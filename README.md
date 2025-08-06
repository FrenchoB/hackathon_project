# Documentation API pour Développeur Frontend


## 1. Base URL API

```url
https://hackathon-project-fkel.onrender.com

```


## 2. Endpoints disponibles

| Méthode | URL                    | Description                         | Auth requis |
|---------|------------------------|-----------------------------------|-------------|
| POST    | /users/register         | Inscription utilisateur            | Non         |
| POST    | /users/login            | Connexion utilisateur              | Non         |
| POST    | /users/verify/:token            | Vérification utilisateur              | Non         |
| POST    | /users/logout            | Déconnexion utilisateur              | Oui         |
| GET     | /docs            | Lister tous les documents        |         |
| GET     | /docs/:id           | Récupérer un document par id        |         |
| POST    | /docs            | Créer un document                |       |
| DELETE     | /docs/:id              | Supprimer un document          |         |
| PUT    | /docs/:id              | Modifier un document     |   |

---
#  Guide des Endpoints API – Pour Développeur Frontend


##  Authentification

###  Inscription
- **Méthode :** `POST`
- **URL :** `/users/register`
- **Champs formulaire requis :**
  - `username` (texte)
  - `email` (texte)
  - `password` (texte)
  - `confirmPassword` (texte)
- **Auth :**  Non

---

###  Connexion
- **Méthode :** `POST`
- **URL :** `/users/login`
- **Champs formulaire requis :**
  - `email` (texte)
  - `password` (texte)
- **Auth :**  Non
- **Réponse :** Renvoie un `token` (à stocker et utiliser)

---
###  Déconnexion
- **Méthode :** `POST`
- **URL :** `/users/logout`
- **Auth :**  Oui

---

##  Documents

###  Lister les documents
- **Méthode :** `GET`
- **URL :** `/docs`
- **Auth :**  

---
###  Récupérer un document
- **Méthode :** `GET`
- **URL :** `/docs/:id`
- **Auth :**  

---

###  Créer un document
- **Méthode :** `POST`
- **URL :** `/docs`
- **Champs formulaire requis :**
  - `title` (texte)
  - `description` (texte)
  - `format` (texte)
  - `tags` (texte)
  - `file` (fichier)
- **Auth :**  

---

###  Supprimer un document
- **Méthode :** `DELETE`
- **URL :** `/docs/:id`
- **Auth :**  

---

###  Modifier un document
- **Méthode :** `PUT`
- **URL :** `/api/annonces`
- **Type :** `multipart/form-data` (upload image)
- **Champs formulaire requis :**
  - `title` (texte)
  - `description` (texte)
  - `format` (texte)
  - `tags` (texte)
  - `file` (fichier)
- **Auth :** 

---

##  Remarques importantes

- L’image doit être envoyée via un champ `file` dans un formulaire `multipart/form-data`.

- Toutes les réponses sont au format **JSON**.

---