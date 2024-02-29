import mongoose from "mongoose";
import { Client } from "../../models/client.js";

const createClient = async (req, res) => {
    try {
        const { primaryContact, type, companyName, email, phoneNumber } = req.body;
        const newData = new Client({ primaryContact, type, companyName, email, phoneNumber });
        const saveData = await newData.save();
        res.status(201).json(saveData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).json(clients);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const result = await Client.findByIdAndUpdate(id, update, { new: true });
        if (!result) {
            return res.status(404).json({ message: "Client not found" })
        }
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }
}



const deleteClientById = async (req, res) => {
    try {
        const clientId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: "Invalid client ID" });
        }
        const deletedClient = await Client.findByIdAndDelete(clientId);
        if (!deletedClient) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.status(200).json({ message: "Client deleted successfully", deletedClient });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { createClient, updateClient, getAllClients, deleteClientById }