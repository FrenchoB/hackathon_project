import Doc from "../models/Doc.js";
import cloudinary from "../cloudinary/cloudinary.js";
import fs from "fs";

class DocController {
  async getAllDocs(req, res) {
    try {
      const docs = await Doc.find();
      res.status(200).json(docs);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getDocById(req, res) {
    try {
      const doc = await Doc.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({ message: "Document non trouvé." });
      }
      res.status(200).json(doc);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async getDocsByTags(req, res) {
    try {
      const { tags } = req.body;

      if (!tags) {
        return res.status(400).json({ message: "Aucun tag fourni." });
      }

      const tagsArray = tags.split(",").map((tag) => tag.trim().toLowerCase());

      const docs = await Doc.find({
        tags: { $in: tagsArray },
      });

      res.status(200).json(docs);
    } catch (err) {
      console.error("Erreur lors de la récupération par tags :", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async createDoc(req, res) {
    try {
      const { title, description, format, tags } = req.body;

      // Vérifie que le fichier est bien présent
      if (!req.file?.path) {
        return res.status(400).json({ message: "Aucun fichier fourni." });
      }

      // Upload du fichier sur Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "hackathon_docs",
        resource_type: "auto",
      });

      // Supprimer le fichier temporaire
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error(
            "Erreur lors de la suppression du fichier temporaire :",
            err.message
          );
      });

      // Création du document dans MongoDB
      const newDoc = new Doc({
        title,
        description,
        format,
        file: result.secure_url,
        public_id: result.public_id,
        tags,
        createdBy: req.user?._id,
      });

      await newDoc.save();
      res.status(201).json(newDoc);
    } catch (err) {
      console.error("Erreur lors de la création du document :", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async deleteDoc(req, res) {
    try {
      const doc = await Doc.findById(req.params.id);

      if (!doc) {
        return res.status(404).json({ message: "Document non trouvé." });
      }
      // supression de Cloudinary
      await cloudinary.uploader.destroy(doc.public_id);

      // supression de MongoDB
      await doc.deleteOne();
      res.status(200).json({ message: "Document supprimé avec succès." });
    } catch (err) {
      console.error("Erreur lors de la suppression :", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async updateDoc(req, res) {
    try {
      const { title, description, format, tags } = req.body;

      const doc = await Doc.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({ message: "Document non trouvé." });
      }

      // Mise à jour des champs
      if (title) doc.title = title;
      if (description) doc.description = description;
      if (format) doc.format = format;
      if (tags) doc.tags = tags;

      if (req.file?.path) {
        // Supprimer l'ancien fichier sur Cloudinary
        if (doc.public_id) {
          await cloudinary.uploader.destroy(doc.public_id);
        }

        // Upload du nouveau fichier
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "hackathon_docs",
          resource_type: "auto",
        });

        // Supprimer le fichier temporaire
        fs.unlink(req.file.path, (err) => {
          if (err)
            console.error(
              "Erreur lors de la suppression du fichier temporaire :",
              err.message
            );
        });

        // Mise à jour des infos Cloudinary
        doc.file = result.secure_url;
        doc.public_id = result.public_id;
      }

      await doc.save();
      res.status(200).json(doc);
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err.message);
      res.status(500).json({ message: err.message });
    }
  }
}

export default new DocController();
