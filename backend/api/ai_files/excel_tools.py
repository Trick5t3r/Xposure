#ne pas faire d'import circular
from openpyxl import load_workbook

import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def complete_excel(file_path):
    logging.info(file_path)
    # Charger le fichier Excel existant
    wb = load_workbook(file_path)
    ws = wb.active

    # Définir les en-têtes de colonnes attendus
    headers = ["Date", "Territoire", "Sujet", "Thème", "Qualité du retour", "Média", "Article"]
    
    # Trouver l’index des colonnes en fonction des en-têtes
    header_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]  # Première ligne
    header_indices = {header: i for i, header in enumerate(header_row) if header in headers}

    # Vérifier chaque ligne (à partir de la 2ème, car la 1ère est l’en-tête)
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
        for header, col_idx in header_indices.items():
            cell = row[col_idx]  # Récupérer la cellule correspondant à la colonne
            if cell.value is None or str(cell.value).strip() == "":
                cell.value = "1"  # Remplacer les valeurs vides par None

    # Sauvegarder les modifications
    wb.save(file_path)
