import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

// Connect to MongoDB
export const db = async () => {
    try {
        await mongoose.connect(process.env.URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}