# AI Video Clipper

An automated "AI Video Strategist" application that takes a YouTube URL, analyzes the content, and repurposes it into short viral clips (TikTok/Shorts format).

## 🎯 Features

- **YouTube Video Analysis**: Download and analyze YouTube videos
- **AI-Powered Clip Selection**: Identify the most viral moments using NVIDIA Nemotron Nano 12B 2 VL
- **Automatic Transcription**: Convert video audio to text with timestamps
- **Smart Cropping**: Crop videos to vertical format (9:16), square (1:1), or Instagram (4:5)
- **Metadata Generation**: Auto-generate titles, descriptions, and hashtags
- **Progress Tracking**: Real-time visualization of the processing pipeline
- **Viral Score**: Each clip gets a viral potential score

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui with Tailwind CSS 4
- **Components**:
  - Input form for YouTube URL, ratio, and style
  - Progress visualization with 4-step pipeline
  - Results display with clip cards and viral scores
  - Copy-to-clipboard for titles, descriptions, hashtags

### Backend (Python FastAPI)
- **Framework**: FastAPI with async support
- **Endpoints**:
  - `POST /analyze`: Start video analysis task
  - `GET /status/{task_id}`: Get task progress
  - `GET /result/{task_id}`: Retrieve generated clips
  - `GET /health`: Health check

### Processing Pipeline
1. **Download**: Fetch video using yt-dlp
2. **Transcribe**: Convert audio to text with Whisper
3. **Analyze**: Send transcript to NVIDIA Nemotron Nano 12B 2 VL to identify viral segments
4. **Process**: Use FFmpeg to crop and cut clips
5. **Generate**: Create metadata (titles, descriptions, hashtags)

## 🚀 Getting Started

### Prerequisites

1. **Node.js 18+** (for Next.js frontend)
2. **Python 3.8+** (for FastAPI backend)
3. **ffmpeg** (must be installed and in system PATH)
4. **NVIDIA API Key** (for Nemotron Nano 12B 2 VL analysis)

### Installation

#### 1. Install Frontend Dependencies
```bash
bun install
```

#### 2. Install Python Backend Dependencies
```bash
cd mini-services/video-clipper-service
pip install -r requirements.txt
```

#### 3. Set Environment Variables
```bash
export NVIDIA_API_KEY=your_nvidia_api_key_here
```

### Running the Application

#### Start Next.js Frontend (Port 3000)
```bash
bun run dev
```

#### Start Python Backend (Port 3001)
```bash
cd mini-services/video-clipper-service
python -m uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

### Development

The frontend is available at: `http://localhost:3000`

The API health check is available at: `http://localhost:3001/health`

## 📂 Project Structure

```
/home/z/my-project/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main frontend component
│   │   └── api/
│   │       └── video-clipper/
│   │           ├── analyze/route.ts    # Proxy to analyze endpoint
│   │           ├── status/route.ts     # Proxy to status endpoint
│   │           └── result/route.ts     # Proxy to result endpoint
│   └── components/
│       └── ui/                         # shadcn/ui components
├── mini-services/
│   └── video-clipper-service/
│       ├── main.py                     # FastAPI application
│       ├── requirements.txt            # Python dependencies
│       └── README.md                   # Service documentation
└── package.json                        # Frontend dependencies
```

## 🎨 UI Components Used

- **Button**: Interactive buttons with loading states
- **Card**: Card layout for sections
- **Input & Textarea**: Form inputs
- **Select**: Dropdown selections
- **Progress**: Progress bar visualization
- **Badge**: Status badges and scores
- **Tabs**: Tabbed interface (Analyze/Results)
- **Toast**: Notifications

## 🔧 Technology Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- Lucide React (icons)
- Sonner (toasts)

### Backend
- FastAPI
- Uvicorn
- Pydantic
- yt-dlp (YouTube downloads)
- NVIDIA Nemotron Nano 12B 2 VL (AI analysis)
- ffmpeg-python (video processing)
- OpenAI Whisper (transcription)

## 📝 Usage

1. Open the application at `http://localhost:3000`
2. Enter a YouTube URL in the input field
3. Select aspect ratio (9:16 for TikTok/Shorts/Reels)
4. Choose analysis style (viral, educational, entertaining, motivational)
5. Click "Start Analysis"
6. Watch the real-time progress visualization
7. View generated clips in the "Results" tab
8. Copy titles, descriptions, and hashtags for your content

## 🎯 Analysis Styles

- **Viral & Trending**: Focus on high-engagement, trending content
- **Educational**: Extract key learning moments and explanations
- **Entertaining**: Find the most entertaining and funny segments
- **Motivational**: Identify inspiring and uplifting moments

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NVIDIA_API_KEY` | Your NVIDIA API key for Nemotron model | Yes |

## 📊 Data Flow

```
Frontend (Next.js)
    ↓
API Routes (Next.js)
    ↓
FastAPI Backend (Python)
    ↓
Video Processing Pipeline
    ├─ yt-dlp (Download)
    ├─ Whisper (Transcribe)
    ├─ OpenAI GPT-4o (Analyze)
    └─ FFmpeg (Process)
    ↓
Results returned to Frontend
```

## 🎨 Design Features

- Modern gradient backgrounds
- Dark mode support
- Responsive design (mobile-first)
- Smooth animations and transitions
- Accessible UI components
- Sticky header and footer
- Real-time progress feedback

## 🔒 CORS

CORS is enabled for all origins in the development environment. For production, update the CORS middleware in `main.py` to allow only specific origins.

## 🚧 Production Considerations

1. **Task Storage**: Replace in-memory task storage with a proper database (PostgreSQL, Redis)
2. **File Storage**: Use cloud storage (S3, GCS) for video files
3. **Queue System**: Implement a task queue (Celery) for better resource management
4. **Rate Limiting**: Add API rate limiting
5. **Authentication**: Add user authentication
6. **Error Monitoring**: Add logging and error tracking (Sentry)
7. **Deployment**: Use Docker containers for easy deployment

## 📄 License

This project is part of the AI Video Clipper implementation.

## 👤 Author

Built with ❤️ using Next.js, FastAPI, and AI technologies
