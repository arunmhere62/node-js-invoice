import mongoose from 'mongoose';

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
        match: [/^https?:\/\/.+\..+/, "Please enter a valid URL"]
    },
    companyTaxNumber: {
        type: String,
        required: true
    },
    companyRegNumber: {
        type: String,
        required: true
    }
});

const CompanyDetails = mongoose.model('CompanyDetails', companyDetailsSchema);

export { CompanyDetails };
