from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, ChatSessionSerializer, ChatSessionUpdateSerializer, CustomTokenObtainPairSerializer, BaseFilePolymorphicSerializer, get_or_create_last_chat_session, PDFFileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import ChatSession, BaseFile, ImageFile, ExcelFile, PDFFile
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .ai_files.pdf_extraction import pdf_to_excel
import pandas as pd
import json


# Create your views here.
#Pour les tokens
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        return data
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ChatSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user):
        return get_or_create_last_chat_session(user=user)

    def get(self, request):
        session = self.get_object(request.user)
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        session = self.get_object(request.user)
        serializer = ChatSessionUpdateSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        session = self.get_object(request.user)
        session.delete()
        return Response({"detail": "Session deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
      
class FileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """Récupérer tous les fichiers de l'utilisateur connecté"""
        files = BaseFile.objects.filter(chatsession__user=request.user)
        serializer = BaseFilePolymorphicSerializer(files, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        print("data:", request.data)
        serializer = BaseFilePolymorphicSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            pdf_to_excel(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, file_id, *args, **kwargs):
        try:
            # Retrieve the file to delete
            file_instance = BaseFile.objects.get(pk=file_id)

            # Check if the user has access to this file via the ChatSession
            if file_instance.chatsession.user != request.user:
                return Response(
                    {"detail": "You do not have permission to delete this file."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Delete the associated file and the instance
            file_instance.file.delete(save=False)
            file_instance.delete()

            return Response(
                {"detail": "File deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        except BaseFile.DoesNotExist:
            return Response(
                {"detail": "File not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class ChatSessionFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Vérifier si la ChatSession existe
            chat_session = get_or_create_last_chat_session(request.user) #ChatSession.objects.get(pk=chatsession_id)

            # Récupérer toutes les images liées à cette ChatSession
            files = BaseFile.objects.filter(chatsession=chat_session)
            serializer = BaseFilePolymorphicSerializer(files, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ChatSession.DoesNotExist:
            return Response(
                {"detail": "ChatSession not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
class ResultExcelFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Vérifier si la ChatSession existe
            chat_session = get_or_create_last_chat_session(request.user) #ChatSession.objects.get(pk=chatsession_id)

            # Récupérer toutes les images liées à cette ChatSession
            files = ExcelFile.objects.filter(chatsession=chat_session, isResultFile=True, region=request.GET.get("region"), date=request.GET.get("date"))
            json_dict = excel_to_json(files[0].file.path)
            return Response(json_dict, status=status.HTTP_200_OK)

        except ChatSession.DoesNotExist:
            return Response(
                {"detail": "ChatSession not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class ResultPDFFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Récupérer la session active
            chat_session = get_or_create_last_chat_session(request.user)

            # Filtrer les fichiers PDF par date et région
            pdf_files = PDFFile.objects.filter(
                chatsession=chat_session,
                region=request.GET.get("region"),
                date=request.GET.get("date"),
                isResultFile=True
            )

            if not pdf_files.exists():
                return Response({"detail": "Aucun fichier PDF trouvé."}, status=status.HTTP_404_NOT_FOUND)

            # Sérialiser les fichiers trouvés
            serializer = PDFFileSerializer(pdf_files, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ChatSession.DoesNotExist:
            return Response(
                {"detail": "ChatSession non trouvée."},
                status=status.HTTP_404_NOT_FOUND
            )

def excel_to_json(file_path):
    """
    Charge un fichier Excel et le convertit en JSON structuré.
    
    :param file_path: Chemin du fichier Excel (.xlsx)
    :return: JSON sous forme de string
    """
    try:
        # Charger le fichier Excel
        df = pd.read_excel(file_path)
        
        # Convertir le DataFrame en une liste de dictionnaires
        data_dict = df.to_dict(orient="records")
        
        return data_dict
    except Exception as e:
        return json.dumps({"erreur": str(e)}, indent=4)