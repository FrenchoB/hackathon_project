import { Router } from "express";
import multer from "multer";
import docsController from "../controllers/docs.controller.js";

const upload = multer({ dest: "uploads/" });

const docsRouter = Router();

docsRouter.get("/", docsController.getAllDocs);
docsRouter.get("/add", docsController.docForm);

docsRouter.post("/tags", docsController.getDocsByTags);
docsRouter.post("/add", upload.single("file"), docsController.createDoc);
docsRouter.delete("/:id", docsController.deleteDoc);
docsRouter.put("/:id", upload.single("file"), docsController.updateDoc);

docsRouter.get("/:id", docsController.getDocById);

export default docsRouter;
