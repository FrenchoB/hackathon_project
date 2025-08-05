import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;
const port = process.env.PORT;

export async function register(req, res) {
  try {
    const { username, email, password, confirmPassword, role } = req.body;
    if (!username || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires" });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email déja utilisé" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      isVerified: false,
    });

    await newUser.save();

    const verificationToken = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const verificationUrl = `${
      CLIENT_URL || `http://localhost:${port}`
    }/users/verify`;

    await sendEmail({
      to: newUser.email,
      subject: "Vérifier votre compte",
      html: `Bonjour ${username}, <br><br>Merci de vérifier votre compte en cliquant sur ce lien : <a href="${verificationUrl}">Vérifier mon compte</a><br><br>Ce lien est valable 24h.`,
    });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ message: "Impossible d’enregistrer l'utilisateur." });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id)
      return res.status(400).json({ message: "Token invalide." });

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(400).json({ message: "Utilisateur introuvable." });
    if (user.isVerified)
      return res.status(400).json({ message: "Compte déjà vérifié." });

    user.isVerified = true;
    await user.save();

    res.json({ message: "Compte vérifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Token invalide ou expiré." });
  }
}
