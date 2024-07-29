import mongoose from "mongoose";
import { BaseInvoice, OneTimeInvoice, RetainerInvoice } from "../../models/invoice.js";
import { ROLE } from "../../services/enums.js";
import moment from "moment";
const invoiceCreate = async (req, res) => {
    try {
        const {
            invoiceType,
            invoiceNumber,
            customerName,
            gstType,
            gstPercentage,
            gstInNumber,
            paymentTerms,
            startDate,
            dueDate,
            invoiceDate,
            invoiceStatus,
            discountPercentage,
            notes,
            termsAndConditions,
            taxAmount,
            totalAmount,
            servicesList,
            invoiceReason,
            mailTo,
        } = req.body;

        const companyId = req.companyId || null;
        const createdBy = req.userName || null;

        if (!companyId || !createdBy) {
            return res.status(400).json({ message: 'companyId and createdBy are required' });
        }

        // Initialize invoice stages
        let invoiceStages = {
            stage1: null,
            stage2: null,
            stage3: null,
            stage4: null,
            stage5: null,
            stage6: null
        };

        // Set initial stages based on invoice status
        if (invoiceStatus === 'DRAFT') {
            invoiceStages.stage1 = 'DRAFT';
        } else if (invoiceStatus === 'PENDING') {
            invoiceStages.stage1 = 'DRAFT';
            invoiceStages.stage2 = 'PENDING';
        }
        const parseDate = (dateStr) => {
            const [day, month, year] = dateStr.split('-').map(Number);
            return new Date(Date.UTC(year, month - 1, day));
        };

        // Parse input dates
        const parsedStartDate = parseDate(startDate);
        const parsedDueDate = parseDate(dueDate);
        const parsedInvoiceDate = parseDate(startDate);

        // Check if dates are valid
        const isValidDate = (date) => date instanceof Date && !isNaN(date.getTime());
        // Continue with your logic for creating or filtering invoices
        console.log('Parsed Start Date:', parsedStartDate);
        console.log('Parsed Due Date:', parsedDueDate);
        console.log('Parsed Invoice Date:', parsedInvoiceDate);

        if (!isValidDate(parsedStartDate) ||
            !isValidDate(parsedDueDate) ||
            !isValidDate(parsedInvoiceDate)) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        // Structure the invoice data
        const invoiceData = {
            invoiceType,
            invoiceNumber,
            customerName,
            gstType,
            gstPercentage,
            gstInNumber,
            paymentTerms,
            startDate: parsedStartDate,
            dueDate: parsedDueDate,
            invoiceDate: parsedInvoiceDate,
            invoiceStatus,
            discountPercentage,
            notes,
            termsAndConditions,
            taxAmount,
            totalAmount,
            servicesList,
            invoiceReason,
            mailTo,
            companyId,
            createdBy,
            invoiceStages
        };

        // Map invoiceType to corresponding model
        const invoiceTypeMapping = {
            'Retainer': RetainerInvoice,
            'Onetime': OneTimeInvoice
        };

        let InvoiceModel = invoiceTypeMapping[invoiceType];
        if (!InvoiceModel) {
            return res.status(400).json({ message: 'Invalid invoice type' });
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
    const userName = req.userName || null;
    const userRole = req.role || null;
    try {
        let query = {};

        if (userRole === ROLE.STANDARDUSER) {
            query = { createdBy: userName };
        } else if (userRole === ROLE.APPROVER) {
            query = { invoiceStatus: { $in: ['PENDING', 'APPROVED'] } };
        }

        const modifiedInvoices = await BaseInvoice.find(query);
        res.status(200).json(modifiedInvoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const invoiceReportHandler = async (startDateStr, endDateStr, role, username) => {

    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    };

    const parsedStartDate = parseDate(startDateStr);
    const parsedEndDate = parseDate(endDateStr);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid date format');
    };

    const matchConditions = {
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        }
    };

    // Add createdBy filter if the role is 'standarduser'
    if (role === ROLE.STANDARDUSER) {
        matchConditions.createdBy = username;
    }
    // Aggregation pipeline for filtering
    const invoices = await BaseInvoice.aggregate([
        {
            $match: matchConditions
        }
    ]).exec();

    return invoices;
};

const agingReportHandler = async (startDate, endDate) => {
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('-');
        return new Date(Date.UTC(year, month - 1, day));
    };
    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    return BaseInvoice.aggregate([
        {
            $match: {
                invoiceDate: { $gte: parsedStartDate, $lte: parsedEndDate }
            }
        },
        {
            $project: {
                invoiceNumber: 1,
                customerName: 1,
                invoiceDate: 1,
                dueDate: 1,
                totalAmount: 1,
                amountPaid: { $ifNull: ["$amountPaid", 0] },
                outstandingAmount: { $subtract: ["$totalAmount", { $ifNull: ["$amountPaid", 0] }] }
            }
        },
        {
            $addFields: {
                daysOverdue: {
                    $cond: {
                        if: { $gte: [new Date(), "$dueDate"] },
                        then: { $floor: { $divide: [{ $subtract: [new Date(), "$dueDate"] }, 1000 * 60 * 60 * 24] } },
                        else: 0
                    }
                }
            }
        },
        {
            $project: {
                invoiceNumber: 1,
                customerName: 1,
                invoiceDate: 1,
                dueDate: 1,
                totalAmount: 1,
                amountPaid: 1,
                outstandingAmount: 1,
                daysOverdue: 1,
                agingBucket: {
                    $switch: {
                        branches: [
                            { case: { $lte: ["$daysOverdue", 30] }, then: "0-30" },
                            { case: { $and: [{ $gt: ["$daysOverdue", 30] }, { $lte: ["$daysOverdue", 45] }] }, then: "31-45" },
                            { case: { $gt: ["$daysOverdue", 45] }, then: "above45" }
                        ],
                        default: "unknown"
                    }
                }
            }
        },
        {
            $group: {
                _id: "$customerName",
                days0to30: {
                    $sum: {
                        $cond: [{ $eq: ["$agingBucket", "0-30"] }, 1, 0]
                    }
                },
                days30to45: {
                    $sum: {
                        $cond: [{ $eq: ["$agingBucket", "31-45"] }, 1, 0]
                    }
                },
                above45: {
                    $sum: {
                        $cond: [{ $eq: ["$agingBucket", "above45"] }, 1, 0]
                    }
                },
                totalAmount: { $sum: "$outstandingAmount" }
            }
        },
        {
            $project: {
                _id: 0,
                id: "$_id",
                customerName: "$_id",
                days0to30: 1,
                days30to45: 1,
                above45: 1,
                totalAmount: 1
            }
        }
    ]);
};

const invoiceAgingReport = async (req, res) => {
    const { startDate, endDate, filter } = req.body;
    const userRole = req.role;
    const userName = req.userName;
    try {
        let result;

        if (filter === 'agingReport') {
            result = await agingReportHandler(startDate, endDate);
        } else if (filter === 'invoiceReport') {
            result = await invoiceReportHandler(startDate, endDate, userRole, userName);
        } else {
            return res.status(400).json({ message: 'Invalid filter value' });
        }
        res.json(result);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

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
        res.status(200).json(invoice);
    } catch (error) {
        console.error('Error getting invoice by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const validateStageTransition = (currentStages, newStatus) => {
    switch (newStatus) {
        case 'PENDING':
            return currentStages.stage1 === 'DRAFT';
        case 'APPROVED':
            return currentStages.stage1 === 'DRAFT' && currentStages.stage2 === 'PENDING';
        case 'PAID':
            return currentStages.stage1 === 'DRAFT' && currentStages.stage2 === 'PENDING' && currentStages.stage3 === 'APPROVED';
        case 'RETURNED':
            return currentStages.stage2 === 'PENDING' || currentStages.stage3 === 'APPROVED';
        case 'DELETED':
            return true;
        default:
            return true; // Allow other transitions without additional checks
    }
};

const updateInvoiceStages = (invoiceStatus, invoiceStages) => {
    const updatedStages = { ...invoiceStages };

    switch (invoiceStatus) {
        case 'DRAFT':
            updatedStages.stage1 = 'DRAFT';
            updatedStages.stage2 = null;
            updatedStages.stage3 = null;
            updatedStages.stage4 = null;
            updatedStages.stage5 = null;
            updatedStages.stage6 = null;
            break;
        case 'PENDING':
            updatedStages.stage1 = 'DRAFT';
            updatedStages.stage2 = 'PENDING';
            updatedStages.stage3 = null;
            updatedStages.stage4 = null;
            updatedStages.stage5 = null;
            updatedStages.stage6 = null;
            break;
        case 'APPROVED':
            updatedStages.stage1 = 'DRAFT';
            updatedStages.stage2 = 'PENDING';
            updatedStages.stage3 = 'APPROVED';
            updatedStages.stage4 = null;
            updatedStages.stage5 = null;
            updatedStages.stage6 = null;
            break;
        case 'PAID':
            updatedStages.stage1 = 'DRAFT';
            updatedStages.stage2 = 'PENDING';
            updatedStages.stage3 = 'APPROVED';
            updatedStages.stage4 = 'PAID';
            updatedStages.stage5 = null;
            updatedStages.stage6 = null;
            break;
        case 'RETURNED':
            updatedStages.stage1 = 'DRAFT';
            updatedStages.stage2 = null;
            updatedStages.stage3 = null;
            updatedStages.stage4 = null;
            updatedStages.stage5 = 'RETURNED';
            updatedStages.stage6 = null;
            break;
        case 'DELETED':
            updatedStages.stage1 = null;
            updatedStages.stage2 = null;
            updatedStages.stage3 = null;
            updatedStages.stage4 = null;
            updatedStages.stage5 = null;
            updatedStages.stage6 = 'DELETED';
            break;
        default:
            throw new Error('Invalid invoice status');
    }

    return updatedStages;
};

const invoiceUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            invoiceType,
            invoiceNumber,
            customerName,
            gstType,
            gstPercentage,
            gstInNumber,
            paymentTerms,
            startDate,
            dueDate,
            invoiceDate,
            invoiceStatus,
            discountPercentage,
            notes,
            termsAndConditions,
            taxAmount,
            totalAmount,
            servicesList,
            invoiceReason,
            mailTo,
            invoiceStages
        } = req.body;
        const updatedBy = req.userName;

        // Find the current invoice
        const currentInvoice = await BaseInvoice.findById(id);
        if (!currentInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Validate stage transition
        if (!validateStageTransition(currentInvoice.invoiceStages, invoiceStatus)) {
            return res.status(400).json({ error: 'Invalid stage transition' });
        }

        // Update the invoice stages based on the new status
        const updatedInvoiceStages = updateInvoiceStages(invoiceStatus, currentInvoice.invoiceStages);

        // Structure the invoice data
        const invoiceData = {
            invoiceType,
            invoiceNumber,
            customerName,
            gstType,
            gstPercentage,
            gstInNumber,
            paymentTerms,
            startDate,
            dueDate,
            invoiceDate,
            invoiceStatus,
            discountPercentage,
            notes,
            termsAndConditions,
            taxAmount,
            totalAmount,
            servicesList,
            invoiceReason,
            mailTo,
            companyId: currentInvoice.companyId,
            invoiceStages: updatedInvoiceStages,
            updatedBy
        };

        const updatedInvoice = await BaseInvoice.findByIdAndUpdate(id, invoiceData, { new: true });
        if (!updatedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export { invoiceCreate, invoiceGetAll, invoiceDelete, invoiceGetById, invoiceUpdate, invoiceAgingReport };