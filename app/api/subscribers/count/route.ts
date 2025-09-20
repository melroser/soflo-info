import { NextResponse } from 'next/server';
import { getAllSubscribers } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET() {
    const subs = await getAllSubscribers();
    return NextResponse.json({ count: subs.length });
}

