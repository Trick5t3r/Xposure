import os
from .llm_tools import convert_to_markdown
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

model = "mistral-small-latest"
api_key = os.environ.get("MISTRAL_API_KEY")
client = Mistral(api_key=api_key)


def reponse_llm(messages):
    chat_response = client.chat.complete(
            model=model,
            messages=messages,
        )
    # Récupère et process les outfits donnés par le LLM
    rep =  chat_response.choices[0].message.content
    #rep = messages[-1]["content"].upper()
    rep = convert_to_markdown(rep)
    return {"role": "assistant", "content": rep}