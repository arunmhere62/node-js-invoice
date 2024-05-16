import mongoose from "mongoose";

const PaymentTerms = mongoose.Schema({
    termName: {
        require: true,
        type: String,
    },
    totalDays: {
        require: true,
        type: Number,
    }
});

// Middleware to format date fields before saving
const PaymentTermsSchema = mongoose.model("PaymentTerms", PaymentTerms);
export { PaymentTermsSchema };
