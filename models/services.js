import mongoose from "mongoose";
import '../mongoose-plugin.js';
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
});

const Service = mongoose.model("service", ServiceSchema);
export { Service };

