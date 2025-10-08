import { NextRequest, NextResponse } from 'next/server'
import client from 'prom-client'

// Register default metrics once
const register = client.register
let defaultMetricsInitialized = false

function initDefaultMetrics() {
  if (!defaultMetricsInitialized) {
    client.collectDefaultMetrics({ register, prefix: 'esawitku_' })
    defaultMetricsInitialized = true
  }
}

export async function GET(_request: NextRequest) {
  try {
    initDefaultMetrics()
    const metrics = await register.metrics()
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return NextResponse.json({ message: 'Metrics generation failed' }, { status: 500 })
  }
}
