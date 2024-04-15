import mongoose from "mongoose";
import { BaseInvoice, OneTimeInvoice, RetainerInvoice } from "../../models/invoice.js";

const invoiceCreate = async (req, res) => {
    try {
        const invoiceData = req.body;

        let InvoiceModel;
        switch (invoiceData.invoiceType) {
            case 'RetainerInvoice':
                InvoiceModel = RetainerInvoice;
                break;
            case 'OneTimeInvoice':
                InvoiceModel = OneTimeInvoice;
                break;
            default:
                InvoiceModel = BaseInvoice;
        }
        // console.log('Selected InvoiceModel:', InvoiceModel.modelName);
        const newInvoice = await InvoiceModel.create(invoiceData);
        // console.log('New invoice created:', newInvoice);
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

const invoiceDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedInvoice = await BaseInvoice.findByIdAndDelete(id);
        if (!deletedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export { invoiceCreate, invoiceGetAll, invoiceDelete };