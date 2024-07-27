import express from "express";
import { invoiceCreate, invoiceDelete, invoiceGetAll, invoiceGetAllData, invoiceGetById, invoiceUpdate } from "../controllers/invoice/invoice.js";

const router = express.Router();

router.post("/create", invoiceCreate)
router.post("/list", invoiceGetAll)
router.post("/delete/:id", invoiceDelete)
router.post("/update/:id", invoiceUpdate)
router.post("/getInvoice/all", invoiceGetAllData)
router.post("/get/:id", invoiceGetById)

export default router;
