# TwinMind Copilot

TwinMind Copilot is an elite, AI-powered live meeting assistant. It listens to your microphone, transcribes speech in real-time, generates instantly actionable suggestions (like questions to ask or fact-checks), and provides a context-aware chat interface to dive deeper into any topic discussed during the meeting.

## Features
* **Live Audio Transcription:** Captures microphone audio in 30-second chunks and accurately transcribes it using Groq's Whisper model.
* **Real-Time Insights:** Automatically generates color-coded, actionable suggestions based on the meeting context (Questions, Talking Points, Answers, Fact-Checks, Clarifications).
* **Context-Aware Chat:** Click on any live suggestion to get a comprehensive deep dive, or manually type follow-up questions to chat with the AI about the meeting.
* **Smart Context Window:** Truncates older history intelligently to prevent payload limits while maintaining focus on the most relevant recent conversations.
* **Dynamic Settings:** A built-in UI to customize LLM system prompts and token limits on the fly, seamlessly stored in your browser's local storage.
* **Session Export:** Download the full meeting transcript, chronological suggestions, and chat history as a formatted text file with a single click.

## Tech Stack
* **Frontend:** React, Vite, Bootstrap 5, Axios
* **Backend:** Python, Django, Django REST Framework
* **AI & LLMs:** Groq API (`whisper-large-v3` for transcription, `openai/gpt-oss-120b` for orchestration and chat)
* **Infrastructure:** Docker, Docker Compose, Fly.io (Backend Hosting), Vercel (Frontend Hosting)

---

## Local Development Setup

### Prerequisites
* Docker and Docker Compose (Recommended)
* Node.js (v18+) and Python (3.10+) (If running manually)
* A free [Groq API Key](https://console.groq.com/keys)

### Option 1: Run with Docker (Recommended)
The easiest way to run the full stack locally is using the included `docker-compose.yml` file.

1. Clone the repository:
   ```bash
   git clone [[https://github.com/yourusername/twinmind-live-suggestions.git](https://github.com/yourusername/twinmind-live-suggestions.git)](https://github.com/dannguyen111/twinmind-live-suggestions.git)
   cd twinmind-live-suggestions
   ```
2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   * Frontend UI: `http://localhost:5173`
   * Backend API: `http://localhost:8000`

### Option 2: Run Manually
If you prefer to run the services directly on your machine:

**1. Start the Django Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

**2. Start the React Frontend**
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

---

## Configuration & Usage
1. Open the frontend URL (`http://localhost:5173`).
2. You will be greeted by the Welcome Screen. Enter your **Groq API Key** (this is safely saved in your browser's `localStorage` and never stored on the server).
3. Click **Start Mic** to begin recording.
4. Speak for a few seconds, then click **Refresh** to instantly flush the audio chunk and generate your first batch of insights.
5. Click the **Settings** button in the top right to adjust prompt engineering or expand the context limits.

---

## Deployment

This project is configured for a split-deployment architecture for optimal performance on free-tier platforms.

### Backend (Fly.io)
The Django backend is containerized and ready to be deployed to Fly.io using the included `fly.toml` and `backend/Dockerfile`.
1. Install the `flyctl` CLI.
2. Navigate to the `backend/` directory.
3. Run `fly launch` to initialize the app (ensure internal port is set to `8000`).
4. Update your `ALLOWED_HOSTS` in `backend/config/settings.py` with your new `.fly.dev` URL.
5. Run `fly deploy`.

### Frontend (Vercel)
The Vite/React frontend can be seamlessly deployed to Vercel.
1. Connect your GitHub repository to Vercel.
2. Select the `frontend/` directory as the root.
3. Add a new Environment Variable in Vercel:
   * **Key:** `VITE_API_URL`
   * **Value:** `https://your-backend-app.fly.dev`
4. Deploy! Be sure to add your new Vercel URL to `CORS_ALLOWED_ORIGINS` in your Django `settings.py` so the backend accepts its requests.
