import mongoose from "mongoose";

const CustomerSchema = mongoose.Schema({
    primaryContact: {
        type: String,
        required: true,
    },
    type: {
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
    phoneNumber: {
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
    contactName: {
        type: String,
        required: true,
    },
    contactEmail: {
        type: String,
        required: true,
    },
    contactPhone: {
        type: Number,
        required: true,
    }
});

const Customer = mongoose.model("customer", CustomerSchema);
export { Customer };