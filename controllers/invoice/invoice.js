import mongoose from "mongoose";
import { BaseInvoice, OneTimeInvoice, RetainerInvoice } from "../../models/invoice.js";
import { invoiceValidation } from "../../validations/validations.js";
import { servicesList } from "../service/service.js";

const invoiceCreate = async (req, res) => {
    try {
        const invoiceData = req.body;

        // Validate the invoice data against the Yup schema
        try {
            await invoiceValidation.validate(invoiceData, { abortEarly: false });
        } catch (validationError) {
            // If validation fails, return error response with validation errors
            return res.status(400).json({ error: 'Validation error', details: validationError.errors });
        }

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

        // Create new invoice if validation passes
        const newInvoice = await InvoiceModel.create(invoiceData);
        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const invoiceGetAll = async (req, res) => {
    try {
        const modifiedInvoices = await BaseInvoice.aggregate([
            {
                $project: {
                    _id: 0, // Exclude the _id field
                    id: '$_id',
                    taxAmount: 1,
                    invoiceType: 1,
                    invoiceNumber: 1,
                    customerName: 1,
                    gstType: 1,
                    gstPercentage: 1,
                    gstInNumber: 1,
                    paymentTerms: 1,
                    startDate: 1,
                    dueDate: 1,
                    invoiceStatus: 1,
                    discountPercentage: 1,
                    notes: 1,
                    termsAndConditions: 1,
                    servicesList: {
                        $map: {
                            input: '$servicesList',
                            as: 'service',
                            in: {
                                id: '$$service._id',
                                serviceAccountingCode: '$$service.serviceAccountingCode',
                                serviceDescription: '$$service.serviceDescription',
                                quantity: '$$service.quantity',
                                price: '$$service.price',
                                serviceAmount: '$$service.serviceAmount'
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json(modifiedInvoices);
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

const invoiceGetById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await BaseInvoice.findById(id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Modify the invoice object to rename _id to id in servicesList
        const modifiedInvoice = {
            ...invoice.toObject(),
            servicesList: invoice.servicesList.map(service => {
                const { _id, ...rest } = service.toObject(); // Destructure _id and rest of the service object
                return { ...rest, id: _id.toString() }; // Convert ObjectId to string and rename to id
            })
        };

        // Rename the top-level _id field to id
        modifiedInvoice.id = modifiedInvoice._id.toString();
        delete modifiedInvoice._id;

        res.status(200).json(modifiedInvoice);
    } catch (error) {
        console.error('Error getting invoice by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const invoiceUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const invoiceData = req.body;

        const updatedInvoice = await BaseInvoice.findByIdAndUpdate(id, invoiceData, { new: true });
        if (!updatedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export { invoiceCreate, invoiceGetAll, invoiceDelete, invoiceGetById, invoiceUpdate };