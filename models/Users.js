import mongoose from "mongoose";
//Definition du modèle de données pour les utilisateurs
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "le nom d'utilisateur est requis"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Email invalide"],
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "le mot de passe doit comporter au moins 6 caractères"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    accessibilité: {
      type: String,
      enum: [
        "Sourd",
        "Aveugle",
        "Sourd-Muet",
        "Malvoyant",
        "Malentendant",
        "Daltonien",
        "Non défini",
      ],
      default: "Non défini",
    },
    resetPasswordToken: { type: String }, // token hashé pour reset password
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

//Création du modèle User
export default mongoose.model("User", userSchema);
