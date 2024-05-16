import mongoose from "mongoose";
import { Customer } from "../../models/customer.js";
import { customerValidation } from "../../validations/validations.js";
import * as Yup from 'yup';

const customerCreate = async (req, res) => {
    try {
        const { customerName, customerType, companyName, customerEmail, customerPhone, paymentTerms, country, address, city, state, pinCode, contactPersons } = req.body;

        await customerValidation.validate(req.body, { abortEarly: false });
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
        if (error instanceof Yup.ValidationError) {
            // Handle validation errors
            const validationErrors = error.inner.map(err => ({ path: err.path, message: err.message }));
            return res.status(400).json({ errors: validationErrors });
        }
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const customerGetParticular = async (req, res) => {
    console.log("customer get particular");
    try {
        const { id } = req.params;
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json(customer);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }
}

const customerGetAll = async (req, res) => {
    try {
        const clients = await Customer.find();
        const transformedClients = clients.map(client => {
            const { _id, ...rest } = client.toObject();
            return {
                ...rest,
                id: _id,
                contactPersons: client.contactPersons.map(contactPerson => ({
                    ...contactPerson.toObject(),
                    id: contactPerson._id
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

export { customerCreate, customerGetAll, customerDeleteById, customerUpdate, customerGetParticular }