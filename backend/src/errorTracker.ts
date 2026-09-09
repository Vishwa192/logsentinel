import { redis } from "./redis";

const WINDOWS_SECONDS = 60; //1 minute window
const ERROR_THRESHOLD = 5; //spike if 5+ errors in the window
const MAX_RECENT_ERRORS = 10;

//Generate the Redis key where we'll store the error count.
function getBucketKey(service: string): string{
    const minuteBucket = Math.floor(Date.now() /1000/WINDOWS_SECONDS);
    return `errors:${service}:${minuteBucket}`
}

function getRecentErrorKeys(service: string): string{
    const minuteBucket = Math.floor(Date.now() /1000/WINDOWS_SECONDS);
    return `errors:recent:${service}:${minuteBucket}`
}

export async function recordError(service: string, message: string, timestamp: string   ): Promise<number> {
    const key = getBucketKey(service);
    const count = await redis.incr(key);
    await redis.expire(key, WINDOWS_SECONDS*2) //keep a bit longer than windows itself

    const recentKey = getRecentErrorKeys(service);
    await redis.lpush(recentKey, JSON.stringify({service, message, timestamp}));
    await redis.ltrim(recentKey, 0, MAX_RECENT_ERRORS-1);
    await redis.expire(recentKey, WINDOWS_SECONDS*2);

    return count;
}

export async function getRecentErrors(service: string) {
    const recentKey = getRecentErrorKeys(service);
    const raw = await redis.lrange(recentKey, 0, -1);
    return raw.map((r) => JSON.parse(r));
}

export async function getCurrentErrorCount(service: string): Promise<number>{
    const key = getBucketKey(service);
    const count = await redis.get(key);
    //this converts the string into and number and 10 means treat string as decimal number
    return count ? parseInt(count, 10) : 0;
}

export function isSpike(count: number): boolean {
    return count >= ERROR_THRESHOLD;
}