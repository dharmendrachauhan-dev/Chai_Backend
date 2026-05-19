import { Route, Routes } from "react-router-dom"
import Video from "./components/Video"
import Navbar from "./components/Navbar"
import { Button } from "./components/ui/button"


function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
         <Route path="/video" element={<Video />} />
      </Routes>
      <Button className="bg-green-500">Subscription</Button>
    </div>
  )
}

export default App
