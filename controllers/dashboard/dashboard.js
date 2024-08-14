import { CollectionNames, ROLE, tokenReqValueEnums } from "../../services/enums.js";
import { CompanyDetails } from '../../models/company/company.js'
import { getDynamicModelNameGenerator } from "../../services/utils/ModelNameGenerator.js";
import mongoose from "mongoose";

const filterAdminDashboard = async (startDate, endDate, InvoiceModel) => {
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('-');
        return new Date(Date.UTC(year, month - 1, day));
    };

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid date format');
    }

    const dateMatch = {
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        }
    };

    const totalOverview = await InvoiceModel.aggregate([
        { $match: dateMatch },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
                noOfCustomers: { $addToSet: "$customerName" },
                noOfInvoices: { $sum: 1 }
            }
        },
        {
            $project: {
                totalAmount: 1,
                noOfCustomers: { $size: "$noOfCustomers" },
                noOfInvoices: 1
            }
        }
    ]);

    const paidOverview = await InvoiceModel.aggregate([
        { $match: { ...dateMatch, invoiceStatus: "PAID" } },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
                noOfCustomers: { $addToSet: "$customerName" },
                noOfInvoices: { $sum: 1 }
            }
        },
        {
            $project: {
                totalAmount: 1,
                noOfCustomers: { $size: "$noOfCustomers" },
                noOfInvoices: 1
            }
        }
    ]);

    const unpaidOverview = await InvoiceModel.aggregate([
        { $match: { ...dateMatch, invoiceStatus: { $ne: "PAID" } } },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
                noOfCustomers: { $addToSet: "$customerName" },
                noOfInvoices: { $sum: 1 }
            }
        },
        {
            $project: {
                totalAmount: 1,
                noOfCustomers: { $size: "$noOfCustomers" },
                noOfInvoices: 1
            }
        }
    ]);

    const invoiceStatus = await InvoiceModel.aggregate([
        { $match: dateMatch },
        {
            $group: {
                _id: "$invoiceStatus",
                noOfInvoices: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                status: "$_id",
                noOfInvoices: 1
            }
        }
    ]);

    const statusMap = invoiceStatus.reduce((acc, item) => {
        acc[item.status.toLowerCase()] = { noOfInvoices: item.noOfInvoices };
        return acc;
    }, {});

    const result = {
        invoiceOverview: {
            total: totalOverview[0] || { totalAmount: 0, noOfCustomers: 0, noOfInvoices: 0 },
            paid: paidOverview[0] || { totalAmount: 0, noOfCustomers: 0, noOfInvoices: 0 },
            unPaid: unpaidOverview[0] || { totalAmount: 0, noOfCustomers: 0, noOfInvoices: 0 },
        },
        invoiceStatus: {
            pending: statusMap.pending || { noOfInvoices: 0 },
            approved: statusMap.approved || { noOfInvoices: 0 },
            returned: statusMap.returned || { noOfInvoices: 0 },
            deleted: statusMap.deleted || { noOfInvoices: 0 },
            draft: statusMap.draft || { noOfInvoices: 0 },
            paid: statusMap.paid || { noOfInvoices: 0 }
        }
    };

    return result;
};

const filterApproverDashboard = async (startDate, endDate, InvoiceModel) => {

    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('-');
        return new Date(Date.UTC(year, month - 1, day));
    };

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid date format');
    };

    const dateMatch = {
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        }
    };

    try {
        const invoices = await InvoiceModel.aggregate([
            { $match: dateMatch },
            {
                $project: {
                    _id: 1,
                    id: "$_id",
                    invoiceType: 1,
                    invoiceNumber: 1,
                    customerName: 1,
                    gstType: 1,
                    gstPercentage: 1,
                    invoiceDate: 1,
                    paymentTerms: 1,
                    startDate: 1,
                    dueDate: 1,
                    invoiceStatus: 1,
                    lastModified: 1,
                    gstInNumber: 1,
                    retainerFee: 1,
                    notes: 1,
                    termsAndConditions: 1,
                    servicesList: {
                        $map: {
                            input: "$servicesList",
                            as: "service",
                            in: {
                                id: "$$service._id",
                                serviceAccountingCode: "$$service.serviceAccountingCode",
                                serviceDescription: "$$service.serviceDescription",
                                serviceQty: "$$service.serviceQty",
                                serviceAmount: "$$service.serviceAmount",
                                serviceTotalAmount: "$$service.serviceTotalAmount"
                            }
                        }
                    },
                    taxAmount: 1,
                    discountPercentage: 1,
                    totalAmount: 1,
                    createdBy: 1,
                    updatedBy: 1,
                    companyName: 1,
                    invoiceReason: 1,
                    mailTo: 1
                }
            }
        ]);

        const pendingInvoices = invoices.filter(invoice => invoice.invoiceStatus === 'PENDING');
        const approvedInvoices = invoices.filter(invoice => invoice.invoiceStatus === 'APPROVED');

        const result = {
            totalInvoices: invoices.length,
            pendingInvoices: pendingInvoices.length,
            approvedInvoices: approvedInvoices.length,
            pendingInvoicesList: pendingInvoices,
            approvedInvoicesList: approvedInvoices
        };

        return result;
    } catch (error) {
        console.error("Error fetching invoices:", error.message);
        throw new Error('Error fetching invoices from MongoDB');
    }
};



const filterSuperAdminDashboard = async (startDate, endDate, InvoiceModel, CustomersModel, excludedCompanyName, companyId) => {
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('-');
        return new Date(Date.UTC(year, month - 1, day));
    };

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid date format');
    }

    // Get total number of companies
    const totalNoOfCompany = await CompanyDetails.countDocuments({
        companyName: { $ne: excludedCompanyName }
    });
    // Get list of companies excluding the superadmin
    const companiesList = await CompanyDetails.find({ companyName: { $ne: excludedCompanyName } }).lean();

    console.log("companiesList", companiesList);

    // Initialize an array to store company overviews
    const companyOverview = [];

    // Get total number of invoices
    let totalNoOfInvoices = 0;

    for (const company of companiesList) {
        // Construct collection names based on company id
        const invoiceCollectionName = `${company._id.toString().replace(/\s+/g, '').toLowerCase()}_invoices`;
        const customerCollectionName = `${company._id.toString().replace(/\s+/g, '').toLowerCase()}_customers`;

        // Count invoices for each company
        const invoiceCount = await mongoose.connection.collection(invoiceCollectionName).countDocuments({
            invoiceDate: {
                $gte: parsedStartDate,
                $lte: parsedEndDate
            }
        });

        totalNoOfInvoices += invoiceCount;

        // Count customers for each company
        const customerCount = await mongoose.connection.collection(customerCollectionName).countDocuments();

        // Add to company overview
        companyOverview.push({
            companyName: company.companyName,
            id: company._id.toString(),
            noOfInvoice: invoiceCount,
            noOfCustomers: customerCount
        });
    }

    return {
        totalNoOfCompany,
        totalNoOfInvoices,
        companyOverview
    };
};


const filterStandardUserDashboard = async (startDate, endDate, userName, InvoiceModel) => {

    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('-');
        return new Date(Date.UTC(year, month - 1, day));
    };

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid date format');
    }

    // Get total number of invoices created by the user
    const totalInvoices = await InvoiceModel.countDocuments({
        createdBy: userName,
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        }
    });

    // Get pending invoices count
    const pendingInvoices = await InvoiceModel.countDocuments({
        createdBy: userName,
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        },
        invoiceStatus: 'PENDING'
    });

    // Get approved invoices count
    const approvedInvoices = await InvoiceModel.countDocuments({
        createdBy: userName,
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        },
        invoiceStatus: 'APPROVED'
    });

    // Get all invoices list with details
    const allInvoicesList = await InvoiceModel.find({
        createdBy: userName,
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        }
    }).populate('companyId');  // Assumes you have a reference to companies

    // Format the invoices
    const formattedInvoicesList = allInvoicesList.map(invoice => ({
        id: invoice._id,
        invoiceType: invoice.invoiceType,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        gstType: invoice.gstType,
        gstPercentage: invoice.gstPercentage,
        invoiceDate: invoice.invoiceDate.toISOString().split('T')[0], // Format date to YYYY-MM-DD
        paymentTerms: invoice.paymentTerms,
        startDate: invoice.startDate.toISOString().split('T')[0], // Format date to YYYY-MM-DD
        dueDate: invoice.dueDate.toISOString().split('T')[0], // Format date to YYYY-MM-DD
        invoiceStatus: invoice.invoiceStatus,
        lastModified: invoice.lastModified.toISOString().split('T')[0], // Format date to YYYY-MM-DD
        gstInNumber: invoice.gstInNumber,
        retainerFee: invoice.retainerFee,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        servicesList: invoice.servicesList,
        taxAmount: invoice.taxAmount,
        discountPercentage: invoice.discountPercentage,
        totalAmount: invoice.totalAmount,
        createdBy: invoice.createdBy,
        updatedBy: invoice.updatedBy,
        companyName: invoice.companyId ? invoice.companyId.companyName : null,
        invoiceReason: invoice.invoiceReason,
        mailTo: invoice.mailTo
    }));

    return {
        totalInvoices,
        pendingInvoices,
        approvedInvoices,
        allInvoicesList: formattedInvoicesList
    };
};

const dashboardReports = async (req, res) => {
    const userRole = req.userRole;
    const userName = req.userName;
    const companyId = req.companyId;
    const companyName = req[tokenReqValueEnums.COMPANY_NAME];

    const { startDate, endDate } = req.body;
    const InvoiceModel = getDynamicModelNameGenerator(req, CollectionNames.INVOICE);
    const CustomersModel = getDynamicModelNameGenerator(req, CollectionNames.CUSTOMERS);

    try {
        let result = null;

        if (userRole === ROLE.ADMIN) {
            result = await filterAdminDashboard(startDate, endDate, InvoiceModel);
        } else if (userRole === ROLE.APPROVER) {
            result = await filterApproverDashboard(startDate, endDate, InvoiceModel);
        } else if (userRole === ROLE.SUPERADMIN) {
            result = await filterSuperAdminDashboard(startDate, endDate, InvoiceModel, CustomersModel, companyName, companyId);
        } else if (userRole === ROLE.STANDARDUSER) {
            result = await filterStandardUserDashboard(startDate, endDate, userName, InvoiceModel);
        }

        else {
            return res.status(403).json({ error: 'Forbidden: Access is denied' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { dashboardReports };
