import express from 'express';
import { createProduct, updateProduct } from '../controllers/product.js';
import verifyToken from '../middleware/authorization.js';
const router = express.Router();

router.post("/createProduct", verifyToken, createProduct);
router.get("/allProduct",)
router.put("/update/:id", verifyToken, updateProduct)
router.delete("/delete",)

export default router;
