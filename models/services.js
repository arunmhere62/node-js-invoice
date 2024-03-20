import mongoose from "mongoose";

const ServiceSchema = mongoose.Schema({
    serviceAccountingCode: {
        type: String,
        required: true,
    },
    serviceDescription: {
        type: String,
        required: true,
    },
    serviceAmount: {
        type: Number,
        required: true,
    }
});

const Service = mongoose.model("service", ServiceSchema);
export { Service };
