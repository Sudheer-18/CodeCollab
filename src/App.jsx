import {BrowserRouter,Routes,Route} from "react-router-dom"


import HomePage from "./components/Home/HomePage";
import SignIn from "./components/Login/SignIn";
import SignUp from "./components/Login/Signup";
import CreateRoom from "./components/Room/CreateRoom";
import JoinRoom from "./components/Room/JoinRoom";
import AvailableRoom from "./components/Room/AvailableRoom";
import Room from "./components/Room/Room";
import DashBoard from "./components/dashboard/Dashboard";
import Footer from "./components/Footer/Footer";

const App  = () => {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/login" element={<SignIn />}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/create-room" element={<CreateRoom />}></Route>
        <Route path="/join-room" element={<JoinRoom />}></Route>
        <Route path="/availableroom" element={<AvailableRoom />}></Route>
        <Route path="/room/:id" element={<Room />}></Route>
        <Route path="/dashboard" element={<DashBoard />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>

  )
}


export default App;