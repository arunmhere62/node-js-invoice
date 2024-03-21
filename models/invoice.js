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
    companyName: {
        require: true,
        type: String
    },
    gstType: {
        require: true,
        type: String
    },
    gstPercentage: {
        require: true,
        type: String
    },
    invoiceDate: {
        require: true,
        type: String
    },

    gstInNumber: {
        require: true,
        type: String
    },
    paymentTerms: {
        require: true,
        type: String
    },
    dueDate: {
        require: true,
        type: String
    },
    invoiceStatus: {
        require: true,
        type: String
    },
    servicesList: [
        {
            serviceAccountingCode: {
                require: true,
                type: String
            },
            qty: {
                require: true,
                type: Number
            },
            price: {
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

const RegularInvoiceSchema = new mongoose.Schema({
    retainerFees: {
        require: true,
        type: Number
    },
});

const OneTimeInvoiceSchema = new mongoose.Schema({
    //    
});

const BaseInvoice = mongoose.model("invoice", BaseInvoiceSchema);
const RegularInvoice = BaseInvoice.discriminator('RegularInvoice', RegularInvoiceSchema);
const OneTimeInvoice = BaseInvoice.discriminator('OneTimeInvoice', OneTimeInvoiceSchema);

export { BaseInvoice, RegularInvoice, OneTimeInvoice };
