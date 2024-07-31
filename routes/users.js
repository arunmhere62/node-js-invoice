import express from 'express';
import { deleteUser, getAllUsers, getSingleUser, updateUserData, userRegistration } from '../controllers/user.js';
import verifyJWT from '../middleware/verifyJWT.js';
import { checkPermission } from '../services/utils/permissionsCheck.js';
import { permissions } from '../services/enums.js';

// import { UserLogin } from '../models/user';

const router = express.Router();
router.post("/register", verifyJWT, checkPermission(permissions.USER_CREATE), userRegistration);
router.post("/update/:id", verifyJWT, checkPermission(permissions.USER_EDIT), updateUserData);
router.post("/list", verifyJWT, checkPermission(permissions.USER_LIST), getAllUsers);
router.post("/get/:id", verifyJWT, checkPermission(permissions.USER_DETAILS_VIEW), getSingleUser);
router.post("/delete/:id", verifyJWT, checkPermission(permissions.USER_DELETE), deleteUser);

export default router;
