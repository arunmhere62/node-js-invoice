import mongoose from "mongoose";
import { Customer } from "../../models/customer.js";

const customerCreate = async (req, res) => {
    try {
        const {
            primaryContact, type, customerEmail, companyName, phoneNumber, paymentTerms, country,
            address, city, state, zipCode, contactName, contactEmail, contactPhone
        } = req.body;

        // Check if any required field is absent
        const requiredFields = ["primaryContact", "type", "customerEmail", "companyName", "phoneNumber", "paymentTerms", "country", "address", "city", "state", "zipCode", "contactName", "contactEmail", "contactPhone"];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        // Create and save the new customer data
        const saveData = await Customer.create({
            primaryContact, type, companyName, phoneNumber, paymentTerms, country,
            address, city, state, customerEmail, zipCode, contactName, contactEmail, contactPhone
        });

        res.status(201).json(saveData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const customerGetAll = async (req, res) => {
    try {
        const clients = await Customer.find();
        res.status(200).json(clients);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const customerUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const result = await Customer.findByIdAndUpdate(id, update, { new: true });
        if (!result) {
            return res.status(404).json({ message: "Customer not found" })
        }
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }
}



const customerDeleteById = async (req, res) => {
    try {
        const customerId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: "Invalid Customer ID" });
        }
        const deletedCustomer = await Customer.findByIdAndDelete(customerId);
        if (!deletedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json({ message: "Customer deleted successfully", deletedCustomer });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { customerCreate, customerGetAll, customerDeleteById, customerUpdate }