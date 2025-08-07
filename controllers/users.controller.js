import User from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import sendEmail from "../utils/sendEmail.js";

const JWT_SECRET = process.env.JWT_SECRET;
const port = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

class UserController {
  async register(req, res) {
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

      console.log(newUser);

      await newUser.save();

      const verificationToken = jwt.sign({ id: newUser._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const verificationUrl = `${
        `${CLIENT_URL}/users/verify/${verificationToken}` ||
        `http://localhost:${port}/users/verify/${verificationToken}`
      }`;

      await sendEmail({
        to: newUser.email,
        subject: "Vérifier votre compte",
        html: `Bonjour ${username}, <br><br>Merci de vérifier votre compte en cliquant sur ce lien : <a href="${verificationUrl}">Vérifier mon compte</a><br><br>Ce lien est valable 7 jours.`,
      });

      res.status(201).json({
        message: "Utilisateur créé. Un email de vérification a été envoyé",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res
        .status(500)
        .json({ message: "Impossible d’enregistrer l'utilisateur." });
    }
  }

  async verifyEmail(req, res) {
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

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Tous les champs sont obligatoires" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "utilisateur non trouvé" });
      }

      if (!user.isVerified) {
        return res.status(401).json({
          message: "Compte non vérifié. Veuillez vérifier vos identifiants.",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: "identifiants incorrects" });
      }

      req.session.user = user;

      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }); // 7 jours})
      res.json({ message: "Connexion réussie" });
      //Section pour admin
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la connexion" });
      console.error(error);
    }
  }

  async logout(req, res) {
    try {
      req.session.destroy();
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });
      res.json({ message: "Déconnexion réussie" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la déconnextion" });
    }
  }

  async requestPasswordReset(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis." });

    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(404).json({ message: "Utilisateur non trouvé." });

      // Création d'un token unique pour reset, par exemple un JWT ou token random
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Option 1: stocker un hash du token pour sécurité
      const resetTokenHashed = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Sauvegarde dans la DB avec expiration 1h par ex
      user.resetPasswordToken = resetTokenHashed;
      user.resetPasswordExpire = Date.now() + 3600000; // 1h en ms
      await user.save();

      // URL de reset envoyée par email
      const resetUrl = `${CLIENT_URL}/api/auth/reset-password/${resetToken}`;

      await sendEmail({
        to: newUser.email,
        //to: "wazabi64000@gmail.com", // ← temporaire
        subject: "Réinitialisation de mot de passe",
        html: `<p>Bonjour,</p>
               <p>Pour réinitialiser votre mot de passe, cliquez sur ce lien :</p>
               <a href="${resetUrl}">${resetUrl}</a>
               <p>Ce lien expire dans 1 heure.</p>`,
      });

      res.json({ message: "Email de réinitialisation envoyé." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  }

  async resetPassword(req, res) {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword)
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });

    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas." });

    try {
      // Hash le token reçu pour le comparer en DB
      const resetTokenHashed = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Trouver l'utilisateur avec token valide et non expiré
      const user = await User.findOne({
        resetPasswordToken: resetTokenHashed,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user)
        return res.status(400).json({ message: "Token invalide ou expiré." });

      // Hash du nouveau password
      user.password = await bcrypt.hash(password, 12);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      res.json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  }

  //Revoyer le lien de validation si le token est expriré

  async resendVerificationEmail(req, res) {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur introuvable." });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Ce compte est déjà vérifié." });
      }

      const verificationToken = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: "1d",
      });

      const verificationUrl = `${CLIENT_URL}/api/auth/verify/${verificationToken}`;

      await sendEmail({
        to: user.email,
        subject: "Nouveau lien de vérification",
        html: `Bonjour ${user.name},<br><br>Voici un nouveau lien pour vérifier votre compte : <a href="${verificationUrl}">Vérifier mon compte</a><br><br>Ce lien est valable 24h.`,
      });

      res.json({
        message: "Un nouveau lien de vérification a été envoyé à votre email.",
      });
    } catch (error) {
      console.error("Erreur lors du renvoi de l’email :", error);
      res
        .status(500)
        .json({ message: "Erreur lors de l’envoi du lien de vérification." });
    }
  }
}

export default new UserController();
