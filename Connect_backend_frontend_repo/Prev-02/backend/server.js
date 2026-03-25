import express from "express";
import cors from 'cors'

const app = express()
const port = 5000

app.use(cors({
  origin: "http://localhost:5173"
}))

app.use(express.json())

// get a list of 5 jokes
const jokes = [
  {
    id: 1,
    title: "Introduction to JavaScript",
    content: "JavaScript is a powerful programming language used for web development. It allows you to create interactive web pages."
  },
  {
    id: 2,
    title: "Understanding React",
    content: "React is a JavaScript library for building user interfaces. It uses components to create reusable UI elements."
  },
  {
    id: 3,
    title: "What is Node.js?",
    content: "Node.js allows you to run JavaScript on the server side. It is built on Chrome's V8 engine."
  },
  {
    id: 4,
    title: "Basics of CSS",
    content: "CSS is used to style HTML elements. It controls layout, colors, fonts, and overall design."
  },
  {
    id: 5,
    title: "Getting Started with APIs",
    content: "APIs allow communication between different software systems. You can fetch data using fetch or axios."
  }
];


// app.get('/', (req, res)=>{
//     res.send("server is ready")
// })

app.get('/api/jokes', (req, res)=>{
    res.send(jokes)
});


app.listen(port , ()=>{
    console.log(`Server is started....`)
})