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
from bs4 import BeautifulSoup
import json
import re
import pytesseract
import cv2
import numpy as np
import base64
import io
from PIL import Image


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
    for article in doc_json:  # Commence à 1 pour ignorer la première page
        #attribut_extracted = extract_attribut_pdf_with_llm(article_text)
        extracted_data.append([article["Date"], article["Lieu"], article["Title"], "", "", article["Média"], article["Article"]])  # Colonnes vides + article

    # Création d'un fichier Excel vide avec une feuille nommée "Articles"
    wb = Workbook()
    ws = wb.active
    ws.title = "Articles"

    # Ajout des en-têtes
    headers = ["Date", "Territoire", "Sujet", "Thème", "Qualité du retour", "Média", "Article"]
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

# Simuler doc[1].get_text("html") (remplace cette ligne avec ton code réel)
def get_sommaire(doc, max_page):
    results = []
    for indice_doc in range(1, max_page):
        html = doc[indice_doc].get_text("html")

        # Parsing HTML
        soup = BeautifulSoup(html, "html.parser")

        # Récupère le premier <div>
        div = soup.find("div")
        if not div:
            print("Aucun <div> trouvé.")
            exit()

        children = iter(div.children)  # Créer un itérateur explicite


        while True:
            entry = {}
            child = next(children, None)

            # Trouver l'image en base64
            if child is None:
                break  # Fin des éléments

            if child.name == "img":
                img_src = child.get("src", "")
                pattern = r"data:image\/[a-zA-Z]+;base64,\s*([A-Za-z0-9+/=\s]+)"
                match = re.search(pattern, img_src)
                if match:
                    base64_data = match.group(1)
                else:
                    print("Aucune image en base64 trouvée.")

                
                image = Image.open(io.BytesIO(base64.b64decode(base64_data)))

                image_cv = np.array(image)

                # Convert RGB (PIL default mode) to BGR (OpenCV format)
                if image_cv.shape[-1] == 3:  # Check if the image has color channels
                    image_cv = cv2.cvtColor(image_cv, cv2.COLOR_RGB2BGR)

                # Convert image to grayscale
                gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
                blur = cv2.GaussianBlur(gray, (3,3), 0)
                thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

                # Morph open to remove noise and invert image
                kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
                opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
                invert = 255 - opening

                # Perform text extraction
                entry["Média"] = pytesseract.image_to_string(invert, lang='eng', config='--psm 6').strip()

                # Lire les prochaines balises dans l'ordre
                date = next(children, None)
                while not date or str(date).strip() == "":
                    date = next(children, None)

                entry["Date"] = date.text.strip() if date else None

                title = next(children, None)
                while not title or str(title).strip() == "":
                    title = next(children, None)

                
                entry["Title"] = title.text.strip() if title else None

                lieu = next(children, None)
                while not lieu or str(lieu).strip() == "":
                    lieu = next(children, None)
                entry["Lieu"] = lieu.text.strip() if lieu else None
                results.append(entry)
            else:
                continue  # Si pas une image, on ignore et continue

        

    # Affichage du résultat JSON
    return results


def get_articles(file_path):
    doc = fitz.open(file_path)
    toc = doc.get_toc()
    doc_json = []
    started = False
    all_pages = []
    for (_, title, ind_page) in toc:
        if started:
            all_pages.append((title, ind_page))
        if started == False and _== 1 and title == "DR Nord-Pas-de-Calais":
            started = True
        


    for (ind_doc, (title, ind_page)) in enumerate(all_pages):
        if ind_doc + 1 < len(all_pages):
            next_page = all_pages[ind_doc + 1][1]
            pages = doc[ind_page:next_page]  # Récupère les pages jusqu'au prochain article
        else:
            pages = doc[ind_page:]  # Dernier article, récupère jusqu'à la fin du document

        current_text = "\n".join(page.get_text("text") for page in pages).strip()

        # Ajoute seulement si un texte est trouvé
        if current_text:
            doc_json.append({"Title" : title, "Article" :current_text, "Lieu": None, "Date":None, "Média":None})

    summmm = get_sommaire(doc, all_pages[0][1])

    for ind in range(min(len(doc_json), len(summmm))):
        doc_json[ind]["Lieu"] = summmm[ind]["Lieu"]
        doc_json[ind]["Date"] = summmm[ind]["Date"]
        doc_json[ind]["Média"] = summmm[ind]["Média"]

    
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


