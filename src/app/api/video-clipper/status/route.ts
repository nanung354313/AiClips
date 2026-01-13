import { NextRequest, NextResponse } from 'next/server'

const PYTHON_SERVICE_PORT = 3001

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const response = await fetch(
      `http://localhost:${PYTHON_SERVICE_PORT}/status/${taskId}`,
      {
        method: 'GET'
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch status' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to video processing service' },
      { status: 500 }
    )
  }
}
