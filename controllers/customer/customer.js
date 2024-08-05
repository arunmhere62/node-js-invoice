import mongoose from "mongoose";
import { getDynamicModelNameGenerator } from "../../services/utils/ModelNameGenerator.js";
import { CollectionNames } from "../../services/enums.js";

const customerCreate = async (req, res) => {
    try {
        const CustomerModel = getDynamicModelNameGenerator(req, CollectionNames.CUSTOMERS);
        const createdBy = req.userName || null;
        const companyId = req.companyId;
        const { customerName, customerType, companyName, customerEmail, customerPhone, paymentTerms, country, address, city, state, pinCode, contactPersons } = req.body;
        if (!companyId || !createdBy) {
            return res.status(400).json({ message: 'companyId and createdBy are required' });
        }
        const newCustomer = new CustomerModel({
            createdBy,
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
            companyId,
        });
        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const customerGetParticular = async (req, res) => {
    try {
        const CustomerModel = getDynamicModelNameGenerator(req, CollectionNames.CUSTOMERS)

        const { id } = req.params;
        const customer = await CustomerModel.findById(id);
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
        const CustomerModel = getDynamicModelNameGenerator(req, CollectionNames.CUSTOMERS)
        const clients = await CustomerModel.find();
        res.status(200).json(clients);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const customerUpdate = async (req, res) => {
    try {
        const CustomerModel = getDynamicModelNameGenerator(req, CollectionNames.CUSTOMERS)

        const { id } = req.params;
        const update = req.body;

        // Extract userName from the request object
        const { userName } = req;

        // Include updatedBy field
        update.updatedBy = userName || null;

        const result = await CustomerModel.findByIdAndUpdate(id, update, { new: true });
        if (!result) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const customerDeleteById = async (req, res) => {
    try {
        const CustomerModel = getDynamicModelNameGenerator(req, CollectionNames.CUSTOMERS)
        const customerId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: "Invalid Customer ID" });
        }
        const deletedCustomer = await CustomerModel.findByIdAndDelete(customerId);
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