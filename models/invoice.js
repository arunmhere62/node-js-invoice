import mongoose from "mongoose";

const BaseInvoiceSchema = mongoose.Schema({
    invoiceType: {
        require: true,
        type: String
    },
    invoiceNumber: {
        require: true,
        type: String
    },
    customerName: {
        require: true,
        type: String
    },
    gstType: {
        require: true,
        type: String
    },
    gstPercentage: {
        require: true,
        type: Number
    },
    gstInNumber: {
        require: true,
        type: String
    },
    paymentTerms: {
        require: true,
        type: String
    },
    startDate: {
        require: true,
        type: Date
    },
    dueDate: {
        require: true,
        type: Date
    },
    invoiceDate: {
        require: true,
        type: Date
    },
    invoiceStatus: {
        require: true,
        type: String
    },
    discountPercentage: {
        require: true,
        type: Number
    },
    notes: {
        require: true,
        type: String,
    },
    termsAndConditions: {
        require: true,
        type: String,
    },
    taxAmount: {
        tds: {
            type: String,
            default: 'FRT121'
        }
    },
    totalAmount: {
        require: true,
        type: Number
    },
    servicesList: [
        {
            serviceAccountingCode: {
                require: true,
                type: String
            },
            serviceDescription: {
                require: false,
                type: String
            },
            serviceQty: {
                require: true,
                type: Number
            },
            serviceTotalAmount: {
                require: true,
                type: Number
            },
            serviceAmount: {
                require: true,
                type: Number
            }
        },
    ]
}, { discriminatorKey: 'type' });

const RetainerInvoiceSchema = new mongoose.Schema({
    retainerFees: {
        require: true,
        type: Number
    },
});

const OneTimeInvoiceSchema = new mongoose.Schema({
    //    
});

const BaseInvoice = mongoose.model("invoice", BaseInvoiceSchema);
const RetainerInvoice = BaseInvoice.discriminator('RetainerInvoice', RetainerInvoiceSchema);
const OneTimeInvoice = BaseInvoice.discriminator('OneTimeInvoice', OneTimeInvoiceSchema);

export { BaseInvoice, RetainerInvoice, OneTimeInvoice };



