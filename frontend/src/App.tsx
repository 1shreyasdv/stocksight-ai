import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/"                  element={<Landing />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/login"             element={<UserLogin />} />
        <Route path="/admin/login"       element={<AdminLogin />} />
        <Route path="/admin/dashboard"   element={<AdminDashboard />} />
        <Route path="/user/dashboard"    element={<UserDashboard />} />
        <Route path="/portfolio"         element={<Navigate to="/login" />} />
        <Route path="/dashboard/:ticker" element={<Navigate to="/login" />} />
        <Route path="*"                  element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;