from django.urls import path
from . import views
from .views import ChatSessionDetailView, FileView, ChatSessionFilesView, ResultExcelFilesView, ResultPDFFilesView, ResultObjectExcelFilesView

urlpatterns = [
    path("chatsessions/", ChatSessionDetailView.as_view(), name="chat_session_detail"),
    path('chatsessions/files/', ChatSessionFilesView.as_view(), name='chatsession-images'),
    path('fileupload/', FileView.as_view(), name='file-upload'),
    path('fileupload/<int:file_id>/', FileView.as_view(), name='file-delete'),
    path('resultfile/', ResultExcelFilesView.as_view(), name='result-file'),
    path("reportfile/", ResultPDFFilesView.as_view(), name="report-file"),
    path("objectresultfile/", ResultObjectExcelFilesView.as_view(), name="object-result-file"),
]