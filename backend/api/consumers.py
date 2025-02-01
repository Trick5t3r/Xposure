import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ChatSession
from .serializers import (
    ChatSessionSerializer,
    ChatSessionUpdateSerializerAsync,
    get_or_create_last_chat_session
)

import asyncio
import logging
from .ai_files.async_aws_llm_rag import async_llm_discussion

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Gère la connexion WebSocket et authentifie l'utilisateur.
        """
        user = self.scope.get('user', None)
        if user and user.is_authenticated:
            # Accepter la connexion WebSocket
            await self.accept()
            self.user = user
            try:
                self.session = await self.get_or_create_last_chat_session(user)
            except Exception as e:
                # En cas d'erreur lors de la récupération ou création de la session
                await self.send(text_data=json.dumps({"error": f"Session error: {str(e)}"}))
                await self.close()
        else:
            # Refuser la connexion si non authentifié
            await self.close()

    async def disconnect(self, close_code):
        """
        Gère les déconnexions WebSocket (optionnel).
        """
        pass

    async def receive(self, text_data):
        """
        Reçoit les données du client WebSocket et traite l'action spécifiée.
        """
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            # Gérer le cas où les données ne sont pas en format JSON valide
            await self.send(text_data=json.dumps({"error": "Invalid JSON format"}))
            return

        method = data.get("method", None)  # Récupérer la méthode
        if not method:
            # Si aucune méthode n'est spécifiée
            await self.send(text_data=json.dumps({"error": "HTTP method is required"}))
            return

        # Associer la méthode à une action
        try:
            if method == "GET":
                await self.get_session()
            elif method == "PATCH":
                await self.patch_session(data)
            elif method == "DELETE":
                await self.delete_session()
            else:
                await self.send(text_data=json.dumps({"error": "Invalid HTTP method"}))
        except Exception as e:
            # En cas d'erreur non gérée
            await self.send(text_data=json.dumps({"error": f"Server error: {str(e)}"}))

    async def get_or_create_last_chat_session(self, user):
        """
        Récupère ou crée la dernière session de chat pour l'utilisateur.
        """
        return await sync_to_async(get_or_create_last_chat_session)(user)

    async def get_session(self):
        """
        Envoie les données de la session actuelle au client.
        """
        if not hasattr(self, 'session') or self.session is None:
            await self.send(text_data=json.dumps({"error": "No active session"}))
            return

        serializer = ChatSessionSerializer(self.session)
        await self.send(text_data=json.dumps({
            "type": "get_session",
            "data": serializer.data
        }))

    async def patch_session(self, data):
        """
        Met à jour la session actuelle avec les données reçues.
        """
        if not hasattr(self, 'session') or self.session is None:
            await self.send(text_data=json.dumps({"error": "No active session"}))
            return
        



        # Exemple thinking
        new_messages = await async_llm_discussion(self, data['newMessage'])

        #####

        



        serializer = ChatSessionUpdateSerializerAsync(self.session, data={"messages" : new_messages}, partial=True)
        if serializer.is_valid():
            await sync_to_async(serializer.save)()
            await sync_to_async(self.session.refresh_from_db)()
            updated_data = await sync_to_async(lambda: ChatSessionSerializer(self.session).data)()

            response_data = {
                "messages": updated_data.get("messages", []),  # Extract "messages" or default to empty list
                "datas": updated_data.get("datas", []) # Add "datas" key with static value
            }

            await self.send(text_data=json.dumps({
                "type": "update_session",
                "data": response_data
            }))
        else:
            await self.send(text_data=json.dumps({
                "type": "error",
                "errors": serializer.errors
            }))

    async def delete_session(self):
        """
        Supprime la session actuelle.
        """
        if not hasattr(self, 'session') or self.session is None:
            await self.send(text_data=json.dumps({"error": "No active session"}))
            return

        await sync_to_async(self.session.delete)()
        self.session = None
        await self.send(text_data=json.dumps({
            "type": "delete_session",
            "detail": "Session deleted successfully."
        }))
