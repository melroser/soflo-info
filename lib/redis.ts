import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Missing Upstash Redis env vars');
}

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SUBS_KEY = 'subs';

export async function addSubscriber(phone: string) {
    await redis.sadd(SUBS_KEY, phone);
}

export async function removeSubscriber(phone: string) {
    await redis.srem(SUBS_KEY, phone);
}

export async function isSubscriber(phone: string) {
    return Boolean(await redis.sismember(SUBS_KEY, phone));
}

export async function getAllSubscribers(): Promise<string[]> {
    return (await redis.smembers(SUBS_KEY)) as string[];
}

export async function setLocation(phone: string, location: string) {
    await redis.hset(`user:${phone}`, { location });
}

export async function getLocation(phone: string) {
    return (await redis.hget<string>(`user:${phone}`, 'location')) ?? '';
}

