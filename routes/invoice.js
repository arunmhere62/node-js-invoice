import express from "express";
import verifyToken from "../middleware/authorization.js";
import { invoiceCreate, invoiceDelete, invoiceGetAll } from "../controllers/invoice/invoice.js";

const router = express.Router();

router.post("/create", verifyToken, invoiceCreate)
router.post("/list", verifyToken, invoiceGetAll)
router.post("/delete/:id", verifyToken, invoiceDelete)

export default router;
