// ============================================================
// PORTFOLIO.TSX — Virtual Stock Portfolio Page
//
// This page lets users:
// - Add stocks they "bought"
// - See current value of each stock
// - See total profit or loss
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPortfolioPerformance, addToPortfolio,
  removeFromPortfolio, loginUser
} from '../services/api';
import { TrendingUp, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Portfolio = () => {
  const navigate = useNavigate();

  const [token,       setToken]       = useState<string>(localStorage.getItem('token') || '');
  const [performance, setPerformance] = useState<any>(null);
  const [loading,     setLoading]     = useState(false);
  const [showAdd,     setShowAdd]     = useState(false);
  const [showLogin,   setShowLogin]   = useState(!localStorage.getItem('token'));

  // Add stock form
  const [ticker,    setTicker]    = useState('');
  const [quantity,  setQuantity]  = useState('');
  const [buyPrice,  setBuyPrice]  = useState('');
  const [buyDate,   setBuyDate]   = useState('');

  // Login form
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
  if (token) loadPortfolio();

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [token]);
  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const data = await getPortfolioPerformance(token);
      setPerformance(data);
    } catch (error) {
      toast.error('Could not load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setShowLogin(false);
      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error('Login failed. Check email and password.');
    }
  };

  const handleAddStock = async () => {
    if (!ticker || !quantity || !buyPrice || !buyDate) {
      toast.error('Please fill all fields!');
      return;
    }
    try {
      await addToPortfolio(token, {
        ticker:        ticker.toUpperCase(),
        quantity:      parseFloat(quantity),
        avg_buy_price: parseFloat(buyPrice),
        buy_date:      buyDate,
      });
      toast.success(`${ticker.toUpperCase()} added to portfolio!`);
      setShowAdd(false);
      setTicker(''); setQuantity(''); setBuyPrice(''); setBuyDate('');
      loadPortfolio();
    } catch (error) {
      toast.error('Could not add stock');
    }
  };

  const handleRemove = async (id: number, tickerName: string) => {
    try {
      await removeFromPortfolio(token, id);
      toast.success(`${tickerName} removed!`);
      loadPortfolio();
    } catch (error) {
      toast.error('Could not remove stock');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setShowLogin(true);
    setPerformance(null);
    toast.success('Logged out!');
  };

  // ── LOGIN SCREEN ──
  if (showLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-8">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={24} />
            <span className="text-xl font-bold text-white">StockSight AI</span>
          </div>
          <h2 className="mb-6 text-2xl font-bold">Login to Portfolio</h2>

          <div className="space-y-4">
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
              onClick={handleLogin}
              className="w-full rounded-lg bg-indigo-600 py-3 font-semibold transition hover:bg-indigo-700"
            >
              Login
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            No account? Register at{' '}
            <span
              onClick={() => navigate('/')}
              className="cursor-pointer text-indigo-400 hover:underline"
            >
              homepage
            </span>
          </p>

          <button
            onClick={() => navigate('/')}
            className="mt-6 flex items-center gap-2 text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between border-b border-gray-800 px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={24} />
            <span className="font-bold">StockSight AI</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm transition hover:bg-red-700"
        >
          Logout
        </button>
      </nav>

      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Portfolio</h1>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 transition hover:bg-indigo-700"
          >
            <Plus size={18} /> Add Stock
          </button>
        </div>

        {/* ── ADD STOCK FORM ── */}
        {showAdd && (
          <div className="mb-6 rounded-xl border border-indigo-500 bg-gray-800 p-6">
            <h3 className="mb-4 font-bold">Add New Position</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <label className="text-xs text-gray-400">Ticker</label>
                <input
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="AAPL"
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Quantity</label>
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="10"
                  type="number"
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Buy Price ($)</label>
                <input
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="150.00"
                  type="number"
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Buy Date</label>
                <input
                  value={buyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                  type="date"
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddStock}
                className="rounded-lg bg-indigo-600 px-4 py-2 transition hover:bg-indigo-700"
              >
                Add to Portfolio
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg bg-gray-700 px-4 py-2 transition hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading portfolio...</div>
        ) : performance ? (
          <>
            {/* ── SUMMARY CARDS ── */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: 'Total Invested',  value: `$${performance.total_invested?.toFixed(2)}`,   color: 'text-white' },
                { label: 'Current Value',   value: `$${performance.current_value?.toFixed(2)}`,    color: 'text-white' },
                { label: 'Total P&L',       value: `$${performance.total_pnl?.toFixed(2)}`,        color: performance.total_pnl >= 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'Return %',        value: `${performance.total_pnl_percent?.toFixed(2)}%`, color: performance.total_pnl_percent >= 0 ? 'text-green-400' : 'text-red-400' },
              ].map(card => (
                <div key={card.label} className="rounded-xl border border-gray-700 bg-gray-800 p-4">
                  <div className="text-sm text-gray-400">{card.label}</div>
                  <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* ── POSITIONS TABLE ── */}
            {performance.positions?.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                No stocks yet! Click "Add Stock" to get started.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900">
                    <tr className="text-gray-400">
                      <th className="px-4 py-3 text-left">Ticker</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Buy Price</th>
                      <th className="px-4 py-3 text-right">Current</th>
                      <th className="px-4 py-3 text-right">P&L</th>
                      <th className="px-4 py-3 text-right">Return</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.positions?.map((pos: any) => (
                      <tr
                        key={pos.id}
                        className="cursor-pointer border-t border-gray-700 hover:bg-gray-700"
                        onClick={() => navigate(`/dashboard/${pos.ticker}`)}
                      >
                        <td className="px-4 py-3 font-bold text-indigo-400">{pos.ticker}</td>
                        <td className="px-4 py-3 text-right">{pos.quantity}</td>
                        <td className="px-4 py-3 text-right">${pos.avg_buy_price}</td>
                        <td className="px-4 py-3 text-right">${pos.current_price}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${pos.pnl?.toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-right ${pos.pnl_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pos.pnl_percent?.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(pos.id, pos.ticker); }}
                            className="text-red-400 transition hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-gray-400">
            Could not load portfolio data.
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 border-t border-gray-800 px-8 py-4 text-center text-xs text-gray-600">
        ⚠️ For educational purposes only. Not financial advice.
      </div>

    </div>
  );
};

export default Portfolio;