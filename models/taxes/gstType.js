import mongoose from "mongoose";

const GstType = mongoose.Schema({
    gstName: {
        type: String,
        required: true,
    },
    gstPercentage: {
        type: Number,
        required: true,
    }
})

const GstTypeSchema = mongoose.model("GstType", GstType)
export { GstTypeSchema }