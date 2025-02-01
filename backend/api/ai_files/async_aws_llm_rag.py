import os
import json
import aioboto3
import boto3
import logging
from dotenv import load_dotenv
from asgiref.sync import sync_to_async
from ..serializers import (
    ChatSessionSerializer,
    ChatSessionUpdateSerializer,
    get_or_create_last_chat_session
)
import asyncio

from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth
import pandas as pd
import json

# Charger les variables d’environnement
load_dotenv()

# Configuration AWS Bedrock
AWS_REGION = "us-west-2"
MODEL_ID = "mistral.mistral-large-2407-v1:0"

# Configuration des logs
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


async def send_update_chat(current_session, data_messages, data_datas, statusMessage):
    """ Envoie la mise à jour du chat en WebSocket """
    data_messages_status = list(data_messages)
    newStatusMessage = {"role": "assistant", "content": statusMessage}
    data_messages_status.append(newStatusMessage)

    response_data = {
        "messages": data_messages_status,  
        "datas": list(data_datas)
    }

    await current_session.send(text_data=json.dumps({
        "type": "update_session",
        "data": response_data
    }))


async def async_llm_discussion(current_session, newMessage):
    """ Gère la conversation avec le modèle en conservant le contexte """
    try:
        old_data = await sync_to_async(lambda: ChatSessionSerializer(current_session.session).data)()
        data_messages = list(old_data.get("messages", {}))
        data_datas = list(old_data.get("datas", {}))
        data_messages.extend(newMessage)
        data_messages_sans_context = [{k: v for k, v in d.items() if k != "context"} for d in data_messages]
        data_messages = data_messages_sans_context

        # Fake thinking - Envoi des messages en streaming
        async for current_message in async_reponse_llm(data_messages):
            await send_update_chat(current_session, data_messages, data_datas, current_message)

        # Ajout de la réponse finale
        data_messages.append({"role": "assistant", "content": current_message})

        return data_messages

    except Exception as e:
        logging.error(f"Erreur dans async_llm_discussion: {str(e)}")
        return data_messages


async def async_reponse_llm(messages):
    """ Envoie un prompt à Mistral via AWS Bedrock et stream la réponse """
    session = aioboto3.Session()
    async with session.client("bedrock-runtime", region_name=AWS_REGION) as client:
        payload = {
            "messages": messages,
        }

        try:
            response = await client.invoke_model_with_response_stream(
                modelId=MODEL_ID,
                contentType="application/json",
                accept="application/json",
                body=json.dumps(payload),
            )

            current_reponse = ""
            async for event in response['body']:
                chunk_data = json.loads(event['chunk']['bytes'].decode("utf-8"))
                if "choices" in chunk_data and chunk_data["choices"]:
                    message = chunk_data["choices"][0]["message"].get("content", "")
                    if message:
                        current_reponse += message
                        yield current_reponse

        except Exception as e:
            logging.error(f"Erreur dans async_reponse_llm: {str(e)}")
            yield "Désolé, une erreur s'est produite."



# Fonction pour interroger OpenSearch
def search_documents(session_search, query):
    search_query = {
        "query": {
            "multi_match": {
                "query": query,
                "fields": ["*"]  # Recherche sur tous les champs
            }
        }
    }
    response = session_search['client'].search(index=session_search['index_name'], body=search_query)
    return [hit["_source"] for hit in response["hits"]["hits"]]

def init_session_search(excel_file):
    session_search = {
        "client": None,
        "index_name": "documents"
    }

    region = "us-west-2"
    service = "es"
    credentials = boto3.Session().get_credentials()
    auth = AWSV4SignerAuth(credentials, region, service)

    client = OpenSearch(
        hosts=[{"host": "your-opensearch-domain.region.es.amazonaws.com", "port": 443}],
        http_auth=auth,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection
    )

    # Charger l'Excel et convertir en JSON
    df = pd.read_excel(excel_file)
    json_data = df.to_dict(orient="records")  # Liste de dictionnaires

    # Indexer chaque document
    for i, doc in enumerate(json_data):
        client.index(index=session_search['index_name'], body=doc, id=i)

    session_search['client'] = client
    return session_search