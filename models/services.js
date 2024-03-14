import mongoose from "mongoose";

const ServiceSchema = mongoose.Schema({
    serviceCode: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    }
});

const Service = mongoose.model("service", ServiceSchema);
export { Service };
