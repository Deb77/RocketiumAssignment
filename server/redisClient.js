// redisClient.js
const { createClient } = require("redis");
const dotenv = require("dotenv");

dotenv.config();

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: 11272
    }
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));

module.exports = redisClient;
