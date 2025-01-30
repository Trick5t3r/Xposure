from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, ChatSessionSerializer, ChatSessionUpdateSerializer, CustomTokenObtainPairSerializer, BaseFilePolymorphicSerializer, get_or_create_last_chat_session
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import ChatSession, BaseFile, ImageFile
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .ai_files.llm_tools import pdf_to_excel



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

    def post(self, request, *args, **kwargs):
        print("data:", request.data)
        serializer = BaseFilePolymorphicSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            pdf_to_excel(self, serializer)
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