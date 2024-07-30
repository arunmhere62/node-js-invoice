import { CompanyDetails } from "../../models/company/company.js";
import { UserLogin } from "../../models/user.js";

const companiesList = async (req, res) => {
    const companyName = req.companyName;
    try {
        // Step 1: Fetch all companies except 'superadminCorp'
        const companies = await CompanyDetails.find({ companyName: { $ne: companyName } });

        // Step 2: Fetch admins for each company and exclude the refreshToken field
        const companiesWithAdmins = await Promise.all(companies.map(async (company) => {
            const admin = await UserLogin.findOne({ companyId: company._id, userRole: 'ADMIN' })
                .select('-refreshToken');
            return {
                company,
                admin
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
        const company = await CompanyDetails.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Step 2: Fetch the admin details for the company and exclude the refreshToken field
        const admin = await UserLogin.findOne({ companyId: company._id, userRole: 'ADMIN' }).select('-refreshToken');

        // Combine the company and admin details
        const companyWithAdmin = {
            company,
            admin
        };

        res.status(200).json(companyWithAdmin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteCompany = async (req, res) => {
    try {
        // Step 1: Fetch the company details by ID
        const company = await CompanyDetails.findById(req.params.id);
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
        const company = await CompanyDetails.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (company) {
            res.status(200).json(company);
        } else {
            res.status(404).json({ message: 'Company not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export { companiesList, getSingleCompany, updateCompany, deleteCompany }