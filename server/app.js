import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import canvasRoutes from "./routes/Canvas.js";
import authRoutes from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";

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

const canvasStates = {}; // redis?

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-canvas", (canvasId) => {
    socket.join(canvasId);
    console.log(`${socket.id} joined canvas ${canvasId}`);

    if (canvasStates[canvasId]) {
      socket.emit("canvas-state", canvasStates[canvasId]);
    }
  });

  socket.on("canvas-update", ({ canvasId, json }) => {
    canvasStates[canvasId] = json; 
    console.log(`Canvas ${canvasId} updated by ${socket.id}`);
    socket.to(canvasId).emit("canvas-update", {canvasId, json}); // broadcast to others
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 6000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
