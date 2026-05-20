import { Route, Routes } from "react-router-dom"
import Video from "./components/Video"
import Navbar from "./components/Navbar"
import SignUp from "./components/SignUp"


function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
         <Route path="/video" element={<Video />} />
        <Route path="/signup" element={<SignUp/>} />
      </Routes>
    </div>
  )
}

export default App
