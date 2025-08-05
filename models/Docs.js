import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  format: {
    type: String,
    enum: ["text", "audio", "video", "epub"],
    required: true,
  },
  url: { type: String, required: true },
  tags: [{ type: String }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const Doc = mongoose.model("Doc", documentSchema);
export default Doc;
