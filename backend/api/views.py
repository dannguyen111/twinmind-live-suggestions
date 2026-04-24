from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
import os

@api_view(['POST'])
def process_audio(request):
    audio_file = request.FILES.get('audio')
    api_key = request.data.get('apiKey') or os.environ.get('GROQ_API_KEY')

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
        
        result = response.json()
        transcript = result.get('text', '')
        
        # NOTE: Inject the GPT-OSS 120B call right here to generate live suggestions.
        
        return Response({
            "transcript": transcript,
            "suggestions": [] # Placeholder for now
        })

    except requests.exceptions.RequestException as e:
        error_details = e.response.text if e.response is not None else str(e)
        print(f"Groq API Error Details: {error_details}")
        
        return Response({"error": "Failed to transcribe audio from Groq"}, status=500)