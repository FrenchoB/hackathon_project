import { createUserSchema } from "../validations/users.validation.js";
import { validate } from "../middlewares/validator.js";
import { loginLimiter } from "../middlewares/authentification.js";
import { authorize, isAuthJwt } from "../middlewares/authentification.js";
import UserController from "../controllers/users.controller.js";
import express from "express";
const router = express.Router();

router.post("/register", validate(createUserSchema), UserController.register);

router.get("/register", UserController.register);

router.get("/verify/:token", UserController.verifyEmail);

router.get("/login", UserController.login);

router.post("/login", loginLimiter, UserController.login);

router.post("/logout", UserController.logout);

router.post("/password-reset-request", UserController.requestPasswordReset);

router.post("/reset-password/:token", UserController.resetPassword);

router.post("/resend-verification", UserController.resendVerificationEmail);

router.get("/admin-panel", isAuthJwt, authorize("admin"), (req, res) => {
  res.json({ message: "Bienvenue dans le panneau admin" });
});

export default router;
