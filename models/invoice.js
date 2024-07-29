import mongoose from 'mongoose';
import '../mongoose-plugin.js';


// Define the base schema for all invoices
const BaseInvoiceSchema = new mongoose.Schema({
    invoiceType: {
        type: String,
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    gstType: {
        type: String,
        required: true
    },
    gstPercentage: {
        type: Number,
        required: true
    },
    gstInNumber: {
        type: String,
        required: true
    },
    paymentTerms: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    invoiceDate: {
        type: Date,
        required: true
    },
    invoiceStatus: {
        type: String,
        required: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        required: false
    },
    termsAndConditions: {
        type: String,
        required: false
    },
    taxAmount: {
        tds: {
            type: String,
            required: false,
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    servicesList: [
        {
            serviceAccountingCode: {
                type: String,
                required: true
            },
            serviceDescription: {
                type: String,
                required: false
            },
            serviceQty: {
                type: Number,
                required: true
            },
            serviceTotalAmount: {
                type: Number,
                required: true
            },
            serviceAmount: {
                type: Number,
                required: true
            }
        }
    ],
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
    invoiceReason: {
        type: String,
        required: false
    },
    mailTo: {
        type: String,
        required: false
    },
    lastModified: {
        type: Date,
        required: false,
        default: Date.now
    },
    invoiceStages: {
        stage1: { type: String, default: null },
        stage2: { type: String, default: null },
        stage3: { type: String, default: null },
        stage4: { type: String, default: null },
        stage5: { type: String, default: null },
        stage6: { type: String, default: null }
    }
}, { discriminatorKey: 'type' });

// Define the schema for retainer invoices
const RetainerInvoiceSchema = new mongoose.Schema({
    retainerFee: {
        type: Number,
        required: true
    }
});

// Define the schema for one-time invoices
const OneTimeInvoiceSchema = new mongoose.Schema({
    // Any specific fields for one-time invoices can be added here
});

// Create the base model
const BaseInvoice = mongoose.model("Invoice", BaseInvoiceSchema);

// Create discriminators
const RetainerInvoice = BaseInvoice.discriminator('RetainerInvoice', RetainerInvoiceSchema);
const OneTimeInvoice = BaseInvoice.discriminator('OneTimeInvoice', OneTimeInvoiceSchema);

export { BaseInvoice, RetainerInvoice, OneTimeInvoice };
