import mongoose, { Schema } from "mongoose";

const CanvasSchema = new Schema(
  {
    name: { type: String, required: true },
    data: { type: Object },
    image: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    collaborators: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
  },
  { timestamps: true }
);

export default mongoose.model("Canvas", CanvasSchema);
