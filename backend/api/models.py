from django.db import models
from django.contrib.auth.models import User

from django.utils.timezone import now
import os
import PyPDF2
from PIL import Image
from polymorphic.models import PolymorphicModel


# Create your models here.

class ChatSession(models.Model):
    title = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    messages = models.JSONField(default=list) 
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

    def extract_data(self):
        """Default extract method for text files."""
        try:
            self.content = ""
        except Exception as e:
            self.content = f"Error extracting data: {str(e)}"
        return self.content


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
        try:
            with open(self.file.path, 'rb') as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                self.content = " ".join(page.extract_text() for page in reader.pages)
        except Exception as e:
            self.content = f"Error extracting data from PDF: {str(e)}"
        self.index_content()
        return self.embeddings


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
        try:
            # Utiliser Pillow et Tesseract pour extraire du texte d'une image
            image = Image.open(self.file)
            self.content = "" #pytesseract.image_to_string(image, lang='eng')
        except Exception as e:
            self.content = f"Error extracting data from image file: {str(e)}"
        return self.content


# Other File Model
class OtherFile(BaseFile):
    def save(self, *args, **kwargs):
        """Override save to determine and create specific subclass."""
        if not self.content or not self.embeddings:
            self.extract_data()
        if self.file and not self.title:  # Check if the file exists and title is not set
            self.title = os.path.basename(self.file.name)  # Extract the file name
        super().save(*args, **kwargs)  # Save the file first
