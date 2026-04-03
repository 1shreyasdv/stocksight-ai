import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStockHistory, getPrediction, getSentimentScore, getAIInsights } from '../services/api';
import toast from 'react-hot-toast';

const STOCKS: any = {
  AAPL: { name:'Apple Inc.',      price:189.40, change:+2.15, high:191.20, cap:'$2.94T', vol:'58.2M' },
  TSLA: { name:'Tesla Inc.',      price:248.20, change:-0.86, high:252.10, cap:'$789B',  vol:'92.1M' },
  NVDA: { name:'NVIDIA Corp.',    price:875.30, change:+3.42, high:881.50, cap:'$2.15T', vol:'43.8M' },
  MSFT: { name:'Microsoft Corp.', price:412.10, change:+1.23, high:415.30, cap:'$3.06T', vol:'22.4M' },
  AMZN: { name:'Amazon.com',      price:182.50, change:+0.94, high:184.20, cap:'$1.89T', vol:'35.6M' },
  GOOGL:{ name:'Alphabet Inc.',   price:175.20, change:-0.32, high:177.10, cap:'$2.18T', vol:'25.3M' },
  META: { name:'Meta Platforms',  price:524.80, change:+1.87, high:528.40, cap:'$1.33T', vol:'18.9M' },
  NFLX: { name:'Netflix Inc.',    price:628.50, change:+0.54, high:632.10, cap:'$270B',  vol:'4.2M'  },
  AMD:  { name:'AMD',             price:178.30, change:+2.11, high:181.20, cap:'$288B',  vol:'52.4M' },
  INTC: { name:'Intel Corp.',     price:42.80,  change:-1.24, high:43.50,  cap:'$181B',  vol:'31.2M' },
  JPM:  { name:'JPMorgan Chase',  price:193.15, change:+0.78, high:194.40, cap:'$556B',  vol:'9.1M'  },
  V:    { name:'Visa Inc.',       price:276.40, change:+0.45, high:278.90, cap:'$569B',  vol:'7.3M'  },
  COIN: { name:'Coinbase Global', price:218.40, change:+4.21, high:222.10, cap:'$54B',   vol:'12.8M' },
  SPOT: { name:'Spotify',         price:385.60, change:+1.92, high:389.20, cap:'$74B',   vol:'3.4M'  },
  PLTR: { name:'Palantir',        price:24.80,  change:+3.12, high:25.20,  cap:'$52B',   vol:'48.2M' },
};

const genChart = (base: number) =>
  Array.from({ length: 30 }, (_, i) => ({
    day: `D${i + 1}`,
    price: +(base * (0.93 + Math.random() * 0.14)).toFixed(2),
  }));

const NAV = [
  { icon:'⊞', label:'Overview',     id:'overview'    },
  { icon:'📈', label:'Market',       id:'market'      },
  { icon:'💼', label:'Portfolio',    id:'portfolio'   },
  { icon:'👁', label:'Watchlist',    id:'watchlist'   },
  { icon:'🔄', label:'Transactions', id:'transactions'},
  { icon:'🤖', label:'AI Predict',   id:'predict'     },
  { icon:'😊', label:'Sentiment',    id:'sentiment'   },
  { icon:'💡', label:'Insights',     id:'insights'    },
  { icon:'📰', label:'News',         id:'news'        },
];

const C = {
  bg:'#0A0A0F', card:'#12121A', border:'#1A1A28',
  green:'#00D68F', red:'#FF4757', orange:'#FF6B35',
  gold:'#FFD700', blue:'#4ECDC4', muted:'rgba(255,255,255,0.4)',
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [page, setPage]             = useState('overview');
  const [ticker, setTicker]         = useState('AAPL');
  const [chartData, setChartData]   = useState(genChart(189.40));
  const [orderType, setOrderType]   = useState<'BUY'|'SELL'>('BUY');
  const [qty, setQty]               = useState(1);
  const [orders, setOrders]         = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [sentiment, setSentiment]   = useState<any>(null);
  const [insights, setInsights]     = useState<any>(null);
  const [loading, setLoading]       = useState(false);
  const [showMenu, setShowMenu]     = useState(false);

  const user  = (() => { try { return JSON.parse(localStorage.getItem('user')||'{}'); } catch { return {}; } })();
  const stock = STOCKS[ticker] || STOCKS.AAPL;
  const fee   = +(stock.price * qty * 0.0005).toFixed(2);
  const total = +(stock.price * qty + fee).toFixed(2);

  useEffect(() => {
    setChartData(genChart(stock.price));
    getStockHistory(ticker).then((d: any) => {
      if (d?.prices?.length) {
        setChartData(d.prices.map((p: any, i: number) => ({ day:`D${i+1}`, price: p.close||p.price||p })));
      }
    }).catch(() => {});
  }, [ticker]);

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const placeOrder = () => {
    if (qty < 1) { toast.error('Enter valid quantity'); return; }
    const o = { id:Date.now(), ticker, type:orderType, qty, price:stock.price, total, time:new Date().toLocaleTimeString(), status:'Completed' };
    const all = [...orders, o];
    setOrders(all);
    localStorage.setItem('stocksight_orders', JSON.stringify(all));
    toast.success(`${orderType} order placed for ${qty} × ${ticker}!`);
  };

  const fetchPrediction = async () => {
    setLoading(true);
    try { const d = await getPrediction(ticker); setPrediction(d); }
    catch {
      setPrediction({ ticker, current_price:stock.price, predicted_price:+(stock.price*1.04).toFixed(2), confidence:78.4, trend:'bullish', accuracy:87.4, rsi:58.3, macd:2.4, ma20:+(stock.price*0.98).toFixed(2), ma50:+(stock.price*0.95).toFixed(2) });
    }
    setLoading(false);
  };

  const fetchSentiment = async () => {
    setLoading(true);
    try { const d = await getSentimentScore(ticker); setSentiment(d); }
    catch {
      const score = +(Math.random()*2-1).toFixed(3);
      setSentiment({ ticker, score, label:score>0.2?'Positive':score<-0.2?'Negative':'Neutral', articles:42,
        news:[
          { headline:`${ticker} reports strong quarterly earnings`, source:'Reuters', sentiment:'positive', score:0.82 },
          { headline:`Analysts raise price target for ${ticker}`, source:'CNBC', sentiment:'positive', score:0.74 },
          { headline:`${ticker} market volatility this week`, source:'Bloomberg', sentiment:'neutral', score:0.12 },
          { headline:`${ticker} faces regulatory challenges`, source:'WSJ', sentiment:'negative', score:-0.45 },
        ],
      });
    }
    setLoading(false);
  };

  const fetchInsights = async () => {
    setLoading(true);
    try { const d = await getAIInsights(ticker); setInsights(d); }
    catch {
      setInsights({ ticker, recommendation:'BUY', summary:`${ticker} shows strong bullish momentum. RSI at 58.3 indicates room to grow. MACD crossed above signal line. Trading above 20-day and 50-day moving averages.`, risk:'Medium', beta:1.24, support:+(stock.price*0.94).toFixed(2), resistance:+(stock.price*1.06).toFixed(2), pe:28.4, confidence:82 });
    }
    setLoading(false);
  };

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20, ...extra,
  });

  const inp: React.CSSProperties = {
    background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`, borderRadius:8,
    padding:'10px 12px', color:'#fff', fontSize:14, outline:'none', fontFamily:'inherit',
    width:'100%', boxSizing:'border-box',
  };

  // ── Overview ─────────────────────────────────────────────────────────────
  const Overview = () => (
    <div style={{ display:'flex', gap:20, height:'100%' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:16, overflowY:'auto' }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {[
            { label:"Today's P&L", value:'+$2,341.50', color:C.green },
            { label:'Watchlist Alerts', value:'3 Triggered', color:C.gold },
            { label:'AI Accuracy', value:'87.4%', color:C.blue },
          ].map(c => (
            <div key={c.label} style={card()}>
              <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>{c.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:c.color, fontFamily:"'JetBrains Mono',monospace" }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div style={card()}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Market Highlights</h3>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            {['AAPL','TSLA'].map(sym => {
              const s = STOCKS[sym]; const up = s.change >= 0;
              return (
                <div key={sym} onClick={() => setTicker(sym)}
                  style={{ background:ticker===sym?`${C.green}15`:'rgba(255,255,255,0.03)', border:`1px solid ${ticker===sym?C.green:C.border}`, borderRadius:12, padding:16, cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <div style={{ width:34,height:34,borderRadius:8,background:up?`${C.green}18`:`${C.red}18`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:up?C.green:C.red }}>{sym[0]}</div>
                    <span style={{ fontWeight:700 }}>{sym}</span>
                  </div>
                  <div style={{ fontSize:22,fontWeight:800,fontFamily:"'JetBrains Mono',monospace" }}>${s.price.toFixed(2)}</div>
                  <div style={{ fontSize:12,color:up?C.green:C.red,marginTop:4 }}>{up?'+':''}{s.change}%</div>
                </div>
              );
            })}
          </div>

          {/* Stock detail */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15 }}>{stock.name}</div>
              <div style={{ fontSize:26,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",marginTop:2 }}>${stock.price.toFixed(2)}</div>
              <div style={{ fontSize:13,color:stock.change>=0?C.green:C.red }}>{stock.change>=0?'+':''}{stock.change}%</div>
            </div>
            <div style={{ display:'flex', gap:4 }}>
              {['1D','1W','1M','3M','1Y'].map(p => (
                <button key={p} style={{ padding:'4px 10px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,color:C.muted,fontSize:12,cursor:'pointer',fontFamily:'inherit' }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${C.border}` }}>
            {[{l:'Day High',v:`$${stock.high}`},{l:'Market Cap',v:stock.cap},{l:'Volume',v:stock.vol}].map(m => (
              <div key={m.l}><div style={{ fontSize:12,color:C.muted,marginBottom:2 }}>{m.l}</div><div style={{ fontWeight:700,fontFamily:"'JetBrains Mono',monospace" }}>{m.v}</div></div>
            ))}
          </div>
          <div style={{ height:200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.3}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                <XAxis dataKey="day" tick={{fill:C.muted,fontSize:11}} tickLine={false} axisLine={false} interval={4}/>
                <YAxis tick={{fill:C.muted,fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}`}/>
                <Tooltip contentStyle={{background:'#1A1A28',border:`1px solid ${C.border}`,borderRadius:10}} itemStyle={{color:C.green}}/>
                <Area type="monotone" dataKey="price" stroke={C.green} strokeWidth={2} fill="url(#cg)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent orders */}
        <div style={card()}>
          <h3 style={{ margin:'0 0 14px',fontSize:15,fontWeight:700 }}>Recent Orders</h3>
          {orders.length === 0
            ? <div style={{ color:C.muted,textAlign:'center',padding:24 }}>No orders yet. Place your first order!</div>
            : orders.slice(-5).reverse().map(o => (
              <div key={o.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'rgba(255,255,255,0.03)',borderRadius:10,marginBottom:8 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:o.type==='BUY'?`${C.green}20`:`${C.red}20`,color:o.type==='BUY'?C.green:C.red }}>{o.type}</span>
                  <span style={{ fontWeight:600 }}>{o.ticker}</span>
                  <span style={{ color:C.muted,fontSize:13 }}>{o.qty} @ ${o.price}</span>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace",fontWeight:700 }}>${o.total.toFixed(2)}</div>
                  <div style={{ fontSize:11,color:C.muted }}>{o.time}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Order Panel */}
      <div style={{ width:260,flexShrink:0,display:'flex',flexDirection:'column',gap:14,overflowY:'auto' }}>
        <div style={card()}>
          <h3 style={{ margin:'0 0 14px',fontSize:15,fontWeight:700 }}>Stock Order</h3>
          <div style={{ display:'flex',background:'rgba(255,255,255,0.05)',borderRadius:10,padding:3,gap:3,marginBottom:14 }}>
            {(['BUY','SELL'] as const).map(t => (
              <button key={t} onClick={() => setOrderType(t)}
                style={{ flex:1,padding:'8px',borderRadius:8,border:'none',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit',background:orderType===t?(t==='BUY'?C.green:C.red):'transparent',color:orderType===t?'#000':'rgba(255,255,255,0.5)' }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:12,color:C.muted,marginBottom:5 }}>Stock</div>
            <select value={ticker} onChange={e => setTicker(e.target.value)} style={{ ...inp, cursor:'pointer' }}>
              {Object.keys(STOCKS).map(s => <option key={s} value={s}>{s} — {STOCKS[s].name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:12,color:C.muted,marginBottom:5 }}>Price (USD)</div>
            <input type="number" value={stock.price} readOnly style={{ ...inp,color:C.green }}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12,color:C.muted,marginBottom:5 }}>Quantity</div>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:34,height:34,borderRadius:8,background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>−</button>
              <input type="number" value={qty} onChange={e => setQty(Math.max(1,+e.target.value))} style={{ ...inp,textAlign:'center' }}/>
              <button onClick={() => setQty(q => q+1)} style={{ width:34,height:34,borderRadius:8,background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>+</button>
            </div>
          </div>
          {[{l:'Last Traded',v:`$${stock.price.toFixed(2)}`},{l:'Fee (0.05%)',v:`$${fee}`},{l:'Total',v:`$${total}`}].map(r => (
            <div key={r.l} style={{ display:'flex',justifyContent:'space-between',fontSize:13,padding:'5px 0',borderBottom:`1px solid ${C.border}` }}>
              <span style={{ color:C.muted }}>{r.l}</span>
              <span style={{ fontWeight:600,fontFamily:"'JetBrains Mono',monospace" }}>{r.v}</span>
            </div>
          ))}
          <button onClick={placeOrder} style={{ width:'100%',marginTop:14,padding:'13px',borderRadius:12,border:'none',background:C.orange,color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:'inherit' }}>
            Place {orderType} Order
          </button>
        </div>
        <div style={card()}>
          <h3 style={{ margin:'0 0 12px',fontSize:14,fontWeight:700 }}>Live Prices</h3>
          {Object.entries(STOCKS).slice(0,8).map(([sym,s]:any) => (
            <div key={sym} onClick={() => setTicker(sym)} style={{ display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border}`,cursor:'pointer' }}>
              <span style={{ fontWeight:700,color:C.green,fontSize:13 }}>{sym}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:13 }}>${s.price.toFixed(2)}</span>
              <span style={{ fontSize:12,color:s.change>=0?C.green:C.red,fontWeight:600 }}>{s.change>=0?'+':''}{s.change}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Market ───────────────────────────────────────────────────────────────
  const Market = () => (
    <div style={card()}>
      <h2 style={{ margin:'0 0 16px',fontSize:18,fontWeight:800 }}>Market</h2>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
            {['Symbol','Company','Price','Change','Market Cap','Volume'].map(h => (
              <th key={h} style={{ padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {Object.entries(STOCKS).map(([sym,s]:any) => (
              <tr key={sym} style={{ borderBottom:`1px solid ${C.border}`,cursor:'pointer' }}
                onClick={() => { setTicker(sym); setPage('overview'); }}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.02)')}
                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                <td style={{ padding:'12px 14px',fontWeight:700,color:C.green }}>{sym}</td>
                <td style={{ padding:'12px 14px',color:'rgba(255,255,255,0.7)',fontSize:13 }}>{s.name}</td>
                <td style={{ padding:'12px 14px',fontFamily:"'JetBrains Mono',monospace",fontWeight:700 }}>${s.price.toFixed(2)}</td>
                <td style={{ padding:'12px 14px',color:s.change>=0?C.green:C.red,fontWeight:600 }}>{s.change>=0?'+':''}{s.change}%</td>
                <td style={{ padding:'12px 14px',color:'rgba(255,255,255,0.7)',fontSize:13 }}>{s.cap}</td>
                <td style={{ padding:'12px 14px',color:C.muted,fontSize:13 }}>{s.vol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Predict ──────────────────────────────────────────────────────────────
  const Predict = () => (
    <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
      <div style={card()}>
        <div style={{ display:'flex',gap:12,alignItems:'center' }}>
          <select value={ticker} onChange={e => setTicker(e.target.value)} style={{ ...inp,width:280 }}>
            {Object.keys(STOCKS).map(s => <option key={s} value={s}>{s} — {STOCKS[s].name}</option>)}
          </select>
          <button onClick={fetchPrediction} disabled={loading}
            style={{ padding:'10px 24px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#FF6B35,#FF4500)',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit',opacity:loading?0.7:1 }}>
            {loading ? 'Analyzing...' : '🤖 Generate Prediction'}
          </button>
        </div>
      </div>
      {!prediction
        ? <div style={{ textAlign:'center',padding:60,color:C.muted }}><div style={{ fontSize:48,marginBottom:12 }}>🤖</div><div style={{ fontSize:18,color:'#fff',fontWeight:700,marginBottom:8 }}>AI Stock Predictions</div><div>Select a stock and click Generate Prediction</div></div>
        : <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
            <div style={card()}>
              <div style={{ fontSize:12,color:C.muted,marginBottom:4 }}>Current Price</div>
              <div style={{ fontSize:32,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",marginBottom:16 }}>${prediction.current_price?.toFixed(2)}</div>
              <div style={{ fontSize:12,color:C.muted,marginBottom:4 }}>7-Day Prediction</div>
              <div style={{ fontSize:28,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:prediction.predicted_price>prediction.current_price?C.green:C.red }}>
                ${prediction.predicted_price?.toFixed(2)} {prediction.predicted_price>prediction.current_price?'↑':'↓'}
              </div>
              <div style={{ display:'flex',gap:8,marginTop:16,flexWrap:'wrap' }}>
                {[{l:prediction.trend?.toUpperCase(),c:C.green},{l:`${prediction.confidence?.toFixed(0)}% Confidence`,c:C.blue},{l:`${prediction.accuracy?.toFixed(0)}% Accuracy`,c:C.gold}].map(b => (
                  <span key={b.l} style={{ padding:'3px 12px',borderRadius:20,fontSize:12,fontWeight:700,background:`${b.c}20`,color:b.c }}>{b.l}</span>
                ))}
              </div>
            </div>
            <div style={card()}>
              <h3 style={{ margin:'0 0 14px',fontSize:14,fontWeight:700 }}>Technical Indicators</h3>
              {[{l:'RSI (14)',v:prediction.rsi?.toFixed(1),c:C.gold},{l:'MACD',v:prediction.macd?.toFixed(2),c:C.green},{l:'MA 20',v:`$${prediction.ma20?.toFixed(2)}`,c:'#fff'},{l:'MA 50',v:`$${prediction.ma50?.toFixed(2)}`,c:'#fff'}].map(r => (
                <div key={r.l} style={{ display:'flex',justifyContent:'space-between',fontSize:13,padding:'7px 0',borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ color:C.muted }}>{r.l}</span>
                  <span style={{ fontWeight:700,color:r.c,fontFamily:"'JetBrains Mono',monospace" }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
      }
    </div>
  );

  // ── Sentiment ────────────────────────────────────────────────────────────
  const Sentiment = () => (
    <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
      <div style={card()}>
        <div style={{ display:'flex',gap:12,alignItems:'center' }}>
          <select value={ticker} onChange={e => setTicker(e.target.value)} style={{ ...inp,width:280 }}>
            {Object.keys(STOCKS).map(s => <option key={s} value={s}>{s} — {STOCKS[s].name}</option>)}
          </select>
          <button onClick={fetchSentiment} disabled={loading}
            style={{ padding:'10px 24px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#FF6B35,#FF4500)',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit',opacity:loading?0.7:1 }}>
            {loading ? 'Analyzing...' : '😊 Analyze Sentiment'}
          </button>
        </div>
      </div>
      {!sentiment
        ? <div style={{ textAlign:'center',padding:60,color:C.muted }}><div style={{ fontSize:48,marginBottom:12 }}>😊</div><div style={{ fontSize:18,color:'#fff',fontWeight:700,marginBottom:8 }}>Sentiment Analysis</div><div>Select a stock and analyze market sentiment</div></div>
        : <>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
              <div style={{ ...card(),textAlign:'center' }}>
                <div style={{ fontSize:48,fontWeight:900,color:sentiment.score>0?C.green:sentiment.score<0?C.red:C.gold,marginBottom:8 }}>{sentiment.score?.toFixed(3)}</div>
                <div style={{ fontSize:16,fontWeight:700,marginBottom:4 }}>{sentiment.label}</div>
                <div style={{ color:C.muted,fontSize:13 }}>{sentiment.articles} articles analyzed</div>
              </div>
              <div style={card()}>
                {[{l:'Score',v:sentiment.score?.toFixed(3),c:sentiment.score>0?C.green:C.red},{l:'Positive',v:Math.floor(sentiment.articles*0.55),c:C.green},{l:'Negative',v:Math.floor(sentiment.articles*0.2),c:C.red},{l:'Neutral',v:Math.floor(sentiment.articles*0.25),c:C.gold}].map(r => (
                  <div key={r.l} style={{ display:'flex',justifyContent:'space-between',fontSize:13,padding:'7px 0',borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ color:C.muted }}>{r.l}</span>
                    <span style={{ fontWeight:700,color:r.c }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={card()}>
              <h3 style={{ margin:'0 0 14px',fontSize:15,fontWeight:700 }}>Recent News</h3>
              {sentiment.news?.map((n:any,i:number) => (
                <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'12px 0',borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ flex:1,marginRight:16 }}>
                    <div style={{ fontSize:14,fontWeight:500,marginBottom:4 }}>{n.headline}</div>
                    <div style={{ fontSize:12,color:C.muted }}>{n.source}</div>
                  </div>
                  <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0,background:n.sentiment==='positive'?`${C.green}20`:n.sentiment==='negative'?`${C.red}20`:`${C.gold}20`,color:n.sentiment==='positive'?C.green:n.sentiment==='negative'?C.red:C.gold }}>
                    {n.sentiment}
                  </span>
                </div>
              ))}
            </div>
          </>
      }
    </div>
  );

  // ── Insights ─────────────────────────────────────────────────────────────
  const Insights = () => (
    <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
      <div style={card()}>
        <div style={{ display:'flex',gap:12,alignItems:'center' }}>
          <select value={ticker} onChange={e => setTicker(e.target.value)} style={{ ...inp,width:280 }}>
            {Object.keys(STOCKS).map(s => <option key={s} value={s}>{s} — {STOCKS[s].name}</option>)}
          </select>
          <button onClick={fetchInsights} disabled={loading}
            style={{ padding:'10px 24px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#FF6B35,#FF4500)',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit',opacity:loading?0.7:1 }}>
            {loading ? 'Analyzing...' : '💡 Generate Insights'}
          </button>
        </div>
      </div>
      {!insights
        ? <div style={{ textAlign:'center',padding:60,color:C.muted }}><div style={{ fontSize:48,marginBottom:12 }}>💡</div><div style={{ fontSize:18,color:'#fff',fontWeight:700,marginBottom:8 }}>AI Insights</div><div>Get AI-powered technical analysis and recommendations</div></div>
        : <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
            <div style={card()}>
              <h3 style={{ margin:'0 0 12px',fontSize:15,fontWeight:700 }}>📊 Technical Analysis</h3>
              <p style={{ fontSize:13,lineHeight:1.8,color:'rgba(255,255,255,0.75)',marginBottom:16 }}>{insights.summary}</p>
              <div style={{ display:'flex',gap:16 }}>
                <div><div style={{ fontSize:11,color:C.muted }}>Support</div><div style={{ fontFamily:"'JetBrains Mono',monospace",color:C.green,fontWeight:700 }}>${insights.support}</div></div>
                <div><div style={{ fontSize:11,color:C.muted }}>Resistance</div><div style={{ fontFamily:"'JetBrains Mono',monospace",color:C.red,fontWeight:700 }}>${insights.resistance}</div></div>
              </div>
            </div>
            <div style={{ ...card(),background:`${C.green}0A`,border:`1px solid ${C.green}33`,textAlign:'center' }}>
              <h3 style={{ margin:'0 0 16px',fontSize:15,fontWeight:700 }}>🎯 Recommendation</h3>
              <div style={{ fontSize:52,fontWeight:900,color:C.green,marginBottom:8 }}>{insights.recommendation}</div>
              <div style={{ color:C.muted,fontSize:13,marginBottom:12 }}>Confidence: <b style={{ color:'#fff' }}>{insights.confidence}%</b></div>
              <div style={{ fontSize:11,color:'rgba(255,255,255,0.3)',fontStyle:'italic' }}>⚠️ Not financial advice</div>
            </div>
          </div>
      }
    </div>
  );

  const Simple = ({ title, icon }: { title:string; icon:string }) => (
    <div style={{ textAlign:'center',padding:80,color:C.muted }}>
      <div style={{ fontSize:48,marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:22,color:'#fff',fontWeight:700,marginBottom:8 }}>{title}</div>
      <div>This section is coming soon</div>
    </div>
  );

  const renderPage = () => {
    switch(page) {
      case 'overview':     return <Overview/>;
      case 'market':       return <Market/>;
      case 'predict':      return <Predict/>;
      case 'sentiment':    return <Sentiment/>;
      case 'insights':     return <Insights/>;
      case 'portfolio':    return <Simple title="Portfolio" icon="💼"/>;
      case 'watchlist':    return <Simple title="Watchlist" icon="👁"/>;
      case 'transactions': return <Simple title="Transactions" icon="🔄"/>;
      case 'news':         return <Simple title="News" icon="📰"/>;
      default:             return <Overview/>;
    }
  };

  return (
    <div style={{ display:'flex',height:'100vh',background:C.bg,color:'#fff',fontFamily:"'DM Sans',sans-serif",overflow:'hidden' }}>

      {/* SIDEBAR */}
      <aside style={{ width:210,minWidth:210,background:'#0D0D15',borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',padding:'16px 10px',overflowY:'auto',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'0 8px 20px',borderBottom:`1px solid ${C.border}`,marginBottom:12 }}>
          <div style={{ width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#00D68F,#00B377)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>📈</div>
          <div>
            <div style={{ fontWeight:700,fontSize:13 }}>StockSight AI</div>
            <div style={{ fontSize:10,color:C.muted }}>Smart Decisions</div>
          </div>
        </div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:10,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:500,marginBottom:2,background:page===n.id?'rgba(0,214,143,0.1)':'transparent',color:page===n.id?'#00D68F':'rgba(255,255,255,0.5)',borderLeft:`3px solid ${page===n.id?'#00D68F':'transparent'}` }}>
            <span style={{ fontSize:15 }}>{n.icon}</span>{n.label}
          </button>
        ))}
        <div style={{ flex:1 }}/>
        <button onClick={logout} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px',borderRadius:10,background:'rgba(255,71,87,0.1)',border:'1px solid rgba(255,71,87,0.2)',color:'#FF4757',cursor:'pointer',fontSize:13,fontWeight:600,width:'100%',fontFamily:'inherit' }}>
          ⏻ Logout
        </button>
      </aside>

      {/* MAIN */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>

        {/* TOPBAR */}
        <header style={{ height:58,background:'#0D0D15',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',padding:'0 20px',gap:16,flexShrink:0 }}>
          <div style={{ flex:1,fontSize:16,fontWeight:700,color:'rgba(255,255,255,0.6)' }}>
            {NAV.find(n=>n.id===page)?.label||'Overview'}
          </div>
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowMenu(!showMenu)}
              style={{ display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.04)',border:`1px solid ${C.border}`,borderRadius:10,padding:'6px 10px',cursor:'pointer',color:'#fff',fontFamily:'inherit' }}>
              <div style={{ width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#00D68F,#00B377)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12 }}>
                {String(user?.full_name||'U')[0].toUpperCase()}
              </div>
              <span style={{ fontSize:13,fontWeight:600 }}>{user?.full_name||'Trader'}</span>
              <span style={{ fontSize:10,color:C.muted }}>▼</span>
            </button>
            {showMenu && (
              <div style={{ position:'absolute',right:0,top:'110%',background:'#12121A',border:`1px solid ${C.border}`,borderRadius:10,minWidth:160,zIndex:999 }}
                onMouseLeave={() => setShowMenu(false)}>
                <div style={{ padding:'10px 14px',fontSize:12,color:C.muted,borderBottom:`1px solid ${C.border}` }}>{user?.email||''}</div>
                <button onClick={logout} style={{ display:'block',width:'100%',padding:'10px 14px',color:'#FF4757',background:'none',border:'none',textAlign:'left',cursor:'pointer',fontSize:13,fontFamily:'inherit' }}>⏻ Logout</button>
              </div>
            )}
          </div>
        </header>

        {/* TICKER */}
        <div style={{ background:'#0D0D15',borderBottom:`1px solid ${C.border}`,padding:'6px 0',overflow:'hidden',flexShrink:0 }}>
          <div style={{ display:'flex',gap:24,animation:'ticker 40s linear infinite',width:'max-content',paddingLeft:16 }}>
            {[...Object.entries(STOCKS),...Object.entries(STOCKS)].map(([sym,s]:any,i) => (
              <div key={i} onClick={() => setTicker(sym)} style={{ display:'flex',alignItems:'center',gap:6,cursor:'pointer',whiteSpace:'nowrap' }}>
                <span style={{ width:22,height:22,borderRadius:'50%',background:s.change>=0?`${C.green}18`:`${C.red}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:s.change>=0?C.green:C.red }}>{sym.slice(0,2)}</span>
                <span style={{ fontWeight:700,fontSize:12 }}>{sym}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'rgba(255,255,255,0.7)' }}>${s.price.toFixed(2)}</span>
                <span style={{ fontSize:11,fontWeight:600,color:s.change>=0?C.green:C.red }}>{s.change>=0?'+':''}{s.change}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* PAGE */}
        <div style={{ flex:1,overflowY:'auto',padding:20 }}>
          {renderPage()}
        </div>
      </div>

      <style>{`
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0A0A0F}
        ::-webkit-scrollbar-thumb{background:#1A1A28;border-radius:4px}
        select option{background:#12121A;color:#fff}
        input::placeholder{color:rgba(255,255,255,0.25)}
      `}</style>
    </div>
  );
}