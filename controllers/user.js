import { UserLogin } from "../models/user.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import bcrypt from "bcrypt";

// ! ------ login -------
const userLogin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ 'message': 'Username and password are required.' });

    try {
        const foundUser = await UserLogin.findOne({ username }).exec();
        if (!foundUser) return res.sendStatus(401); // Unauthorized 

        // Evaluate password
        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) return res.sendStatus(401);

        // Extract roles from the user document, handle the case where roles are undefined or null
        const roles = foundUser.roles ? Object.values(foundUser.roles).filter(Boolean) : [];

        // Create access token
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "roles": roles
                }
            },
            "secret-key",
            { expiresIn: '30min' }
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
                { "username": foundUser.username },
                "secret-key",
                { expiresIn: '30days' }
            );
            // Update user's refresh tokens
            foundUser.refreshToken.push(refreshToken);
            await foundUser.save();
        }

        // Return both access token and refresh token in the response body
        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ! ------  handle new user  -------
const userRegistration = async (req, res) => {
    const { username, password, role } = req.body;
    // Validate input
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required.' });
    }
    try {
        // Check for duplicate usernames in the database
        const duplicate = await UserLogin.findOne({ username: username }).exec();
        if (duplicate) {
            return res.status(409).json({ message: 'Username already exists.' }); // Conflict
        }

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and store the new username
        const newUser = await UserLogin.create({
            username: username,
            password: hashedPassword,
            role: role // Assign the provided role
        });

        console.log('New user created:', newUser);

        // Log successful username creation
        // ...

        return res.status(201).json({ success: `New username ${username} created!` });
    } catch (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// -----------------------------to update all users-----------------------------------
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
