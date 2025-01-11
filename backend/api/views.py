from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, ChatSessionSerializer, ChatSessionUpdateSerializer, CustomTokenObtainPairSerializer, BaseFilePolymorphicSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import ChatSession, BaseFile, ImageFile
from rest_framework_simplejwt.views import TokenObtainPairView

# Create your views here.
#Pour les tokens
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ChatSessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ChatSessionSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ChatSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, session_id, user):
        return get_object_or_404(ChatSession, id=session_id, user=user)

    def get(self, request, session_id):
        session = self.get_object(session_id, request.user)
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, session_id):
        session = self.get_object(session_id, request.user)
        serializer = ChatSessionUpdateSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, session_id):
        session = self.get_object(session_id, request.user)
        session.delete()
        return Response({"detail": "Session deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

      
class FileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print("data:", request.data)
        serializer = BaseFilePolymorphicSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
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

    def get(self, request, chatsession_id, *args, **kwargs):
        try:
            # Vérifier si la ChatSession existe
            chat_session = ChatSession.objects.get(pk=chatsession_id)

            # Vérifier si l'utilisateur a accès à cette ChatSession
            if chat_session.user != request.user:
                return Response(
                    {"detail": "You do not have permission to view these images."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Récupérer toutes les images liées à cette ChatSession
            files = BaseFile.objects.filter(chatsession=chat_session)
            serializer = BaseFilePolymorphicSerializer(files, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ChatSession.DoesNotExist:
            return Response(
                {"detail": "ChatSession not found."},
                status=status.HTTP_404_NOT_FOUND
            )