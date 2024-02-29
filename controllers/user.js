import { UserLogin } from "../models/user.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';


// -----------------------------to insert the loggedIn users-----------------------------------
const userRegistration = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newData = new UserLogin({ username, email, password });
        const saveData = await newData.save();
        res.status(201).json(saveData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const secretKey = 'yourSecretKey';

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Await the findOne method to get the user
        const user = await UserLogin.findOne({ email, password });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // If user exists, generate token
        const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: "24hr" });
        res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


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
