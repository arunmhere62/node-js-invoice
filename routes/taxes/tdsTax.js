import express from 'express';
import { getTdsList, createTds, deleteTdsById, getTdsById, updateTdsById } from '../../controllers/taxes/tdsTax.js';
import { checkPermission } from '../../services/utils/permissionsCheck.js';
import { permissions } from '../../services/enums.js';

const router = express.Router();

router.post('/list', checkPermission(permissions.TDS_TAX_LIST), getTdsList);
router.post('/create', checkPermission(permissions.TDS_TAX_CREATE), createTds);
router.post('/update/:id', checkPermission(permissions.TDS_TAX_EDIT), updateTdsById);
router.post('/delete/:id', checkPermission(permissions.TDS_TAX_DELETE), deleteTdsById);
router.post("/get/:id", checkPermission(permissions.TDS_TAX_DETAILS_VIEW), getTdsById);

export default router;