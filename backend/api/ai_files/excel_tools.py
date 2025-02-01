#ne pas faire d'import circular
from openpyxl import load_workbook
from .classifier import theme_classifier, sentiment_classifier
import pandas as pd
import logging

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
import matplotlib.pyplot as plt
import geopandas as gpd
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def complete_excel(file_path):
    logging.info(file_path)
    # Charger le fichier Excel existant
    wb = load_workbook(file_path)
    ws = wb.active

    # Définir les en-têtes de colonnes attendus
    headers = ["Date", "Territoire", "Sujet", "Thème", "Qualité du retour", "Média", "Articles"]
    
    # Trouver l’index des colonnes en fonction des en-têtes
    header_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]  # Première ligne
    header_indices = {header: i for i, header in enumerate(header_row) if header in headers}
    theme_qr = ["Thème", "Qualité du retour"]
    theme_qr_indices = {header: i for i, header in enumerate(header_row) if header in theme_qr}

    # Vérifier chaque ligne (à partir de la 2ème, car la 1ère est l’en-tête)
    i = 0
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
        i+=1
        logging.info(i/ws.max_row)
        for header, col_idx in theme_qr_indices.items():
            cell = row[col_idx]  # Récupérer la cellule correspondant à la colonne
            if cell.value is None or str(cell.value).strip() == "":
                #cell.value = "1"  # Remplacer les valeurs vides par None
                if headers[col_idx] == "Thème":
                    article = {}
                    article["Date"] = str(row[header_indices['Date']].value).strip()
                    article["Territoire"] = str(row[header_indices['Territoire']].value).strip()
                    article["Sujet"] = str(row[header_indices['Sujet']].value).strip()
                    article["Média"] = str(row[header_indices['Média']].value).strip()
                    article["Articles"] = str(row[header_indices['Articles']].value).strip()
                    cell.value = theme_classifier(article)['Thème']
                if headers[col_idx] == "Qualité du retour":
                    cell.value = sentiment_classifier(str(row[header_indices['Articles']].value).strip())

    # Sauvegarder les modifications
    wb.save(file_path)




def generate_pdf_result(excel_path_file):
    # Charger le fichier Excel
    wb = load_workbook(excel_path_file)
    ws = wb.active

    # Définir les en-têtes de colonnes attendus
    headers = ["Date", "Territoire", "Sujet", "Thème", "Qualité du retour", "Média", "Articles"]

    # Trouver l’index des colonnes en fonction des en-têtes
    header_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]  # Première ligne
    header_indices = {header: i for i, header in enumerate(header_row) if header in headers}

    # Créer un DataFrame à partir des données
    data = []
    for row in ws.iter_rows(min_row=1, values_only=True):  # Commencer à la 2ᵉ ligne
        data.append({header: row[col_idx] for header, col_idx in header_indices.items()})
    df = pd.DataFrame(data)

    df.columns = df.columns.astype(str)  # Forcer en `str`
    df.columns = df.columns.str.strip()  # Supprimer les espaces autour des noms
    df.columns = df.columns.str.replace("\n", " ")  # Supprimer les sauts de ligne éventuels

    # 🚀 DEBUG : Vérifier les colonnes

    #Génère le pdf
    temp_pdf_path = generate_pdf_from_dataframe(df)

    return temp_pdf_path

def generate_pdf_from_dataframe(df, pdf_filename="rapport_graphes.pdf"):
    """
    Génère un PDF contenant :
    - Une page de présentation avec la date et le logo Enedis.
    - Une carte de la France.
    - Un histogramme des thèmes par média.
    - Un camembert de la répartition des médias.

    Paramètres :
    - df (pd.DataFrame) : DataFrame contenant au moins les colonnes "Thème" et "Média".
    - pdf_filename (str) : Nom du fichier PDF de sortie.
    - geojson_path (str) : Chemin vers le fichier GeoJSON des départements français.
    - enedis_logo_path (str) : Chemin vers le logo Enedis.
    """
    geojson_path="./api/ai_files/files_pdfgenerator/departements.geojson"
    enedis_logo_path="./api/ai_files/files_pdfgenerator/enedis_logo.png"
    ia_logo_path = "./api/ai_files/files_pdfgenerator/ia.png"


    # Vérifier la présence des colonnes requises
    if "Thème" not in df.columns or "Média" not in df.columns:
        raise ValueError("Le DataFrame doit contenir les colonnes 'Thème' et 'Média'.")

    # Dimensions de la page PDF
    width, height = A4

    # Création du PDF
    temp_path = f"/tmp/result_{pdf_filename}"

    c = canvas.Canvas(temp_path, pagesize=A4)

    ### 📌 PAGE 1 : Page de présentation ###
    c.drawImage(enedis_logo_path, 3 * cm, height - 10 * cm, width=15 * cm, height=12 * cm)

    # Obtenir la date actuelle
    date_aujourd_hui = datetime.now()
    date_formatee = date_aujourd_hui.strftime("%-d %B %Y")

    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2, height - 7 * cm, date_formatee)

    c.setFont("Helvetica", 14)
    c.drawImage(ia_logo_path, 1 * cm, height - 12 * cm, width=5 * cm, height=3 * cm)
    c.drawCentredString(width / 2, height - 10.5 * cm, "Xposure")

    c.showPage()  # Nouvelle page

    ### 📌 PAGE 2 : Sommaire ###
    c.setFont("Helvetica-Bold", 22)
    c.drawString(2 * cm, height - 3 * cm, "Sommaire")

    c.setFont("Helvetica", 14)
    c.drawString(3 * cm, height - 6 * cm, "1. Géographie ..................................... Page 3")
    c.drawString(3 * cm, height - 8 * cm, "2. Analyse des Thèmes par Média ................ Page 4")

    c.showPage()  # Nouvelle page

    ### 📌 PAGE 3 : Carte de la France ###
    c.setFont("Helvetica-Bold", 20)
    c.drawString(2 * cm, height - 3 * cm, "1. Géographie")

    # Charger la carte de la France depuis un GeoJSON
    france = gpd.read_file(geojson_path)

    # Vérification du système de coordonnées et reprojection si nécessaire
    if france.crs is None or france.crs.to_epsg() != 3857:
        france = france.to_crs(epsg=3857)

    # Création de la figure avec fond de carte
    fig, ax = plt.subplots(figsize=(6, 6))
    france.plot(ax=ax, color="#FAEBD7", edgecolor="black")

    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_frame_on(False)

    # Sauvegarde temporaire de la figure
    map_filename = "map_france.png"
    fig.savefig(map_filename, bbox_inches="tight", dpi=150)
    plt.close(fig)

    # Insérer la carte dans le PDF
    c.drawImage(map_filename, 2 * cm, height - 18 * cm, width=15 * cm, height=12 * cm)

    c.showPage()  # Nouvelle page

    ### 📌 PAGE 4 : Analyse des Thèmes par Média ###
    c.setFont("Helvetica-Bold", 20)
    c.drawString(2 * cm, height - 3 * cm, "2. Analyse des Thèmes par Média")

    # 🔹 **Graphe 1 : Histogramme des thèmes par média**
    theme_counts = df.groupby("Média")["Thème"].value_counts().unstack(fill_value=0)

    fig, ax = plt.subplots(figsize=(8, 6))
    theme_counts.plot(kind="bar", stacked=True, ax=ax, colormap="Set3")
    ax.set_title("Répartition des Thèmes par Média")
    ax.set_xlabel("Média")
    ax.set_ylabel("Nombre de Thèmes")
    ax.legend(title="Thèmes", loc="best", fontsize=8)
    plt.xticks(rotation=45)

    # Sauvegarde temporaire
    graph1_filename = "graph_theme_media_bar.png"
    fig.savefig(graph1_filename, bbox_inches="tight", dpi=150)
    plt.close(fig)

    # 🔹 **Graphe 2 : Camembert des Médias**
    fig, ax = plt.subplots(figsize=(6, 6))
    df["Média"].value_counts().plot.pie(autopct='%1.1f%%', startangle=90, colormap="Pastel1", ax=ax)
    ax.set_ylabel("")
    ax.set_title("Répartition des Médias")

    # Sauvegarde temporaire
    graph2_filename = "graph_media_pie.png"
    fig.savefig(graph2_filename, bbox_inches="tight", dpi=150)
    plt.close(fig)

    # 📌 Insérer les graphes dans le PDF
    c.drawImage(graph1_filename, 2 * cm, height - 18 * cm, width=15 * cm, height=12 * cm)
    c.showPage()

    c.drawImage(graph2_filename, 2 * cm, height - 18 * cm, width=15 * cm, height=12 * cm)
    c.showPage()

    # Sauvegarde finale du PDF
    c.save()

    # 🔥 Supprimer les images temporaires
    os.remove(map_filename)
    os.remove(graph1_filename)
    os.remove(graph2_filename)

    logging.info(f"✅ PDF généré avec succès : {pdf_filename}")

    return temp_path

