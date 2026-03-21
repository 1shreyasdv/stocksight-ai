import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Register from './pages/Register';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/"                  element={<Landing />} />
        <Route path="/dashboard/:ticker" element={<Dashboard />} />
        <Route path="/portfolio"         element={<Portfolio />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/login"             element={<UserLogin />} />
        <Route path="/admin/login"       element={<AdminLogin />} />
        <Route path="/admin/dashboard"   element={<AdminDashboard />} />
        <Route path="/user/dashboard"    element={<UserDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;