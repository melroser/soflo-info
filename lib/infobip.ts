export interface InfobipSendResult {
    ok: boolean;
    messageId?: string;
    error?: string;
}

const BASE = 'https://api.infobip.com';

function headerAuth() {
    const key = process.env.INFOBIP_API_KEY;
    if (!key) throw new Error('Missing INFOBIP_API_KEY');
    return { Authorization: `App ${key}` };
}

export async function sendSMS(to: string, text: string): Promise<InfobipSendResult> {
    const from = process.env.INFOBIP_SENDER_ID || 'CrisisLink';
    const res = await fetch(`${BASE}/sms/2/text/advanced`, {
        method: 'POST',
        headers: {
            ...headerAuth(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            messages: [
                {
                    destinations: [{ to }],
                    from,
                    text,
                },
            ],
        }),
    });

    const data = await res.json().catch(() => ({}));
    const status = data?.messages?.[0]?.status;
    if (res.ok && status?.groupId === 1) {
        return { ok: true, messageId: data.messages[0].messageId };
    }
    return { ok: false, error: status?.description || data?.requestError?.serviceException?.text || 'send failed' };
}

export async function sendBulk(toList: string[], text: string): Promise<{ ok: boolean; errorCount: number }> {
    const from = process.env.INFOBIP_SENDER_ID || 'CrisisLink';
    // Chunk destinations to avoid huge payloads
    const chunkSize = 50;
    let errorCount = 0;

    for (let i = 0; i < toList.length; i += chunkSize) {
        const chunk = toList.slice(i, i + chunkSize);
        const res = await fetch(`${BASE}/sms/2/text/advanced`, {
            method: 'POST',
            headers: {
                ...headerAuth(),
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        destinations: chunk.map((to) => ({ to })),
                        from,
                        text,
                    },
                ],
            }),
        });
        if (!res.ok) errorCount += chunk.length;
    }

    return { ok: errorCount === 0, errorCount };
}

