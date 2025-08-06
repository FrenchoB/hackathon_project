import { createUserSchema } from "../validations/users.validation.js";
import { validate } from "../middlewares/validator.js";

import { loginLimiter } from "../middlewares/authentification.js";
// import { authorize, isAuthJwt } from "../middlewares/authentification.js";
import UserController from "../controllers/users.controller.js";
import express from "express";
const router = express.Router();

router.get("/verify/:token", UserController.verifyEmail);

router.post("/login", loginLimiter, UserController.login);

router.post("/logout", UserController.logout);

router.post("/register", validate(createUserSchema), UserController.register);

export default router;
