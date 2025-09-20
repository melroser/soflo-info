'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Users } from 'lucide-react';

export default function AdminPage() {
    const [count, setCount] = useState<number>(0);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<string>('');

    useEffect(() => {
        fetch('/api/subscribers/count')
            .then((r) => r.json())
            .then((d) => setCount(d.count ?? 0))
            .catch(() => setCount(0));
    }, []);

    async function sendBlast() {
        setSending(true);
        setResult('');
        try {
            const r = await fetch('/api/blast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message.trim(), password }),
            });
            const data = await r.json();
            if (r.ok && data.ok) {
                setResult(`Sent to ${data.sent} subscribers${data.errors ? `, ${data.errors} errors` : ''}.`);
            } else {
                setResult(data.error || 'Failed to send');
            }
        } catch {
            setResult('Network error');
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4 py-10">
            <div className="max-w-2xl mx-auto">
                <Card className="rounded-2xl bg-slate-900/70 backdrop-blur-md shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Users className="h-6 w-6 text-red-500" />
                            Broadcast Center
                        </CardTitle>
                        <CardDescription className="text-slate-300">
                            Send emergency blasts to all subscribed users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-slate-300 text-sm">Subscribers: {count}</div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-300">Admin Password</label>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-300">Message</label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Keep it short (<= 300 chars) for low-bandwidth delivery."
                                className="min-h-[120px]"
                            />
                        </div>
                        <Button
                            onClick={sendBlast}
                            disabled={!password || !message.trim() || sending}
                            className="w-full emergency-gradient text-white"
                        >
                            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                            {sending ? 'Sending...' : 'Send Blast'}
                        </Button>
                        {result && <div className="text-sm text-slate-200">{result}</div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

