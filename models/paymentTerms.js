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

export const getDynamicPaymentTermsModel = (collectionName) => {
    return mongoose.model(collectionName, PaymentTerms);
};
