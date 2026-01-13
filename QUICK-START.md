# Quick Start Guide - AI Video Clipper with NVIDIA API

## ⚡ Quick Start (2 Minutes)

### 1. Start Python Backend
```bash
cd /home/z/my-project/mini-services/video-clipper-service
python -m uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

You should see:
```
✅ NVIDIA API Key loaded successfully
   Key format: sk-or-v1-d466ac...3283c29ac4
```

### 2. Open Frontend
Visit: **http://localhost:3000**

### 3. Test It Out
1. Enter a YouTube URL
2. Select style (viral/educational/entertaining/motivational)
3. Click "Start Analysis"
4. Watch NVIDIA AI process your content!

---

## 🎯 What You Can Do Now

### ✨ Real AI Analysis
- Analyzes video transcripts with NVIDIA Nemotron Nano 12B 2 VL
- Generates 5 viral clips per video
- Provides titles, descriptions, hashtags, timestamps
- Calculates viral scores (70-100)

### 📋 Copy & Use Content
- One-click copy for titles, descriptions, hashtags
- Perfect for TikTok, YouTube Shorts, Instagram Reels
- Style-optimized content (4 different styles)

### 🔄 4 Analysis Styles
1. **Viral** - Mind-blowing hooks & secrets
2. **Educational** - Concepts & takeaways
3. **Entertaining** - Funny moments & reactions
4. **Motivational** - Powerful quotes & stories

---

## 🔧 Configuration

### Your Setup
- **API Key**: Configured ✅
- **Backend**: Python FastAPI (port 3001)
- **Frontend**: Next.js 15 (port 3000)
- **AI Model**: NVIDIA Nemotron Nano 12B 2 VL

### Environment File
```
mini-services/video-clipper-service/.env
  Contains: NVIDIA_API_KEY=sk-or-v1-d466ac...
  Protected: Yes (.gitignore)
  Status: Active ✅
```

---

## 🧪 Test Commands

### Health Check
```bash
curl http://localhost:3001/health
```

### Test Analysis
```bash
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "ratio": "9:16",
    "style": "viral"
  }'
```

### Check Status
```bash
# Replace {task_id} with actual ID from analyze response
curl http://localhost:3001/status/{task_id}
```

### Get Results
```bash
curl http://localhost:3001/result/{task_id}
```

---

## 📚 Full Documentation

- **Quick Setup**: `SETUP-API-KEY.md`
- **Setup Guide**: `SETUP-GUIDE.md`
- **NVIDIA Integration**: `NVIDIA-INTEGRATION-SUMMARY.md`
- **Full Documentation**: `README-video-clipper.md`

---

## 🔒 Security Checklist

- [x] API key in `.env` file
- [x] `.env` in `.gitignore`
- [x] No API key in code
- [x] Truncated key in logs
- [x] Environment variable loading
- [x] `.env.example` for reference

---

## 🐛 Common Issues

### "NVIDIA_API_KEY not found"
→ Solution: Ensure `.env` file exists in service directory

### "Module not found: dotenv"
→ Solution: Run `pip install python-dotenv`

### Port already in use
→ Solution: Change port to 3002 in uvicorn command

### Frontend can't connect to backend
→ Solution: Ensure Python backend is running on port 3001

---

## 🎉 You're All Set!

Your AI Video Clipper is now:
- ✅ Configured with NVIDIA API
- ✅ Ready for real AI analysis
- ✅ Secure and protected
- ✅ Fully documented
- ✅ Tested and verified

**Start creating viral content powered by NVIDIA AI! 🚀**
