import os
from mistralai import Mistral
from dotenv import load_dotenv
from ..models import ExcelFile
import io
from django.core.files.base import ContentFile
from openpyxl import Workbook, load_workbook
import fitz
from pathlib import Path
import boto3
import json
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    


def pdf_to_excel(pdfFile_serializer):
    """
    Convertit un fichier PDF en fichier Excel.
    Extrait les articles du PDF et les stocke avec des colonnes vides pour territoire, sujet et média.
    """
    # Récupération de l'instance `PDFFile` depuis le serializer
    pdfFile = pdfFile_serializer.instance  
    pdf_path = pdfFile.file.path  # Chemin du fichier PDF

    # Ouverture du PDF et extraction du texte
    doc_json = get_articles(pdf_path)
    extracted_data = []

    # Parcours des pages (sauf la première)
    for key, (title, article_text) in doc_json.items():  # Commence à 1 pour ignorer la première page
        attribut_extracted = extract_attribut_pdf_with_llm(article_text)
        extracted_data.append([attribut_extracted["Territoire"], title, "", "", attribut_extracted["Média"], attribut_extracted["Article"]])  # Colonnes vides + article

    # Création d'un fichier Excel vide avec une feuille nommée "Articles"
    wb = Workbook()
    ws = wb.active
    ws.title = "Articles"

    # Ajout des en-têtes
    headers = ["Territoire", "Sujet", "Thème", "Qualité du retour", "Média", "Article"]
    ws.append(headers)

    # Remplissage du fichier Excel avec les données extraites
    for row in extracted_data:
        ws.append(row)

    # Sauvegarde du fichier en mémoire
    excel_buffer = io.BytesIO()
    wb.save(excel_buffer)
    excel_buffer.seek(0)

    # Création de l'instance ExcelFile avec le fichier généré
    excelFile = ExcelFile(
        title= str(Path(pdfFile.title).with_suffix(".xlsx")),
        chatsession=pdfFile.chatsession,
        content="",
        date=pdfFile.date,
        region=pdfFile.region,
    )

    # Définition du fichier généré dans le champ `file`
    excelFile.file.save(str(Path(pdfFile.title).with_suffix(".xlsx")), ContentFile(excel_buffer.getvalue()), save=True)

    return excelFile

def get_articles(file_path):
    doc = fitz.open(file_path)
    toc = doc.get_toc()
    doc_json = {}
    started = False
    all_pages = []
    for (_, title, ind_page) in toc:
        if started == False and _== 1 and title == "DR Nord-Pas-de-Calais":
            started = True
        
        if started:
            all_pages.append((title, ind_page))


    for (ind_doc, (title, ind_page)) in enumerate(all_pages):
        if ind_doc + 1 < len(all_pages):
            next_page = all_pages[ind_doc + 1][1]
            pages = doc[ind_page:next_page]  # Récupère les pages jusqu'au prochain article
        else:
            pages = doc[ind_page:]  # Dernier article, récupère jusqu'à la fin du document

        current_text = "\n".join(page.get_text("text") for page in pages).strip()

        # Ajoute seulement si un texte est trouvé
        if current_text:
            doc_json[ind_doc] = (title, current_text)

    
    return doc_json


# Initialisation du client Bedrock
bedrock = boto3.client(service_name='bedrock-runtime', region_name='us-west-2')

def extract_attribut_pdf_with_llm(article_text):
    """
    Utilise un modèle LLM sur AWS Bedrock pour extraire les informations d'un article.
    """
    prompt = f"""
    Analyse l'article suivant et extrait les informations dans un format JSON structuré.
    Article :
    {article_text}

    Retourne un JSON avec ces champs :
    {{
        "Territoire": "Nom de la région mentionnée",
        "Média": "Nom du journal ou site web",
        "Article": "Texte brut de l'article"
    }}
    """

    model_id = "mistral.mistral-large-2402-v1:0"

    conversation = [
        {
            "role": "user",
            "content": [{"text": prompt}],
        }
    ]

    required_keys = {"Territoire", "Média", "Article"}  # Clés obligatoires

    counter = 0
    while counter < 1:  # Limite de 3 tentatives
        counter += 1
        response = bedrock.converse(
            modelId=model_id,
            messages=conversation,
        )

        response_text = response["output"]["message"]["content"][0]["text"]

        try:
            # Extraction du JSON
            result_json = json.loads(response_text)

            # Vérification des clés requises
            if all(key in result_json for key in required_keys):
                return result_json  # ✅ Retourne le JSON valide si tout est OK

            logging.warning("Certaines clés sont absentes, relance de la requête...")
        
        except json.JSONDecodeError:
            logging.warning("Erreur : La réponse du modèle n'est pas un JSON valide. Relance de la requête...")

    logging.error(f"Erreur : Le modèle n'a pas pu extraire les informations de l'article. {response_text}")
    return {
        "Territoire": "",
        "Média": "",
        "Article": article_text
    }


