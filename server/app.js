import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import canvasRoutes from "./routes/Canvas.js";
import authRoutes from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";
import redisClient from "./redisClient.js"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/canvas", requireAuth, canvasRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-canvas", async (canvasId) => {
    socket.join(canvasId);
    console.log(`${socket.id} joined canvas ${canvasId}`);

    try {
      const state = await redisClient.get(`canvas:${canvasId}`);
      if (state) {
        socket.emit("canvas-state", JSON.parse(state));
      }
    } catch (err) {
      console.error("Redis get error:", err);
    }
  });

  socket.on("canvas-update", async ({ canvasId, json }) => {
    try {
      await redisClient.set(`canvas:${canvasId}`, JSON.stringify(json), {
        EX: 60
      });

      console.log(`Canvas ${canvasId} updated by ${socket.id}`);
      socket.to(canvasId).emit("canvas-update", { canvasId, json });
    } catch (err) {
      console.error("Redis set error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

async function startServer() {
  try {
    await redisClient.connect();
    console.log("Redis connected");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 6000;
    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

startServer();
