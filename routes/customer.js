import express from 'express';
import { customerCreate, customerGetAll, customerDeleteById, customerUpdate } from '../controllers/customer/customer.js';
import verifyToken from '../middleware/authorization.js';

const router = express.Router();

router.post("/create", verifyToken, customerCreate);
router.post("/update/:id", verifyToken, customerUpdate);
router.post("/list", verifyToken, customerGetAll);
router.post("/delete/:id", verifyToken, customerDeleteById);

export default router;