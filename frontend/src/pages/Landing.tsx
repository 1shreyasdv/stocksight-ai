import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingStocks } from '../services/api';
import { Search, TrendingUp, Brain, BarChart2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Landing = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const data = await getTrendingStocks();
        setTrending(data);
      } catch (error) {
        toast.error('Could not load trending stocks');
      } finally {
        setLoading(false);
      }
    };
    loadTrending();
  }, []);

  const handleSearch = () => {
    if (!search.trim()) { toast.error('Please enter a stock ticker!'); return; }
    navigate(`/dashboard/${search.toUpperCase()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between border-b border-gray-800 px-8 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-indigo-500" size={28} />
          <span className="text-xl font-bold text-white">StockSight AI</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/portfolio')} className="px-4 py-2 text-gray-300 transition hover:text-white">Portfolio</button>
          <button onClick={() => navigate('/login')} className="rounded-lg border border-gray-600 px-4 py-2 text-gray-300 transition hover:text-white">Login</button>
          <button onClick={() => navigate('/register')} className="rounded-lg border border-gray-600 px-4 py-2 text-gray-300 transition hover:text-white">Register</button>
          <button onClick={() => navigate('/dashboard/AAPL')} className="rounded-lg bg-indigo-600 px-4 py-2 transition hover:bg-indigo-700">Try Demo</button>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-900 px-4 py-2 text-sm text-indigo-300">
          <Brain size={16} /> AI-Powered Stock Predictions
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight">
          Predict Stocks with <span className="text-indigo-500"> Artificial Intelligence</span>
        </h1>
        <p className="mb-10 max-w-2xl text-xl text-gray-400">
          Get AI-powered price predictions, sentiment analysis, and technical indicators for any stock — completely free!
        </p>
        <div className="flex w-full max-w-lg gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 px-4">
            <Search className="text-gray-400" size={20} />
            <input
              type="text" placeholder="Enter stock ticker (e.g. AAPL, TSLA)"
              value={search} onChange={(e) => setSearch(e.target.value)} onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent py-4 text-white placeholder-gray-500 outline-none"
            />
          </div>
          <button onClick={handleSearch} className="rounded-xl bg-indigo-600 px-6 py-4 font-semibold transition hover:bg-indigo-700">Analyze</button>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {['AAPL','TSLA','GOOGL','MSFT','NVDA','AMZN','META','NFLX','AMD','INTC'].map(ticker => (
            <button key={ticker} onClick={() => navigate(`/dashboard/${ticker}`)} className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300 transition hover:bg-gray-700">{ticker}</button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-12">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold"><TrendingUp className="text-indigo-500" />Trending Stocks</h2>
        {loading ? (
          <div className="py-8 text-center text-gray-400">Loading trending stocks...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {trending.map((stock: any) => (
              <div key={stock.ticker} onClick={() => navigate(`/dashboard/${stock.ticker}`)} className="cursor-pointer rounded-xl border border-gray-700 bg-gray-800 p-4 transition hover:border-indigo-500">
                <div className="font-bold text-white">{stock.ticker}</div>
                <div className="mb-2 truncate text-sm text-gray-400">{stock.company_name}</div>
                <div className="text-lg font-semibold">${stock.current_price?.toFixed(2) ?? 'N/A'}</div>
                <div className={`text-sm font-medium ${stock.change_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change_percent >= 0 ? '▲' : '▼'} {Math.abs(stock.change_percent ?? 0).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-8 py-12">
        <h2 className="mb-10 text-center text-2xl font-bold">Why StockSight AI?</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <Brain className="mb-4 text-indigo-500" size={32} />
            <h3 className="mb-2 text-lg font-bold">AI Predictions</h3>
            <p className="text-sm text-gray-400">Uses Facebook Prophet and XGBoost ML models to predict future stock prices with confidence intervals.</p>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <BarChart2 className="mb-4 text-indigo-500" size={32} />
            <h3 className="mb-2 text-lg font-bold">Technical Analysis</h3>
            <p className="text-sm text-gray-400">RSI, MACD, Bollinger Bands, Moving Averages and more technical indicators calculated automatically.</p>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <Shield className="mb-4 text-indigo-500" size={32} />
            <h3 className="mb-2 text-lg font-bold">Sentiment Analysis</h3>
            <p className="text-sm text-gray-400">AI reads latest news headlines and tells you if the market sentiment is Bullish or Bearish.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 px-8 py-6 text-center text-xs text-gray-600">
        ⚠️ This platform is for educational purposes only and does not constitute financial advice.
      </div>
    </div>
  );
};

export default Landing;