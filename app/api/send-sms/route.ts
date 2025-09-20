import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/infobip';

export const runtime = 'nodejs';

type RequestPayload = {
    phoneNumber?: string;
    message?: string;
    raw?: boolean; // when true, send exactly the message you pass (no wrappers)
};

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber, message, raw } = (await request.json()) as RequestPayload;

        if (!phoneNumber || !message) {
            return NextResponse.json(
                { success: false, error: 'Phone number and message are required' },
                { status: 400 }
            );
        }

        const text = raw
            ? message
            : `🚨 EMERGENCY ALERT 🚨\n\n${message}\n\n- CrisisLink Emergency System`;

        const res = await sendSMS(phoneNumber, text);

        if (res.ok) {
            return NextResponse.json({ success: true, messageId: res.messageId });
        }
        return NextResponse.json({ success: false, error: res.error || 'SMS sending failed' }, { status: 400 });
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

