import mongoose, { Schema } from "mongoose";

const ReplySchema = new Schema({
  text: { type: String, required: true },
  mentions: [{ type: String }],
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const CommentSchema = new Schema(
  {
    canvas: {
      type: Schema.Types.ObjectId,
      ref: "Canvas",
      required: true,
      index: true,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    text: { type: String, required: true },
    mentions: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    replies: [ReplySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
