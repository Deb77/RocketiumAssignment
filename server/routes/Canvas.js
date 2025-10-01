import { Router } from "express";
import Canvas from "../models/Canvas.js";

const router = Router();

// Save canvas
router.post("/", async (req, res) => {
  try {
    const { name, data } = req.body;
    const canvas = new Canvas({ name, data });
    await canvas.save();
    res.status(201).json(canvas);
  } catch (err) {
    res.status(500).json({ error: "Failed to save canvas", details: err });
  }
});

// Get all canvases
router.get("/", async (_req, res) => {
  try {
    const canvases = await Canvas.find().sort({ updatedAt: -1 });
    res.json(canvases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch canvases" });
  }
});

// Get single canvas by ID
router.get("/:id", async (req, res) => {
  try {
    const canvas = await Canvas.findById(req.params.id);
    if (!canvas) return res.status(404).json({ error: "Canvas not found" });
    res.json(canvas);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch canvas" });
  }
});

// Update canvas
router.put("/:id", async (req, res) => {
  try {
    const { name, data, image } = req.body;
    const canvas = await Canvas.findByIdAndUpdate(
      req.params.id,
      { name, data, image },
      { new: true }
    );
    if (!canvas) return res.status(404).json({ error: "Canvas not found" });
    res.json(canvas);
  } catch (err) {
    res.status(500).json({ error: "Failed to update canvas" });
  }
});

// Delete canvas
router.delete("/:id", async (req, res) => {
  try {
    const canvas = await Canvas.findByIdAndDelete(req.params.id);
    if (!canvas) return res.status(404).json({ error: "Canvas not found" });
    res.json({ message: "Canvas deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete canvas" });
  }
});

export default router;
