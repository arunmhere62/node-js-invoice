import { TdsSchema } from "../../models/taxes/tdsTax.js";

const createTds = async (req, res) => {
    try {
        const { taxName, taxPercentage } = req.body;

        const newData = new TdsSchema({ taxName, taxPercentage })
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getTdsList = async (req, res) => {
    try {
        const tdsList = await TdsSchema.aggregate([
            {
                $project: {
                    id: "$_id",
                    _id: 0,
                    taxName: 1,
                    taxPercentage: 1,
                }
            }
        ]);

        res.status(200).json(tdsList);
    } catch (error) {
        console.error("Error Fetching TDS List:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const getTdsById = async (req, res) => {
    try {
        const { id } = req.params;
        const tds = await TdsSchema.findById(id);
        if (!tds) {
            return res.status(404).json({ message: "TDS Not Found" })
        }
        res.status(200).json(tds);
    } catch (error) {
        console.error("Error Fetching TDS by ID :", error);
        res.status(500).json({ message: " Internal server error" })
    }
}

const updateTdsById = async (req, res) => {
    try {
        const { id } = req.params;
        const { taxName, taxPercentage } = req.body;
        const updateIds = await TdsSchema.findByIdAndUpdate(id, { taxName, taxPercentage }, { new: true });
        if (!updateIds) {
            return res.status(404).json({ message: "TDS not found" })
        }
        res.status(200).json(updateIds)
    } catch (error) {
        console.error("Error updating Tds by id :", error);
        res.status(500).json({ message: "Internal server error" })
    }
}

const deleteTdsById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTds = await TdsSchema.findByIdAndDelete(id);
        if (!deletedTds) {
            return res.status(404).json({ message: "Tds not found" })
        }
        res.status(200).json(deletedTds)
    } catch (error) {
        console.error("Error deleting Tds by id", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export { createTds, getTdsList, getTdsById, updateTdsById, deleteTdsById }