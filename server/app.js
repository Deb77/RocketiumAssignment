import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import canvasRoutes from "./routes/Canvas.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/canvas", canvasRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
