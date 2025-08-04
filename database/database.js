import mongoose from "mongoose";

const connectDB = async function () {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connexion à la base de données réussie !");
  } catch (error) {
    console.error(
      "Erreur de connexion à la base de données du Hackathon_Project :" +
        error.message
    );
  }
};

export default connectDB;
