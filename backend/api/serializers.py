from django.contrib.auth.models import User
from rest_framework import serializers
from .models import ChatSession
from .models import BaseFile, PDFFile, ImageFile, OtherFile
from .ai_files.llm_discussion import reponse_llm
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from rest_polymorphic.serializers import PolymorphicSerializer
from .models import BaseFile, PDFFile, ImageFile, OtherFile


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
        fields = ["id", "title", "user", "messages", "created_at"]
        read_only_fields = ["id", "user", "created_at"]

    def create(self, validated_data):
        # Ajouter l'utilisateur connecté au modèle
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ChatSessionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ["messages"]

    def update(self, instance, validated_data):
        # Ajout d'un nouveau message utilisateur
        new_messages = validated_data.get("messages")
        if new_messages:
            instance.messages.extend(new_messages)  # Ajouter au tableau existant
            self.treat_the_message(instance, new_messages)
        instance.save()
        return instance
    
    def treat_the_message(self, instance, new_messages):
        rep = reponse_llm(instance.messages)
        if rep:
            instance.messages.append(rep)
   


#### RAG serializers 

class BaseFileSerializer(serializers.ModelSerializer):
    sessionid = serializers.IntegerField(write_only=True)  # Temporary field for input
    chatsession = serializers.PrimaryKeyRelatedField(read_only=True)  # Output field (linked object)

    class Meta:
        model = BaseFile
        fields = ['id', 'title', 'sessionid', 'chatsession', 'file', 'created_at']
        read_only_fields = ['id', 'title', 'chatsession', 'created_at']

    def validate(self, attrs):
        request = self.context.get('request')
        session_id = attrs.get('sessionid')

        # Ensure session exists and belongs to the user
        try:
            chat_session = ChatSession.objects.get(pk=session_id)
        except ChatSession.DoesNotExist:
            raise serializers.ValidationError({"sessionid": "ChatSession does not exist."})

        if chat_session.user != request.user:
            raise serializers.ValidationError({"sessionid": "You do not have permission to use this session."})

        # Replace sessionid with the actual ChatSession object
        attrs['chatsession'] = chat_session
        return attrs

    def create(self, validated_data):
        # 'sessionid' has already been handled in validate
        validated_data.pop('sessionid', None)
        return BaseFile.objects.create(**validated_data)



    
class PDFFileSerializer(BaseFileSerializer):
    class Meta(BaseFileSerializer.Meta):  # Hériter des champs et des options Meta
        model = PDFFile

    def create(self, validated_data):
        # 'sessionid' has already been handled in validate
        validated_data.pop('sessionid', None)
        return PDFFile.objects.create(**validated_data)
    

class ImageFileSerializer(BaseFileSerializer):
    class Meta(BaseFileSerializer.Meta):  # Hériter des champs et des options Meta
        model = ImageFile

    def create(self, validated_data):
        # 'sessionid' has already been handled in validate
        validated_data.pop('sessionid', None)
        return ImageFile.objects.create(**validated_data)


class OtherFileSerializer(BaseFileSerializer):
    class Meta(BaseFileSerializer.Meta):  # Hériter des champs et des options Meta
        model = OtherFile

    def create(self, validated_data):
        # 'sessionid' has already been handled in validate
        validated_data.pop('sessionid', None)
        return OtherFile.objects.create(**validated_data)


class BaseFilePolymorphicSerializer(PolymorphicSerializer):
    """
    Polymorphic serializer for BaseFile and its child models.
    """
    model_serializer_mapping = {
        BaseFile: BaseFileSerializer,
        PDFFile: PDFFileSerializer,
        ImageFile: ImageFileSerializer,
        OtherFile: OtherFileSerializer,
    }