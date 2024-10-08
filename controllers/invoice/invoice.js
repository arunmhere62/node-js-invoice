import mongoose from "mongoose";
import { CollectionNames, ROLE, tokenReqValueEnums } from "../../services/enums.js";
import moment from "moment";
import { getDynamicModelNameGenerator } from "../../services/utils/ModelNameGenerator.js";
import { UserLogin } from "../../models/user.js";
import nodemailer from 'nodemailer';
import { INVOICE_STAGES } from "../../services/enums.js";
import { CompanyDetails } from "../../models/company/company.js";


const invoiceCreate = async (req, res) => {
    try {

        const InvoiceModel = getDynamicModelNameGenerator(req, CollectionNames.INVOICE);
        if (!InvoiceModel) {
            return res.status(400).json({ message: `Unknown collection type: ${CollectionNames.INVOICE}, issue on backend` });
        };

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

        const companyDetails = await CompanyDetails.findOne({ _id: companyId }).lean();

        if (!companyDetails) {
            return res.status(404).json({ message: "company id not found when creating invoice" })
        }

        const invoiceCount = await InvoiceModel.countDocuments({ companyId });

        if (invoiceCount >= companyDetails.invoiceLimit) {
            return res.status(400).json({ message: "you have reached the max number of invoices" })
        };

        // find approver is present or not
        const findApproverPresent = await UserLogin.find({
            companyId: companyId,
            userRole: ROLE.APPROVER
        });

        if (!findApproverPresent || findApproverPresent.length === 0) {
            return res.status(400).json({ message: 'No approver found for the company. Cannot create invoice.' });
        };

        if (!companyId || !createdBy) {
            return res.status(400).json({ message: 'companyId and createdBy are required' });
        }

        // Initialize invoice stages
        let invoiceStages = {
            stage1: null, // draft
            stage2: null, // pending
            stage3: null, // approved
            stage4: null, // paid
            stage5: null, // returned
            stage6: null, // mailed
            stage7: null, // deleted
        };

        // Set initial stages based on invoice status
        if (invoiceStatus === 'DRAFT') {
            invoiceStages.stage1 = 'DRAFT';
        } else if (invoiceStatus === 'PENDING') {
            invoiceStages.stage1 = 'DRAFT';
            invoiceStages.stage2 = 'PENDING';
        };

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

        // Create new invoice if validation passes
        const newInvoice = await InvoiceModel.create(invoiceData);
        if (invoiceStatus === "DRAFT") {
            res.status(201).json({ message: "New Invoice Created successfully and in DRAFT stage" });
        } else if (invoiceStatus === "PENDING") {
            res.status(201).json({ message: "New Invoice Created successfully and sent approver" });
        }
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const invoiceGetAll = async (req, res) => {
    try {
        const userName = req.userName || null;
        const userRole = req.userRole || null;
        const InvoiceModel = getDynamicModelNameGenerator(req, CollectionNames.INVOICE);

        let query = {};

        if (userRole === ROLE.STANDARDUSER) {
            query = { createdBy: userName };
        } else if (userRole === ROLE.APPROVER) {
            query = { invoiceStatus: { $in: ['PENDING', 'APPROVED',] } };
        } else {
            query = {}
        }

        const modifiedInvoices = await InvoiceModel.find(query);
        res.status(200).json(modifiedInvoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const invoiceReportHandler = async (startDateStr, endDateStr, userRole, username, InvoiceModel) => {
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
    if (userRole === ROLE.STANDARDUSER) {
        matchConditions.createdBy = username;
    }
    // Aggregation pipeline for filtering
    const invoices = await InvoiceModel.aggregate([
        {
            $match: matchConditions
        },
        {
            $addFields: {
                id: '$_id'
            }
        },
        {
            $unset: '_id'
        },
        {
            $addFields: {
                servicesList: {
                    $map: {
                        input: "$servicesList",
                        as: "service",
                        in: {
                            $mergeObjects: [
                                "$$service",
                                { id: "$$service._id" }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unset: "servicesList._id"
        }
    ]).exec();

    return invoices;
};

const agingReportHandler = async (startDate, endDate, InvoiceModel) => {
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('-');
        return new Date(Date.UTC(year, month - 1, day));
    };

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    const invoices = await InvoiceModel.aggregate([
        {
            $match: {
                invoiceDate: { $gte: parsedStartDate, $lte: parsedEndDate }
            }
        },
        {
            $project: {
                _id: 1,
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
            $addFields: {
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
                _id: {
                    customerName: "$customerName",
                    agingBucket: "$agingBucket"
                },
                invoices: {
                    $push: {
                        id: "$_id",
                        invoiceNumber: "$invoiceNumber",
                        daysOverdue: "$daysOverdue",
                        agingBucket: "$agingBucket",
                        totalAmount: "$totalAmount",
                        amountPaid: "$amountPaid",
                        outstandingAmount: "$outstandingAmount"
                    }
                },
                count: { $sum: 1 },
                totalCustomerAmount: { $sum: "$outstandingAmount" }
            }
        },
        {
            $group: {
                _id: "$_id.customerName",
                invoices: { $push: "$invoices" },
                totalCustomerAmount: { $first: "$totalCustomerAmount" },
                days0to30: {
                    $sum: {
                        $cond: [{ $eq: ["$_id.agingBucket", "0-30"] }, 1, 0]
                    }
                },
                days30to45: {
                    $sum: {
                        $cond: [{ $eq: ["$_id.agingBucket", "31-45"] }, 1, 0]
                    }
                },
                above45: {
                    $sum: {
                        $cond: [{ $eq: ["$_id.agingBucket", "above45"] }, 1, 0]
                    }
                }
            }
        },
        {
            $unwind: "$invoices"
        },
        {
            $unwind: "$invoices"
        },
        {
            $project: {
                _id: 0,
                id: "$invoices.id",
                invoiceNumber: "$invoices.invoiceNumber",
                daysOverdue: "$invoices.daysOverdue",
                agingBucket: "$invoices.agingBucket",
                totalAmount: "$invoices.totalAmount",
                amountPaid: "$invoices.amountPaid",
                outstandingAmount: "$invoices.outstandingAmount",
                days0to30: 1,
                days30to45: 1,
                above45: 1,
                customerName: "$_id",
                totalCustomerAmount: "$totalCustomerAmount"
            }
        }
    ]);

    return invoices;
};

const invoiceAgingReport = async (req, res) => {
    try {
        const { startDate, endDate, filter } = req.body;
        const userRole = req.userRole;
        const userName = req.userName;
        const InvoiceModel = getDynamicModelNameGenerator(req, CollectionNames.INVOICE);

        let result;

        if (filter === 'agingReport') {
            result = await agingReportHandler(startDate, endDate, InvoiceModel);
        } else if (filter === 'invoiceReport') {
            result = await invoiceReportHandler(startDate, endDate, userRole, userName, InvoiceModel);
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
        const InvoiceModel = getDynamicModelNameGenerator(req, CollectionNames.INVOICE);
        const deletedInvoice = await InvoiceModel.findByIdAndDelete(id);
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
        const InvoiceModel = getDynamicModelNameGenerator(req, CollectionNames.INVOICE);
        const invoice = await InvoiceModel.findById(id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.status(200).json(invoice);
    } catch (error) {
        console.error('Error getting invoice by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const validateStageTransition = (currentStages, newStatus) => {
    switch (newStatus) {
        case INVOICE_STAGES.STAGE_2_PENDING:
            return currentStages.stage1 === INVOICE_STAGES.STAGE_1_DRAFT;
        case INVOICE_STAGES.STAGE_3_APPROVED:
            return currentStages.stage1 === INVOICE_STAGES.STAGE_1_DRAFT && currentStages.stage2 === INVOICE_STAGES.STAGE_2_PENDING;
        case INVOICE_STAGES.STAGE_4_MAILED:
            return currentStages.stage1 === INVOICE_STAGES.STAGE_1_DRAFT && currentStages.stage2 === INVOICE_STAGES.STAGE_2_PENDING && currentStages.stage3 === INVOICE_STAGES.STAGE_3_APPROVED
        case INVOICE_STAGES.STAGE_5_PAID:
            return currentStages.stage1 === INVOICE_STAGES.STAGE_1_DRAFT && currentStages.stage2 === INVOICE_STAGES.STAGE_2_PENDING && currentStages.stage3 === INVOICE_STAGES.STAGE_3_APPROVED && currentStages.stage4 === INVOICE_STAGES.STAGE_4_MAILED;
        case INVOICE_STAGES.STAGE_6_RETURNED:
            return currentStages.stage2 === INVOICE_STAGES.STAGE_2_PENDING || currentStages.stage3 === INVOICE_STAGES.STAGE_3_APPROVED;
        case INVOICE_STAGES.STAGE_7_DELETED:
            return true;
        default:
            return true; // Allow other transitions without additional checks
    }
};

// using this in email function and invoice 
export const updateInvoiceStages = (invoiceStatus, invoiceStages) => {
    const updatedStages = { ...invoiceStages };

    switch (invoiceStatus) {
        case INVOICE_STAGES.STAGE_1_DRAFT:
            updatedStages.stage1 = INVOICE_STAGES.STAGE_1_DRAFT;
            updatedStages.stage2 = null;
            updatedStages.stage3 = null;
            updatedStages.stage4 = null;
            updatedStages.stage5 = null;
            updatedStages.stage6 = null;
            break;
        case INVOICE_STAGES.STAGE_2_PENDING:
            updatedStages.stage1 = INVOICE_STAGES.STAGE_1_DRAFT;
            updatedStages.stage2 = INVOICE_STAGES.STAGE_2_PENDING;
            updatedStages.stage3 = null;
            updatedStages.stage4 = null;
            updatedStages.stage5 = null;
            updatedStages.stage6 = null;
            break;
        case INVOICE_STAGES.STAGE_3_APPROVED:
            updatedStages.stage1 = INVOICE_STAGES.STAGE_1_DRAFT;
            updatedStages.stage2 = INVOICE_STAGES.STAGE_2_PENDING;
            updatedStages.stage3 = INVOICE_STAGES.STAGE_3_APPROVED;
            updatedStages.stage4 = null;
            updatedStages.stage5 = null;
            updatedStages.stage6 = null;
            break;
        case INVOICE_STAGES.STAGE_4_MAILED:
            updatedStages.stage1 = INVOICE_STAGES.STAGE_1_DRAFT;
            updatedStages.stage2 = INVOICE_STAGES.STAGE_2_PENDING;
            updatedStages.stage3 = INVOICE_STAGES.STAGE_3_APPROVED;
            updatedStages.stage4 = INVOICE_STAGES.STAGE_4_MAILED;
            updatedStages.stage5 = null;
            updatedStages.stage6 = null;
            break;
        case INVOICE_STAGES.STAGE_5_PAID:
            updatedStages.stage1 = INVOICE_STAGES.STAGE_1_DRAFT;
            updatedStages.stage2 = INVOICE_STAGES.STAGE_2_PENDING;
            updatedStages.stage3 = INVOICE_STAGES.STAGE_3_APPROVED;
            updatedStages.stage4 = INVOICE_STAGES.STAGE_4_MAILED;
            updatedStages.stage5 = INVOICE_STAGES.STAGE_5_PAID;
            updatedStages.stage6 = null;
            break;
        case INVOICE_STAGES.STAGE_6_RETURNED:
            updatedStages.stage1 = INVOICE_STAGES.STAGE_1_DRAFT;
            updatedStages.stage2 = null;
            updatedStages.stage3 = null;
            updatedStages.stage4 = null;
            updatedStages.stage5 = null;
            updatedStages.stage6 = INVOICE_STAGES.STAGE_6_RETURNED;
            break;
        case INVOICE_STAGES.STAGE_7_DELETED:
            updatedStages.stage6 = INVOICE_STAGES.STAGE_7_DELETED;
            break;
        default:
            throw new Error('Invalid invoice status');
    }
    return updatedStages;
};

const invoiceUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const InvoiceModel = getDynamicModelNameGenerator(req, CollectionNames.INVOICE);

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
        const currentInvoice = await InvoiceModel.findById(id);
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

        const updatedInvoice = await InvoiceModel.findByIdAndUpdate(id, invoiceData, { new: true });
        if (!updatedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        let responseMessage = 'Invoice updated successfully';
        if (invoiceStatus === 'PENDING') {
            responseMessage = 'Invoice updated & sent to approver successfully';
        } else if (invoiceStatus === 'APPROVED') {
            responseMessage = 'Invoice updated & approved successfully';
        } else if (invoiceStatus === 'RETURNED') {
            responseMessage = 'Invoice updated & Returned successfully';
        } else if (invoiceStatus === 'DRAFT') {
            responseMessage = 'Invoice Updated successfully and in Draft stage';
        }
        res.status(200).json({ message: responseMessage });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export { invoiceCreate, invoiceGetAll, invoiceDelete, invoiceGetById, invoiceUpdate, invoiceAgingReport };