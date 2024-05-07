import express from 'express';
import { createPaymentTerms, deletePaymentTermById, getAllPaymentTerms, getPaymentTermById, updatePaymentTermById } from '../controllers/paymentTerms.js';

const router = express.Router();

router.post('/list', getAllPaymentTerms);
router.post('/create', createPaymentTerms);
router.post('/update/:id', updatePaymentTermById);
router.post('/delete/:id', deletePaymentTermById);
router.post("/get/:id", getPaymentTermById);

export default router;