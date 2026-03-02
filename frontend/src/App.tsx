import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#ffffff',
            border: '1px solid #334155'
          }
        }}
      />
      <Routes>
        <Route path="/"                  element={<Landing />} />
        <Route path="/dashboard/:ticker" element={<Dashboard />} />
        <Route path="/portfolio"         element={<Portfolio />} />
        <Route path="/register"          element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;