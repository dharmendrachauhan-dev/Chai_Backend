import connectDB from "./db/db.js";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})

connectDB()




// 1st Approach
/*
import express from 'express';
const app = express()
// IIFE
;(async () => {
    try {
        const dbConnect = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("my app is not able to talk database", error)
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR: ", error)
        throw error
    }
})()

*/