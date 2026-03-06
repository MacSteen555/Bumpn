import dotenv from 'dotenv';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

dotenv.config();

const options = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times: number) => {
        // reconnect after
        return Math.max(times * 100, 3000);
    },
};

export const pubsub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options),
});

export const TOPICS = {
    POST_ADDED: 'POST_ADDED',
    VIBE_UPDATED: 'VIBE_UPDATED',
};
