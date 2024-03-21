import mongoose from "mongoose";
import { BaseInvoice, OneTimeInvoice, RegularInvoice } from "../../models/invoice.js";

const invoiceCreate = async (req, res) => {
    try {
        const invoiceData = req.body;
        console.log('Received invoice data:', invoiceData);

        let InvoiceModel;
        switch (invoiceData.type) {
            case 'RegularInvoice':
                InvoiceModel = RegularInvoice;
                break;
            case 'OneTimeInvoice':
                InvoiceModel = OneTimeInvoice;
                break;
            default:
                InvoiceModel = BaseInvoice;
        }
        console.log('Selected InvoiceModel:', InvoiceModel.modelName);

        const newInvoice = await InvoiceModel.create(invoiceData);
        console.log('New invoice created:', newInvoice);

        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const invoiceGetAll = async (req, res) => {
    try {
        const invoices = await BaseInvoice.find();
        res.status(200).json(invoices);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



export { invoiceCreate, invoiceGetAll };