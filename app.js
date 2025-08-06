import dotenv from "dotenv";
import express from "express";
import xss from "xss-clean"; // A remplacer par sanitize-html qui n'est pas déprécié
import rateLimit from "express-rate-limit";
import connectDB from "./database/database.js";
import docsRouter from "./routes/docs.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT;
import usersRoutes from "./routes/users.routes.js";
import session from "express-session";
import cookieParser from "cookie-parser";

// Limiteur : 100 requêtes par IP toutes les 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes
  message: "Trop de requêtes, réessayez plus tard.",
  standardHeaders: true, // Retourne les infos de rate limit dans les headers
  legacyHeaders: false, // Désactive les vieux headers `X-RateLimit-*`
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(xss()); // Pour nettoyer les entrées utilisateur contre les attaques XSS
app.use(limiter);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use((req, res, next) => {
  res.locals.style = "main"; // valeur par défaut
  next();
});
app.use(cookieParser()); //Pour parser les cookies
app.use("/users", usersRoutes);

app.use("/docs", docsRouter);

app.listen(port, () => {
  connectDB();
  console.log("Serveur démarré sur le port " + port);
});
