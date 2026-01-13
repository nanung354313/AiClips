import { NextRequest, NextResponse } from 'next/server'

const PYTHON_SERVICE_PORT = 3001

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`http://localhost:${PYTHON_SERVICE_PORT}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to start analysis' }))
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
