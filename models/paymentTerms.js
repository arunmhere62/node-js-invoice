import mongoose from "mongoose";
import '../mongoose-plugin.js';

const PaymentTerms = mongoose.Schema({
    termName: {
        require: true,
        type: String,
    },
    totalDays: {
        require: true,
        type: Number,
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

// Middleware to format date fields before saving
const PaymentTermsSchema = mongoose.model("PaymentTerms", PaymentTerms);
export { PaymentTermsSchema };
