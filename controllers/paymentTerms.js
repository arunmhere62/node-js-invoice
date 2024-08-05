import mongoose from "mongoose";
import { getDynamicModelNameGenerator } from "../services/utils/ModelNameGenerator.js";
import { CollectionNames } from "../services/enums.js";

const createPaymentTerms = async (req, res) => {

    try {
        const PaymentTermsSchema = getDynamicModelNameGenerator(req, CollectionNames.PAYMENT_TERMS);
        const { termName, totalDays } = req.body;
        const companyId = req.companyId;
        const createdBy = req.userName;
        // Ensure companyId is provided
        if (!companyId || !createdBy) {
            return res.status(400).json({ message: 'createdBy and companyId is required' });
        }
        const newData = new PaymentTermsSchema({ termName, totalDays, companyId, createdBy });
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        console.error("Error creating new terms:", error)
        res.status(500).json({ message: "Internal server error" });
    }
}

const getAllPaymentTerms = async (req, res) => {

    try {
        const PaymentTermsSchema = getDynamicModelNameGenerator(req, CollectionNames.PAYMENT_TERMS);
        const paymentTerms = await PaymentTermsSchema.find();
        res.status(200).json(paymentTerms);
    } catch (error) {
        console.error("Error fetching payment terms:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getPaymentTermById = async (req, res) => {

    try {
        const PaymentTermsSchema = getDynamicModelNameGenerator(req, CollectionNames.PAYMENT_TERMS);
        const { id } = req.params;
        const paymentTerm = await PaymentTermsSchema.findById(id);
        if (!paymentTerm) {
            return res.status(404).json({ message: "Payment term not found" });
        }
        res.status(200).json(paymentTerm);
    } catch (error) {
        console.error("Error fetching payment term by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updatePaymentTermById = async (req, res) => {

    try {
        const PaymentTermsSchema = getDynamicModelNameGenerator(req, CollectionNames.PAYMENT_TERMS);
        const { id } = req.params;
        const updatedBy = req.userName;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid id format" });
        }
        const { termName, totalDays } = req.body;
        if (!updatedBy) {
            return res.status(400).json({ message: 'updatedBy is required' });
        }
        const updatedPaymentTerm = await PaymentTermsSchema.findByIdAndUpdate(
            id,
            { termName, totalDays, updatedBy },
            { new: true }
        );
        if (!updatedPaymentTerm) {
            return res.status(404).json({ message: "Payment term not found" });
        }
        res.status(200).json(updatedPaymentTerm);
    } catch (error) {
        console.error("Error updating payment term by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deletePaymentTermById = async (req, res) => {
    try {
        const PaymentTermsSchema = getDynamicModelNameGenerator(req, CollectionNames.PAYMENT_TERMS);
        const { id } = req.params;
        const deletedPaymentTerm = await PaymentTermsSchema.findByIdAndDelete(id);
        if (!deletedPaymentTerm) {
            return res.status(404).json({ message: "Payment term not found" });
        }
        res.status(200).json(deletedPaymentTerm);
    } catch (error) {
        console.error("Error deleting payment term by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { createPaymentTerms, deletePaymentTermById, getAllPaymentTerms, getPaymentTermById, updatePaymentTermById };