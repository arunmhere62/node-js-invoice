import mongoose from "mongoose";
import { Service } from "../../models/services.js";

const serviceCreate = async (req, res) => {
    try {
        const { serviceCode, description, amount } = req.body;
        const newService = new Service({ serviceCode, description, amount });
        const saveService = await newService.save();
        res.status(201).json(saveService);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


const servicesList = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const serviceUpdate = async (req, res) => {
    console.log(req.body);
    try {
        const { id } = req.params;
        const update = req.body;
        const result = await Service.findByIdAndUpdate(id, update, { new: true });
        if (!result) {
            return res.status(404).json({ message: "service not found" })
        }
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

const serviceDelete = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }
        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            return res.status(404).json({ message: "service is not found" });
        }
        res.status(200).json({ message: "services deleted successfully", deletedService });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { serviceCreate, servicesList, serviceUpdate, serviceDelete };
