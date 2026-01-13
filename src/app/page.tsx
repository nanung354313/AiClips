'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Youtube, Scissors, Download, Video, Zap, Copy, Check, Play, Clock, Hash, Tag } from 'lucide-react'

interface VideoClip {
  id: string
  title: string
  description: string
  hashtags: string[]
  startTime: number
  endTime: number
  duration: number
  viralScore: number
}

interface TaskStatus {
  taskId: string
  status: 'idle' | 'downloading' | 'transcribing' | 'analyzing' | 'processing' | 'completed' | 'error'
  progress: number
  currentStep: string
  error?: string
}

export default function AIVideoClipper() {
  const [url, setUrl] = useState('')
  const [ratio, setRatio] = useState('9:16')
  const [style, setStyle] = useState('viral')
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({
    taskId: '',
    status: 'idle',
    progress: 0,
    currentStep: ''
  })
  const [clips, setClips] = useState<VideoClip[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAnalyze = async () => {
    if (!url) {
      toast.error('Please enter a YouTube URL')
      return
    }

    // Validate YouTube URL
    if (!url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/)) {
      toast.error('Please enter a valid YouTube URL')
      return
    }

    setIsProcessing(true)
    setTaskStatus({
      taskId: '',
      status: 'downloading',
      progress: 0,
      currentStep: 'Initializing...'
    })

    try {
      // Start analysis
      const response = await fetch('/api/video-clipper/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ratio, style })
      })

      if (!response.ok) {
        throw new Error('Failed to start analysis')
      }

      const data = await response.json()
      const taskId = data.taskId

      // Poll for status
      await pollStatus(taskId)
    } catch (error) {
      toast.error('Failed to analyze video')
      setTaskStatus(prev => ({ ...prev, status: 'error', error: 'Failed to start analysis' }))
      setIsProcessing(false)
    }
  }

  const pollStatus = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video-clipper/status?taskId=${taskId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch status')
        }

        const data = await response.json()
        setTaskStatus(data)

        if (data.status === 'completed') {
          clearInterval(pollInterval)
          setIsProcessing(false)

          // Fetch results
          const resultResponse = await fetch(`/api/video-clipper/result?taskId=${taskId}`)
          if (resultResponse.ok) {
            const resultData = await resultResponse.json()
            setClips(resultData.clips)
            toast.success('Analysis completed successfully!')
          }
        } else if (data.status === 'error') {
          clearInterval(pollInterval)
          setIsProcessing(false)
          toast.error(data.error || 'Analysis failed')
        }
      } catch (error) {
        clearInterval(pollInterval)
        setIsProcessing(false)
        toast.error('Failed to check status')
      }
    }, 2000)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const getProgressSteps = () => {
    const steps = [
      { key: 'downloading', label: 'Downloading', icon: Download },
      { key: 'transcribing', label: 'Transcribing', icon: Scissors },
      { key: 'analyzing', label: 'Analyzing with AI', icon: Zap },
      { key: 'processing', label: 'Processing Clips', icon: Video }
    ]

    return steps
  }

  const currentStepIndex = getProgressSteps().findIndex(
    step => step.key === taskStatus.status
  )

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Youtube className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Video Clipper</h1>
              <p className="text-sm text-muted-foreground">Transform long videos into viral short clips</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="results">Results {clips.length > 0 && `(${clips.length})`}</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Video Analysis</CardTitle>
                <CardDescription>
                  Enter a YouTube URL to analyze and extract viral clips
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">YouTube URL</Label>
                  <Input
                    id="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ratio">Aspect Ratio</Label>
                    <Select value={ratio} onValueChange={setRatio} disabled={isProcessing}>
                      <SelectTrigger id="ratio">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:16">9:16 (TikTok/Shorts/Reels)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="4:5">4:5 (Instagram)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Analysis Style</Label>
                    <Select value={style} onValueChange={setStyle} disabled={isProcessing}>
                      <SelectTrigger id="style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viral">Viral & Trending</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="entertaining">Entertaining</SelectItem>
                        <SelectItem value="motivational">Motivational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isProcessing || !url}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Progress Visualization */}
            {isProcessing && (
              <Card>
                <CardHeader>
                  <CardTitle>Processing Progress</CardTitle>
                  <CardDescription>{taskStatus.currentStep}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(taskStatus.progress)}%</span>
                    </div>
                    <Progress value={taskStatus.progress} />
                  </div>

                  <div className="space-y-3">
                    {getProgressSteps().map((step, index) => {
                      const isActive = index === currentStepIndex
                      const isCompleted = index < currentStepIndex
                      const Icon = step.icon

                      return (
                        <div
                          key={step.key}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isActive
                              ? 'border-primary bg-primary/5'
                              : isCompleted
                                ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20'
                                : 'border-muted bg-muted/20'
                          }`}
                        >
                          <div className={`p-2 rounded-full ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {isCompleted ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                              {step.label}
                            </p>
                          </div>
                          {isActive && (
                            <span className="text-sm text-muted-foreground animate-pulse">
                              Processing...
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prerequisites Notice */}
            <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500 rounded-full text-white">
                    <Youtube className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                      Prerequisites Required
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                      This application requires <strong>ffmpeg</strong> to be installed on the system
                      and an <strong>OpenAI API Key</strong> for AI analysis.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {clips.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Video className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No clips yet</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Analyze a YouTube video to generate viral clips
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {clips.map((clip, index) => (
                  <Card key={clip.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Clip #{index + 1}
                            </Badge>
                            <Badge className="bg-green-500">
                              Viral Score: {clip.viralScore}%
                            </Badge>
                          </div>
                          <CardTitle className="text-xl">{clip.title}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(clip.title, 'Title')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {Math.floor(clip.startTime / 60)}:{(clip.startTime % 60).toFixed(2).padStart(5, '0')}
                            {' '} - {' '}
                            {Math.floor(clip.endTime / 60)}:{(clip.endTime % 60).toFixed(2).padStart(5, '0')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          <span>{clip.duration}s</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <div className="relative">
                          <Textarea
                            value={clip.description}
                            readOnly
                            className="min-h-[80px] resize-none"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(clip.description, 'Description')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            <Label>Hashtags</Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(clip.hashtags.join(' '), 'Hashtags')}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy All
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {clip.hashtags.map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary/20"
                              onClick={() => copyToClipboard(tag, 'Hashtag')}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>AI Video Clipper - Powered by AI to transform your content</p>
        </div>
      </footer>
    </div>
  )
}
