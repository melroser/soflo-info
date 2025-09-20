import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const key = 'health:ping';
        await redis.set(key, 'ok', { ex: 60 });
        const val = await redis.get<string>(key);
        return NextResponse.json({ ok: true, val });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'redis error';
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}

