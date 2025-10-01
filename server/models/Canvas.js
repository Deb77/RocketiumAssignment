import mongoose, { Schema } from "mongoose";

const CanvasSchema = new Schema(
  {
    name: { type: String, required: true },
    data: { type: Object},
    image: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Canvas", CanvasSchema);
