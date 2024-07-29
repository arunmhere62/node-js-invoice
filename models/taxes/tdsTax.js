import mongoose from "mongoose";
import '../../mongoose-plugin.js';

const TdsTax = mongoose.Schema({
    taxName: {
        required: true,
        type: String
    },
    taxPercentage: {
        required: true,
        type: Number
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

const TdsSchema = mongoose.model("TdsType", TdsTax);
export { TdsSchema } 
