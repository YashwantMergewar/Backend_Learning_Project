// require("dotenv").config({path: "./.env"});
import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_Name } from "./constants";

// import express from "express";
import connectDB from "./db/index.js";

dotenv.config({ path: "./.env" });

connectDB()
    




// First approach to connect to MongoDB
/*const app = express();

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`/ `${DB_Name}`)
        app.on("error", (error) => {
            console.log("Error connecting to MongoDB:", error);
            throw error;
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}) ()*/