import express from 'express';
import { createPaymentTerms, deletePaymentTermById, getAllPaymentTerms, getPaymentTermById, updatePaymentTermById } from '../controllers/paymentTerms.js';
import { checkPermission } from '../services/utils/permissionsCheck.js';
import { permissions } from '../services/enums.js';

const router = express.Router();

router.post('/list', checkPermission(permissions.PAYMENT_TERMS_LIST), getAllPaymentTerms);
router.post('/create', checkPermission(permissions.PAYMENT_TERMS_CREATE), createPaymentTerms);
router.post('/update/:id', checkPermission(permissions.PAYMENT_TERMS_EDIT), updatePaymentTermById);
router.post('/delete/:id', checkPermission(permissions.PAYMENT_TERMS_DELETE), deletePaymentTermById);
router.post("/get/:id", checkPermission(permissions.PAYMENT_TERMS_DETAILS_VIEW), getPaymentTermById);

export default router;