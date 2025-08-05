import { Router } from "express";
import docsController from "../controllers/docs.controller";

const DocsRouter = Router();

DocsRouter.get ('/', docsController.getAll);
DocsRouter.get('/:category_name', docsController.getById);



export default DocsRouter;