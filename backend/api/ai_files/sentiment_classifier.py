import boto3
from botocore.exceptions import ClientError
import json
import re


MODEL_ID = "mistral.mistral-large-2407-v1:0"
REGION_NAME = "us-west-2"


def classify(article):
    """Classify the sentiment of the a text talking about Enedis.
    Parameters
    ----------
    article : str
        The article to classify.

    Returns
    -------
    str : in ["factuel" , "positif" , "négatif"]
        The sentiment of the article.
    """
    client = boto3.client("bedrock-runtime", region_name=REGION_NAME)

    message = f"""En étant un habitant francais. Tu m'aideras à atteindre l'objectif suivant :
    Prédire le sentiment de l'image d'Enedis uniquement dans l'un des catégories suivantes [factuel / positif / négatif]


    Prends également en compte les détails ou éléments contextuels suivants :

    Enedis est le gestionnaire du réseau de distribution d'électricité en France, chargé de l'acheminement et de la maintenance des infrastructures électriques, mais n'est pas responsable de la production d'électricité.

    Voici les situations où Enedis est responsable :
    - Défauts d’entretien du réseau.
    - Retards d'intervention ou mauvaise gestion lors de la résolution des pannes électriques.
    - Travaux mal réalisés affectant l'approvisionnement en électricité.
    - Erreurs techniques sur le réseau électrique endommageant des appareils des usagers.

    En revanche, Enedis n'est pas responsable si :
    - La panne est causée par des événements extérieurs comme des intempéries, des accidents causés par des tiers ou des cas de force majeure.
    - Le problème provient de l'installation électrique interne des usagers.

    L'article : 

    Contenu de l'article : {article}

    1. Examinons d'abord les informations disponibles dans l'article.
    2. Quelle est la responsabilité d'Enedis selon les détails de l'article ?
    3. D'un point de vue strictement usager, raisonne sur l'impact des événements liés à Enedis : 
    - factuel : l'usager est indifferent quant à Enedis, ca veut dire qu'on ne peut pas repprocher ou apprecier l'action ou l'inaction d'Enedis.
    - négatif : Le lien avec Enedis présente un problème global, dont Enedis porte la responsabilité, et qui engendre de la frustration chez les usagers.
    - positif : Enedis fait un effort pour améliorer la situation des usagers, leur satisfaction et la qualité de vie.
    L’énergie étant essentielle au quotidien des usagers, chaque effort ou manquement d'Enedis impacte directement leur vie. Il est donc crucial de prioriser chaque événement en fonction de son impact réel, positif ou négatif, afin d’anticiper l’image d'Enedis auprès des usagers.
    """
    instruction = """Après tu utiliseras le format json suivant pour répondre :
    {"Image" : [factuel / positif / négatif]}."""

    prompt = message + instruction

    conversation = [
        {
            "role": "user",
            "content": [{"text": prompt}],
        }
    ]

    try:
        response = client.converse(
            modelId=MODEL_ID,
            messages=conversation,
        )

        response_text = response["output"]["message"]["content"][0]["text"]

    except (ClientError, Exception) as e:
        print(f"ERROR: Can't invoke '{MODEL_ID}'. Reason: {e}")
        exit(1)

    match = re.search(
        r"\{.*?\}", response["output"]["message"]["content"][0]["text"], re.DOTALL
    )

    if match:
        json_str = match.group(0)
        return json.loads(json_str)["Image"]
    else:
        return "None"
