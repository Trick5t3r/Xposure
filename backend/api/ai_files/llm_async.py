import os
import json
from mistralai import Mistral
from dotenv import load_dotenv
from asgiref.sync import sync_to_async
from ..serializers import (
    ChatSessionSerializer,
    ChatSessionUpdateSerializer,
    get_or_create_last_chat_session
)
import asyncio

load_dotenv()

model = "mistral-small-latest"
api_key = os.environ.get("MISTRAL_API_KEY")
client = Mistral(api_key=api_key)

import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


async def send_update_chat(current_session, data_messages, data_datas, statusMessage):
    data_messages_status = list(data_messages)
    newStatusMessage = {"role": "assistant", "content": statusMessage}
    data_messages_status.append(newStatusMessage)

    response_data = {
        "messages": data_messages_status,  # Extract "messages" or default to empty list
        "datas": list(data_datas) # Add "datas" key with static value
    }

    await current_session.send(text_data=json.dumps({
        "type": "update_session",
        "data": response_data
    }))

async def async_llm_discussion(current_session, newMessage):
    old_data = await sync_to_async(lambda: ChatSessionSerializer(current_session.session).data)()
    data_messages = list(old_data.get("messages", {}))
    data_datas = list(old_data.get("datas", {}))
    data_messages.extend(newMessage)
    

    #Fake thinking
    async for currrent_message in async_reponse_llm(data_messages):
        await send_update_chat(current_session, data_messages, data_datas, currrent_message)

    data_messages.append({"role": "assistant", "content": currrent_message})

    return data_messages

async def async_reponse_llm(messages):
    current_reponse = ""
    response = await client.chat.stream_async(
        model=model,
        messages=messages,
    )
    async for chunk in response:
        if chunk.data.choices[0].delta.content is not None:
            current_reponse += chunk.data.choices[0].delta.content
            
            yield current_reponse