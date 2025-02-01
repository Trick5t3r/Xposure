import boto3
from botocore.exceptions import ClientError
import json
import re
import os


MODEL_ID = "mistral.mistral-large-2407-v1:0"
REGION_NAME = "us-west-2"


def sentiment_classifier(article):
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



def theme_classifier(article):
    prompt = """
    Enedis est l'entreprise responsable de la gestion et de la distribution de l'électricité.
    Je vais te fournir un article faisant référence à Enedis. Ta mission consiste à identifier le thème principal des passages où Enedis est mentionné, en choisissant le thème le plus pertinent parmi les catégories suivantes : 
    - **'divers'** : Thèmes généraux.
    - **'réseau'** : Gestion, entretien et maintenance du réseau électrique de distribution.
    - **'transition écologique'** : Initiatives et projets visant à favoriser une consommation d'énergie plus verte et durable.
    - **'aléas climatiques'** : Impacts des conditions météorologiques (vents, tempêtes, canicules, etc.) sur le réseau et la distribution d'électricité.
    - **'raccordement'** : Le processus de connexion des consommateurs au réseau électrique d'Enedis.
    - **'rh'** : Ressources humaines, gestion du personnel, des locaux d'entreprise et des équipes d'Enedis.
    - **'partenariats industriels / académiques'** : Collaborations avec des entreprises et des institutions académiques pour des projets liés à l'énergie.
    - **'clients'** : Service aux clients, gestion des demandes et des problématiques liées aux usagers du réseau électrique.
    - **'mobilité électrique'** : Projets et actions liés à la promotion des véhicules électriques et des infrastructures de recharge.
    - **'linky'** : Déploiement et gestion des compteurs intelligents Linky chez les consommateurs.
    - **'grèves'** : Grèves ou mouvements sociaux affectant les activités d'Enedis.
    - **'rse'** : Responsabilité sociétale de l'entreprise, y compris l'impact social et environnemental d'Enedis.
    - **'prévention'** : Mesures prises pour éviter des accidents, des pannes ou d'autres risques sur le réseau.
    - **'innovation'** : Nouvelles technologies et solutions innovantes dans la gestion de l'énergie et du réseau électrique.
    - **'marque employeur/rh'** : Actions liées à l'image de l'employeur et au recrutement au sein d'Enedis.

    Autrement dit il faut répondre à la question : pour quoi parle-t-on d'Enedis dans cet article ?


    **Format de l'article :**

    * Date : {date}
    * Territoire : {territoire}
    * Sujet : {sujet}
    * Média : {media}
    * Contenu de l'article : {article}

    Ton objectif est de lire l'article et de renvoyer une réponse sous forme de JSON contenant une seule clé : 
    - "Thème" : thème principal des passages où Enedis est mentionné : 'divers', 'réseau', 'transition écologique', 'aléas climatiques',
        'raccordement', 'rh', 'partenariats industriels / académiques',
        'clients', 'mobilité électrique', 'linky', 'grèves', 'rse',
        'prévention', 'innovation', 'marque employeur/rh'

    Réponds sous forme de JSON valide
    """
    
    region = REGION_NAME
    model_id = MODEL_ID

    # Initialisation du client AWS Bedrock
    bedrock_client = boto3.client(
        'bedrock-runtime',  # Utilisation du service AWS Bedrock
        region_name=region # À ajuster selon la région AWS que vous utilisez
    )
    message1 = prompt.format(date=article['Date'], territoire=article['Territoire'], sujet=article['Sujet'], media=article['Média'], article=article['Articles'])
    #print(message)
    messages = [{"role": "user", "content": [{"text": message1 }]}]
    temperature = 1
    max_tokens = 8192

    params = {
        "modelId": model_id,
        "messages": messages,
        "inferenceConfig": {
            "temperature": temperature,
            "maxTokens": max_tokens
        }
    }
    # Appel à l'API AWS Bedrock pour générer la réponse
    response = bedrock_client.converse(**params)
 
    match = re.search(r'\{.*\}', response["output"]["message"]["content"][0]["text"], re.DOTALL)

    if match:
        json_str = match.group(0)  # Récupérer la chaîne JSON
        json_obj = json.loads(json_str)  # Transformer en JSON
        return json_obj
    else: # ERREUR, le LLM a surement pas renvoyé un Json valide
        return {'Thème' : 'None'}