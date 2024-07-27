import express from 'express';
import { getAllUsers, getUserByNameOrId, getUserData, updateUserData, userLogin, userRegistration } from '../controllers/user.js';
import verifyJWT from '../middleware/verifyJWT.js';

// import { UserLogin } from '../models/user';

const router = express.Router();
router.post("/register", verifyJWT, userRegistration);
router.get("/login", getUserData);
router.put("/:id", updateUserData);
router.get("/allUser", getAllUsers);
router.get("/:id", getUserByNameOrId);

export default router;

