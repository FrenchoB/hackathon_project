import dotenv from "dotenv";
import express from "express";
import connectDB from "./database/database.js";
import docsRouter from "./routes/docs.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use("/docs", docsRouter);

app.listen(port, () => {
  connectDB();
  console.log("Serveur démarré sur le port " + port);
});
