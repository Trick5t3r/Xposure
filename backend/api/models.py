from django.db import models
from django.contrib.auth.models import User

from django.utils.timezone import now
import os
from PIL import Image
from polymorphic.models import PolymorphicModel
from .ai_files.excel_tools import complete_excel
import stat

import pandas as pd
from django.core.files.base import ContentFile
from django.core.exceptions import MultipleObjectsReturned


import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


# Create your models here.
def get_or_create_result_excel(self):
    # Tenter de récupérer un fichier existant correspondant aux critères
    result_file = None
    try:
        result_file = ExcelFile.objects.get(date=self.date, region=self.region, isResultFile=True)
    except ExcelFile.DoesNotExist:
        # Créer un fichier Excel vide avec les en-têtes
        temp_path = f"/tmp/result_{self.date}_{self.region}.xlsx"
        headers = ["Territoire", "Sujet", "Thème", "Qualité du retour", "Média", "Article"]
        df_empty = pd.DataFrame(columns=headers)
        df_empty.to_excel(temp_path, index=False)  # Désactiver l'inclusion de l'index

        # Créer un nouvel objet ExcelFile
        result_file = ExcelFile.objects.create(
            title=f"result_{self.date}_{self.region}.xlsx",
            chatsession=self.chatsession,
            created_at=now(),
            date=self.date, 
            region=self.region, 
            isResultFile=True,
        )
        
        # Enregistrer le fichier vide dans l'objet ExcelFile
        with open(temp_path, "rb") as f:
            result_file.file.save(f"result_{self.date}_{self.region}.xlsx", ContentFile(f.read()))
        os.remove(temp_path)
    except MultipleObjectsReturned:
        # Si plusieurs fichiers existent, on en prend un arbitrairement (le premier)
        result_file = ExcelFile.objects.filter(date=self.date, region=self.region, isResultFile=True).first()

    # Charger le fichier actuel
    if not self.file:
        raise ValueError("Le fichier source n'existe pas.")
    
    df_new = pd.read_excel(self.file.path, skiprows=1, index_col=None)  # Ignore la première ligne, pas d'index inutile

    # Charger le fichier existant ou créer un DataFrame vide
    if result_file.file:
        df_result = pd.read_excel(result_file.file.path, index_col=None)  # Pas d'index inutile
    else:
        df_result = pd.DataFrame(columns=headers)
    logging.info(df_result)
    logging.info(df_new)
    # Vérifier que les colonnes sont bien alignées avant de concaténer
    df_new.columns = ["Territoire", "Sujet", "Thème", "Qualité du retour", "Média", "Article"]
    if not df_new.empty:
        df_new = df_new[df_result.columns]  # Aligner les colonnes avec le fichier existant
    
    # Ajouter les nouvelles lignes
    df_result = pd.concat([df_result, df_new], ignore_index=True)

    # Sauvegarde temporaire du fichier
    temp_path = f"/tmp/result_{self.date}_{self.region}.xlsx"
    df_result.to_excel(temp_path, index=False)  # Désactiver l'inclusion de l'index

    # Enregistrer le fichier dans l'objet ExcelFile
    with open(temp_path, "rb") as f:
        result_file.file.save(f"result_{self.date}_{self.region}.xlsx", ContentFile(f.read()))

    result_file.save()
    os.remove(temp_path)

    return result_file


class ChatSession(models.Model):
    title = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    messages = models.JSONField(default=list) 
    datas = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session with {self.user.username} at {self.created_at}"
    
# Base Model
class BaseFile(PolymorphicModel):
    title = models.CharField(blank=True, null=True, max_length=255)
    chatsession = models.ForeignKey(ChatSession, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=now)
    file = models.FileField()#upload_to='uploads/')
    content = models.TextField(blank=True, null=True)  # For storing extracted text
    date = models.CharField(max_length=7, blank=True, null=True)  
    region = models.CharField(max_length=3, null=True, blank=True)
    isResultFile = models.BooleanField(default=False)

    def extract_data(self):
        """Default extract method for text files."""
        self.content = ""
        return ""


# PDF File Model
class PDFFile(BaseFile):
    def save(self, *args, **kwargs):
        """Override save to determine and create specific subclass."""
        if not self.content or not self.embeddings:
            self.extract_data()
        if self.file and not self.title:  # Check if the file exists and title is not set
            self.title = os.path.basename(self.file.name)  # Extract the file name
        super().save(*args, **kwargs)  # Save the file first

    def extract_data(self):
        self.content = ""
        return ""
    
# Excel File Model
class ExcelFile(BaseFile):
    datas = models.JSONField(default=list)

    def save(self, *args, **kwargs):
        """Override save to determine and create specific subclass."""
        if not self.content or not self.datas:
            self.extract_data()
        if self.file and not self.title:  # Check if the file exists and title is not set
            self.title = os.path.basename(self.file.name)  # Extract the file name
        super().save(*args, **kwargs)  # Save the file first
        if self.file:
            file_path = self.file.path
            os.chmod(file_path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)
            if self.isResultFile:
                complete_excel(file_path)
            else:
                get_or_create_result_excel(self)

    def extract_data(self):
        self.content = ""
        self.datas = []
        return ""


# Image File Model
class ImageFile(BaseFile):
    def save(self, *args, **kwargs):
        """Override save to determine and create specific subclass."""
        if not self.content or not self.embeddings:
            self.extract_data()
        if self.file and not self.title:  # Check if the file exists and title is not set
            self.title = os.path.basename(self.file.name)  # Extract the file name
        super().save(*args, **kwargs)  # Save the file first

    def extract_data(self):
        self.content = ""
        return ""


# Other File Model
class OtherFile(BaseFile):
    def save(self, *args, **kwargs):
        """Override save to determine and create specific subclass."""
        if not self.content or not self.embeddings:
            self.extract_data()
        if self.file and not self.title:  # Check if the file exists and title is not set
            self.title = os.path.basename(self.file.name)  # Extract the file name
        super().save(*args, **kwargs)  # Save the file first
