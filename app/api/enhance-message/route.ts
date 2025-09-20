import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // For MVP, use a simple enhancement algorithm
    // In production, this would call your AI service or OpenAI
    const enhancedMessage = enhanceMessageMVP(message)

    return NextResponse.json({
      success: true,
      enhancedMessage
    })
  } catch (error) {
    console.error('Message enhancement error:', error)
    return NextResponse.json(
      { success: false, error: 'Enhancement failed' },
      { status: 500 }
    )
  }
}

function enhanceMessageMVP(message: string): string {
  const emergencyKeywords = {
    'help': 'URGENT ASSISTANCE NEEDED',
    'trapped': 'PERSON TRAPPED - IMMEDIATE RESCUE REQUIRED',
    'injured': 'MEDICAL EMERGENCY - INJURY REPORTED',
    'flood': 'FLOOD EMERGENCY - EVACUATION MAY BE NEEDED',
    'fire': 'FIRE EMERGENCY - IMMEDIATE DANGER',
    'medical': 'MEDICAL EMERGENCY - URGENT RESPONSE NEEDED',
    'evacuation': 'EVACUATION REQUIRED - SAFETY CRITICAL',
    'power': 'POWER OUTAGE - INFRASTRUCTURE FAILURE',
    'water': 'WATER EMERGENCY - ESSENTIAL SERVICES AFFECTED'
  }

  let enhanced = message

  // Add urgency indicators
  for (const [keyword, enhancement] of Object.entries(emergencyKeywords)) {
    if (message.toLowerCase().includes(keyword)) {
      enhanced = `${enhancement}: ${enhanced}`
      break
    }
  }

  // Add location prompt if not present
  if (!enhanced.toLowerCase().includes('location') && !enhanced.toLowerCase().includes('address')) {
    enhanced += '\n\nLOCATION: Please provide exact address or coordinates for emergency response.'
  }

  // Add contact info prompt
  if (!enhanced.toLowerCase().includes('contact')) {
    enhanced += '\n\nCONTACT: Reply with callback number if different from sender.'
  }

  // Add timestamp
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  enhanced += `\n\nTIME: ${timestamp} EST`

  return enhanced
}

