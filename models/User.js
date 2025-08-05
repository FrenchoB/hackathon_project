import mongoose from "mongoose";
//Definition du modèle de données pour les utilisateurs
const userSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.ObjectId, auto: true },
  username: {
    type: String,
    required: [true, "le nom d'utilisateur est requis"],
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, "Email invalide"],
  },
  password: {
    type: String,
    required: true,
    minLength: [3, "le mot de passe doit comporter au moins 3 caractères"],
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
  timestamps: true,
});

//Création du modèle User
module.exports = mongoose.model("User", userSchema);
