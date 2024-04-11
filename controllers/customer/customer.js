import mongoose from "mongoose";
import { Customer } from "../../models/customer.js";

const customerCreate = async (req, res) => {
    try {
        const { customerName, customerType, companyName, customerEmail, customerPhone, paymentTerms, country, address, city, state, pinCode, contactPersons } = req.body;

        const newCustomer = new Customer({
            customerName,
            customerType,
            companyName,
            customerEmail,
            customerPhone,
            paymentTerms,
            country,
            address,
            city,
            state,
            pinCode,
            contactPersons,
        });
        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const customerGetAll = async (req, res) => {
    try {
        const clients = await Customer.find();
        // Map through each document to transform _id to id
        const transformedClients = clients.map(client => {
            const { _id, ...rest } = client.toObject(); // Destructure _id
            return {
                ...rest, // Spread the rest of the properties
                id: _id, // Rename _id to id
                // Transform contactPersons array
                contactPersons: client.contactPersons.map(contactPerson => ({
                    ...contactPerson.toObject(), // Spread the contactPerson properties
                    id: contactPerson._id // Rename _id to id
                }))
            };
        });
        res.status(200).json(transformedClients);
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