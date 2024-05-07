import express from 'express';
import { getTdsList, createTds, deleteTdsById, getTdsById, updateTdsById } from '../../controllers/taxes/tdsTax.js';

const router = express.Router();

router.post('/list', getTdsList);
router.post('/create', createTds);
router.post('/update/:id', updateTdsById);
router.post('/delete/:id', deleteTdsById);
router.post("/get/:id", getTdsById);
export default router;