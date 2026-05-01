import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"


export const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true  // Required for cookies/auth headers
}))

// Multer se file uploading configure karte hai
// url se data to problem
// next is Flag (err, req, res, next)

app.use(express.json({ limit: "16kb" }))  // client send json data this middleware converts into req.body
app.use(express.urlencoded({ extended: true, limit: "16kb" })) // this parses the data from html form converts into req.body
app.use(express.static("public")) // this is for static files 
app.use(cookieParser()) //is is middleware that converts browser cookies into a JavaScript object (req.cookies) so the backend can easily read them.


//routes import
import userRouter from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users", userRouter) // Prefix

// EG: http://localhost:8000/api/v1/users/register
