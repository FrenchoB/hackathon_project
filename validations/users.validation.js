import Joi from "joi";

export const createUserSchema = Joi.object({
  username: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Le nom d'utilisateur est requis.",
    "string.min": "Le nom d'utilisateur doit contenir au moins 2 caractères.",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Le format de l'email est invalide.",
      "string.empty": "L'email est requis.",
    }),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
    .required()
    .messages({
      "string.min": "Le mot de passe doit contenir au moins 6 caractères.",
      "string.empty": "Le mot de passe est requis.",
    }),
  confirmPassword: Joi.valid(Joi.ref("password")).required().messages({
    "any.only": "Les mots de passe ne correspondent pas.",
  }),
  accessibilite: Joi.alternatives().try(
    Joi.string().valid(
      "Sourd",
      "Aveugle",
      "Sourd-Muet",
      "Malvoyant",
      "Malentendant",
      "Daltonien",
      "Non défini"
    ),
    Joi.array().items(
      Joi.string().valid(
        "Sourd",
        "Aveugle",
        "Sourd-Muet",
        "Malvoyant",
        "Malentendant",
        "Daltonien",
        "Non défini"
      )
    )
  ),
});
