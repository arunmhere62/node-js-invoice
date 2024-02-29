import express from 'express';
import { createClient, deleteClientById, getAllClients, updateClient } from '../controllers/Client/clients.js';
import verifyToken from '../middleware/authorization.js';


const router = express.Router();

router.post("/createClient", verifyToken, createClient);
router.post("/updateClient", verifyToken, updateClient)
router.post("/clientList", verifyToken, getAllClients)
router.post("/:id", verifyToken, deleteClientById)

export default router;