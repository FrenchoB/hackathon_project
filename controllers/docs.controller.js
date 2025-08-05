import docsModel from './docs.model.js';

const BASE_URL = 'http://localhost:5000';

export default class docsController {
    static getAll = async (req, res) => {
        try {
            const documents = await docsModel.getAll();
            res.status(200).json(documents); 
        } catch (err) {
            console.log(err.message);
            res.status(500).json({ message: err.message }); 
        }
    }

    static getByTags = async (req, res) => {
        try {
            const documents = await docsModel.getByTags(req.params.category_name); 
            res.status(200).json(documents); 
        } catch (err) {
            console.log(err.message);
            res.status(500).json({ message: err.message }); 
        }
    }
}

