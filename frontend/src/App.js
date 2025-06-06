import React from 'react';
import Navbar from "./components/navbar";
import Banner from "./components/banner";
import VideoEmbed from './components/videoembed';
import ComplaintForm from './components/complainForm';
import Payment from './components/Payment/payment';
import LiveLocationPage from './components/location';
import About from './components/About/about';
import Footer from "./components/footer";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Chatbot from './components/chatbot/chatbot';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Only render Navbar, Banner, VideoEmbed, and Footer on the home page */}
        <Route path="/" element={
          <>
            <Navbar />
            <Banner />
            <VideoEmbed />
           
            <Footer />
          </>
        } />
        <Route path="/Chatbot" element={<Chatbot />} />
        <Route path="/complainForm" element={<ComplaintForm />} />
        <Route path="/AboutUs" element={<About />} />
        <Route path="/Payment" element={<Payment/>} />
        <Route path="/live-location" element={<LiveLocationPage/>} />
        
        {/* Other routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </Router>
  );
};

export default App;
