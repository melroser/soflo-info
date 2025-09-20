import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com'
const TRIAL = process.env.INFOBIP_TRIAL === '1'
const TRIAL_TEXT =
    process.env.INFOBIP_TRIAL_TEXT ||
    'This is a preregistered test message from Infobip. Enjoy your free trial!'

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber, message } = await request.json()

        if (!phoneNumber || !message) {
            return NextResponse.json(
                { success: false, error: 'Phone number and message are required' },
                { status: 400 }
            )
        }

        const res = await fetch(`${BASE}/sms/2/text/advanced`, {
            method: 'POST',
            headers: {
                Authorization: `App ${process.env.INFOBIP_API_KEY}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        destinations: [{ to: phoneNumber }],
                        from: process.env.INFOBIP_SENDER_ID || 'CrisisLink',
                        text: TRIAL ? TRIAL_TEXT : `🚨 EMERGENCY ALERT 🚨\n\n${message}\n\n- CrisisLink Emergency System`,
                    },
                ],
            }),
        })

        const data = await res.json().catch(() => ({}))

        if (res.ok && data?.messages?.[0]?.status?.groupId === 1) {
            return NextResponse.json({
                success: true,
                messageId: data.messages[0].messageId,
            })
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    data?.requestError?.serviceException?.text ||
                    data?.messages?.[0]?.status?.description ||
                    'SMS sending failed',
            },
            { status: 400 }
        )
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

