# Video Clipper Service

Python FastAPI service for processing YouTube videos and generating viral clips.

## Requirements

- Python 3.8+
- ffmpeg (must be installed and in PATH)
- OpenAI API key (for AI analysis)

## Installation

```bash
pip install -r requirements.txt
```

## Development

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

## Production

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 3001
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4o analysis

## API Endpoints

- `POST /analyze`: Start video analysis
- `GET /status/{task_id}`: Get task status
- `GET /result/{task_id}`: Get analysis results
- `GET /health`: Health check

## Services Used

- **yt-dlp**: Download YouTube videos
- **Whisper**: Transcribe audio to text
- **OpenAI GPT-4o**: Analyze content and identify viral segments
- **FFmpeg**: Process and crop videos
