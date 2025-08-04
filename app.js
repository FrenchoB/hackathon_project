import express from "express";
const app = express();
import connectDB from "./database/database.js";
import "dotenv/config";
const port = process.env.PORT;


app.use{express.json()}

app.listen(port, () => {
  connectDB();
  console.log("Serveur démarré sur le port " + port);
});
