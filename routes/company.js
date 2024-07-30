
import express from 'express';
import { permissions } from '../services/enums.js';
import { checkPermission } from '../services/utils/permissionsCheck.js';
import { companiesList, deleteCompany, getSingleCompany } from '../controllers/company/company.js';

const router = express.Router();

router.post('/list', checkPermission(permissions.COMPANY_LIST), companiesList);
router.post('/get/:id', checkPermission(permissions.COMPANY_DETAILS_VIEW), getSingleCompany);
router.post('/delete/:id', checkPermission(permissions.COMPANY_DELETE), deleteCompany);

export default router;