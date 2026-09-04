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

const App  = () => {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/login" element={<SignIn />}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/create-room" element={<CreateRoom />}></Route>
        <Route path="/join-room" element={<JoinRoom />}></Route>
        <Route path="/room/:id" element={<Room />}></Route>
        <Route path="/dashboard" element={<DashBoard />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>

  )
}


export default App;