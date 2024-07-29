import mongoose from "mongoose";
import '../../mongoose-plugin.js';

const GstType = mongoose.Schema({
    gstName: {
        type: String,
        required: true,
    },
    gstPercentage: {
        type: Number,
        required: true,
    },
    companyId: {
        require: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyDetails'
    },
    createdBy: {
        type: String,
        required: false,
        default: null,
    },
    updatedBy: {
        type: String,
        required: false,
        default: null,

    },
})

const GstTypeSchema = mongoose.model("GstType", GstType)
export { GstTypeSchema }