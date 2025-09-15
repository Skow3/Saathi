// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login'; // 1. Import the Login page
import Dashboard from './pages/Dashboard';
import NekoCat from "./components/NekoCat";
import AboutYou from './pages/AboutYou';

function App() {
  return (
    <div>
      <NekoCat />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} /> {/* 2. Add the route */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Add Dashboard Route */}
        <Route path="/aboutyou" element={<AboutYou />} />
      </Routes>
    </div>
  );
}

export default App;