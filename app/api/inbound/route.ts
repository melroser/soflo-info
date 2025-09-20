import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, removeSubscriber, isSubscriber, setLocation, getLocation } from '@/lib/redis';
import { sendSMS } from '@/lib/infobip';

export const runtime = 'nodejs';

type Inbound = {
    results?: Array<{ from: string; to: string; text?: string; cleanText?: string }>;
    messages?: Array<{ from: string; to: string; text?: string; cleanText?: string }>;
};

function parseInbound(body: Inbound) {
    const arr = body.results || body.messages || [];
    return arr.map((m) => ({
        from: normalizePhone(m.from),
        to: m.to,
        text: (m.cleanText || m.text || '').trim(),
    }));
}

function normalizePhone(p: string) {
    // Minimal E.164-like sanitizer for MVP
    const digits = p.replace(/[^\d+]/g, '');
    return digits.startsWith('+') ? digits : `+${digits}`;
}

function parseLocationFromText(text: string): string {
    // Simple heuristics: lat,long OR ZIP OR "city, state"
    const latlon = text.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
    if (latlon) return `${latlon[1]},${latlon[2]}`;

    const zip = text.match(/\b\d{5}\b/);
    if (zip) return zip[0];

    const cityState = text.match(/\b([A-Za-z ]+),\s*([A-Za-z]{2})\b/);
    if (cityState) return `${cityState[1].trim()}, ${cityState[2].toUpperCase()}`;

    return '';
}

function makePlan(location: string): string {
    // Keep under ~300 chars for low bandwidth
    const coastalHints = /miami|key west|miami-dade|broward|palm beach|tampa|pensacola|jacksonville|fort lauderdale|naples|keys/i;
    const isCoastal = coastalHints.test(location);

    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' });
    const base = [
        `Plan ${now} EST`,
        isCoastal ? 'High wind/flood risk.' : 'Moderate wind risk.',
        'Go-bag: water, meds, IDs, cash, charger.',
        'Charge phones, share location w/ family.',
        'If evac ordered: leave ASAP; avoid flooded roads.',
        'Shelter: interior room, away from windows.',
        'Emergency: 911 if life-threatening.',
    ].join(' ');
    const loc = location ? `Loc: ${location}. ` : '';
    const msg = `🚨 Hurricane Plan: ${loc}${base}`;
    return msg.slice(0, 300);
}

async function handleCommand(from: string, text: string) {
    const upper = text.trim().toUpperCase();

    if (upper.startsWith('STOP') || upper.startsWith('UNSUB')) {
        await removeSubscriber(from);
        return 'You are unsubscribed. Reply SUB to rejoin.';
    }

    if (upper.startsWith('SUB') || upper.startsWith('START') || upper.startsWith('SUBSCRIBE')) {
        await addSubscriber(from);
        const loc = parseLocationFromText(text);
        if (loc) await setLocation(from, loc);
        return 'Subscribed. Reply: LOC <address/zip/lat,long> to set location. Text PLAN anytime to get your plan.';
    }

    if (upper.startsWith('LOC ')) {
        const loc = text.slice(4).trim();
        if (!loc) return 'Send as: LOC 33101 or LOC 25.77,-80.19 or LOC Miami, FL';
        await setLocation(from, loc);
        return `Location saved: ${loc}. Text PLAN to get your plan.`;
    }

    if (upper === 'HELP') {
        return 'Commands: SUB (subscribe), STOP (unsubscribe), LOC <place>, PLAN (your plan).';
    }

    if (upper === 'PLAN') {
        const saved = await getLocation(from);
        if (!saved) return 'No location saved. Send LOC <zip/lat,long/city,ST>';
        return makePlan(saved);
    }

    // Not a command
    return '';
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json().catch(() => ({}))) as Inbound;
        const messages = parseInbound(body);

        // Process each inbound message (usually one)
        for (const m of messages) {
            const from = m.from;
            const text = m.text || '';

            // Command processing first
            const cmdReply = await handleCommand(from, text);
            if (cmdReply) {
                await sendSMS(from, cmdReply);
                continue;
            }

            // If subscribed or location provided => send plan
            const sub = await isSubscriber(from);
            const inlineLoc = parseLocationFromText(text);
            if (sub || inlineLoc) {
                const loc = inlineLoc || (await getLocation(from)) || '';
                const plan = makePlan(loc);
                await sendSMS(from, plan);
            } else {
                await sendSMS(
                    from,
                    'Reply SUB to subscribe. Or send LOC <zip/lat,long/city,ST> for a personalized hurricane plan. Text HELP for commands.'
                );
            }
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        // Always 200 to avoid retries storms; log server-side in real app
        return NextResponse.json({ ok: true });
    }
}

