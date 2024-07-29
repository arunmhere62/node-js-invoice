import express from 'express';
import { customerCreate, customerGetAll, customerDeleteById, customerUpdate, customerGetParticular } from '../controllers/customer/customer.js';
import { permissions } from '../services/enums.js';
import { checkPermission } from '../services/utils/permissionsCheck.js';

const router = express.Router();

router.post("/create", checkPermission(permissions.CUSTOMER_CREATE), customerCreate);
router.post("/get/:id", checkPermission(permissions.CUSTOMER_DETAILS_VIEW), customerGetParticular);
router.post("/update/:id", checkPermission(permissions.CUSTOMER_EDIT), customerUpdate);
router.post("/list", checkPermission(permissions.CUSTOMER_LIST), customerGetAll);
router.post("/delete/:id", checkPermission(permissions.CUSTOMER_DELETE), customerDeleteById);

export default router;