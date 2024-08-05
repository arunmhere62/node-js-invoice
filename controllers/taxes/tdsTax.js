import { CollectionNames, } from "../../services/enums.js";
import { getDynamicModelNameGenerator } from "../../services/utils/ModelNameGenerator.js";

const createTds = async (req, res) => {

    try {
        const TdsTaxModel = getDynamicModelNameGenerator(req, CollectionNames.TDS_TAX);
        const { taxName, taxPercentage } = req.body;
        const companyId = req.companyId;
        const createdBy = req.userName;
        // Ensure companyId is provided
        if (!companyId || !createdBy) {
            return res.status(400).json({ message: 'createdBy and companyId is required' });
        }
        const newData = new TdsTaxModel({ taxName, taxPercentage, companyId, createdBy })
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getTdsList = async (req, res) => {

    try {
        const TdsTaxModel = getDynamicModelNameGenerator(req, CollectionNames.TDS_TAX);
        const tdsList = await TdsTaxModel.find();
        res.status(200).json(tdsList);
    } catch (error) {
        console.error("Error Fetching TDS List:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getTdsById = async (req, res) => {

    try {
        const TdsTaxModel = getDynamicModelNameGenerator(req, CollectionNames.TDS_TAX);
        const { id } = req.params;
        const tds = await TdsTaxModel.findById(id);
        if (!tds) {
            return res.status(404).json({ message: "TDS Not Found" })
        }
        res.status(200).json(tds);
    } catch (error) {
        console.error("Error Fetching TDS by ID :", error);
        res.status(500).json({ message: "Internal server error" })
    }
};

const updateTdsById = async (req, res) => {
    try {
        const TdsTaxModel = getDynamicModelNameGenerator(req, CollectionNames.TDS_TAX);
        const { id } = req.params;
        const updatedBy = req.userName;
        const { taxName, taxPercentage } = req.body;
        if (!updatedBy) {
            return res.status(400).json({ message: 'updatedBy is required' });
        }
        const updateIds = await TdsTaxModel.findByIdAndUpdate(id, { updatedBy, taxName, taxPercentage, updatedBy }, { new: true });
        if (!updateIds) {
            return res.status(404).json({ message: "TDS not found" })
        }
        res.status(200).json(updateIds)
    } catch (error) {
        console.error("Error updating Tds by id :", error);
        res.status(500).json({ message: "Internal server error" })
    }
};

const deleteTdsById = async (req, res) => {
    try {
        const TdsTaxModel = getDynamicModelNameGenerator(req, CollectionNames.TDS_TAX);
        const { id } = req.params;
        const deletedTds = await TdsTaxModel.findByIdAndDelete(id);
        if (!deletedTds) {
            return res.status(404).json({ message: "Tds not found" })
        }
        res.status(200).json(deletedTds)
    } catch (error) {
        console.error("Error deleting Tds by id", error)
        res.status(500).json({ message: "Internal server error" })
    }
};

export { createTds, getTdsList, getTdsById, updateTdsById, deleteTdsById }