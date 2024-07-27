import { UserLogin } from "../models/user.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import bcrypt from "bcrypt";

import { CompanyDetails } from "../models/company/company.js";

// ! ------ login -------

const userLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    try {
        const foundUser = await UserLogin.findOne({ email }).exec();
        if (!foundUser) return res.sendStatus(401); // Unauthorized 

        // Evaluate password
        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) return res.sendStatus(401);

        // Fetch company details if available
        let companyDetails = null;
        if (foundUser.companyDetailsId) {
            console.log('Fetching company details for ID:', foundUser.companyDetailsId);
            companyDetails = await CompanyDetails.findById(foundUser.companyDetailsId).exec();
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
                    "email": foundUser.email,
                    "userName": foundUser.userName,
                    "role": foundUser.role,
                    "companyName": companyDetails ? companyDetails.companyName : null,
                    "companyId": companyDetails ? companyDetails._id : null,
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
                    "email": foundUser.email,
                    "userName": foundUser.userName,
                    "role": foundUser.role
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
            refreshToken,
            userDetails: {
                register: {
                    email: foundUser.email,
                    userName: foundUser.userName,
                    role: foundUser.role,
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


// ! ------------ user registration 
const userRegistration = async (req, res) => {
    const { email, userName, password, userMobile, description, role, companyName, companyEmail, companyPhone, companyCountry, companyState, companyAddress, companyWebsite, companyTaxNumber, companyRegNumber } = req.body;

    const tokenRoles = req.role; // Extract roles from the request object
    const companyIdFromToken = req.companyId; // Extract company ID from the token

    console.log("companyIdFromToken:", companyIdFromToken);

    // Check if the role is valid
    const validRoles = ['ADMIN', 'APPROVER', 'STANDARDUSER', 'SUPERADMIN'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role provided.' });
    }

    try {
        if (role === 'SUPERADMIN') {
            // Validate company details for SUPERADMIN
            if (!companyName || !companyEmail || !companyPhone || !companyCountry || !companyState || !companyAddress || !companyWebsite || !companyTaxNumber || !companyRegNumber) {
                return res.status(400).json({ message: 'All company details are required for SUPERADMIN role.' });
            }

            // Check if a SUPERADMIN already exists
            const superAdminExists = await UserLogin.findOne({ role: 'SUPERADMIN' }).exec();
            if (superAdminExists) {
                return res.status(409).json({ message: 'A SUPERADMIN already exists.' });
            }

            // Check if the company email already exists
            const existingCompany = await CompanyDetails.findOne({ companyEmail }).exec();
            if (existingCompany) {
                return res.status(409).json({ message: `A company with the email "${companyEmail}" already exists.` });
            }

            // Create company details for SUPERADMIN
            const companyDetails = await CompanyDetails.create({
                companyName,
                companyEmail,
                companyPhone,
                companyCountry,
                companyState,
                companyAddress,
                companyWebsite,
                companyTaxNumber,
                companyRegNumber
            });

            // Create and store the new SUPERADMIN user
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await UserLogin.create({
                email,
                userName,
                password: hashedPassword,
                role,
                userMobile,
                description,
                companyDetailsId: companyDetails._id
            });

            console.log('New SUPERADMIN user created:', newUser);

            return res.status(201).json({ success: `New SUPERADMIN user with email ${email} created!` });
        } else if (role === 'ADMIN') {
            // Validate token for ADMIN role
            if (!tokenRoles || !tokenRoles.includes('ADMIN')) {
                return res.status(403).json({ message: 'Unauthorized. You need to be an ADMIN to create users.' });
            }

            // Validate input for ADMIN role
            if (!email || !userName || !password || !role) {
                return res.status(400).json({ message: 'Email, userName, password, and role are required.' });
            }

            // Validate company details for ADMIN role
            if (!companyName || !companyEmail || !companyPhone || !companyCountry || !companyState || !companyAddress || !companyWebsite || !companyTaxNumber || !companyRegNumber) {
                return res.status(400).json({ message: 'All company details are required for ADMIN role.' });
            }

            // Check if the company email already exists
            const existingCompany = await CompanyDetails.findOne({ companyEmail }).exec();
            if (existingCompany) {
                return res.status(409).json({ message: `A company with the email "${companyEmail}" already exists.` });
            }

            // Create or find the company details
            const companyDetails = await CompanyDetails.create({
                companyName,
                companyEmail,
                companyPhone,
                companyCountry,
                companyState,
                companyAddress,
                companyWebsite,
                companyTaxNumber,
                companyRegNumber
            });

            // Create and store the new ADMIN user
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await UserLogin.create({
                email,
                userName,
                password: hashedPassword,
                role,
                userMobile,
                description,
                companyDetailsId: companyDetails._id
            });

            console.log('New ADMIN user created:', newUser);

            return res.status(201).json({ success: `New ADMIN user with email ${email} created!` });
        } else if (role === 'APPROVER' || role === 'STANDARDUSER') {
            // Validate token for APPROVER and STANDARDUSER roles
            if (!tokenRoles || !tokenRoles.includes('ADMIN')) {
                return res.status(403).json({ message: 'Unauthorized. You need to be an ADMIN to create users.' });
            }

            // Validate input for APPROVER and STANDARDUSER roles
            if (!email || !userName || !password || !role) {
                return res.status(400).json({ message: 'Email, userName, password, and role are required.' });
            }

            // Ensure company details are not provided for APPROVER and STANDARDUSER
            if (companyName || companyEmail || companyPhone || companyCountry || companyState || companyAddress || companyWebsite || companyTaxNumber || companyRegNumber) {
                return res.status(400).json({ message: 'Company details should not be provided for APPROVER and STANDARDUSER roles.' });
            }

            // Fetch the company details using the company ID from the token
            if (!companyIdFromToken) {
                return res.status(400).json({ message: 'Company ID is required in token.' });
            }

            const companyDetails = await CompanyDetails.findById(companyIdFromToken).exec();
            if (!companyDetails) {
                return res.status(500).json({ message: "Company details not found." });
            }

            // Create and store the new APPROVER or STANDARDUSER
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await UserLogin.create({
                email,
                userName,
                password: hashedPassword,
                role,
                userMobile,
                description,
                companyDetailsId: companyIdFromToken
            });

            console.log('New APPROVER/STANDARDUSER created:', newUser);

            return res.status(201).json({ success: `New user with email ${email} created!` });
        }
    } catch (err) {
        if (err.code === 11000) {
            // Handle duplicate key error
            return res.status(409).json({ message: 'Duplicate key error. A record with this value already exists.' });
        }
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// ! -----------------------------to update all users-----------------------------------
const updateUserData = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const result = await UserLogin.findByIdAndUpdate(id, update, { new: true });
        if (!result) {
            return res.status(404).json({ message: "user not found" })
        }
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }
}


const getUserData = async (req, res) => {
    try {
        const { key, value } = req.query;
        const query = { [key]: value };
        const result = await UserLogin.findOne(query);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// -----------------------------to get all users-----------------------------------
const getAllUsers = async (req, res) => {
    try {
        const users = await UserLogin.find();
        if (!users) {
            return res.status(404).json({ message: 'Users not found' })
        }
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }
}

const getUserByNameOrId = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserLogin.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export { userLogin, userRegistration, getUserData, updateUserData, getAllUsers, getUserByNameOrId };
