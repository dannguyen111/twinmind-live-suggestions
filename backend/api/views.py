from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
import os
from .services.orchestrator import generate_live_suggestions, generate_chat_response

@api_view(['POST'])
def process_audio(request):
    audio_file = request.FILES.get('audio')
    api_key = request.data.get('apiKey') or os.environ.get('GROQ_API_KEY')
    previous_context = request.data.get('context', '')

    if not audio_file or not api_key:
        return Response({"error": "Audio file and API key are required."}, status=400)

    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    files = {
        "file": ("chunk.webm", audio_file.read())
    }
    data = {
        "model": "whisper-large-v3",
        "response_format": "json"
    }

    try:
        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()
        transcript_chunk = response.json().get('text', '').strip()
        
        suggestions = []
        
        if transcript_chunk:
            full_context = f"{previous_context}\n{transcript_chunk}".strip()
            suggestions = generate_live_suggestions(api_key, full_context)

        return Response({
            "transcript": transcript_chunk,
            "suggestions": suggestions 
        })

    except requests.exceptions.RequestException as e:
        error_details = e.response.text if e.response is not None else str(e)
        print(f"Groq API Error Details: {error_details}")
        
        return Response({"error": "Failed to transcribe audio from Groq"}, status=500)
    
@api_view(['POST'])
def chat_message(request):
    query = request.data.get('query')
    transcript = request.data.get('transcript', '')
    history = request.data.get('history', [])
    api_key = request.data.get('apiKey') or os.environ.get('GROQ_API_KEY')

    if not query or not api_key:
        return Response({"error": "Query and API key are required."}, status=400)

    answer = generate_chat_response(api_key, transcript, history, query)
    
    return Response({"answer": answer})