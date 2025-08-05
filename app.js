import express from "express";
const app = express();
import connectDB from "./database/database.js";
import "dotenv/config";
const port = process.env.PORT;
import usersRoutes from "./routes/users.routes.js";
import session from "express-session";
import cookieParser from "cookie-parser";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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

app.listen(port, () => {
  connectDB();
  console.log("Serveur démarré sur le port " + port);
});
