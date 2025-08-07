import dotenv from "dotenv";
import express from "express";
import ejs from "ejs";
import expressLayouts from "express-ejs-layouts";
import methodOverride from "method-override";
import connectDB from "./database/database.js";
import docsRouter from "./routes/docs.routes.js";
import helmet from "helmet";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT;

import usersRoutes from "./routes/users.routes.js";
import session from "express-session";
import cookieParser from "cookie-parser";

//Middlewares
app.use(express.static("public")); //Pour servir les fichiers statiques (CSS, images, etc.)
app.use(express.static("uploads")); //Pour servir les fichiers uploadés
app.use(expressLayouts); //Pour utiliser express-ejs-layouts
app.use(helmet());
app.use(cors({ origin: "https://localhost:5000", credential: true }));
app.use(express.urlencoded({ extended: true })); //Créer le body permettant de récupérer les données du formulaire
app.use(express.json());
app.use(methodOverride("_method")); //Pour utiliser les méthodes PUT et DELETE dans les formulaires
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
app.use(cookieParser()); //Pour parser les cookies
app.use("/users", usersRoutes);
app.use("/docs", docsRouter);

//Settings
app.set("trust proxy", 1);
app.set("view engine", "ejs"); //Pour utiliser EJS comme moteur de template

app.listen(port, () => {
  connectDB();
  console.log("Serveur démarré sur le port " + port);
});
