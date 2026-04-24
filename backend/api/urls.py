from django.urls import path
from . import views

urlpatterns = [
    path('process-audio/', views.process_audio, name='process_audio'),
]