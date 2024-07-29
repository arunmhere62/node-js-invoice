import express from "express";
import { invoiceAgingReport, invoiceCreate, invoiceDelete, invoiceGetAll, invoiceGetById, invoiceUpdate } from "../controllers/invoice/invoice.js";
import { checkPermission } from "../services/utils/permissionsCheck.js";
import { permissions } from "../services/enums.js";

const router = express.Router();

router.post("/create", checkPermission(permissions.INVOICE_CREATE), invoiceCreate)
router.post("/list", checkPermission(permissions.INVOICE_LIST), invoiceGetAll)
router.post("/delete/:id", checkPermission(permissions.INVOICE_DELETE), invoiceDelete)
router.post("/update/:id", checkPermission(permissions.INVOICE_EDIT), invoiceUpdate)
router.post("/get/:id", checkPermission(permissions.INVOICE_DETAILS_VIEW), invoiceGetById)
router.post("/reports", checkPermission(permissions.INVOICE_AGING_REPORT), invoiceAgingReport)

export default router;
