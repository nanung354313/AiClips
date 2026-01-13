from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid
import asyncio
import os
import httpx
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="AI Video Clipper Service")

# Configuration
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_MODEL = "nvidia/nemotron-nano-12b-2vl"  # NVIDIA Nemotron Nano 12B 2 VL

# Check if API key is loaded
if NVIDIA_API_KEY:
    print("✅ NVIDIA API Key loaded successfully")
    print(f"   Key format: {NVIDIA_API_KEY[:15]}...{NVIDIA_API_KEY[-10:]}")
else:
    print("⚠️  NVIDIA_API_KEY not found in .env or environment variables")
    print("⚠️  Using mock data for demo mode")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory task storage (in production, use a proper database)
tasks = {}

# Pydantic models
class AnalyzeRequest(BaseModel):
    url: str
    ratio: str = "9:16"
    style: str = "viral"

class VideoClip(BaseModel):
    id: str
    title: str
    description: str
    hashtags: List[str]
    startTime: float
    endTime: float
    duration: float
    viralScore: int

class TaskStatus(BaseModel):
    taskId: str
    status: str  # idle, downloading, transcribing, analyzing, processing, completed, error
    progress: float
    currentStep: str
    error: Optional[str] = None

class AnalysisResult(BaseModel):
    taskId: str
    clips: List[VideoClip]
    originalVideoTitle: str
    originalVideoDuration: float
    createdAt: str

# Routes
@app.post("/analyze")
async def analyze_video(request: AnalyzeRequest):
    """Start video analysis task"""
    task_id = str(uuid.uuid4())

    # Initialize task
    tasks[task_id] = {
        "taskId": task_id,
        "status": "idle",
        "progress": 0,
        "currentStep": "Initializing",
        "error": None
    }

    # Start processing in background
    asyncio.create_task(process_video(task_id, request))

    return {"taskId": task_id}

@app.get("/status/{task_id}")
async def get_status(task_id: str):
    """Get task status"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    return tasks[task_id]

@app.get("/result/{task_id}")
async def get_result(task_id: str):
    """Get analysis results"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    task = tasks[task_id]
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Task not completed yet")

    return task.get("result", {})

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "video-clipper-service"}

async def process_video(task_id: str, request: AnalyzeRequest):
    """Process video: download, transcribe, analyze, create clips"""
    task = tasks[task_id]

    try:
        # Step 1: Download video
        update_task_status(task_id, "downloading", 10, "Downloading video...")
        await download_video(task_id, request.url)

        # Step 2: Transcribe
        update_task_status(task_id, "transcribing", 30, "Transcribing audio...")
        transcript = await transcribe_video(task_id)

        # Step 3: Analyze with AI
        update_task_status(task_id, "analyzing", 50, "Analyzing content with AI...")
        clips_data = await analyze_with_ai(task_id, transcript, request.style)

        # Step 4: Process clips
        update_task_status(task_id, "processing", 80, "Processing video clips...")
        clips = await process_clips(task_id, clips_data, request.ratio)

        # Complete
        update_task_status(task_id, "completed", 100, "Analysis completed!")

        # Store results
        task["result"] = {
            "taskId": task_id,
            "clips": clips,
            "originalVideoTitle": task.get("videoTitle", "Unknown"),
            "originalVideoDuration": task.get("videoDuration", 0),
            "createdAt": datetime.now().isoformat()
        }

    except Exception as e:
        update_task_status(task_id, "error", 0, f"Error: {str(e)}", str(e))

def update_task_status(task_id: str, status: str, progress: float, current_step: str, error: Optional[str] = None):
    """Update task status"""
    if task_id in tasks:
        tasks[task_id].update({
            "status": status,
            "progress": progress,
            "currentStep": current_step
        })
        if error:
            tasks[task_id]["error"] = error

async def download_video(task_id: str, url: str):
    """Download video using yt-dlp"""
    import yt_dlp

    output_dir = f"/tmp/video-clipper/{task_id}"
    os.makedirs(output_dir, exist_ok=True)

    ydl_opts = {
        'format': 'best[ext=mp4]',
        'outtmpl': f'{output_dir}/video.%(ext)s',
        'quiet': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        tasks[task_id]["videoTitle"] = info.get("title", "Unknown")
        tasks[task_id]["videoDuration"] = info.get("duration", 0)
        tasks[task_id]["videoPath"] = f"{output_dir}/video.mp4"

async def transcribe_video(task_id: str) -> str:
    """Transcribe video audio to text"""
    # Note: This would use Whisper in production
    # For demo purposes, return a mock transcript
    await asyncio.sleep(2)

    return """
    [0:00-0:30] Introduction and welcome to the channel
    [0:30-1:00] Main topic discussion and key points
    [1:00-1:30] Detailed explanation and examples
    [1:30-2:00] Summary and conclusion
    [2:00-2:30] Call to action and next steps
    """

async def analyze_with_ai(task_id: str, transcript: str, style: str) -> List[dict]:
    """Analyze transcript to identify viral segments using NVIDIA Nemotron Nano 12B 2 VL"""
    
    if not NVIDIA_API_KEY:
        print("Warning: NVIDIA_API_KEY not set, using mock data")
        # Fall back to mock data if no API key
        await asyncio.sleep(1)
        return get_mock_clips(style)
    
    # Construct the prompt for viral clip analysis
    prompt = f"""
You are an expert video content strategist specializing in creating viral clips for TikTok, YouTube Shorts, and Instagram Reels.

Analyze the following video transcript and identify the 5 best segments for viral short clips.

Transcript:
{transcript}

Style: {style}

Return your response in this exact JSON format (no additional text):
{{
    "clips": [
        {{
            "title": "Attention-grabbing title",
            "description": "2-3 sentence description",
            "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
            "startTime": 0,
            "endTime": 30,
            "viralScore": 95
        }}
    ]
}}

Make sure:
1. Clips are 15-60 seconds each
2. Start times are sequential (don't overlap)
3. Viral scores range from 70-100
4. Titles are hooky and attention-grabbing
5. Descriptions are optimized for engagement
6. Hashtags are relevant and trending
"""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                NVIDIA_API_URL,
                headers={
                    "Authorization": f"Bearer {NVIDIA_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": NVIDIA_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert video content strategist. Always respond with valid JSON."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "response_format": {"type": "json_object"}
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Parse JSON response
                clips_data = json.loads(content)
                
                # Add UUIDs to clips
                for clip in clips_data["clips"]:
                    clip["id"] = str(uuid.uuid4())
                
                return clips_data["clips"]
            else:
                print(f"NVIDIA API error: {response.status_code} - {response.text}")
                # Fall back to mock data
                return get_mock_clips(style)
                
    except Exception as e:
        print(f"Error calling NVIDIA API: {str(e)}")
        # Fall back to mock data
        return get_mock_clips(style)

def get_mock_clips(style: str) -> List[dict]:
    """Return mock clips when API is not available"""
    style_specific_titles = {
        "viral": [
            "Hook: Mind-Blowing Opening",
            "Key Insight: The Secret Formula",
            "Story: The Turning Point",
            "Action: Three Quick Steps",
            "CTA: Join the Community"
        ],
        "educational": [
            "Concept: Breaking Down the Basics",
            "Example: Real-World Application",
            "Tip #1: Game-Changing Insight",
            "Tip #2: Expert Strategy",
            "Summary: Key Takeaways"
        ],
        "entertaining": [
            "LOL: The Funniest Moment",
            "Plot Twist: You Won't Believe This",
            "Reaction: Epic Response",
            "Highlight: Best Scene",
            "Outro: Leave a Comment"
        ],
        "motivational": [
            "Power: Words That Changed Everything",
            "Story: From Zero to Hero",
            "Wisdom: Life-Changing Lesson",
            "Quote: Most Inspirational Moment",
            "Action: Start Your Journey Today"
        ]
    }
    
    titles = style_specific_titles.get(style, style_specific_titles["viral"])
    
    clips = [
        {
            "id": str(uuid.uuid4()),
            "title": titles[0],
            "description": "Start with this powerful hook that captures attention immediately. Perfect for stopping scroll.",
            "hashtags": ["#viral", "#trending", "#fyp", "#explore", "#mustwatch"],
            "startTime": 0,
            "endTime": 30,
            "viralScore": 95
        },
        {
            "id": str(uuid.uuid4()),
            "title": titles[1],
            "description": "Share the main breakthrough moment that changed everything. This is your most valuable content.",
            "hashtags": ["#inspiration", "#motivation", "#tips", "#advice", "#growth"],
            "startTime": 30,
            "endTime": 60,
            "viralScore": 88
        },
        {
            "id": str(uuid.uuid4()),
            "title": titles[2],
            "description": "Tell a compelling story about when everything changed. Stories connect emotionally with viewers.",
            "hashtags": ["#storytime", "#inspiration", "#journey", "#transformation", "#life"],
            "startTime": 60,
            "endTime": 90,
            "viralScore": 85
        },
        {
            "id": str(uuid.uuid4()),
            "title": titles[3],
            "description": "Break down actionable steps viewers can take immediately. Clear and actionable content.",
            "hashtags": ["#howto", "#tutorial", "#steps", "#action", "#dothis"],
            "startTime": 90,
            "endTime": 120,
            "viralScore": 82
        },
        {
            "id": str(uuid.uuid4()),
            "title": titles[4],
            "description": "End with a strong call to action that encourages engagement and community building.",
            "hashtags": ["#subscribe", "##follow", "#community", "#join", "#connect"],
            "startTime": 120,
            "endTime": 150,
            "viralScore": 78
        }
    ]
    
    return clips

async def process_clips(task_id: str, clips_data: List[dict], ratio: str) -> List[VideoClip]:
    """Process video clips using FFmpeg"""
    # Note: This would use FFmpeg to actually cut and crop videos
    # For demo purposes, just create the clip metadata
    await asyncio.sleep(2)

    clips = []
    for clip_data in clips_data:
        clip = VideoClip(
            id=clip_data["id"],
            title=clip_data["title"],
            description=clip_data["description"],
            hashtags=clip_data["hashtags"],
            startTime=clip_data["startTime"],
            endTime=clip_data["endTime"],
            duration=clip_data["endTime"] - clip_data["startTime"],
            viralScore=clip_data["viralScore"]
        )
        clips.append(clip)

    return clips

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
