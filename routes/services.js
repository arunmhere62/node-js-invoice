import express from 'express';
import verifyToken from '../middleware/authorization.js';
import { getServiceById, serviceCreate, serviceDelete, serviceUpdate, servicesList } from '../controllers/service/service.js';

const router = express.Router();

router.post('/list', servicesList);
router.post('/create', serviceCreate);
router.post('/update/:id', serviceUpdate);
router.post('/get/:id', getServiceById);
router.post('/delete/:id', serviceDelete);

export default router;