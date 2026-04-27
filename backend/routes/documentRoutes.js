import express from 'express';
import { 
    getDocuments,
    getDocument,
    uploadDocument,
    deleteDocument } from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

//All router
router.use(protect);
router.post('/', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;