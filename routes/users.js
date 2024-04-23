import express from 'express';
import { getAllUsers, getUserByNameOrId, getUserData, updateUserData, userLogin, userRegistration } from '../controllers/user.js';
import verifyToken from '../middleware/authorization.js';

// import { UserLogin } from '../models/user';

const router = express.Router();
router.post("/login", userLogin);
router.post("/register", userRegistration);
router.get("/login", getUserData);
router.put("/:id", updateUserData);
router.get("/allUser", getAllUsers);
router.get("/:id", getUserByNameOrId);

export default router;

