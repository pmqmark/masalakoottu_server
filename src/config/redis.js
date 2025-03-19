const Redis = require("ioredis");

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,

    retryStrategy: (times) => {
        const delay = Math.min(times * 100, 2000);
        return delay;
    },
});

redis.on("error", (err) => {
    console.error("[REDIS ERROR]", err.message || err);
});

redis.on("connect", () => {
    console.log("[REDIS] Connected to Redis server");
});

redis.on("ready", () => {
    console.log("[REDIS] Redis client ready");
});

module.exports = redis;
