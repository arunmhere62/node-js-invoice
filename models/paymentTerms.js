import mongoose from "mongoose";

const PaymentTerms = mongoose.Schema({
    termName: {
        required: true,
        type: String,
    },
    startDate: {
        required: true,
        type: Date,
    },
    dueDate: {
        required: true,
        type: Date,
    },
});

// Middleware to format date fields before saving
PaymentTerms.pre('save', function (next) {
    // Formatting start date
    this.startDate = `${this.startDate.getDate()}-${this.startDate.getMonth() + 1}-${this.startDate.getFullYear()}`;
    // Formatting due date
    this.dueDate = `${this.dueDate.getDate()}-${this.dueDate.getMonth() + 1}-${this.dueDate.getFullYear()}`;
    next();
});

const PaymentTermsSchema = mongoose.model("PaymentTerms", PaymentTerms);
export { PaymentTermsSchema };
