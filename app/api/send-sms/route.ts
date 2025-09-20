import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type InfobipAdvancedResponse = {
    messages?: Array<{
        messageId?: string;
        status?: {
            groupId?: number;
            description?: string;
        };
    }>;
    requestError?: {
        serviceException?: {
            text?: string;
        };
    };
};

const BASE = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
const TRIAL = process.env.INFOBIP_TRIAL === '1';
const TRIAL_TEXT =
    process.env.INFOBIP_TRIAL_TEXT ||
    'This is a preregistered test message from Infobip. Enjoy your free trial!';

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber, message } = (await request.json()) as {
            phoneNumber?: string;
            message?: string;
        };

        if (!phoneNumber || !message) {
            return NextResponse.json(
                { success: false, error: 'Phone number and message are required' },
                { status: 400 }
            );
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
                        text: TRIAL
                            ? TRIAL_TEXT
                            : `🚨 EMERGENCY ALERT 🚨\n\n${message}\n\n- CrisisLink Emergency System`,
                    },
                ],
            }),
        });

        let resp: InfobipAdvancedResponse = {};
        try {
            resp = (await res.json()) as InfobipAdvancedResponse;
        } catch {
            resp = {};
        }

        if (res.ok && resp.messages?.[0]?.status?.groupId === 1) {
            return NextResponse.json({
                success: true,
                messageId: resp.messages?.[0]?.messageId,
            });
        }

        const errorMsg =
            resp.requestError?.serviceException?.text ||
            resp.messages?.[0]?.status?.description ||
            'SMS sending failed';

        return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

