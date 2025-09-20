import { NextRequest, NextResponse } from 'next/server';
import { getAllSubscribers } from '@/lib/redis';
import { sendBulk } from '@/lib/infobip';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const { message, password } = (await req.json().catch(() => ({}))) as { message?: string; password?: string };
    if (!password || password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    const text = (message || '').trim();
    if (!text) return NextResponse.json({ ok: false, error: 'Message required' }, { status: 400 });

    const subs = await getAllSubscribers();
    if (subs.length === 0) return NextResponse.json({ ok: true, sent: 0 });

    const limited = text.slice(0, 300);
    const res = await sendBulk(subs, `🚨 Alert: ${limited}`);
    return NextResponse.json({ ok: res.ok, sent: subs.length, errors: res.errorCount });
}

