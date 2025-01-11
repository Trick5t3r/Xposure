from django.urls import path
from . import views
from .views import ChatSessionListCreateView, ChatSessionDetailView, FileView, ChatSessionFilesView

urlpatterns = [
    path("chatsessions/", ChatSessionListCreateView.as_view(), name="chat_session_list_create"),
    path('chatsessions/<int:chatsession_id>/files/', ChatSessionFilesView.as_view(), name='chatsession-images'),
    path("chatsessions/<int:session_id>/", ChatSessionDetailView.as_view(), name="chat_session_detail"),
    path('fileupload/', FileView.as_view(), name='file-upload'),
    path('fileupload/<int:file_id>/', FileView.as_view(), name='file-delete'),
]