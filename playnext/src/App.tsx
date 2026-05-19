import { Route, Routes } from "react-router-dom"
import Video from "./components/Video"
import Navbar from "./components/Navbar"


function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
         <Route path="/video" element={<Video />} />
      </Routes>
    </div>
  )
}

export default App
