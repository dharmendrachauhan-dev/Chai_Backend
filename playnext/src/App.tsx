import { Route, Routes, useLocation } from "react-router-dom"
import Video from "./components/Video"
import Navbar from "./components/Navbar"
import SignUp from "./components/SignUp"
import SideBar from "./components/SideBar"


function App() {
  const location = useLocation();
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/video" element={<Video />} />
        <Route path="/signup" element={<SignUp/>} />
      </Routes>
      {
        location.pathname !== "/signup"  && 
        location.pathname !== "/login" &&
        <SideBar/>
      }
      
    </div>
  )
}

export default App
