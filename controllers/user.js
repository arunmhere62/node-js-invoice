import mongoose from "mongoose";
import { UserLogin } from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { CompanyDetails } from "../models/company/company.js";
import { ROLE, tokenReqValueEnums } from "../services/enums.js";

// ! ------ login -------
const userLogin = async (req, res) => {
    const { userEmail, password } = req.body;
    if (!userEmail || !password) return res.status(400).json({ message: 'Email and password are required.' });

    try {
        const foundUser = await UserLogin.findOne({ userEmail }).exec();
        if (!foundUser) return res.sendStatus(401); // Unauthorized 

        // Evaluate password
        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) return res.sendStatus(401);

        // Fetch company details if available
        let companyDetails = null;
        if (foundUser.companyId) {

            companyDetails = await CompanyDetails.findById(foundUser.companyId).exec();
            if (!companyDetails) {
                return res.status(500).json({ message: "Company details not found." });
            }
        }

        // Extract roles from the user document, handle the case where roles are undefined or null
        const roles = foundUser.roles ? Object.values(foundUser.roles).filter(Boolean) : [];

        // Create access token
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "userEmail": foundUser.userEmail,
                    "userName": foundUser.userName,
                    "userRole": foundUser.userRole,
                    "companyName": companyDetails ? companyDetails.companyName : null,
                    "companyId": companyDetails ? companyDetails.id : null,
                }
            },
            "secret-key",
            { expiresIn: '30days' }
        );

        // Check if the user already has a refresh token
        let refreshToken = foundUser.refreshToken.find(token => {
            try {
                jwt.verify(token, "secret-key");
                return true; // Token is valid
            } catch (err) {
                if (err.name === 'TokenExpiredError') {
                    return false; // Token has expired
                } else {
                    throw err; // Other token verification errors
                }
            }
        });
        if (!refreshToken) {
            // Generate a new refresh token
            refreshToken = jwt.sign(
                {
                    "userEmail": foundUser.userEmail,
                    "userName": foundUser.userName,
                    "userRole": foundUser.userRole
                },
                "secret-key",
                { expiresIn: '30days' }
            );
            // Update user's refresh tokens
            foundUser.refreshToken.push(refreshToken);
            await foundUser.save();
        }

        // Return access token, refresh token, user details, and company details in the response body
        res.json({
            accessToken,
            refresh: refreshToken,
            userEmail: foundUser.userEmail,
            userName: foundUser.userName,
            userRole: foundUser.userRole,
            userDetails: {
                register: {
                    userEmail: foundUser.userEmail,
                    userName: foundUser.userName,
                    userRole: foundUser.userRole,
                    userMobile: foundUser.userMobile,
                    description: foundUser.description
                },
                companyDetails: companyDetails ? {
                    companyName: companyDetails.companyName,
                    companyEmail: companyDetails.companyEmail,
                    companyPhone: companyDetails.companyPhone,
                    companyCountry: companyDetails.companyCountry,
                    companyState: companyDetails.companyState,
                    companyAddress: companyDetails.companyAddress,
                    companyWebsite: companyDetails.companyWebsite,
                    companyTaxNumber: companyDetails.companyTaxNumber,
                    companyRegNumber: companyDetails.companyRegNumber
                } : null
            }
        });
    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ! --------- registration -----------
const userRegistration = async (req, res) => {
    const { userDetails } = req.body;
    const { userEmail, userRole } = userDetails;
    const tokenRoles = req.userRole; // Extract roles from the request object

    const companyIdFromToken = req.companyId; // Extract company ID from the token

    const validRoles = [ROLE.ADMIN, ROLE.SUPERADMIN, ROLE.APPROVER, ROLE.STANDARDUSER];
    if (!validRoles.includes(userRole)) {
        return res.status(400).json({ message: 'Invalid userRole provided.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingUser = await UserLogin.findOne({ userEmail });
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        switch (userRole) {
            case ROLE.SUPERADMIN:
                return await registerSuperAdmin(req, res, session);
            case ROLE.ADMIN:
                return await registerAdmin(req, res, session, tokenRoles);
            case ROLE.APPROVER:
            case ROLE.STANDARDUSER:
                return await registerApproverOrStandardUser(req, res, session, tokenRoles, companyIdFromToken);
            default:
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Invalid userRole provided.' });
        }
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Duplicate key error. A record with this value already exists.' });
        }
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


const registerApproverOrStandardUser = async (req, res, session, tokenRoles, companyIdFromToken) => {
    const { userDetails } = req.body;

    if (!userDetails) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'userDetails are required' })
    }
    const { userEmail, userName, password, userMobile, description, userRole, } = userDetails;

    if (!tokenRoles.includes(ROLE.ADMIN)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ message: 'Unauthorized. You need to be an ADMIN to create APPROVER or STANDARDUSER users.' });
    }

    const companyDetails = await CompanyDetails.findById(companyIdFromToken);
    if (!companyDetails) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: 'Company details not found.' });
    }

    await createUser({
        userEmail,
        userName,
        password,
        userRole,
        userMobile,
        description,
        companyId: companyIdFromToken,
    }, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: `New user with email ${userEmail} created!` });
};

const registerAdmin = async (req, res, session, tokenRoles) => {
    const {
        userDetails, companyDetails
    } = req.body;

    const { userEmail, userName, password, userMobile, description, userRole, } = userDetails;
    const { companyName, companyEmail, companyPhone, companyCountry, companyState, companyAddress,
        companyWebsite, companyTaxNumber, companyRegNumber, } = companyDetails;

    if (!tokenRoles.includes(ROLE.SUPERADMIN)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ message: 'Unauthorized. Only SUPERADMIN can create ADMIN users.' });
    }

    const adminCount = await UserLogin.countDocuments({ userRole: ROLE.ADMIN });
    if (adminCount >= 2) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Cannot create more than two Companies and ADMIN users.' });
    }

    const existingCompany = await CompanyDetails.findOne({ companyEmail });
    if (existingCompany) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({ message: `A company with the email "${companyEmail}" already exists.` });
    }

    const companyId = await createCompanyDetails({
        companyName,
        companyEmail,
        companyPhone,
        companyCountry,
        companyState,
        companyAddress,
        companyWebsite,
        companyTaxNumber,
        companyRegNumber,
    }, session);

    await createUser({
        userEmail,
        userName,
        password,
        userRole,
        userMobile,
        description,
        companyId,
    }, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: `New ADMIN user with email ${userEmail} created!` });
};

const registerSuperAdmin = async (req, res, session) => {
    const {
        userEmail,
        userName,
        password,
        userMobile,
        description,
        userRole,
        companyName,
        companyEmail,
        companyPhone,
        companyCountry,
        companyState,
        companyAddress,
        companyWebsite,
        companyTaxNumber,
        companyRegNumber,
    } = req.body;

    const companyId = await createCompanyDetails({
        companyName,
        companyEmail,
        companyPhone,
        companyCountry,
        companyState,
        companyAddress,
        companyWebsite,
        companyTaxNumber,
        companyRegNumber,
    }, session);

    await createUser({
        userEmail,
        userName,
        password,
        userRole,
        userMobile,
        description,
        companyId,
    }, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: `New SUPERADMIN user with email ${userEmail} created!` });
};

const createCompanyDetails = async (companyDetails, session) => {
    const companyDetailsDoc = new CompanyDetails(companyDetails);
    await companyDetailsDoc.save({ session });
    return companyDetailsDoc._id;
};

const createUser = async (userDetails, session) => {
    const hashedPassword = await bcrypt.hash(userDetails.password, 10);
    const newUser = new UserLogin({
        ...userDetails,
        password: hashedPassword,
    });
    await newUser.save({ session });
};

// ! ----------- update users ------------
const updateUserData = async (req, res) => {
    const userRole = req.userRole;

    try {
        // Extract company and admin/user details from request body
        const { companyDetails, adminDetails, userDetails } = req.body;

        if (userRole === 'SUPERADMIN') {
            // Step 1: Update the company details
            const updatedCompany = await CompanyDetails.findByIdAndUpdate(req.params.id, companyDetails, { new: true });

            if (updatedCompany) {
                // Step 2: Update the UserLogin details if userDetails are provided
                let updatedAdmin;
                if (userDetails) {
                    updatedAdmin = await UserLogin.findOneAndUpdate(
                        { companyId: updatedCompany._id, userRole: 'ADMIN' },
                        userDetails,
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
                    userDetails: updatedAdmin
                };

                // Step 4: Send the response
                res.status(200).json(companyWithAdmin);
            } else {
                res.status(404).json({ message: 'Company not found' });
            }
        } else if (userRole === 'ADMIN') {
            // Destructure userDetails and exclude the password field
            const { ...sanitizedUserDetails } = userDetails;

            // Only update user details for APPROVER or STANDARDUSER
            const updatedUser = await UserLogin.findOneAndUpdate(
                { _id: req.params.id, userRole: { $in: ['APPROVER', 'STANDARDUSER'] } },
                sanitizedUserDetails,
                { new: true }
            ).select('-refreshToken');

            if (updatedUser) {
                // Send the updated user details
                res.status(200).json({ userDetails: updatedUser });
            } else {
                res.status(404).json({ message: 'User not found or unauthorized to update' });
            }
        } else {
            res.status(403).json({ message: 'Unauthorized to update details.' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// ! ------------- users list -------------------
const getAllCompaniesWithAdmins = async (excludedCompanyName) => {
    try {
        // Fetch all companies except the one with the excluded company name (e.g., 'superadminCorp')
        const companies = await CompanyDetails.find({ companyName: { $ne: excludedCompanyName } });

        // Fetch admins for each company and exclude the refreshToken and password fields
        const companiesWithAdmins = await Promise.all(companies.map(async (company) => {
            const admin = await UserLogin.findOne({
                companyId: company._id,
                userRole: 'ADMIN'
            }).select('-refreshToken -password'); // Exclude both refreshToken and password fields

            return {
                companyDetails: company,
                userDetails: admin,
            };
        }));

        return companiesWithAdmins.filter(company => company.userDetails); // Exclude companies without an admin
    } catch (err) {
        throw new Error(err.message);
    }
};

const getCompanyUsers = async (companyId) => {
    try {
        // Fetch users for the specific company, excluding passwords
        const users = await UserLogin.find({ companyId, userRole: { $in: ['APPROVER', 'STANDARDUSER'] } })
            .select('-password -refreshToken'); // Exclude passwords and refresh tokens

        return users;
    } catch (err) {
        throw new Error(err.message);
    }
};

const getAllUsers = async (req, res) => {
    const userRole = req.userRole; // Extract role from the request
    const companyId = req.companyId; // Extract companyId from the request, if applicable
    const companyName = req[tokenReqValueEnums.COMPANY_NAME]
    try {
        if (userRole === ROLE.SUPERADMIN) {
            const companiesWithAdmins = await getAllCompaniesWithAdmins(companyName);
            res.status(200).json(companiesWithAdmins);
        } else if (userRole === ROLE.ADMIN) {
            if (!companyId) {
                return res.status(400).json({ message: 'Company ID is required for ADMIN role.' });
            }
            const companyUsers = await getCompanyUsers(companyId);
            res.status(200).json(companyUsers);
        } else {
            res.status(403).json({ message: 'Access denied' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// ! ------------- get single user ------------
const getSingleUser = async (req, res) => {
    const userRole = req.userRole; // Extract the user's role from the request
    const userId = req.params.id; // Extract the user ID from the request parameters

    try {
        if (userRole === ROLE.SUPERADMIN) {
            // Fetch the SUPERADMIN user and their associated company details
            const adminDetails = await UserLogin.findById(userId).select('-refreshToken -password');
            if (!adminDetails) {
                return res.status(404).json({ message: 'User not found' });
            }

            const companyDetails = await CompanyDetails.findById(adminDetails.companyId);
            if (!companyDetails) {
                return res.status(404).json({ message: 'Company not found' });
            }

            const response = {
                userDetails: adminDetails,
                companyDetails
            };

            res.status(200).json(response);
        } else if (userRole === ROLE.ADMIN) {
            // Fetch the ADMIN user's details
            const userDetails = await UserLogin.findById(userId).select('-refreshToken -password');
            if (!userDetails) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(userDetails);
        } else {
            res.status(403).json({ message: 'Access denied' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const deleteUser = async (req, res) => {
    const userRole = req.userRole; // Extract the user's role from the request
    const userId = req.params.id; // Extract the user ID from the request parameters

    try {
        if (userRole === ROLE.SUPERADMIN) {
            // Delete the SUPERADMIN user and their associated company details
            const user = await UserLogin.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const companyId = user.companyId;
            await UserLogin.deleteOne({ _id: userId });
            await CompanyDetails.deleteOne({ _id: companyId });

            res.status(200).json({ message: 'SUPERADMIN user and associated company deleted successfully' });
        } else if (userRole === ROLE.ADMIN) {
            // Delete the ADMIN user details
            const user = await UserLogin.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await UserLogin.deleteOne({ _id: userId });

            res.status(200).json({ message: 'ADMIN user deleted successfully' });
        } else {
            res.status(403).json({ message: 'Access denied' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { userLogin, userRegistration, updateUserData, getAllUsers, getSingleUser, deleteUser };
