const Redis = require("ioredis");

// Prioritize the full REDIS_URL string from your .env
const redis = new Redis(process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.log("Redis Error:", err));

module.exports = redis;