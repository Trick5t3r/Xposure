from django.contrib.auth.models import User
from rest_framework import serializers
from .models import ChatSession
from .models import BaseFile, PDFFile, ImageFile, OtherFile
from .ai_files.llm_discussion import reponse_llm, interaction_llm
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from rest_polymorphic.serializers import PolymorphicSerializer
from .models import BaseFile, PDFFile, ImageFile, OtherFile, ExcelFile

#Functions
def get_or_create_last_chat_session(user):
    # Tente de récupérer la dernière ChatSession
    chat_session = ChatSession.objects.filter(user=user).order_by('-created_at').first()
    
    # Si aucune session n'existe, en créer une nouvelle
    if not chat_session:
        chat_session = ChatSession.objects.create(user=user, title=f"Session of {user}", messages=[{ "role": "assistant", "content": "Que puis-je faire pour vous ?" }], datas=[])
    
    return chat_session

#Personnalise les tokens
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Ajouter le username dans les claims du token
        token['username'] = user.username

        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwards = {"password": {"write_only":True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    


class ChatSessionSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')  # Champ en lecture seule

    class Meta:
        model = ChatSession
        fields = ["id", "title", "user", "messages", "datas", "created_at"]
        read_only_fields = ["id", "user", "created_at", "datas"]

    def create(self, validated_data):
        # Ajouter l'utilisateur connecté au modèle
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ChatSessionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ["messages", "datas"]
        read_only_fields = ["datas"]

    def update(self, instance, validated_data):
        # Ajout d'un nouveau message utilisateur
        new_messages = validated_data.get("messages")
        if new_messages:
            instance.messages.extend(new_messages)  # Ajouter au tableau existant
            self.treat_the_message(instance, new_messages)
        instance.save()
        return instance
    
    def treat_the_message(self, instance, new_messages):
        interaction_llm(instance)
   

class ChatSessionUpdateSerializerAsync(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ["messages", "datas"]
        read_only_fields = ["datas"]


#### RAG serializers 

class BaseFileSerializer(serializers.ModelSerializer):
    chatsession = serializers.PrimaryKeyRelatedField(read_only=True)  # Output field (linked object)

    class Meta:
        model = BaseFile
        fields = ['id', 'title', 'chatsession', 'file', 'created_at', 'date', 'region', 'isResultFile']
        read_only_fields = ['id', 'title', 'chatsession', 'created_at', 'isResultFile']

    def validate(self, attrs):
        request = self.context.get('request')
        # Replace sessionid with the actual ChatSession object
        attrs['chatsession'] = get_or_create_last_chat_session(request.user)
        return attrs



    
class PDFFileSerializer(BaseFileSerializer):
    class Meta(BaseFileSerializer.Meta):  # Hériter des champs et des options Meta
        model = PDFFile

class ExcelFileSerializer(BaseFileSerializer):
    class Meta(BaseFileSerializer.Meta):  # Hériter des champs et des options Meta
        model = ExcelFile

class ImageFileSerializer(BaseFileSerializer):
    class Meta(BaseFileSerializer.Meta):  # Hériter des champs et des options Meta
        model = ImageFile


class OtherFileSerializer(BaseFileSerializer):
    class Meta(BaseFileSerializer.Meta):  # Hériter des champs et des options Meta
        model = OtherFile


class BaseFilePolymorphicSerializer(PolymorphicSerializer):
    """
    Polymorphic serializer for BaseFile and its child models.
    """
    model_serializer_mapping = {
        BaseFile: BaseFileSerializer,
        PDFFile: PDFFileSerializer,
        ImageFile: ImageFileSerializer,
        ExcelFile: ExcelFileSerializer,
        OtherFile: OtherFileSerializer,
    }