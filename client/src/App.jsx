import { BrowserRouter,Routes,Route } from "react-router-dom";
import Login from'./pages/Login'
import Manage from './pages/Manage'
import Lobby from './pages/Lobby'
import Meeting from './pages/Meeting'


function App() {
  

  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Login/>}/>
    <Route path="/Ma" element={<Manage/>}/>
    <Route path="/lobby/:id" element={<Lobby/>}/>
    <Route path="/Meeting/:id" element={<Meeting/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
