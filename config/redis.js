const Redis = require("ioredis");

const redisOptions = process.env.REDIS_URL 
  ? process.env.REDIS_URL 
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
    };

const redis = new Redis(redisOptions);

// Use 'ready' instead of 'connect' to ensure Redis is actually usable
redis.on("ready", () => console.log("✅ Redis is ready"));

redis.on("error", (err) => {
  // Only log the message to keep your console clean
  console.error("❌ Redis Error:", err.message);
});

module.exports = redis;