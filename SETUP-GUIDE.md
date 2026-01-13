# Quick Setup Guide for AI Video Clipper

## Step-by-Step Instructions

### 1. Prerequisites Check

Verify you have the following installed:

```bash
# Check Node.js version (should be 18+)
node --version

# Check Python version (should be 3.8+)
python --version

# Check ffmpeg (must be in PATH)
ffmpeg -version

# Check bun (package manager)
bun --version
```

### 2. Install Frontend Dependencies

```bash
cd /home/z/my-project
bun install
```

### 3. Install Python Backend Dependencies

```bash
cd mini-services/video-clipper-service
pip install -r requirements.txt
```

### 4. Set NVIDIA API Key

```bash
# For Linux/Mac
export NVIDIA_API_KEY="your_nvidia_api_key_here"

# For Windows (PowerShell)
$env:NVIDIA_API_KEY="your_nvidia_api_key_here"
```

### 5. Start the Services

**Terminal 1 - Start Python Backend:**
```bash
cd /home/z/my-project/mini-services/video-clipper-service
python -m uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

**Terminal 2 - Start Next.js Frontend:**
```bash
cd /home/z/my-project
bun run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### 7. Test the Application

1. Open http://localhost:3000 in your browser
2. Enter a YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
3. Select aspect ratio and analysis style
4. Click "Start Analysis"
5. Watch the progress visualization
6. View results in the "Results" tab

## Common Issues & Solutions

### Issue 1: Module not found error
**Solution**: Run `bun install` to install all frontend dependencies

### Issue 2: Python package not found
**Solution**: Run `pip install -r requirements.txt` in the service directory

### Issue 3: FFmpeg not found
**Solution**: Install FFmpeg:
- **Ubuntu/Debian**: `sudo apt-get install ffmpeg`
- **Mac**: `brew install ffmpeg`
- **Windows**: Download from https://ffmpeg.org/download.html

### Issue 4: NVIDIA API errors
**Solution**: Make sure you've set the `NVIDIA_API_KEY` environment variable

### Issue 5: Port already in use
**Solution**: Either stop the process using the port or change the port:
```bash
# Change Python service port to 3002
python -m uvicorn main:app --host 0.0.0.0 --port 3002 --reload
```

Then update the port in `/home/z/my-project/src/app/api/video-clipper/*/route.ts` files.

## Development Tips

### Hot Reload
- Both frontend and backend support hot reload
- Changes to `.tsx` files will auto-reload the Next.js dev server
- Changes to `main.py` will auto-reload the FastAPI server

### Linting
```bash
cd /home/z/my-project
bun run lint
```

### Testing the API
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test analyze endpoint
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","ratio":"9:16","style":"viral"}'
```

## File Locations

| Component | Path |
|-----------|------|
| Frontend Page | `/home/z/my-project/src/app/page.tsx` |
| API Routes | `/home/z/my-project/src/app/api/video-clipper/` |
| Backend Service | `/home/z/my-project/mini-services/video-clipper-service/main.py` |
| Python Dependencies | `/home/z/my-project/mini-services/video-clipper-service/requirements.txt` |

## Next Steps

1. **Add Real Video Processing**: The current implementation uses mock data. To enable real processing:
   - Ensure FFmpeg is installed
   - Set your NVIDIA API key
   - Update the `transcribe_video` function to use Whisper
   - Update the `analyze_with_ai` function to use NVIDIA Nemotron (already implemented)
   - Update the `process_clips` function to use FFmpeg

2. **Add Database**: Replace in-memory task storage with a database (PostgreSQL, Redis)

3. **Add Authentication**: Implement user authentication with NextAuth.js

4. **Add File Storage**: Use cloud storage (S3, GCS) for processed videos

## Support

For issues or questions, refer to the main README.md file or check the documentation in the respective directories.
