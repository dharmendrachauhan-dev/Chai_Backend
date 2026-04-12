import connectDB from "./db/db.js";
import dotenv from "dotenv"
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 8000

connectDB()
.then(()=>{

    app.on("error", (error)=>{
        console.log("ERROR", error)
        throw error
    })

    app.listen(PORT, () => {
        console.log(` Server is listening on port http://localhost:${PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!" , err);
})









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