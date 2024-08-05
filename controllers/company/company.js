import { UserLogin } from "../../models/user.js";
import bcrypt from 'bcrypt';
import { getDynamicModelNameGenerator } from "../../services/utils/ModelNameGenerator.js";
import { CollectionNames } from "../../services/enums.js";

const companiesList = async (req, res) => {
    const companyName = req.companyName;
    try {
        // Step 1: Fetch all companies except 'superadminCorp'
        const CompanyModel = getDynamicModelNameGenerator(req, CollectionNames.COMPANY)

        const companies = await CompanyModel.find({ companyName: { $ne: companyName } });

        // Step 2: Fetch admins for each company and exclude the refreshToken field
        const companiesWithAdmins = await Promise.all(companies.map(async (company) => {
            const admin = await UserLogin.findOne({ companyId: company._id, userRole: 'ADMIN' })
                .select('-refreshToken');
            return {
                companyDetails: company,
                adminDetails: admin,
            };
        }));

        res.status(200).json(companiesWithAdmins);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSingleCompany = async (req, res) => {
    try {
        // Step 1: Fetch the company details by ID
        const CompanyModel = getDynamicModelNameGenerator(req, CollectionNames.COMPANY);

        const companyDetails = await CompanyModel.findById(req.params.id);
        if (!companyDetails) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Step 2: Fetch the admin details for the company and exclude the refreshToken field
        const adminDetails = await UserLogin.findOne({ companyId: companyDetails._id, userRole: 'ADMIN' }).select('-refreshToken');

        // Combine the company and admin details
        const companyWithAdmin = {
            companyDetails: companyDetails,
            adminDetails: adminDetails
        };

        res.status(200).json(companyWithAdmin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteCompany = async (req, res) => {
    try {
        // Step 1: Fetch the company details by ID
        const CompanyModel = getDynamicModelNameGenerator(req, CollectionNames.COMPANY)

        const company = await CompanyModel.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Step 2: Delete the admin profile for the company
        await UserLogin.deleteOne({ companyId: company._id, userRole: 'ADMIN' });

        // Step 3: Delete the company details
        await CompanyDetails.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Company and admin profile deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



const updateCompany = async (req, res) => {
    try {
        // Extract company and admin details from request body
        const CompanyModel = getDynamicModelNameGenerator(req, CollectionNames.COMPANY)

        const { companyDetails, adminDetails } = req.body;

        // Step 1: Update the company details
        const updatedCompany = await CompanyModel.findByIdAndUpdate(req.params.id, companyDetails, { new: true });

        if (updatedCompany) {
            // Step 2: Update the UserLogin details if provided
            let updatedAdmin;
            if (adminDetails) {
                updatedAdmin = await UserLogin.findOneAndUpdate(
                    { companyId: updatedCompany._id, userRole: 'ADMIN' },
                    adminDetails,
                    { new: true }
                ).select('-refreshToken');
            } else {
                // Fetch the admin details if not updating
                updatedAdmin = await UserLogin.findOne({ companyId: updatedCompany._id, userRole: 'ADMIN' })
                    .select('-refreshToken');
            }

            // Step 3: Construct the response object including the company and its admin
            const companyWithAdmin = {
                companyDetails: updatedCompany,
                adminDetails: updatedAdmin
            };

            // Step 4: Send the response
            res.status(200).json(companyWithAdmin);
        } else {
            res.status(404).json({ message: 'Company not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export { companiesList, getSingleCompany, updateCompany, deleteCompany }