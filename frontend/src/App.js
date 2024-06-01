import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MotorControl from './pages/MotorControl';

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<MotorControl />} />
      </Routes>
    </Router>
  );
}

export default App;
