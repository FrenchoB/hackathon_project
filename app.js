import "dotenv/config";
import express from "express";
import ejs from "ejs";
import expressLayouts from "express-ejs-layouts";
import methodOverride from "method-override";
import connectDB from "./database/database.js";
import docsRouter from "./routes/docs.routes.js";
import helmet from "helmet";
import cors from "cors";
import usersRoutes from "./routes/users.routes.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
//import xss from "xss-clean"; // A remplacer par sanitize-html qui n'est pas déprécié

const app = express();
const port = process.env.PORT;
const whitelist = [
  "https://hackathon-project-fkel.onrender.com",
  "http://localhost:5000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Requête serveur à serveur
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true); // Origine autorisée
    } else {
      callback(new Error("Origine non autorisée par CORS"));
    }
  },
  credentials: true,
};

// Limiteur : 100 requêtes par IP toutes les 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes
  message: "Trop de requêtes, réessayez plus tard.",
  standardHeaders: true, // Retourne les infos de rate limit dans les headers
  legacyHeaders: false, // Désactive les vieux headers `X-RateLimit-*`
});


//Middlewares
app.use(express.static("public")); //Pour servir les fichiers statiques (CSS, images, etc.)
app.use(express.static("uploads")); //Pour servir les fichiers uploadés
app.use(expressLayouts); //Pour utiliser express-ejs-layouts
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); //Pour parser les cookies
app.use(limiter);
//app.use(xss()); // Pour nettoyer les entrées utilisateur contre les attaques XSS
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
app.use((req, res, next) => {
  res.locals.style = "main"; // valeur par défaut
  next();
});

app.use("/users", usersRoutes);
app.use("/docs", docsRouter);

//Settings
app.set("trust proxy", 1);
app.set("view engine", "ejs"); //Pour utiliser EJS comme moteur de template

app.listen(port, () => {
  connectDB();
  console.log("Serveur démarré sur le port " + port);
});
