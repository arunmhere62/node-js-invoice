import express from 'express';
import { customerCreate, customerGetAll, customerDeleteById, customerUpdate, customerGetParticular } from '../controllers/customer/customer.js';
import verifyToken from '../middleware/authorization.js';

const router = express.Router();

router.post("/create", customerCreate);
router.post("/get/:id", customerGetParticular);
router.post("/update/:id", customerUpdate);
router.post("/list", customerGetAll);
router.post("/delete/:id", customerDeleteById);

export default router;