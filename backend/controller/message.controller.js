import { Message } from "../models/message.model.js";

// Get all messages
export const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find();
        res.status(200).json([messages]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new message
export const createMessage = async (req, res) => {
    try {
        const { username, message } = req.body;
        const data = await Message.create({username, message});
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// delete all messages 
export const deleteAllMessages = async (req, res) => {
    try {
        await Message.deleteMany({});
        res.status(200).json({ message: "All messages deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};