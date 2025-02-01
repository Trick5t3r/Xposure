import os
from mistralai import Mistral
from dotenv import load_dotenv
from ..models import ExcelFile
import io
from django.core.files.base import ContentFile
from openpyxl import Workbook, load_workbook
import fitz
from pathlib import Path


load_dotenv()

# Configuration du client Mistral
model = "mistral-small-latest"  # Spécifiez le modèle souhaité
api_key = os.environ.get("MISTRAL_API_KEY")
client = Mistral(api_key=api_key)

def generate_title(content):
    """
    Generate a title for the given content using Mistral's API.

    Args:
        content (str): The text content from which to generate a title.

    Returns:
        str: A generated title summarizing the content.
    """
    try:
        # Créez un prompt pour guider le modèle à générer un titre
        prompt = (
            "Given the following content, generate a concise and descriptive title:\n\n"
            f"Content: {content}\n\n"  # Tronquer pour éviter les dépassements
            "Title:"
        )

        # Envoyer la requête au modèle Mistral
        chat_response = client.chat.complete(
            model=model,
            messages=[{"role": "user", "content": prompt}],
        )

        # Récupérer le contenu généré
        rep = chat_response.choices[0].message.content

        return rep
    except Exception as e:
        return f"Error generating title: {str(e)}"

def convert_to_markdown(content):
    """
    Convert text content to Markdown format and highlight key elements using Mistral's API.

    Args:
        content (str): The text content to convert.

    Returns:
        str: The content formatted in Markdown.
    """
    if content.strip() == "":
        return ""
    try:
        # Prompt pour convertir en Markdown en mettant en évidence les éléments importants
        prompt = (
            "You are a Markdown formatting assistant. Convert the provided text into a clean and well-structured Markdown document. "
            "Do not add, remove, or alter the content—only format it as Markdown.\n\n"
            "Formatting rules:\n"
            "- Use and add appropriate headers (e.g., #, ##, ###) for sections only when the content logically requires a structured division (e.g., multi-paragraph or topic-based content). Avoid headers for short or simple text.\n"
            "- Format lists using bullet points (-) or numbered lists (1., 2., 3.) where applicable.\n"
            "- Highlight key points using **bold** or *italic* text where emphasis is naturally implied.\n"
            "- Use backticks (`code`) for inline code and triple backticks (```code```) for code blocks.\n"
            "- Close code blocks with triple backticks (```).\n"
            "- Convert any URLs into clickable Markdown links.\n"
            "- Ensure the output is professional, readable, and properly indented, without unnecessary formatting or sections.\n\n"
            f"Input text:\n{content[:1000]}\n\n"  # Truncate input to avoid excessive length
            "Formatted Markdown output:\n```markdown\n"
        )





        # Envoyer la requête au modèle Mistral
        chat_response = client.chat.complete(
            model=model,
            messages=[{"role": "user", "content": prompt}],
        )

        # Récupérer le contenu généré
        markdown = chat_response.choices[0].message.content

        return markdown
    except Exception as e:
        return f"Error converting to Markdown: {str(e)}"
    


def pdf_to_excel(pdfFile_serializer):
    """
    Convertit un fichier PDF en fichier Excel.
    Extrait les articles du PDF et les stocke avec des colonnes vides pour territoire, sujet et média.
    """
    # Récupération de l'instance `PDFFile` depuis le serializer
    pdfFile = pdfFile_serializer.instance  
    pdf_path = pdfFile.file.path  # Chemin du fichier PDF

    # Ouverture du PDF et extraction du texte
    doc = fitz.open(pdf_path)
    extracted_data = []

    # Parcours des pages (sauf la première)
    for page_num in range(1, len(doc)):  # Commence à 1 pour ignorer la première page
        page = doc[page_num]
        text = page.get_text("text")  # Extraction du texte brut
        extracted_data.append(["0", "0", "", "", "0", text])  # Colonnes vides + article

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


