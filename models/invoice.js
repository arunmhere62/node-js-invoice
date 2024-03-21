import mongoose from "mongoose";

const BaseInvoiceSchema = mongoose.Schema({
    primaryContact: String,
    type: String,
    companyName: String,
    customerEmail: String,
    phoneNumber: Number,
    paymentTerms: String,
    country: String,
    address: String,
    city: String,
    state: String,
    pinCode: String,
    contactName: String,
    contactEmail: String,
    contactPhone: Number
}, { discriminatorKey: 'type' });

const RegularInvoiceSchema = new mongoose.Schema({
    regularInvoice: String,
    regularInvoiceNumber: String,
    qty: Number,
});

const OneTimeInvoiceSchema = new mongoose.Schema({
    oneTime: String,
    oneTimeInvoiceNumber: String,
    price: Number,
});

const BaseInvoice = mongoose.model("invoice", BaseInvoiceSchema);
const RegularInvoice = BaseInvoice.discriminator('RegularInvoice', RegularInvoiceSchema);
const OneTimeInvoice = BaseInvoice.discriminator('OneTimeInvoice', OneTimeInvoiceSchema);

export { BaseInvoice, RegularInvoice, OneTimeInvoice };
