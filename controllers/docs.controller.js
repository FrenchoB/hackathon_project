import Doc from "../models/Doc";

class UserController {
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

      const docs = await Doc.find({ tags: { $in: tags } });
      res.status(200).json(docs);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    }
  }
}

export default new UserController();
