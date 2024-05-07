import express from 'express';
import { getGstTypeById, createGstType, deleteGstTypeById, getGstTypeList, updateGstTypeById } from '../../controllers/taxes/gstType.js';

const router = express.Router();

router.post('/list', getGstTypeList);
router.post('/create', createGstType);
router.post('/update/:id', updateGstTypeById);
router.post('/delete/:id', deleteGstTypeById);
router.post("/get/:id", getGstTypeById);

export default router;