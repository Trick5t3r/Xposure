import os
import json
import aioboto3
import boto3
import logging
from dotenv import load_dotenv
from asgiref.sync import sync_to_async
from ..serializers import (
    ChatSessionSerializer,
)
import asyncio
from ..models import ExcelFile

#from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth
import pandas as pd
import json
from .rag.rag import get_knowledge_base

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

"""
AWS_REGION = "us-east-1"
MODEL_ID = "anthropic.claude-v2"
OPENSEARCH_HOST = "your-opensearch-domain.region.aoss.amazonaws.com"

# Initialisation du client OpenSearch Serverless
def init_opensearch_client():
    service = "aoss"
    credentials = boto3.Session().get_credentials()
    auth = AWSV4SignerAuth(credentials, AWS_REGION, service)

    return OpenSearch(
        hosts=[{"host": OPENSEARCH_HOST, "port": 443}],
        http_auth=auth,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection
    )

# Indexation du fichier Excel dans OpenSearch Serverless
async def index_excel_to_opensearch(excel_file, index_name="knowledge_base"):
    client = init_opensearch_client()
    df = pd.read_excel(excel_file)
    json_data = df.to_dict(orient="records")

    for i, doc in enumerate(json_data):
        client.index(index=index_name, body=doc, id=i)
    logging.info(f"{len(json_data)} documents indexés dans OpenSearch.")

# Recherche de documents pertinents dans OpenSearch
async def search_documents(query, index_name="knowledge_base"):
    client = init_opensearch_client()
    search_query = {
        "query": {
            "multi_match": {
                "query": query,
                "fields": ["*"]  # Recherche sur tous les champs
            }
        }
    }
    response = client.search(index=index_name, body=search_query)
    return [hit["_source"] for hit in response["hits"]["hits"]]"""

# Génération d'un prompt RAG pour Bedrock
async def generate_knowledge_base_prompt(query):

    logging.info("Génération du prompt pour Bedrock...")
    context = get_knowledge_base(query)
    prompt = f"""
    Tu es un assistant intelligent utilisant une base de connaissances.
    Voici des informations trouvées dans la base de données :

    {context}

    Question :
    {query}

    Réponse :
    """

    return prompt

# Fonction principale : Conversation avec le Knowledge Base
async def async_llm_discussion(current_session, newMessage):
    """ Gère la conversation avec le modèle en conservant la base de connaissances OpenSearch """
    last_newMessage = newMessage[-1]
    try:
        # Charger les anciennes données de session
        old_data = await sync_to_async(lambda: ChatSessionSerializer(current_session.session).data)()
        data_messages = list(old_data.get("messages", {}))
        data_messages_renderer = list(old_data.get("messages", {}))
        data_datas = list(old_data.get("datas", {}))


        
        message_initial = {"role": "user", "content": last_newMessage["content"]}
        data_messages_renderer.append(message_initial)

        await send_update_chat(current_session, data_messages_renderer, data_datas, "Thinking...")
        improved_message = {"role": "user", "content": await generate_knowledge_base_prompt(last_newMessage["content"])}
        data_messages.append(improved_message)
        

        data_messages = [{k: v for k, v in d.items() if k != "context"} for d in data_messages]
        data_messages_renderer = [{k: v for k, v in d.items() if k != "context"} for d in data_messages_renderer]

        async for current_message in async_reponse_llm(data_messages):
            await send_update_chat(current_session, data_messages_renderer, data_datas, current_message)

        data_messages_renderer.append({"role": "assistant", "content": current_message})

        return data_messages_renderer

    except Exception as e:
        logging.error(f"Erreur dans async_llm_discussion: {str(e)}")
        return data_messages

# Fonction d'appel à Bedrock pour générer une réponse
async def async_reponse_llm(messages):
    """ Envoie un prompt à AWS Bedrock et stream la réponse """
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

            current_response = ""
            async for event in response['body']:
                chunk_data = json.loads(event['chunk']['bytes'].decode("utf-8"))
                if "choices" in chunk_data and chunk_data["choices"]:
                    message = chunk_data["choices"][0]["message"].get("content", "")
                    if message:
                        current_response += message
                        yield current_response

        except Exception as e:
            logging.error(f"Erreur dans async_reponse_llm: {str(e)}")
            yield "Désolé, une erreur s'est produite."