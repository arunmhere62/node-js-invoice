import mongoose from "mongoose";

const ProductSchema = mongoose.Schema({
    title: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    prize: {
        type: Number,
        required: false,
    }
});

const Product = mongoose.model("product", ProductSchema);
export { Product };