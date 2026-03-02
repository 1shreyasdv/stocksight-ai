import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  getStockOverview, getStockHistory,
  getPrediction, getSentimentScore,
  getNewsSentiment, getAIInsights
} from '../services/api';
import { TrendingUp, ArrowLeft, Brain, Newspaper, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { ticker }  = useParams();
  const navigate    = useNavigate();

  const [overview,   setOverview]   = useState<any>(null);
  const [history,    setHistory]    = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [sentiment,  setSentiment]  = useState<any>(null);
  const [news,       setNews]       = useState<any[]>([]);
  const [insights,   setInsights]   = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('chart');
  const [days,       setDays]       = useState(30);
  const [period,     setPeriod]     = useState('1y');

  useEffect(() => {
    if (ticker) loadAllData();
  }, [ticker]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [overviewData, historyData, sentimentData, newsData] =
        await Promise.all([
          getStockOverview(ticker!),
          getStockHistory(ticker!, period),
          getSentimentScore(ticker!),
          getNewsSentiment(ticker!),
        ]);
      setOverview(overviewData);
      setHistory(historyData.data || []);
      setSentiment(sentimentData);
      setNews(newsData.news || []);
    } catch (error) {
      toast.error('Error loading stock data');
    } finally {
      setLoading(false);
    }
  };

  const loadPrediction = async () => {
    try {
      toast.loading('Running AI prediction...');
      const data = await getPrediction(ticker!, days);
      setPrediction(data);
      toast.dismiss();
      toast.success('Prediction ready!');
    } catch (error) {
      toast.dismiss();
      toast.error('Prediction failed');
    }
  };

  const loadInsights = async () => {
    try {
      toast.loading('Running AI analysis...');
      const data = await getAIInsights(ticker!);
      setInsights(data);
      toast.dismiss();
      toast.success('AI Analysis ready!');
    } catch (error) {
      toast.dismiss();
      toast.error('AI Analysis failed');
    }
  };

  const chartData = [
    ...history.slice(-60).map((h: any) => ({
      date:   h.date,
      actual: h.close,
    })),
    ...(prediction?.predictions || []).map((p: any) => ({
      date:      p.date,
      predicted: p.predicted_price,
      upper:     p.upper_bound,
      lower:     p.lower_bound,
    }))
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mb-4 text-4xl text-indigo-500">⏳</div>
          <div className="text-xl text-white">Loading {ticker}...</div>
          <div className="mt-2 text-gray-400">Fetching real-time data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b border-gray-800 px-8 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 transition hover:text-white">
            <ArrowLeft size={20} /> Back
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={24} />
            <span className="font-bold">StockSight AI</span>
          </div>
        </div>
        <button onClick={() => navigate('/portfolio')} className="rounded-lg bg-indigo-600 px-4 py-2 transition hover:bg-indigo-700">
          My Portfolio
        </button>
      </nav>

      <div className="mx-auto max-w-7xl px-8 py-8">

        {/* STOCK HEADER */}
        {overview && (
          <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{ticker}</h1>
                <p className="text-gray-400">{overview.company_name}</p>
                <p className="text-sm text-gray-500">{overview.sector} • {overview.industry}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">${overview.current_price?.toFixed(2)}</div>
                <div className={`text-lg font-semibold ${overview.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {overview.change >= 0 ? '▲' : '▼'} ${Math.abs(overview.change).toFixed(2)} ({Math.abs(overview.change_percent).toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: 'Market Cap',  value: overview.market_cap ? `$${(overview.market_cap/1e9).toFixed(2)}B` : 'N/A' },
                { label: 'P/E Ratio',   value: overview.pe_ratio?.toFixed(2) ?? 'N/A' },
                { label: '52W High',    value: `$${overview.week_52_high?.toFixed(2) ?? 'N/A'}` },
                { label: '52W Low',     value: `$${overview.week_52_low?.toFixed(2) ?? 'N/A'}` },
              ].map(stat => (
                <div key={stat.label} className="rounded-lg bg-gray-900 p-3">
                  <div className="text-xs text-gray-400">{stat.label}</div>
                  <div className="font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERIOD SELECTOR */}
        <div className="mb-4 flex gap-2">
          {['1mo','3mo','6mo','1y','2y'].map(p => (
            <button
              key={p}
              onClick={() => { setPeriod(p); loadAllData(); }}
              className={`rounded-full px-3 py-1 text-sm transition ${
                period === p ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* TABS */}
        <div className="mb-6 flex gap-2 border-b border-gray-800">
          {['chart','prediction','sentiment','news','ai insights'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition ${
                activeTab === tab
                  ? 'border-b-2 border-indigo-400 text-indigo-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'ai insights' ? '🧠 AI Insights' : tab}
            </button>
          ))}
        </div>

        {/* CHART TAB */}
        {activeTab === 'chart' && (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-bold">Price History</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151' }} />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#6366f1" dot={false} strokeWidth={2} name="Actual Price" />
                <Line type="monotone" dataKey="predicted" stroke="#10b981" dot={false} strokeWidth={2} strokeDasharray="5 5" name="Predicted Price" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* PREDICTION TAB */}
        {activeTab === 'prediction' && (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Brain className="text-indigo-500" /> AI Price Prediction
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
                <button onClick={loadPrediction} className="rounded-lg bg-indigo-600 px-4 py-2 transition hover:bg-indigo-700">
                  Run Prediction
                </button>
              </div>
            </div>

            {!prediction ? (
              <div className="py-12 text-center text-gray-400">
                <Brain size={48} className="mx-auto mb-4 text-gray-600" />
                <p>Click "Run Prediction" to get AI price forecast!</p>
              </div>
            ) : (
              <>
                <div className={`mb-6 rounded-xl p-4 text-center text-xl font-bold ${
                  prediction.verdict?.includes('Bullish') ? 'bg-green-900 text-green-400' :
                  prediction.verdict?.includes('Bearish') ? 'bg-red-900 text-red-400' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {prediction.verdict}
                </div>

                <div className="mb-6 grid grid-cols-3 gap-4">
                  {[
                    { label: 'MAE',  value: `$${prediction.accuracy?.mae?.toFixed(2)}` },
                    { label: 'RMSE', value: `$${prediction.accuracy?.rmse?.toFixed(2)}` },
                    { label: 'MAPE', value: `${prediction.accuracy?.mape?.toFixed(2)}%` },
                  ].map(m => (
                    <div key={m.label} className="rounded-lg bg-gray-900 p-3 text-center">
                      <div className="text-xs text-gray-400">{m.label}</div>
                      <div className="font-bold text-white">{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400">
                        <th className="py-2 text-left">Date</th>
                        <th className="py-2 text-right">Predicted</th>
                        <th className="py-2 text-right">Low</th>
                        <th className="py-2 text-right">High</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prediction.predictions.slice(0, 10).map((p: any) => (
                        <tr key={p.date} className="border-b border-gray-800 hover:bg-gray-700">
                          <td className="py-2 text-gray-300">{p.date}</td>
                          <td className="py-2 text-right font-semibold text-green-400">${p.predicted_price}</td>
                          <td className="py-2 text-right text-red-400">${p.lower_bound}</td>
                          <td className="py-2 text-right text-green-400">${p.upper_bound}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* SENTIMENT TAB */}
        {activeTab === 'sentiment' && sentiment && (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-6 text-xl font-bold">Market Sentiment</h2>
            <div className={`mb-6 rounded-xl p-6 text-center ${
              sentiment.color === 'green' ? 'bg-green-900' :
              sentiment.color === 'red'   ? 'bg-red-900'   : 'bg-gray-700'
            }`}>
              <div className="mb-2 text-4xl font-bold">{sentiment.overall_label}</div>
              <div className="text-gray-300">Score: {sentiment.overall_score} | Confidence: {sentiment.confidence}</div>
              <div className="mt-2 text-sm text-gray-400">Based on {sentiment.articles_analyzed} articles</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-green-900 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{sentiment.breakdown?.positive_articles}</div>
                <div className="text-sm text-green-300">Positive</div>
              </div>
              <div className="rounded-lg bg-gray-700 p-4 text-center">
                <div className="text-2xl font-bold text-gray-300">{sentiment.breakdown?.neutral_articles}</div>
                <div className="text-sm text-gray-400">Neutral</div>
              </div>
              <div className="rounded-lg bg-red-900 p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{sentiment.breakdown?.negative_articles}</div>
                <div className="text-sm text-red-300">Negative</div>
              </div>
            </div>
          </div>
        )}

        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
              <Newspaper className="text-indigo-500" /> Latest News
            </h2>
            <div className="space-y-4">
              {news.length === 0 ? (
                <p className="py-8 text-center text-gray-400">No news found</p>
              ) : (
                news.map((article: any, i: number) => (
                  <div key={i} className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-white">{article.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{article.source} • {article.published_at?.slice(0,10)}</p>
                      </div>
                      <span className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${
                        article.sentiment_label === 'Positive' ? 'bg-green-900 text-green-400' :
                        article.sentiment_label === 'Negative' ? 'bg-red-900 text-red-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {article.sentiment_label}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* AI INSIGHTS TAB */}
        {activeTab === 'ai insights' && (
          <div className="space-y-6">
            {!insights ? (
              <div className="rounded-xl border border-gray-700 bg-gray-800 p-12 text-center">
                <Zap size={48} className="mx-auto mb-4 text-indigo-500" />
                <h3 className="mb-2 text-xl font-bold">AI Institutional Analysis</h3>
                <p className="mb-6 text-gray-400">
                  Get hedge-fund level analysis with technical scores,
                  probability forecasts and AI confidence ratings!
                </p>
                <button
                  onClick={loadInsights}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-700"
                >
                  🧠 Run AI Analysis
                </button>
              </div>
            ) : (
              <>
                {/* AI Score Card */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                    <Zap className="text-indigo-500" /> AI Composite Score
                  </h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-6xl font-bold text-indigo-400">
                        {insights.analysis?.composite?.ai_score}
                      </div>
                      <div className="text-gray-400">out of 100</div>
                    </div>
                    <div className={`rounded-xl px-6 py-3 text-3xl font-bold ${
                      insights.analysis?.composite?.rating === 'Strong Buy' ? 'bg-green-900 text-green-400' :
                      insights.analysis?.composite?.rating === 'Buy'        ? 'bg-green-800 text-green-300' :
                      insights.analysis?.composite?.rating === 'Hold'       ? 'bg-yellow-900 text-yellow-400' :
                      insights.analysis?.composite?.rating === 'Sell'       ? 'bg-red-800 text-red-300' :
                      'bg-red-900 text-red-400'
                    }`}>
                      {insights.analysis?.composite?.rating}
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    {insights.analysis?.composite?.reasoning}
                  </p>
                </div>

                {/* Probability Forecast */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
                  <h2 className="mb-4 text-xl font-bold">📊 Probability Forecast</h2>
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-green-900 p-4 text-center">
                      <div className="text-3xl font-bold text-green-400">
                        {insights.analysis?.forecast?.bullish_probability}%
                      </div>
                      <div className="text-green-300">Bullish</div>
                    </div>
                    <div className="rounded-xl bg-gray-700 p-4 text-center">
                      <div className="text-3xl font-bold text-gray-300">
                        {insights.analysis?.forecast?.neutral_probability}%
                      </div>
                      <div className="text-gray-400">Neutral</div>
                    </div>
                    <div className="rounded-xl bg-red-900 p-4 text-center">
                      <div className="text-3xl font-bold text-red-400">
                        {insights.analysis?.forecast?.bearish_probability}%
                      </div>
                      <div className="text-red-300">Bearish</div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-900 p-4">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-400">AI Confidence Score</span>
                      <span className="font-bold text-white">{insights.analysis?.forecast?.confidence_score}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Annual Volatility</span>
                      <span className="font-bold text-white">{insights.analysis?.forecast?.volatility}%</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">{insights.analysis?.forecast?.summary}</p>
                </div>

                {/* Technical Analysis */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
                  <h2 className="mb-4 text-xl font-bold">📈 Technical Analysis</h2>
                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      { label: 'Trend',          value: insights.analysis?.technical?.trend },
                      { label: 'Signal Strength', value: `${insights.analysis?.technical?.signal_strength}/10` },
                      { label: 'RSI',             value: insights.analysis?.technical?.rsi },
                      { label: 'Volume',          value: insights.analysis?.technical?.volume_trend },
                    ].map(item => (
                      <div key={item.label} className="rounded-lg bg-gray-900 p-3">
                        <div className="text-xs text-gray-400">{item.label}</div>
                        <div className="font-bold text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {insights.analysis?.technical?.signals_detected?.map((signal: string, i: number) => (
                      <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        signal.includes('Bullish') || signal.includes('Above') || signal.includes('Golden')
                          ? 'bg-green-900 text-green-300'
                          : signal.includes('Bearish') || signal.includes('Below') || signal.includes('Death') || signal.includes('Overbought')
                          ? 'bg-red-900 text-red-300'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {signal.includes('Bullish') || signal.includes('Above') || signal.includes('Golden') ? '✅' : '⚠️'} {signal}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-400">{insights.analysis?.technical?.explanation}</p>
                </div>

                {/* Risk Factors */}
                <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
                  <h2 className="mb-4 text-xl font-bold">⚠️ Risk Factors</h2>
                  <div className="space-y-2">
                    {insights.risk_factors?.map((risk: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm text-gray-300">
                        ⚠️ {risk}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={loadInsights}
                  className="w-full rounded-xl bg-indigo-600 py-3 font-semibold transition hover:bg-indigo-700"
                >
                  🔄 Refresh Analysis
                </button>
              </>
            )}
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

export default Dashboard;