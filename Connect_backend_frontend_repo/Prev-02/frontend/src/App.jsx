import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [jokes, setJokes] = useState([])

  useEffect(() => {
    axios.get('http://localhost:5000/api/jokes')
    .then((response) => {
      setJokes(response.data)
    })
    .catch((error)=>{
      console.log("Somthing went wrong", error)
    })
  },[])

  return (
    <>
      <h1>Dharmendra Chai || Youtube Hai</h1>
      <p>JOKES: {jokes.length}</p>

      {
        jokes.map((jokes, index) => (
            <div key={jokes.id}>
              <h3>{jokes.title}</h3>
              <p>{jokes.content}</p>
            </div>
          )
        )
      }

    </>
  )
}

export default App