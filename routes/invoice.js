import express from "express";
import verifyToken from "../middleware/authorization.js";
import { invoiceCreate, invoiceDelete, invoiceGetAll } from "../controllers/invoice/invoice.js";

const router = express.Router();

router.post("/create", invoiceCreate)
router.post("/list", invoiceGetAll)
router.post("/delete/:id", invoiceDelete)

export default router;
