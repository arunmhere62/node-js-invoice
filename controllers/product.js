import { Product } from "../models/product.js";

const createProduct = async (req, res) => {
    try {
        const { title, description, prize } = req.body;
        const newData = new Product({ title, description, prize });
        const saveData = await newData.save();
        res.status(201).json(saveData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const result = await Product.findByIdAndUpdate(id, update, { new: true });
        if (!result) {
            return res.status(404).json({ message: "product not found" })
        }
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }
}


export { createProduct, updateProduct };