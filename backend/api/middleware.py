import jwt
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class JWTAuthMiddleware:
    """
    Middleware personnalisé pour gérer l'authentification basée sur JWT
    pour les connexions WebSocket.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Extraire le token JWT de la chaîne de requête
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]

        if token:
            # Valider et décoder le token JWT
            scope['user'] = await self.get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            # Valider le token JWT
            UntypedToken(token)
            
            # Décoder le payload du token pour récupérer l'ID utilisateur
            decoded_data = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"]  # Utilisez l'algorithme correspondant
            )
            user_id = decoded_data.get("user_id")
            return User.objects.get(id=user_id)
        except (jwt.ExpiredSignatureError, jwt.DecodeError, jwt.InvalidTokenError, User.DoesNotExist):
            return AnonymousUser()
