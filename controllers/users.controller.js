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

      let accessibilite = req.body.accessibilite;
      if (!Array.isArray(accessibilite)) {
        accessibilite = accessibilite ? [accessibilite] : ["Non défini"];
      }

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
        accessibilite,
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

      // res.status(201).json({
      //   message: "Utilisateur créé. Un email de vérification a été envoyé",
      //   user: {
      //     id: newUser._id,
      //     username: newUser.username,
      //     email: newUser.email,
      //     role: newUser.role,
      //   },
      // });

      res.redirect("/login");
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

  async indexLogin(req, res) {
    try {
      res.render("pages/login", {
        style: "",
        title: "connexion",
        error: null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur lors de l'affichage du login : " + err);
    }
  }

  async registerForm(req, res) {
    try {
      res.render("pages/register", { title: "Inscription" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur lors de l'affichage du login : " + err);
    }
  }
}

export default new UserController();
