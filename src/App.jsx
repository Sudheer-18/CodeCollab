<<<<<<< HEAD
import React from "react"; 
import {BrowserRouter,Routes,Route} from "react-router-dom"


import HomePage from "./componets/Home/HomePage";
import SignIn from "./componets/Login/SIginin";
import SignUp from "./componets/Login/Signup";
import CreateRoom from "./componets/Room/CreateRoom";
import JoinRoom from "./componets/Room/JoinRoom";
import Room from "./componets/Room/Room";
import DashBoard from "./componets/dashboard/DashBoard";
import Footer from "./componets/Footer/Footer";
=======
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
>>>>>>> 756de1679ca0efb7ccbb987f619ca511799d9d5a

const App  = () => {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/login" element={<SignIn />}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/create-room" element={<CreateRoom />}></Route>
        <Route path="/join-room" element={<JoinRoom />}></Route>
<<<<<<< HEAD
=======
        <Route path="/availableroom" element={<AvailableRoom />}></Route>
>>>>>>> 756de1679ca0efb7ccbb987f619ca511799d9d5a
        <Route path="/room/:id" element={<Room />}></Route>
        <Route path="/dashboard" element={<DashBoard />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>

  )
}


export default App;