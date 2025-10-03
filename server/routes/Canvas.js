import { Router } from "express";
import Canvas from "../models/Canvas.js";
import User from "../models/User.js";
import redisClient from "../redisClient.js";

const router = Router();

// Create canvas (owned by current user)
router.post("/", async (req, res) => {
  try {
    const { name, data, image } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const canvas = await Canvas.create({ name, data, image, owner: req.user.id });
    res.status(201).json(canvas);
  } catch (err) {
    res.status(500).json({ error: "Failed to save canvas", details: err?.message });
  }
});

// Get all canvases belonging to current user (owner or collaborator)
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const canvases = await Canvas.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    }).sort({ updatedAt: -1 });
    res.json(canvases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch canvases" });
  }
});

// Get single canvas by ID (must be owner or collaborator)
router.get("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const canvasFromCache = await redisClient.get(`canvas:${req.params.id}`);
    const canvas = await Canvas.findOne({
      _id: req.params.id,
      $or: [{ owner: userId }, { collaborators: userId }],
    });
    if (canvasFromCache) {
      res.json({ ...canvas, data: JSON.parse(canvasFromCache)})
    }
    if (!canvas) return res.status(404).json({ error: "Canvas not found" });
    res.json(canvas);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch canvas" });
  }
});

// Share a canvas by email (owner only) - add collaborator
router.post("/:id/share-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const collaborator = await User.findOne({ email });
    if (!collaborator) return res.status(404).json({ error: "User not found" });

    // Only owner can share
    const updated = await Canvas.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $addToSet: { collaborators: collaborator._id } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Canvas not found or not owned by you" });

    res.json({ message: "Collaborator added", collaborator: { id: collaborator._id, email: collaborator.email } });
  } catch (err) {
    res.status(500).json({ error: "Failed to share canvas" });
  }
});

// Remove a collaborator by email (owner only)
router.delete("/:id/share-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const collaborator = await User.findOne({ email });
    if (!collaborator) return res.status(404).json({ error: "User not found" });

    const updated = await Canvas.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $pull: { collaborators: collaborator._id } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Canvas not found or not owned by you" });

    res.json({ message: "Collaborator removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove collaborator" });
  }
});

// Update canvas (owner or collaborator)
router.put("/:id", async (req, res) => {
  try {
    const { name, data, image } = req.body;
    const userId = req.user.id;
    const canvas = await Canvas.findOneAndUpdate(
      { _id: req.params.id, $or: [{ owner: userId }, { collaborators: userId }] },
      { name, data, image },
      { new: true }
    );
    if (!canvas) return res.status(404).json({ error: "Canvas not found" });
    res.json({ message: "Canvas updated!", canvas });
  } catch (err) {
    res.status(500).json({ error: "Failed to update canvas" });
  }
});

// Delete canvas (only owner)
router.delete("/:id", async (req, res) => {
  try {
    const canvas = await Canvas.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!canvas) return res.status(404).json({ error: "Canvas not found" });
    res.json({ message: "Canvas deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete canvas" });
  }
});

export default router;
