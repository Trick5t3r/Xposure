prompt_get_articles_numbers = """
Tu es un assistant à la lecture de pdf. En particulier tu analyse les sommaires de revues d'articles.
Tu vas recevoir un début de document dans un mauvais format. Ta tâche sera d'identifier où est le sommaire et d'extraire les numéros de pages des différents articles du document.

**Document**
{document}

**Output**
Tu répondra sous la forme d'une liste d'entiers représentant les numéros de page des articles du sommaire dans l'ordre du document.
Par exemple :
[1, 2, 4, 6, 5, 8, 10, 11, 12, 15...]
"""

prompt_get_article_info = """
Tu es un assistant à la lecture de pdf. En particulier tu analyse des article pour en retirer des informations.
Tu vas recevoir un article dans un mauvais format. Ta tâche sera d'extraire du texte le nom du Média, la date de publication (format : jj/mm/aaaa), le département d'édition (que tu le déduira de la ville) ainsi que le contenu de l'article (que tu recopieras mot pour mot). En plus de cela tu décriras une courte phrase le sujet de l'article sans mention du genre 'L'article traite'.

**Article**
{document}

**Output**
A partir de l'article et en suivant les consignes, Tu répondra sous la forme json avec 4 clés :
- "Média" : nom du média officiel (dans le bon format et en minuscule) que tu déduira de ce que tu trouve dans l'article. Par exemple, si tu trouve dans l'article 'nordlitoral.fr', tu dois renvoyer 'nord litoral'.
- "Date" : date de publication (format : jj/mm/aaaa).
- "Lieu" : le département d'édition que tu le déduira de la ville (en minuscule).
- "Contenu" : contenu texte de l'article que tu recopieras mot pour mot dans un format bien lisible.
- "Sujet" : Sujet de l'article en une courte phrase SANS mention du genre 'L'article traite'.

Réponds sous forme de JSON valide
"""

BUCKET_NAME = "yessin-project"
AWS_REGION = "us-west-2"
MODEL_ID = "mistral.mistral-large-2407-v1:0"

import time
import pandas as pd
import boto3
import os
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor
from ..models import ExcelFile
import io
from django.core.files.base import ContentFile
from pathlib import Path

import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def get_data_pdf(path):
    
    textract_client = boto3.client('textract')

    # Lancer l'analyse
    response = textract_client.start_document_text_detection(
        DocumentLocation={
            'S3Object': {
                'Bucket': BUCKET_NAME,
                'Name': path
            }
        }
    )
    job_id = response['JobId']

    # Récupérer toutes les pages de résultats
    all_blocks = []
    next_token = None

    def get_job_status(job_id, next_token=None):
        while True:
            if next_token:
                response = textract_client.get_document_text_detection(JobId=job_id, NextToken=next_token)
            else:
                response = textract_client.get_document_text_detection(JobId=job_id)
            status = response['JobStatus']
            if status in ['SUCCEEDED', 'FAILED']:
                return response
            logging.info("En attente des résultats...")
            time.sleep(5)

    while True:
        response = get_job_status(job_id, next_token)

        # Ajouter les blocs extraits
        all_blocks.extend(response['Blocks'])

        # Vérifier s'il y a une autre page
        next_token = response.get('NextToken')
        if not next_token:
            break  # Stop si plus de pages

    df = pd.DataFrame.from_dict(all_blocks)
    return df


def upload_file_bucket(local_path, output_path):
    logging.info(f"Envoi du fichier {local_path} à S3...")
    s3_client = boto3.client('s3')
    # Téléchargement du fichier sur S3
    s3_client.upload_file(local_path, BUCKET_NAME, output_path)
    logging.info(f"Fichier {local_path} envoyé à {BUCKET_NAME}/{output_path}")


def get_sommaire(df):
    df_ = df[df['Page'] < get_first_page(df)]
    extract_text = ""
    for i,row in df_.iterrows():
        extract_text += str(row['Text']) + "\n"
    return extract_text

def get_first_page(df):
    page_counts = df.groupby('Page').size()  # Compter les éléments par page
    single_element_pages = page_counts.argmin()  # Récupérer les pages avec un seul élément
    return int(single_element_pages)+1

def get_last_page(df):
    return int(df['Page'].max())


def get_pages(df, page_min, page_max):
    df_ = df[(df['Page'] >= page_min) & (df['Page'] < page_max)]
    extract_text = ""
    for i,row in df_.iterrows():
        extract_text += str(row['Text']) + "\n"
    return extract_text

def llm_call(message, format='text'):
    temperature = 1
    max_tokens = 8192
    region = AWS_REGION
    model_id =MODEL_ID

    bedrock_client = boto3.client(
        'bedrock-runtime',  # Utilisation du service AWS Bedrock
        region_name=region # À ajuster selon la région AWS que vous utilisez
    )
    messages = [{"role": "user", "content": [{"text": message }]}]
    

    params = {
        "modelId": model_id,
        "messages": messages,
        "inferenceConfig": {
            "temperature": temperature,
            "maxTokens": max_tokens
        }
    }
    while True:
        try: 
            response = bedrock_client.converse(**params)

            if format == 'list':
                match = re.search(r'\[\s*(.*?)\s*\]', response["output"]["message"]["content"][0]["text"])
                if match:
                    str_content = match.group(1)  # Récupérer le texte sans les crochets et sans espaces
                    list_obj = str_content.split(",")  # Transformer en liste (si les éléments sont séparés par des virgules)
                    list_obj = [item.strip() for item in list_obj]  # Supprimer les espaces autour des éléments
                    return list_obj
                else: raise Exception("Erreur d'appel au LLM")
            if format == 'json':
                match = re.search(r'\{.*\}', response["output"]["message"]["content"][0]["text"], re.DOTALL)
                if match:
                    json_str = match.group(0)  # Récupérer la chaîne JSON
                    json_obj = json.loads(json_str)  # Transformer en JSON
                    return json_obj
                else: # ERREUR, le LLM a surement pas renvoyé un Json valide
                    raise Exception("Erreur d'appel au LLM")
                
            return response["output"]["message"]["content"][0]["text"]
        except:
            logging.error("Erreur d'appel au LLM ! On recommence...")


def process_data_pdf_to_xls(in_path):
    logging.info("Download PDF")
    df = get_data_pdf(in_path)

    logging.info("Get pages numbers...")
    correct = False
    while correct == False:
        try:
            article_pages = llm_call(prompt_get_articles_numbers.format(document=get_sommaire(df)), 'list')
            article_pages = [int(nb) for nb in article_pages]
            correct = True
        except:
            print("Incorrect response of the LLM when asking for article pages nb")
    articles_info = []

    with ThreadPoolExecutor(10) as executor:
        articles_info = list(executor.map(
                                lambda i: llm_call(
                                    prompt_get_article_info.format(document=get_pages(df, article_pages[i], article_pages[i+1])),
                                    'json'
                                ), 
                                range(len(article_pages) - 1)
                            ))
    articles_info.append(llm_call(prompt_get_article_info.format(document=get_pages(df, article_pages[-1],get_last_page(df))), 'json'))
    

    data = pd.DataFrame.from_dict(articles_info)
    data = data.rename(columns={'Contenu': 'Articles'})
    data = data.rename(columns={'Lieu': 'Territoire'})
    data['Thème'] = None
    data['Qualité du retour'] = None
    data = data.loc[:, ['Date','Territoire','Sujet','Thème','Qualité du retour','Média','Articles']]

    return data

def pdf_to_excel(pdfFile_serializer):
    pdfFile = pdfFile_serializer.instance  
    pdf_path = pdfFile.file.path  # Chemin du fichier PDF
    # 🔹 Convertir le PDF en DataFrame
    upload_file_bucket(pdf_path, pdf_path)
    pd_data = process_data_pdf_to_xls(pdf_path)

    # 🔹 Créer un buffer en mémoire pour stocker l'Excel
    excel_buffer = io.BytesIO()

    # 🔹 Exporter le DataFrame dans le buffer
    pd_data.to_excel(excel_buffer, index=False, engine="openpyxl")
    excel_buffer.seek(0)  # Revenir au début du fichier

    # 🔹 Générer un nom de fichier basé sur `pdfFile.title`
    excel_filename = str(Path(pdfFile.title).with_suffix(".xlsx"))

    # 🔹 Créer l'objet `ExcelFile` sans le champ `file` d'abord
    excelFile = ExcelFile.objects.create(
        title=excel_filename,
        chatsession=pdfFile.chatsession,
        content="",  # Si ce champ est nécessaire
        date=pdfFile.date,
        region=pdfFile.region
    )

    # 🔹 Sauvegarder le fichier Excel dans `FileField`
    excelFile.file.save(excel_filename, ContentFile(excel_buffer.getvalue()), save=True)
    return excelFile

## ONLY CODE
#bucket_name = "bucket-textract-colas"
#in_path = "revue_enedis.pdf"
#final_df = process_data_pdf_to_xls(in_path,bucket_name)