import express from 'express';
import verifyToken from '../middleware/authorization.js';
import { serviceCreate, serviceDelete, serviceUpdate, servicesList } from '../controllers/service/service.js';

const router = express.Router();

router.post('/list', verifyToken, servicesList);
router.post('/create', verifyToken, serviceCreate);
router.post('/update/:id', verifyToken, serviceUpdate);
router.post('/delete/:id', verifyToken, serviceDelete);

export default router;