import requests
import json
from .prompts import LIVE_SUGGESTIONS_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT

def truncate_text(text, max_chars=15000):
    """Keeps the text within token limits by only taking the most recent characters."""
    if len(text) > max_chars:
        return "... [Older context truncated] ...\n" + text[-max_chars:]
    return text

def generate_live_suggestions(api_key, full_transcript_text):
    """
    Calls the Groq LLM to generate 3 contextual suggestions based on the transcript.
    """
    if not full_transcript_text.strip():
        return []

    safe_transcript = truncate_text(full_transcript_text)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "openai/gpt-oss-120b",
        "messages": [
            {"role": "system", "content": LIVE_SUGGESTIONS_SYSTEM_PROMPT},
            {"role": "user", "content": f"Here is the meeting transcript so far:\n\n{safe_transcript}\n\nProvide the 3 suggestions."}
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        parsed_content = json.loads(content)
        return parsed_content.get("suggestions", [])
        
    except Exception as e:
        print(f"LLM Generation Error: {e}")
        if 'response' in locals():
            print(f"Error Details: {response.text}")
        return []
    
def generate_chat_response(api_key, full_transcript, chat_history, current_query):
    if not current_query:
        return "Please provide a query."

    safe_transcript = truncate_text(full_transcript)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Build the message context array
    messages = [
        {"role": "system", "content": CHAT_SYSTEM_PROMPT},
        {"role": "system", "content": f"MEETING TRANSCRIPT SO FAR:\n{safe_transcript}"}
    ]

    recent_history = chat_history[-10:] if len(chat_history) > 10 else chat_history
    
    # Append the running chat history
    for msg in recent_history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
    messages.append({"role": "user", "content": current_query})

    data = {
        "model": "openai/gpt-oss-120b", 
        "messages": messages,
        "temperature": 0.5,
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content']
    except Exception as e:
        print(f"Chat LLM Error: {e}")
        return "I encountered an error trying to process that request."