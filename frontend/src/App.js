import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './component/Navbar';
import MotorControl from './pages/MotorControl';
import Test from './pages/Test';

function App() {


  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<MotorControl />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  );
}

export default App;
