import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    const infobipResponse = await fetch('https://api.infobip.com/sms/2/text/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            destinations: [{ to: phoneNumber }],
            from: process.env.INFOBIP_SENDER_ID || 'CrisisLink',
            text: `🚨 EMERGENCY ALERT 🚨\n\n${message}\n\n- CrisisLink Emergency System`
          }
        ]
      })
    })

    const infobipData = await infobipResponse.json()

    if (infobipResponse.ok && infobipData.messages?.[0]?.status?.groupId === 1) {
      return NextResponse.json({
        success: true,
        messageId: infobipData.messages[0].messageId,
        enhancedMessage: message
      })
    } else {
      return NextResponse.json({
        success: false,
        error: infobipData.requestError?.serviceException?.text || 'SMS sending failed'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('SMS sending error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

