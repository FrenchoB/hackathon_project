import mongoose from "mongoose";

//Definition du modèle de données pour les documents
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, unique: true },
  description: { type: String, unique: true, required: true },
  format: {
    type: String,
    enum: ["text", "image", "audio", "video", "epub", "pdf"],
    required: true,
  },
  file: { type: String, required: true, unique: true },
  public_id: { type: String, required: true },
  tags: [{ type: String, trim: true, lowercase: true, required: true }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const Doc = mongoose.model("Doc", documentSchema);
export default Doc;
