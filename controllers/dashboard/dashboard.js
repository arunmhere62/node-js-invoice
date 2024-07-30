import { BaseInvoice, OneTimeInvoice, RetainerInvoice } from "../../models/invoice.js";
import { ROLE } from "../../services/enums.js";
import { CompanyDetails } from '../../models/company/company.js'
import { Customer } from "../../models/customer.js";

const filterAdminDashboard = async (startDate, endDate) => {
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

    const totalOverview = await BaseInvoice.aggregate([
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

    const paidOverview = await BaseInvoice.aggregate([
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

    const unpaidOverview = await BaseInvoice.aggregate([
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

    const invoiceStatus = await BaseInvoice.aggregate([
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

const filterApproverDashboard = async (startDate, endDate) => {
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

    // Fetching invoices for the given date range
    const invoices = await BaseInvoice.find({ ...dateMatch, invoiceStatus: "PENDING" })
        .select({
            _id: 0,
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
        })
        .exec();

    // Creating the result object
    const result = {
        totalInvoices: invoices.length,
        pendingInvoices: invoices.length,
        approvedInvoices: 0,  // Assuming you only want pending invoices here
        pendingInvoicesList: invoices
    };

    return result;
};

const filterSuperAdminDashboard = async (startDate, endDate) => {
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
    const totalNoOfCompany = await CompanyDetails.countDocuments();

    // Get total number of invoices
    const totalNoOfInvoices = await BaseInvoice.countDocuments({
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        }
    });

    // Get company overview
    const companyOverview = await CompanyDetails.aggregate([
        {
            $lookup: {
                from: 'baseinvoices', // Adjust this to match your invoices collection name
                localField: '_id', // Field in CompanyDetails to match
                foreignField: 'companyId', // Field in BaseInvoice to match
                as: 'invoices'
            }
        },
        {
            $lookup: {
                from: 'customers', // Name of the customers collection
                localField: '_id', // Field in CompanyDetails to match
                foreignField: 'companyId', // Field in customers to match
                as: 'customers'
            }
        },
        {
            $addFields: {
                noOfInvoices: { $size: { $ifNull: ["$invoices", []] } },
                noOfCustomers: { $size: { $ifNull: ["$customers", []] } }
            }
        },
        {
            $project: {
                _id: 0, // Exclude the _id field from the output
                id: "$_id",
                companyName: 1,
                noOfInvoice: "$noOfInvoices",
                noOfCustomers: "$noOfCustomers"
            }
        }
    ]);

    return {
        totalNoOfCompany,
        totalNoOfInvoices,
        companyOverview
    };
};

const filterStandardUserDashboard = async (startDate, endDate, userName) => {
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
    const totalInvoices = await BaseInvoice.countDocuments({
        createdBy: userName,
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        }
    });

    // Get pending invoices count
    const pendingInvoices = await BaseInvoice.countDocuments({
        createdBy: userName,
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        },
        invoiceStatus: 'PENDING'
    });

    // Get approved invoices count
    const approvedInvoices = await BaseInvoice.countDocuments({
        createdBy: userName,
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        },
        invoiceStatus: 'APPROVED'
    });

    // Get all invoices list with details
    const allInvoicesList = await BaseInvoice.find({
        createdBy: userName,
        invoiceDate: {
            $gte: parsedStartDate,
            $lte: parsedEndDate
        }
    }).populate('customerId') // Assumes you have a reference to customers
        .populate('companyId');  // Assumes you have a reference to companies

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
    console.log("userRole", userRole);
    const { startDate, endDate } = req.body;

    try {
        let result = null;

        if (userRole === ROLE.ADMIN) {
            result = await filterAdminDashboard(startDate, endDate);
        } else if (userRole === ROLE.APPROVER) {
            result = await filterApproverDashboard(startDate, endDate);
        } else if (userRole === ROLE.SUPERADMIN) {
            result = await filterSuperAdminDashboard(startDate, endDate);
        } else if (userRole === ROLE.STANDARDUSER) {
            result = await filterStandardUserDashboard(startDate, endDate, userName);
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
