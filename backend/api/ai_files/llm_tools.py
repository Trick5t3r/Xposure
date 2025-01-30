import os
from mistralai import Mistral
from dotenv import load_dotenv

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
    


def pdf_to_excel(currentSession, pdfFile):
    print(pdfFile)