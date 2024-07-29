import express from 'express';
import { getGstTypeById, createGstType, deleteGstTypeById, getGstTypeList, updateGstTypeById } from '../../controllers/taxes/gstType.js';
import { checkPermission } from '../../services/utils/permissionsCheck.js';
import { permissions } from '../../services/enums.js';

const router = express.Router();

router.post('/list', checkPermission(permissions.GST_TYPE_LIST), getGstTypeList);
router.post('/create', checkPermission(permissions.GST_TYPE_CREATE), createGstType);
router.post('/update/:id', checkPermission(permissions.GST_TYPE_EDIT), updateGstTypeById);
router.post('/delete/:id', checkPermission(permissions.GST_TYPE_DELETE), deleteGstTypeById);
router.post("/get/:id", checkPermission(permissions.GST_TYPE_DETAILS_VIEW), getGstTypeById);

export default router;