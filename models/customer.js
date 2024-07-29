import mongoose from "mongoose";
import '../mongoose-plugin.js';

const ContactPersonSchema = mongoose.Schema({
    contactName: {
        type: String,
        required: true,
    },
    contactEmail: {
        type: String,
        required: true,
    },
    contactPhone: {
        type: String, // Assuming phone number is stored as a string
        required: true,
    },
});

const CustomerSchema = mongoose.Schema({
    customerName: {
        type: String,
        required: true,
    },
    customerType: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: Number,
        required: true,
    },
    paymentTerms: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pinCode: {
        type: String,
        required: true,
    },
    contactPersons: {
        type: [ContactPersonSchema],
        default: [],
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
    companyId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyDetails'
    },
});

const Customer = mongoose.model("customer", CustomerSchema);
export { Customer };