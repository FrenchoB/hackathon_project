import nodemailer from "nodemailer";
import "dotenv/config";

//test de récupération des variables

console.log(process.env.GMAIL_USER);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export default async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"AGATHE" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email envoyé avec succès", info.messageId);
  } catch (error) {
    console.error("Erreur d'envoi :", error);
    throw new Error("Erreur lors de l'envoi de l'email");
  }
}