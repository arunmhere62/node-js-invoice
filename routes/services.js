import express from 'express';
import { getServiceById, serviceCreate, serviceDelete, serviceUpdate, servicesList } from '../controllers/service/service.js';
import { checkPermission } from '../services/utils/permissionsCheck.js';
import { permissions } from '../services/enums.js';

const router = express.Router();

router.post('/list', checkPermission(permissions.SERVICE_LIST), servicesList);
router.post('/create', checkPermission(permissions.SERVICE_CREATE), serviceCreate);
router.post('/update/:id', checkPermission(permissions.SERVICE_EDIT), serviceUpdate);
router.post('/get/:id', checkPermission(permissions.SERVICE_DETAILS_VIEW), getServiceById);
router.post('/delete/:id', checkPermission(permissions.SERVICE_DELETE), serviceDelete);

export default router;