import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate   = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      toast.error('Please fill all fields!');
      return;
    }
    try {
      await registerUser(email, password, fullName);
      toast.success('Account created! Please login now.');
      navigate('/portfolio');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-8">

        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="text-indigo-500" size={24} />
          <span className="text-xl font-bold text-white">StockSight AI</span>
        </div>

        <h2 className="mb-2 text-2xl font-bold">Create Account</h2>
        <p className="mb-6 text-sm text-gray-400">
          Register to track your portfolio!
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Full Name"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleRegister}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold transition hover:bg-indigo-700"
          >
            Create Account
          </button>

          <button
            onClick={() => navigate('/portfolio')}
            className="w-full rounded-lg bg-gray-700 py-3 text-gray-300 transition hover:bg-gray-600"
          >
            Already have account? Login
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 text-sm text-gray-500 transition hover:text-gray-300"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;