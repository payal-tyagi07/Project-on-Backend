import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
import app from "./app.js"

dotenv.config();

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((err)=>{
    console.log("mongodb connection failed");
})












//one approach to do connection and server setup is
//  to do it in index.js file itself. Another approach
//  is to create a separate file for database 
// connection and then import it in index.js file. 
// This way we can keep our code organized and modular.

/*
(async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: DB_NAME,
        });
        console.log("Connected to MongoDB");
        app.on("error",(error)=>{
            console.error("Error in Express app:", error);
            throw error;
        });

        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
})()
*/