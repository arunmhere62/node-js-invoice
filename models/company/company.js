import mongoose from 'mongoose';
import '../../mongoose-plugin.js';

const companyDetailsSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    companyEmail: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, "Please enter a valid email address"]
    },
    companyPhone: {
        type: String,
        required: true
    },
    companyCountry: {
        type: String,
        required: true
    },
    companyState: {
        type: String,
        required: true
    },
    companyAddress: {
        type: String,
        required: true
    },
    companyWebsite: {
        type: String,
        required: true,
    },
    companyTaxNumber: {
        type: String,
        required: true
    },
    companyRegNumber: {
        type: String,
        required: true
    },
    // 
    customerLimit: {
        type: Number,
        required: true,
    },
    invoiceLimit: {
        type: Number,
        required: true,
    },
    userLimit: {
        type: Number,
        required: true,
    },
    serviceLimit: {
        type: Number,
        required: true,
    },
});

const CompanyDetails = mongoose.model('CompanyDetails', companyDetailsSchema);

export { CompanyDetails };
