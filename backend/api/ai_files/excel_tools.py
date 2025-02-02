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

    headers = ["Date", "Territoire", "Sujet", "Thème", "Qualité du retour", "Média", "Articles"]
    header_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]  
    header_indices = {header: i for i, header in enumerate(header_row) if header in headers}

    data = []
    for row in ws.iter_rows(min_row=1, values_only=True):
        data.append({header: row[col_idx] for header, col_idx in header_indices.items()})
    df = pd.DataFrame(data)

    df.columns = df.columns.astype(str)
    df.columns = df.columns.str.strip()
    df.columns = df.columns.str.replace("\n", " ")

    temp_pdf_path = generate_pdf_from_dataframe(df)
    return temp_pdf_path

def generate_pdf_from_dataframe(df, pdf_filename="rapport_graphes.pdf"):
    geojson_path = "./api/ai_files/files_pdfgenerator/departements.geojson"
    enedis_logo_path = "./api/ai_files/files_pdfgenerator/enedis_logo.png"
    ia_logo_path = "./api/ai_files/files_pdfgenerator/ia.png"
    
    width, height = A4
    temp_path = f"result_{pdf_filename}"
    c = canvas.Canvas(temp_path, pagesize=A4)

    c.drawImage(enedis_logo_path, 3 * cm, height - 10 * cm, width=15 * cm, height=12 * cm)
    date_formatee = datetime.now().strftime("%-d %B %Y")
    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2, height - 7 * cm, date_formatee)
    c.drawImage(ia_logo_path, 1 * cm, height - 12 * cm, width=5 * cm, height=3 * cm)
    c.showPage()

    c.setFont("Helvetica-Bold", 22)
    c.drawString(2 * cm, height - 3 * cm, "Sommaire")
    c.setFont("Helvetica", 14)
    c.drawString(3 * cm, height - 6 * cm, "Résumé ....................................... Page 3")
    c.drawString(3 * cm, height - 8 * cm, "Graphiques .................. Page 4")
    c.showPage()
    c.setFont("Helvetica-Bold", 22)
    c.drawString(2 * cm, height - 3 * cm, "Résumé")

    c.showPage()

    c.setFont("Helvetica-Bold", 22)
    c.drawString(2 * cm, height - 3 * cm, "Graphiques")
    c.setFont("Helvetica-Bold", 20)
    c.drawString(2 * cm, height - 5 * cm, "1. Géographie")
    
    # Charger la carte de la France depuis un GeoJSON
    france = gpd.read_file(geojson_path)
    
    # Vérification du système de coordonnées et reprojection si nécessaire
    if france.crs is None or france.crs.to_epsg() != 3857:
        france = france.to_crs(epsg=3857)
    
    # Comptage des retours positifs et négatifs par département
    df["Territoire"] = df["Territoire"].str.lower()
    dept_counts = df.groupby(["Territoire", "Qualité du retour"]).size().unstack(fill_value=0)
    dept_counts["color"] = dept_counts.apply(lambda x: "red" if x.get("négatif", 0) > x.get("positif", 0) else ("green" if x.get("positif", 0) > x.get("négatif", 0) else "gray"), axis=1)
    
    # Fusionner avec les données géographiques
    france["nom"] = france["nom"].str.lower()
    france = france.merge(dept_counts, how="left", left_on="nom", right_index=True)
    france = france.dropna(subset=["color"])  # Supprimer les départements sans valeurs associées
        
    # Création de la figure avec fond de carte
    fig, ax = plt.subplots(figsize=(6, 6))
    france.plot(ax=ax, color=france["color"].fillna("white"), edgecolor="black")
    
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_frame_on(False)
    
    # Sauvegarde temporaire de la figure
    map_filename = "map_france.png"
    fig.savefig(map_filename, bbox_inches="tight", dpi=150)
    plt.close(fig)
    
    # Insérer la carte dans le PDF
    c.drawImage(map_filename, 2 * cm, height - 18 * cm, width=15 * cm, height=12 * cm)
    
    c.showPage()
    os.remove(map_filename)

    c.setFont("Helvetica-Bold", 20)
    c.drawString(2 * cm, height - 3 * cm, "2. Analyse des Thèmes par Média")
    
    df_positive = df[df["Qualité du retour"] == "positif"]
    df_negative = df[df["Qualité du retour"] == "négatif"]
    df_factuel = df[df["Qualité du retour"] == "factuel"]

    # Camembert des retours positifs
    fig, ax = plt.subplots(figsize=(6, 6))
    df_positive["Média"].value_counts().plot.pie(autopct='%1.1f%%', startangle=90, colormap="Greens", ax=ax)
    ax.set_ylabel("")
    ax.set_title("Répartition des retours positifs")
    graph_pos_filename = "graph_positive_pie.png"
    fig.savefig(graph_pos_filename, bbox_inches="tight", dpi=150)
    plt.close(fig)

    # Camembert des retours négatifs
    fig, ax = plt.subplots(figsize=(6, 6))
    df_negative["Média"].value_counts().plot.pie(autopct='%1.1f%%', startangle=90, colormap="Reds", ax=ax)
    ax.set_ylabel("")
    ax.set_title("Répartition des retours négatifs")
    graph_neg_filename = "graph_negative_pie.png"
    fig.savefig(graph_neg_filename, bbox_inches="tight", dpi=150)
    plt.close(fig)

    # Graphique en barres empilées
    media_counts = df.groupby(["Média", "Qualité du retour"]).size().unstack(fill_value=0)
    media_counts = media_counts.div(media_counts.sum(axis=1), axis=0).iloc[1:]  # Normalisation

    fig, ax = plt.subplots(figsize=(8, 6))
    media_counts.plot(kind='bar', stacked=True, ax=ax, color=['red', 'green', 'gray'])
    ax.set_title("Proportions des retours par Média")
    ax.set_xlabel("Média")
    ax.set_ylabel("Proportion")
    ax.legend(["Négatif", "Positif", "Factuel"], loc="best", fontsize=8)
    plt.xticks(rotation=45)
    graph_bar_filename = "graph_bar_quality.png"
    fig.savefig(graph_bar_filename, bbox_inches="tight", dpi=150)
    plt.close(fig)

    # Graphique temporel
    df_time = df.groupby(["Date", "Qualité du retour"]).size().unstack(fill_value=0).iloc[:-1]
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(df_time.index, df_time.get("positif", 0), color='green', label='Positif')
    ax.bar(df_time.index, -df_time.get("négatif", 0), color='red', label='Négatif')
    ax.set_title("Évolution des retours dans le temps")
    ax.set_xlabel("Date")
    ax.set_ylabel("Nombre de retours")
    ax.legend()
    graph_time_filename = "graph_time.png"
    fig.savefig(graph_time_filename, bbox_inches="tight", dpi=150)
    plt.close(fig)

    # Graphique en barres par thème
    media_counts = df.groupby(["Thème", "Qualité du retour"]).size().unstack(fill_value=0)
    media_counts = media_counts.div(media_counts.sum(axis=1), axis=0).iloc[1:]  # Normalisation

    fig, ax = plt.subplots(figsize=(8, 6))
    media_counts.plot(kind='bar', stacked=True, ax=ax, color=['red', 'green', 'gray'])
    ax.set_title("Proportions des retours par Thème")
    ax.set_xlabel("Thème")
    ax.set_ylabel("Proportion")
    ax.legend(["Négatif", "Positif", "Factuel"], loc="best", fontsize=8)
    plt.xticks(rotation=45)

    graph_bar_theme_filename = "graph_bar_quality_theme.png"
    fig.savefig(graph_bar_theme_filename, bbox_inches="tight", dpi=150)
    plt.close(fig)

    # Insertion des graphiques dans le PDF
    c.drawImage(graph_pos_filename, 2 * cm, height - 18 * cm, width=15 * cm, height=12 * cm)
    c.showPage()
    
    c.drawImage(graph_neg_filename, 2 * cm, height - 18 * cm, width=15 * cm, height=12 * cm)
    c.showPage()
    
    c.drawImage(graph_bar_filename, 2 * cm, height - 18 * cm, width=15 * cm, height=12 * cm)
    c.showPage()

    c.drawImage(graph_bar_theme_filename, 2 * cm, height - 18 * cm, width=15 * cm, height=12 * cm)
    c.showPage()

    c.setFont("Helvetica-Bold", 20)
    c.drawString(2 * cm, height - 6 * cm, "3. Graphique temporel")
    
    c.drawImage(graph_time_filename, 2 * cm, height - 18 * cm, width=15 * cm, height=12 * cm)
    c.showPage()

    c.save()

    os.remove(graph_pos_filename)
    os.remove(graph_neg_filename)
    os.remove(graph_bar_filename)
    os.remove(graph_time_filename)

    return temp_path



