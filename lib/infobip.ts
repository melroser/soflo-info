const BASE = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
const TRIAL = process.env.INFOBIP_TRIAL === '1';
const TRIAL_TEXT =
    process.env.INFOBIP_TRIAL_TEXT ||
    'This is a preregistered test message from Infobip. Enjoy your free trial!';

function headerAuth() {
    const key = process.env.INFOBIP_API_KEY;
    if (!key) throw new Error('Missing INFOBIP_API_KEY');
    return { Authorization: `App ${key}` };
}

export async function sendSMS(to: string, text: string) {
    const from = process.env.INFOBIP_SENDER_ID || 'CrisisLink';
    const bodyText = TRIAL ? TRIAL_TEXT : text;
    const res = await fetch(`${BASE}/sms/2/text/advanced`, {
        method: 'POST',
        headers: { ...headerAuth(), 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            messages: [{ destinations: [{ to }], from, text: bodyText }],
        }),
    });
    const data = await res.json().catch(() => ({}));
    const status = data?.messages?.[0]?.status;
    return res.ok && status?.groupId === 1
        ? { ok: true, messageId: data.messages[0].messageId }
        : { ok: false, error: status?.description || data?.requestError?.serviceException?.text || 'send failed' };
}

export async function sendBulk(toList: string[], text: string) {
    const from = process.env.INFOBIP_SENDER_ID || 'CrisisLink';
    const bodyText = TRIAL ? TRIAL_TEXT : text;
    let errorCount = 0;
    for (let i = 0; i < toList.length; i += 50) {
        const chunk = toList.slice(i, i + 50);
        const res = await fetch(`${BASE}/sms/2/text/advanced`, {
            method: 'POST',
            headers: { ...headerAuth(), 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                messages: [{ destinations: chunk.map((to) => ({ to })), from, text: bodyText }],
            }),
        });
        if (!res.ok) errorCount += chunk.length;
    }
    return { ok: errorCount === 0, errorCount };
}

