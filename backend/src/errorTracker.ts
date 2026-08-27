import { redis } from "./redis";

const WINDOWS_SECONDS = 60; //1 minute window
const ERROR_THRESHOLD = 5; //spike if 5+ errors in the window

function getBucketKey(service: string): string{
    const minuteBucket = Math.floor(Date.now() /1000/WINDOWS_SECONDS);
    return `errors:${service}:${minuteBucket}`
}

export async function recordError(service: string): Promise<number> {
    const key = getBucketKey(service);
    const count = await redis.incr(key);
    await redis.expire(key, WINDOWS_SECONDS*2) //keep a bit longer than windows itself
    return count;
}

export async function getCurrentErrorCount(service: string): Promise<number>{
    const key = getBucketKey(service);
    const count = await redis.get(key);
    return count ? parseInt(count, 10) : 0;
}

export function isSpike(count: number): boolean {
    return count >= ERROR_THRESHOLD;
}