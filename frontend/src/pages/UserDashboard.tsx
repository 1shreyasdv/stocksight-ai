import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getStockOverview, getStockHistory, getNewsSentiment, getSentimentScore } from '../services/api';
import toast from 'react-hot-toast';

const TICKERS = ['AAPL','TSLA','NVDA','MSFT','AMZN','GOOGL','META','NFLX','AMD','INTC','ORCL','CRM','ADBE','PYPL','UBER','LYFT','SNAP','SPOT','COIN','PLTR','ARM','SMCI','MU','QCOM','AVGO'];

const MOCK: any = {
  AAPL:{current_price:189.40,change_percent:2.15,day_high:191.20,market_cap:2940000000000,week_52_high:199.62,pe_ratio:28.5,company_name:'Apple Inc.'},
  TSLA:{current_price:248.20,change_percent:-0.86,day_high:252.10,market_cap:789000000000,week_52_high:271.00,pe_ratio:55.2,company_name:'Tesla Inc.'},
  NVDA:{current_price:875.30,change_percent:3.42,day_high:881.50,market_cap:2150000000000,week_52_high:974.00,pe_ratio:68.1,company_name:'NVIDIA Corp.'},
  MSFT:{current_price:412.10,change_percent:1.23,day_high:415.30,market_cap:3060000000000,week_52_high:430.82,pe_ratio:35.4,company_name:'Microsoft Corp.'},
  AMZN:{current_price:182.50,change_percent:0.94,day_high:184.20,market_cap:1890000000000,week_52_high:201.20,pe_ratio:42.3,company_name:'Amazon.com Inc.'},
  GOOGL:{current_price:175.20,change_percent:-0.32,day_high:177.10,market_cap:2180000000000,week_52_high:193.31,pe_ratio:24.1,company_name:'Alphabet Inc.'},
  META:{current_price:524.80,change_percent:1.87,day_high:528.40,market_cap:1330000000000,week_52_high:589.35,pe_ratio:26.8,company_name:'Meta Platforms'},
  NFLX:{current_price:628.50,change_percent:0.54,day_high:632.10,market_cap:270000000000,week_52_high:700.99,pe_ratio:44.2,company_name:'Netflix Inc.'},
  AMD:{current_price:178.30,change_percent:2.11,day_high:181.20,market_cap:288000000000,week_52_high:227.30,pe_ratio:38.5,company_name:'Advanced Micro Devices'},
  INTC:{current_price:42.80,change_percent:-1.24,day_high:43.50,market_cap:181000000000,week_52_high:51.28,pe_ratio:12.3,company_name:'Intel Corp.'},
  ORCL:{current_price:128.40,change_percent:0.78,day_high:129.80,market_cap:352000000000,week_52_high:164.50,pe_ratio:31.2,company_name:'Oracle Corp.'},
  CRM:{current_price:298.70,change_percent:1.45,day_high:301.20,market_cap:289000000000,week_52_high:318.71,pe_ratio:52.4,company_name:'Salesforce Inc.'},
  ADBE:{current_price:478.20,change_percent:-0.63,day_high:482.10,market_cap:212000000000,week_52_high:634.46,pe_ratio:28.9,company_name:'Adobe Inc.'},
  PYPL:{current_price:68.40,change_percent:1.12,day_high:69.20,market_cap:72000000000,week_52_high:82.16,pe_ratio:15.8,company_name:'PayPal Holdings'},
  UBER:{current_price:78.90,change_percent:2.34,day_high:79.80,market_cap:163000000000,week_52_high:87.00,pe_ratio:48.2,company_name:'Uber Technologies'},
  LYFT:{current_price:14.20,change_percent:-0.84,day_high:14.60,market_cap:5800000000,week_52_high:20.56,pe_ratio:22.1,company_name:'Lyft Inc.'},
  SNAP:{current_price:11.80,change_percent:3.51,day_high:12.10,market_cap:19000000000,week_52_high:17.90,pe_ratio:0,company_name:'Snap Inc.'},
  SPOT:{current_price:385.60,change_percent:1.92,day_high:389.20,market_cap:74000000000,week_52_high:436.28,pe_ratio:0,company_name:'Spotify Technology'},
  COIN:{current_price:218.40,change_percent:4.21,day_high:222.10,market_cap:54000000000,week_52_high:283.00,pe_ratio:28.4,company_name:'Coinbase Global'},
  PLTR:{current_price:24.80,change_percent:3.12,day_high:25.20,market_cap:52000000000,week_52_high:31.25,pe_ratio:180.2,company_name:'Palantir Technologies'},
  ARM:{current_price:128.60,change_percent:2.84,day_high:130.10,market_cap:134000000000,week_52_high:188.75,pe_ratio:92.4,company_name:'ARM Holdings'},
  SMCI:{current_price:892.40,change_percent:-1.24,day_high:902.10,market_cap:52000000000,week_52_high:1229.00,pe_ratio:28.1,company_name:'Super Micro Computer'},
  MU:{current_price:118.20,change_percent:1.84,day_high:119.80,market_cap:131000000000,week_52_high:157.54,pe_ratio:22.4,company_name:'Micron Technology'},
  QCOM:{current_price:168.40,change_percent:0.92,day_high:170.20,market_cap:188000000000,week_52_high:230.63,pe_ratio:18.2,company_name:'Qualcomm Inc.'},
  AVGO:{current_price:1342.80,change_percent:1.54,day_high:1352.40,market_cap:624000000000,week_52_high:1438.17,pe_ratio:32.8,company_name:'Broadcom Inc.'},
};

// Share orders globally so admin can see them
const SHARED_ORDERS_KEY = 'stocksight_orders';
const SHARED_USERS_KEY = 'stocksight_users';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Overview');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [orderType, setOrderType] = useState<'BUY'|'SELL'>('BUY');
  const [orderQty, setOrderQty] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>({full_name:'Trader',email:''});
  const [stockData, setStockData] = useState<any>(MOCK);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL','TSLA','NVDA','MSFT','AMZN']);
  const [searchTicker, setSearchTicker] = useState('');
  
  const [sentimentData, setSentimentData] = useState<any>({});
  const [insightStock, setInsightStock] = useState('AAPL');
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightData, setInsightData] = useState<any>(null);
  

  useEffect(()=>{
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        // Save user to shared storage for admin
        const existingUsers = JSON.parse(localStorage.getItem(SHARED_USERS_KEY)||'[]');
        const already = existingUsers.find((u:any)=>u.email===parsed.email);
        if (!already) {
          existingUsers.push({...parsed, joined: new Date().toISOString().slice(0,10), trades:0, status:'Active'});
          localStorage.setItem(SHARED_USERS_KEY, JSON.stringify(existingUsers));
        }
      }
      // Load saved orders
      const savedOrders = JSON.parse(localStorage.getItem(SHARED_ORDERS_KEY)||'[]');
      const userData2 = localStorage.getItem('user');
      if (userData2) {
        const u = JSON.parse(userData2);
        setOrders(savedOrders.filter((o:any)=>o.userEmail===u.email));
      }
    } catch {}
    loadRealStockData();
    loadChartData('AAPL');
  },[]);

  useEffect(()=>{ loadChartData(selectedStock); },[selectedStock]);

  const loadRealStockData = async () => {
    setLoadingStocks(true);
    const results: any = {...MOCK};
    try { await fetch(`${process.env.REACT_APP_API_BASE_URL}/`); } catch {}
    for (const t of TICKERS) {
      try {
        const data = await getStockOverview(t);
        if (data?.current_price) results[t] = {...MOCK[t], ...data};
      } catch {}
    }
    setStockData(results);
    setLoadingStocks(false);
  };

  const loadChartData = async (ticker: string) => {
    setLoadingChart(true);
    try {
      const data = await getStockHistory(ticker,'1mo');
      if (data?.data?.length>0) {
        setChartData(data.data.slice(-30));
      } else throw new Error('no data');
    } catch {
      const base = MOCK[ticker]?.current_price||100;
      setChartData(Array.from({length:30},(_,i)=>({
        date:`03/${String(i+1).padStart(2,'0')}`,
        close: +(base*(0.93+Math.random()*0.14)).toFixed(2)
      })));
    } finally { setLoadingChart(false); }
  };

  const loadInsight = async (ticker: string) => {
    setInsightLoading(true);
    setInsightStock(ticker);
    try {
      const [sent, news] = await Promise.all([
        getSentimentScore(ticker),
        getNewsSentiment(ticker)
      ]);
      setInsightData({sentiment:sent, news:news?.news||[]});
    } catch {
      setInsightData({sentiment:null, news:[]});
    } finally { setInsightLoading(false); }
  };

  const placeOrder = () => {
    if (!orderQty||parseFloat(orderQty)<=0) { toast.error('Enter valid quantity!'); return; }
    const price = stockData[selectedStock]?.current_price||MOCK[selectedStock]?.current_price||0;
    const total = (price*parseFloat(orderQty)).toFixed(2);
    const newOrder = {
      id: Date.now(),
      ticker: selectedStock,
      type: orderType,
      qty: orderQty,
      price: `$${price.toFixed(2)}`,
      total: `$${total}`,
      time: new Date().toLocaleTimeString(),
      date: new Date().toISOString().slice(0,10),
      status: 'Filled',
      userEmail: user.email,
      userName: user.full_name
    };
    const newOrders = [newOrder, ...orders];
    setOrders(newOrders);
    // Save to shared storage for admin
    const allOrders = JSON.parse(localStorage.getItem(SHARED_ORDERS_KEY)||'[]');
    allOrders.unshift(newOrder);
    localStorage.setItem(SHARED_ORDERS_KEY, JSON.stringify(allOrders));
    // Update user trade count
    const users = JSON.parse(localStorage.getItem(SHARED_USERS_KEY)||'[]');
    const idx = users.findIndex((u:any)=>u.email===user.email);
    if (idx>=0) { users[idx].trades = (users[idx].trades||0)+1; localStorage.setItem(SHARED_USERS_KEY, JSON.stringify(users)); }
    toast.success(`✅ ${orderType} ${orderQty} ${selectedStock} @ $${price.toFixed(2)}`);
    setOrderQty('');
  };

  const addToWatchlist = (ticker: string) => {
    if (!watchlist.includes(ticker)) { setWatchlist([...watchlist,ticker]); toast.success(`${ticker} added!`); }
    else toast.error(`${ticker} already in watchlist!`);
  };

  const removeFromWatchlist = (ticker: string) => {
    setWatchlist(watchlist.filter(t=>t!==ticker));
    toast.success(`${ticker} removed!`);
  };

  const menuItems = [
    {icon:'📊',label:'Overview'},{icon:'📈',label:'Market'},
    {icon:'💼',label:'Portfolio'},{icon:'⭐',label:'Watchlist'},
    {icon:'💳',label:'Transactions'},{icon:'🧠',label:'AI Insights'},
    {icon:'📄',label:'Reports'},{icon:'📰',label:'News'},{icon:'⚙️',label:'Settings'},
  ];

  const stock = stockData[selectedStock]||MOCK[selectedStock];
  const totalValue = watchlist.reduce((s,t)=>s+(stockData[t]?.current_price||MOCK[t]?.current_price||0),0);
  const card: React.CSSProperties = {background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)',border:'1px solid #f1f5f9'};
  const th: React.CSSProperties = {padding:'10px 12px',textAlign:'left',color:'#94a3b8',fontWeight:600,fontSize:'0.8rem',borderBottom:'1px solid #f1f5f9'};
  const td: React.CSSProperties = {padding:'11px 12px',borderBottom:'1px solid #f8fafc',fontSize:'0.85rem'};

  const renderContent = () => {

    /* ── OVERVIEW ── */
    if (activeMenu==='Overview') return (
      <div style={{display:'flex',gap:'24px'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:'20px'}}>
          {/* Highlights */}
          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <h2 style={{margin:0,fontSize:'1rem',fontWeight:800}}>⭐ Market Highlights</h2>
              <span style={{fontSize:'0.75rem',color:'#94a3b8'}}>{loadingStocks?'Loading live data...':'Live data'}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
              {['AAPL','TSLA','NVDA'].map(t=>{
                const d=stockData[t]||MOCK[t];
                return (
                  <div key={t} onClick={()=>{setSelectedStock(t);}} style={{padding:'16px',borderRadius:'12px',border:`2px solid ${selectedStock===t?'#6366f1':'#f1f5f9'}`,cursor:'pointer',background:selectedStock===t?'#f0f0ff':'#fafafa',transition:'all 0.2s'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                      <span style={{fontWeight:800}}>{t}</span>
                      <span>{t==='AAPL'?'🍎':t==='TSLA'?'⚡':'🖥️'}</span>
                    </div>
                    <div style={{fontSize:'1.3rem',fontWeight:800}}>${(d.current_price||0).toFixed(2)}</div>
                    <div style={{fontSize:'0.8rem',color:(d.change_percent||0)>=0?'#10b981':'#ef4444',fontWeight:600}}>
                      {(d.change_percent||0)>=0?'▲':'▼'} {Math.abs(d.change_percent||0).toFixed(2)}%
                    </div>
                    <div style={{fontSize:'0.7rem',color:'#94a3b8',marginTop:'4px'}}>{d.company_name||t}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart */}
          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'12px'}}>
              <div>
                <h2 style={{margin:0,fontSize:'1rem',fontWeight:800}}>{selectedStock} — {(stock?.company_name)||selectedStock}</h2>
                <div style={{fontSize:'1.5rem',fontWeight:800,marginTop:'4px'}}>
                  ${(stock?.current_price||0).toFixed(2)}
                  <span style={{fontSize:'0.9rem',marginLeft:'8px',color:(stock?.change_percent||0)>=0?'#10b981':'#ef4444',fontWeight:600}}>
                    {(stock?.change_percent||0)>=0?'▲':'▼'} {Math.abs(stock?.change_percent||0).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {['AAPL','TSLA','NVDA','MSFT','AMZN'].map(t=>(
                  <button key={t} onClick={()=>setSelectedStock(t)} style={{padding:'5px 10px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'0.78rem',fontWeight:600,background:selectedStock===t?'#6366f1':'#f1f5f9',color:selectedStock===t?'white':'#64748b'}}>{t}</button>
                ))}
              </div>
            </div>
            {loadingChart?(
              <div style={{height:'220px',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8'}}>⏳ Loading chart...</div>
            ):(
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData.map((d:any)=>({date:d.date?.slice(5)||d.date,price:parseFloat(d.close)||d.price||0}))}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fill:'#94a3b8',fontSize:11}} />
                  <YAxis tick={{fill:'#94a3b8',fontSize:11}} domain={['auto','auto']} />
                  <Tooltip contentStyle={{background:'white',border:'1px solid #e2e8f0',borderRadius:'8px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginTop:'16px'}}>
              {[
                {label:'Day High',  value:`$${(stock?.day_high||stock?.current_price||0).toFixed(2)}`},
                {label:'Market Cap',value:stock?.market_cap?`$${(stock.market_cap/1e12).toFixed(2)}T`:'N/A'},
                {label:'52W High',  value:`$${(stock?.week_52_high||0).toFixed(2)}`},
                {label:'P/E Ratio', value:(stock?.pe_ratio||0).toFixed(1)},
              ].map(s=>(
                <div key={s.label} style={{padding:'10px',background:'#f8fafc',borderRadius:'10px'}}>
                  <div style={{fontSize:'0.7rem',color:'#94a3b8',fontWeight:600}}>{s.label}</div>
                  <div style={{fontWeight:700,fontSize:'0.9rem',marginTop:'2px'}}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
              <button onClick={()=>navigate(`/dashboard/${selectedStock}`)} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #e2e8f0',background:'white',color:'#6366f1',fontWeight:600,cursor:'pointer'}}>
                📊 Full AI Analysis →
              </button>
              <button onClick={()=>addToWatchlist(selectedStock)} style={{padding:'10px 16px',borderRadius:'10px',border:'1px solid #fef9c3',background:'#fef9c3',color:'#ca8a04',fontWeight:600,cursor:'pointer'}}>
                ⭐ Watch
              </button>
            </div>
          </div>

          {/* Orders */}
          <div style={card}>
            <h3 style={{margin:'0 0 16px',fontSize:'1rem',fontWeight:800}}>📋 Recent Orders ({orders.length})</h3>
            {orders.length===0?(
              <div style={{textAlign:'center',padding:'24px',color:'#94a3b8'}}>
                <div style={{fontSize:'40px',marginBottom:'8px'}}>📭</div>
                <p style={{margin:0}}>No orders yet. Use the order panel to buy/sell!</p>
              </div>
            ):(
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr>{['Ticker','Type','Qty','Price','Total','Time','Status'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {orders.slice(0,10).map((o,i)=>(
                      <tr key={i}>
                        <td style={{...td,fontWeight:700,color:'#6366f1'}}>{o.ticker}</td>
                        <td style={td}><span style={{padding:'3px 8px',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,background:o.type==='BUY'?'#dcfce7':'#fee2e2',color:o.type==='BUY'?'#16a34a':'#dc2626'}}>{o.type}</span></td>
                        <td style={td}>{o.qty}</td>
                        <td style={{...td,color:'#64748b'}}>{o.price}</td>
                        <td style={{...td,fontWeight:700}}>{o.total}</td>
                        <td style={{...td,color:'#94a3b8'}}>{o.time}</td>
                        <td style={td}><span style={{color:'#10b981',fontWeight:600,fontSize:'0.8rem'}}>✅ {o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{width:'280px',flexShrink:0,display:'flex',flexDirection:'column',gap:'16px'}}>
          {/* Portfolio Value */}
          <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'16px',padding:'20px',color:'white'}}>
            <p style={{margin:'0 0 4px',fontSize:'0.75rem',opacity:0.8,fontWeight:600}}>PORTFOLIO VALUE</p>
            <p style={{margin:'0 0 4px',fontSize:'2rem',fontWeight:800}}>${totalValue.toFixed(2)}</p>
            <p style={{margin:'0 0 16px',fontSize:'0.8rem',opacity:0.7}}>{watchlist.length} stocks tracked</p>
            <button onClick={()=>setActiveMenu('Portfolio')} style={{width:'100%',padding:'10px',borderRadius:'10px',background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)',color:'white',fontWeight:700,cursor:'pointer',fontSize:'0.85rem'}}>
              View Portfolio →
            </button>
          </div>

          {/* Order Panel */}
          <div style={card}>
            <h3 style={{margin:'0 0 16px',fontWeight:800,fontSize:'0.95rem'}}>📦 Place Order</h3>
            <div style={{display:'flex',marginBottom:'16px',border:'1px solid #e2e8f0',borderRadius:'10px',overflow:'hidden'}}>
              {(['BUY','SELL'] as const).map(t=>(
                <button key={t} onClick={()=>setOrderType(t)} style={{flex:1,padding:'12px',border:'none',cursor:'pointer',fontWeight:800,fontSize:'0.9rem',transition:'all 0.2s',background:orderType===t?(t==='BUY'?'#dcfce7':'#fee2e2'):'white',color:orderType===t?(t==='BUY'?'#16a34a':'#dc2626'):'#94a3b8'}}>{t}</button>
              ))}
            </div>
            <div style={{marginBottom:'12px'}}>
              <label style={{fontSize:'0.75rem',color:'#94a3b8',fontWeight:600,display:'block',marginBottom:'6px'}}>SELECT STOCK</label>
              <select value={selectedStock} onChange={e=>setSelectedStock(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'0.85rem',outline:'none',fontWeight:600}}>
                {TICKERS.map(t=><option key={t} value={t}>{t} — ${(stockData[t]?.current_price||MOCK[t]?.current_price||0).toFixed(2)}</option>)}
              </select>
            </div>
            <div style={{marginBottom:'12px'}}>
              <label style={{fontSize:'0.75rem',color:'#94a3b8',fontWeight:600,display:'block',marginBottom:'6px'}}>QUANTITY</label>
              <div style={{display:'flex',alignItems:'center',border:'1px solid #e2e8f0',borderRadius:'8px',overflow:'hidden'}}>
                <button onClick={()=>setOrderQty(q=>String(Math.max(0,parseFloat(q||'0')-1)))} style={{padding:'10px 14px',border:'none',background:'#f8fafc',cursor:'pointer',fontWeight:700,fontSize:'1rem',color:'#64748b'}}>−</button>
                <input type="number" value={orderQty} onChange={e=>setOrderQty(e.target.value)} placeholder="0" style={{flex:1,padding:'10px',border:'none',fontSize:'0.9rem',outline:'none',textAlign:'center',fontWeight:700}} />
                <button onClick={()=>setOrderQty(q=>String(parseFloat(q||'0')+1))} style={{padding:'10px 14px',border:'none',background:'#f8fafc',cursor:'pointer',fontWeight:700,fontSize:'1rem',color:'#64748b'}}>+</button>
              </div>
            </div>
            <div style={{marginBottom:'16px',padding:'12px',background:'#f8fafc',borderRadius:'10px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                <span style={{fontSize:'0.8rem',color:'#94a3b8'}}>Last Price</span>
                <span style={{fontWeight:700,fontSize:'0.9rem'}}>${(stock?.current_price||0).toFixed(2)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                <span style={{fontSize:'0.8rem',color:'#94a3b8'}}>Quantity</span>
                <span style={{fontWeight:700,fontSize:'0.9rem'}}>{orderQty||0}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #e2e8f0',paddingTop:'8px',marginTop:'8px'}}>
                <span style={{fontSize:'0.8rem',color:'#94a3b8',fontWeight:600}}>Est. Total</span>
                <span style={{fontWeight:800,fontSize:'1rem',color:'#6366f1'}}>${((stock?.current_price||0)*(parseFloat(orderQty)||0)).toFixed(2)}</span>
              </div>
            </div>
            <button onClick={placeOrder} style={{width:'100%',padding:'14px',borderRadius:'10px',border:'none',cursor:'pointer',fontWeight:800,fontSize:'1rem',transition:'all 0.2s',background:orderType==='BUY'?'linear-gradient(135deg,#16a34a,#22c55e)':'linear-gradient(135deg,#dc2626,#ef4444)',color:'white',boxShadow:orderType==='BUY'?'0 4px 12px rgba(22,163,74,0.4)':'0 4px 12px rgba(220,38,38,0.4)'}}>
              {orderType==='BUY'?'🟢 Place BUY Order':'🔴 Place SELL Order'}
            </button>
          </div>

          {/* Watchlist */}
          <div style={card}>
            <h3 style={{margin:'0 0 12px',fontWeight:800,fontSize:'0.95rem'}}>⭐ Watchlist ({watchlist.length})</h3>
            {watchlist.map(t=>{
              const d=stockData[t]||MOCK[t];
              return (
                <div key={t} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f8fafc'}}>
                  <span onClick={()=>setSelectedStock(t)} style={{fontWeight:700,fontSize:'0.9rem',cursor:'pointer',color:'#6366f1'}}>{t}</span>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontWeight:700,fontSize:'0.85rem'}}>${(d?.current_price||0).toFixed(2)}</div>
                      <div style={{fontSize:'0.72rem',color:(d?.change_percent||0)>=0?'#10b981':'#ef4444',fontWeight:600}}>
                        {(d?.change_percent||0)>=0?'+':''}{(d?.change_percent||0).toFixed(2)}%
                      </div>
                    </div>
                    <button onClick={()=>removeFromWatchlist(t)} style={{background:'#fee2e2',border:'none',borderRadius:'6px',color:'#ef4444',cursor:'pointer',padding:'3px 6px',fontSize:'0.7rem',fontWeight:700}}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );

    /* ── MARKET ── */
    if (activeMenu==='Market') return (
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={{margin:0,fontWeight:800}}>📈 Live Market — {TICKERS.length} Stocks</h2>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            {loadingStocks&&<span style={{fontSize:'0.8rem',color:'#94a3b8'}}>⏳ Loading live data...</span>}
            <button onClick={loadRealStockData} style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:'#f0f0ff',color:'#6366f1',fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>🔄 Refresh</button>
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc'}}>
              {['Ticker','Company','Price','Change','Day High','52W High','P/E','Actions'].map(h=><th key={h} style={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {TICKERS.map(t=>{
                const d=stockData[t]||MOCK[t];
                return (
                  <tr key={t} style={{borderBottom:'1px solid #f8fafc'}}>
                    <td style={{...td,fontWeight:800,color:'#6366f1',cursor:'pointer'}} onClick={()=>setSelectedStock(t)}>{t}</td>
                    <td style={{...td,color:'#64748b',fontSize:'0.8rem'}}>{d?.company_name||t}</td>
                    <td style={{...td,fontWeight:700}}>${(d?.current_price||0).toFixed(2)}</td>
                    <td style={td}><span style={{color:(d?.change_percent||0)>=0?'#10b981':'#ef4444',fontWeight:700}}>{(d?.change_percent||0)>=0?'▲':'▼'} {Math.abs(d?.change_percent||0).toFixed(2)}%</span></td>
                    <td style={{...td,color:'#64748b'}}>${(d?.day_high||d?.current_price||0).toFixed(2)}</td>
                    <td style={{...td,color:'#64748b'}}>${(d?.week_52_high||0).toFixed(2)}</td>
                    <td style={{...td,color:'#64748b'}}>{(d?.pe_ratio||0).toFixed(1)}</td>
                    <td style={td}>
                      <button onClick={()=>navigate(`/dashboard/${t}`)} style={{padding:'4px 8px',borderRadius:'6px',border:'none',cursor:'pointer',background:'#f0f0ff',color:'#6366f1',fontWeight:600,fontSize:'0.75rem',marginRight:'4px'}}>📊</button>
                      <button onClick={()=>addToWatchlist(t)} style={{padding:'4px 8px',borderRadius:'6px',border:'none',cursor:'pointer',background:'#fef9c3',color:'#ca8a04',fontWeight:600,fontSize:'0.75rem'}}>⭐</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );

    /* ── PORTFOLIO ── */
    if (activeMenu==='Portfolio') return (
      <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
          {[
            {label:'Watchlist Value',value:`$${totalValue.toFixed(2)}`,icon:'💰',color:'#6366f1'},
            {label:'Total Orders',value:orders.length,icon:'📋',color:'#10b981'},
            {label:'Stocks Tracked',value:watchlist.length,icon:'⭐',color:'#f59e0b'},
          ].map(s=>(
            <div key={s.label} style={{...card,textAlign:'center'}}>
              <div style={{fontSize:'32px',marginBottom:'8px'}}>{s.icon}</div>
              <div style={{fontSize:'1.8rem',fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'4px'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={card}>
          <h3 style={{margin:'0 0 16px',fontWeight:800}}>💼 My Holdings</h3>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Stock','Company','Price','Change','Action'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {watchlist.map(t=>{
                const d=stockData[t]||MOCK[t];
                return (
                  <tr key={t}>
                    <td style={{...td,fontWeight:800,color:'#6366f1'}}>{t}</td>
                    <td style={{...td,color:'#64748b',fontSize:'0.8rem'}}>{d?.company_name||t}</td>
                    <td style={{...td,fontWeight:700}}>${(d?.current_price||0).toFixed(2)}</td>
                    <td style={td}><span style={{color:(d?.change_percent||0)>=0?'#10b981':'#ef4444',fontWeight:600}}>{(d?.change_percent||0)>=0?'+':''}{(d?.change_percent||0).toFixed(2)}%</span></td>
                    <td style={td}>
                      <button onClick={()=>navigate(`/dashboard/${t}`)} style={{padding:'4px 10px',borderRadius:'6px',border:'none',cursor:'pointer',background:'#f0f0ff',color:'#6366f1',fontWeight:600,fontSize:'0.8rem',marginRight:'6px'}}>📊 Analyze</button>
                      <button onClick={()=>removeFromWatchlist(t)} style={{padding:'4px 10px',borderRadius:'6px',border:'none',cursor:'pointer',background:'#fee2e2',color:'#ef4444',fontWeight:600,fontSize:'0.8rem'}}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );

    /* ── WATCHLIST ── */
    if (activeMenu==='Watchlist') return (
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={{margin:0,fontWeight:800}}>⭐ Watchlist ({watchlist.length})</h2>
          <div style={{display:'flex',gap:'8px'}}>
            <select value={searchTicker} onChange={e=>setSearchTicker(e.target.value)} style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'0.85rem',outline:'none'}}>
              <option value="">Select stock to add...</option>
              {TICKERS.filter(t=>!watchlist.includes(t)).map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={()=>{if(searchTicker){addToWatchlist(searchTicker);setSearchTicker('');}}} style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:'#6366f1',color:'white',fontWeight:600,cursor:'pointer'}}>+ Add</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
          {watchlist.map(t=>{
            const d=stockData[t]||MOCK[t];
            return (
              <div key={t} style={{padding:'20px',borderRadius:'12px',border:'1px solid #f1f5f9',background:'#fafafa'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <span style={{fontWeight:800,fontSize:'1.1rem',color:'#6366f1'}}>{t}</span>
                  <button onClick={()=>removeFromWatchlist(t)} style={{background:'#fee2e2',border:'none',borderRadius:'6px',color:'#ef4444',cursor:'pointer',padding:'3px 8px',fontSize:'0.75rem',fontWeight:600}}>✕</button>
                </div>
                <div style={{fontSize:'0.75rem',color:'#94a3b8',marginBottom:'8px'}}>{d?.company_name||t}</div>
                <div style={{fontSize:'1.4rem',fontWeight:800,marginBottom:'4px'}}>${(d?.current_price||0).toFixed(2)}</div>
                <div style={{fontSize:'0.85rem',color:(d?.change_percent||0)>=0?'#10b981':'#ef4444',fontWeight:600,marginBottom:'12px'}}>
                  {(d?.change_percent||0)>=0?'▲':'▼'} {Math.abs(d?.change_percent||0).toFixed(2)}%
                </div>
                <button onClick={()=>navigate(`/dashboard/${t}`)} style={{width:'100%',padding:'8px',borderRadius:'8px',border:'none',background:'#f0f0ff',color:'#6366f1',fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>📊 Full Analysis</button>
              </div>
            );
          })}
        </div>
      </div>
    );

    /* ── TRANSACTIONS ── */
    if (activeMenu==='Transactions') return (
      <div style={card}>
        <h2 style={{margin:'0 0 20px',fontWeight:800}}>💳 My Transactions ({orders.length})</h2>
        {orders.length===0?(
          <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>📭</div>
            <p>No transactions yet!</p>
            <button onClick={()=>setActiveMenu('Overview')} style={{padding:'10px 20px',borderRadius:'10px',border:'none',background:'#6366f1',color:'white',fontWeight:600,cursor:'pointer'}}>Go Place an Order →</button>
          </div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc'}}>
              {['#','Ticker','Type','Qty','Price','Total','Date','Time','Status'].map(h=><th key={h} style={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {orders.map((o,i)=>(
                <tr key={i}>
                  <td style={{...td,color:'#94a3b8'}}>{orders.length-i}</td>
                  <td style={{...td,fontWeight:700,color:'#6366f1'}}>{o.ticker}</td>
                  <td style={td}><span style={{padding:'3px 8px',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,background:o.type==='BUY'?'#dcfce7':'#fee2e2',color:o.type==='BUY'?'#16a34a':'#dc2626'}}>{o.type}</span></td>
                  <td style={td}>{o.qty}</td>
                  <td style={{...td,color:'#64748b'}}>{o.price}</td>
                  <td style={{...td,fontWeight:700}}>{o.total}</td>
                  <td style={{...td,color:'#64748b'}}>{o.date}</td>
                  <td style={{...td,color:'#94a3b8'}}>{o.time}</td>
                  <td style={td}><span style={{color:'#10b981',fontWeight:600,fontSize:'0.8rem'}}>✅ Filled</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );

    /* ── AI INSIGHTS ── */
    if (activeMenu==='AI Insights') return (
      <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
        <div style={card}>
          <h2 style={{margin:'0 0 16px',fontWeight:800}}>🧠 AI Stock Insights — All 25 Stocks</h2>
          <p style={{color:'#64748b',margin:'0 0 16px',fontSize:'0.9rem'}}>Click any stock to get AI-powered sentiment analysis and predictions!</p>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'20px'}}>
            {TICKERS.map(t=>(
              <button key={t} onClick={()=>loadInsight(t)} style={{padding:'8px 14px',borderRadius:'10px',border:'none',cursor:'pointer',fontWeight:600,fontSize:'0.85rem',background:insightStock===t?'linear-gradient(135deg,#6366f1,#8b5cf6)':'#f1f5f9',color:insightStock===t?'white':'#64748b',transition:'all 0.2s'}}>
                {t}
              </button>
            ))}
          </div>
          {insightLoading?(
            <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>
              <div style={{fontSize:'40px',marginBottom:'8px'}}>⏳</div>
              <p>Loading AI analysis for {insightStock}...</p>
            </div>
          ):insightData?(
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <div style={{padding:'20px',borderRadius:'12px',background:insightData.sentiment?.color==='green'?'#f0fdf4':insightData.sentiment?.color==='red'?'#fef2f2':'#f8fafc',border:`1px solid ${insightData.sentiment?.color==='green'?'#bbf7d0':insightData.sentiment?.color==='red'?'#fecaca':'#e2e8f0'}`}}>
                <h3 style={{margin:'0 0 8px',fontWeight:700}}>{insightStock} — Sentiment Analysis</h3>
                <div style={{fontSize:'1.5rem',fontWeight:800,color:insightData.sentiment?.color==='green'?'#16a34a':insightData.sentiment?.color==='red'?'#dc2626':'#64748b'}}>
                  {insightData.sentiment?.overall_label||'Neutral'}
                </div>
                <div style={{color:'#64748b',fontSize:'0.9rem',marginTop:'4px'}}>
                  Score: {insightData.sentiment?.overall_score||'N/A'} | Articles analyzed: {insightData.sentiment?.articles_analyzed||0}
                </div>
              </div>
              {insightData.news?.length>0&&(
                <div>
                  <h3 style={{margin:'0 0 12px',fontWeight:700}}>📰 Latest News</h3>
                  {insightData.news.slice(0,5).map((n:any,i:number)=>(
                    <div key={i} style={{padding:'12px',borderRadius:'10px',border:'1px solid #f1f5f9',background:'#fafafa',marginBottom:'8px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',gap:'12px'}}>
                        <p style={{margin:0,fontWeight:600,fontSize:'0.9rem'}}>{n.title}</p>
                        <span style={{padding:'2px 8px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,whiteSpace:'nowrap',background:n.sentiment_label==='Positive'?'#dcfce7':n.sentiment_label==='Negative'?'#fee2e2':'#f1f5f9',color:n.sentiment_label==='Positive'?'#16a34a':n.sentiment_label==='Negative'?'#dc2626':'#64748b'}}>{n.sentiment_label}</span>
                      </div>
                      <p style={{margin:'4px 0 0',fontSize:'0.78rem',color:'#94a3b8'}}>{n.source} • {n.published_at?.slice(0,10)}</p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={()=>navigate(`/dashboard/${insightStock}`)} style={{padding:'12px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',fontWeight:700,cursor:'pointer',fontSize:'0.95rem'}}>
                📊 Full AI Dashboard for {insightStock} →
              </button>
            </div>
          ):(
            <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>
              <div style={{fontSize:'48px',marginBottom:'12px'}}>🧠</div>
              <p>Click any stock above to get AI insights!</p>
            </div>
          )}
        </div>
      </div>
    );

    /* ── REPORTS ── */
    if (activeMenu==='Reports') return (
      <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
          {[
            {label:'Total Orders',value:orders.length,icon:'📋',color:'#6366f1'},
            {label:'BUY Orders',value:orders.filter(o=>o.type==='BUY').length,icon:'🟢',color:'#10b981'},
            {label:'SELL Orders',value:orders.filter(o=>o.type==='SELL').length,icon:'🔴',color:'#ef4444'},
          ].map(s=>(
            <div key={s.label} style={{...card,textAlign:'center'}}>
              <div style={{fontSize:'32px',marginBottom:'8px'}}>{s.icon}</div>
              <div style={{fontSize:'1.8rem',fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'4px'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={card}>
          <h3 style={{margin:'0 0 16px',fontWeight:800}}>📄 Download Reports</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
            {[
              {title:'Trade History',desc:'All your buy/sell orders',icon:'📋',color:'#6366f1'},
              {title:'Portfolio Report',desc:'Holdings and performance',icon:'💼',color:'#10b981'},
              {title:'P&L Summary',desc:'Profit and loss analysis',icon:'💰',color:'#f59e0b'},
              {title:'Market Report',desc:'25 stock performance',icon:'📈',color:'#8b5cf6'},
              {title:'Watchlist Report',desc:'Your tracked stocks',icon:'⭐',color:'#ef4444'},
              {title:'AI Analysis Report',desc:'Sentiment & predictions',icon:'🧠',color:'#06b6d4'},
            ].map(r=>(
              <div key={r.title} style={{padding:'20px',borderRadius:'12px',border:'1px solid #f1f5f9',background:'#fafafa'}}>
                <div style={{fontSize:'28px',marginBottom:'10px'}}>{r.icon}</div>
                <h4 style={{margin:'0 0 6px',fontWeight:700}}>{r.title}</h4>
                <p style={{margin:'0 0 14px',color:'#64748b',fontSize:'0.82rem'}}>{r.desc}</p>
                <button onClick={()=>toast.success(`${r.title} downloaded!`)} style={{width:'100%',padding:'8px',borderRadius:'8px',border:`1px solid ${r.color}30`,background:`${r.color}10`,color:r.color,fontWeight:600,cursor:'pointer',fontSize:'0.82rem'}}>
                  📥 Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    /* ── NEWS ── */
    if (activeMenu==='News') return (
      <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
        <div style={card}>
          <h2 style={{margin:'0 0 16px',fontWeight:800}}>📰 Live Market News</h2>
          <p style={{color:'#64748b',margin:'0 0 16px',fontSize:'0.9rem'}}>Click any stock for its latest AI-analyzed news!</p>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'20px'}}>
            {TICKERS.slice(0,15).map(t=>(
              <button key={t} onClick={()=>loadInsight(t)} style={{padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',fontWeight:600,fontSize:'0.8rem',background:insightStock===t?'#6366f1':'#f1f5f9',color:insightStock===t?'white':'#64748b'}}>
                📰 {t}
              </button>
            ))}
          </div>
          {insightLoading?(
            <div style={{textAlign:'center',padding:'24px',color:'#94a3b8'}}>⏳ Loading news for {insightStock}...</div>
          ):insightData?.news?.length>0?(
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {insightData.news.map((n:any,i:number)=>(
                <div key={i} style={{padding:'14px',borderRadius:'10px',border:'1px solid #f1f5f9',background:'#fafafa'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:'12px',alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <p style={{margin:'0 0 6px',fontWeight:600,color:'#0f172a'}}>{n.title}</p>
                      <p style={{margin:0,fontSize:'0.78rem',color:'#94a3b8'}}>{n.source} • {n.published_at?.slice(0,10)}</p>
                    </div>
                    <span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,whiteSpace:'nowrap',background:n.sentiment_label==='Positive'?'#dcfce7':n.sentiment_label==='Negative'?'#fee2e2':'#f1f5f9',color:n.sentiment_label==='Positive'?'#16a34a':n.sentiment_label==='Negative'?'#dc2626':'#64748b'}}>
                      {n.sentiment_label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {[
                {title:'Fed holds interest rates steady, market reacts positively',source:'Reuters',time:'2h ago',sentiment:'Neutral',ticker:'Market'},
                {title:'Apple unveils new AI chip powering next-gen MacBooks',source:'Bloomberg',time:'3h ago',sentiment:'Positive',ticker:'AAPL'},
                {title:'NVIDIA announces partnership with major cloud providers for AI',source:'CNBC',time:'4h ago',sentiment:'Positive',ticker:'NVDA'},
                {title:'Tesla faces production challenges at Gigafactory Berlin',source:'WSJ',time:'5h ago',sentiment:'Negative',ticker:'TSLA'},
                {title:'Microsoft Azure AI services see 35% surge in enterprise adoption',source:'FT',time:'6h ago',sentiment:'Positive',ticker:'MSFT'},
                {title:'Coinbase reports record trading volume amid crypto rally',source:'CoinDesk',time:'7h ago',sentiment:'Positive',ticker:'COIN'},
              ].map((n,i)=>(
                <div key={i} style={{padding:'14px',borderRadius:'10px',border:'1px solid #f1f5f9',background:'#fafafa'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:'12px',alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <p style={{margin:'0 0 6px',fontWeight:600,color:'#0f172a'}}>{n.title}</p>
                      <p style={{margin:0,fontSize:'0.78rem',color:'#94a3b8'}}>{n.source} • {n.time} • <span style={{color:'#6366f1'}}>{n.ticker}</span></p>
                    </div>
                    <span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,whiteSpace:'nowrap',background:n.sentiment==='Positive'?'#dcfce7':n.sentiment==='Negative'?'#fee2e2':'#f1f5f9',color:n.sentiment==='Positive'?'#16a34a':n.sentiment==='Negative'?'#dc2626':'#64748b'}}>
                      {n.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

    /* ── SETTINGS ── */
    if (activeMenu==='Settings') return (
      <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
        <div style={card}>
          <h2 style={{margin:'0 0 20px',fontWeight:800}}>⚙️ Account Settings</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}}>
            {[
              {label:'Full Name',value:user?.full_name||'Trader',type:'text'},
              {label:'Email',value:user?.email||'',type:'email'},
              {label:'Phone',value:'',type:'tel',placeholder:'+91 98765 43210'},
              {label:'Location',value:'',type:'text',placeholder:'Mumbai, India'},
            ].map(f=>(
              <div key={f.label}>
                <label style={{fontSize:'0.8rem',color:'#64748b',fontWeight:600,display:'block',marginBottom:'6px'}}>{f.label.toUpperCase()}</label>
                <input defaultValue={f.value} type={f.type} placeholder={(f as any).placeholder||''}
                  style={{width:'100%',padding:'10px 14px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}} />
              </div>
            ))}
          </div>
          <button onClick={()=>toast.success('Profile updated!')} style={{padding:'10px 24px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',fontWeight:700,cursor:'pointer'}}>
            💾 Save Changes
          </button>
        </div>
        <div style={card}>
          <h3 style={{margin:'0 0 16px',fontWeight:800}}>🔔 Notifications</h3>
          {['Price alerts','News notifications','Trade confirmations','Portfolio updates'].map(n=>(
            <div key={n} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px',background:'#f8fafc',borderRadius:'10px',marginBottom:'8px'}}>
              <span style={{fontWeight:600}}>{n}</span>
              <button onClick={()=>toast.success(`${n} toggled!`)} style={{padding:'6px 16px',borderRadius:'8px',border:'none',background:'#dcfce7',color:'#16a34a',fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>ON</button>
            </div>
          ))}
        </div>
        <div style={card}>
          <h3 style={{margin:'0 0 12px',fontWeight:800,color:'#ef4444'}}>⚠️ Danger Zone</h3>
          <button onClick={()=>{localStorage.removeItem('token');localStorage.removeItem('user');navigate('/login');}} style={{padding:'10px 24px',borderRadius:'10px',border:'1px solid #fee2e2',background:'#fff5f5',color:'#ef4444',fontWeight:700,cursor:'pointer'}}>
            🚪 Logout from StockSight
          </button>
        </div>
      </div>
    );

    return null;
  };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f8fafc',fontFamily:"'DM Sans',sans-serif",color:'#0f172a'}}>

      {/* SIDEBAR */}
      <div style={{width:'220px',minHeight:'100vh',background:'white',borderRight:'1px solid #e2e8f0',display:'flex',flexDirection:'column',padding:'20px 0',flexShrink:0,boxShadow:'2px 0 8px rgba(0,0,0,0.04)'}}>
        <div style={{padding:'0 16px 20px',borderBottom:'1px solid #f1f5f9'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'14px'}}>S</div>
            <div>
              <div style={{fontWeight:800,fontSize:'0.95rem'}}>StockSight</div>
              <div style={{fontSize:'0.65rem',color:'#6366f1',fontWeight:600}}>AI TRADER</div>
            </div>
          </div>
        </div>
        <div style={{padding:'8px 0',flex:1}}>
          {[{group:'Main Menu',items:menuItems.slice(0,5)},{group:'Analysis',items:menuItems.slice(5,8)},{group:'Personal',items:menuItems.slice(8)}].map(g=>(
            <div key={g.group}>
              <p style={{padding:'12px 16px 4px',fontSize:'0.7rem',color:'#94a3b8',fontWeight:700,letterSpacing:'0.05em',margin:0}}>{g.group.toUpperCase()}</p>
              {g.items.map(item=>(
                <button key={item.label} onClick={()=>setActiveMenu(item.label)} style={{width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'9px 16px',border:'none',cursor:'pointer',textAlign:'left',background:activeMenu===item.label?'#f0f0ff':'transparent',color:activeMenu===item.label?'#6366f1':'#64748b',fontSize:'0.875rem',fontWeight:activeMenu===item.label?700:400,borderRight:activeMenu===item.label?'3px solid #6366f1':'3px solid transparent',transition:'all 0.15s'}}>
                  <span style={{fontSize:'16px'}}>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={{padding:'16px',borderTop:'1px solid #f1f5f9'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px',background:'#f8fafc',borderRadius:'10px',marginBottom:'8px'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'14px',flexShrink:0}}>
              {(user?.full_name?.[0]||'U').toUpperCase()}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:'0.8rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.full_name||'Trader'}</div>
              <div style={{fontSize:'0.65rem',color:'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email||'Active Trader'}</div>
            </div>
          </div>
          <button onClick={()=>{localStorage.removeItem('token');localStorage.removeItem('user');navigate('/login');}} style={{width:'100%',padding:'8px',borderRadius:'8px',border:'1px solid #fee2e2',background:'#fff5f5',color:'#ef4444',fontSize:'0.8rem',fontWeight:600,cursor:'pointer'}}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* TOP BAR */}
        <div style={{height:'60px',background:'white',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{display:'flex',gap:'16px',overflow:'hidden'}}>
            {TICKERS.slice(0,8).map(t=>{
              const d=stockData[t]||MOCK[t];
              return (
                <div key={t} onClick={()=>setSelectedStock(t)} style={{display:'flex',alignItems:'center',gap:'4px',cursor:'pointer',flexShrink:0}}>
                  <span style={{fontWeight:700,fontSize:'0.8rem'}}>{t}</span>
                  <span style={{fontSize:'0.75rem',color:(d?.change_percent||0)>=0?'#10b981':'#ef4444',fontWeight:600}}>
                    {(d?.change_percent||0)>=0?'▲':'▼'}{Math.abs(d?.change_percent||0).toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
            <input placeholder="Search & analyze..." style={{padding:'7px 14px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'0.85rem',outline:'none',width:'180px'}}
              onKeyPress={(e:any)=>{if(e.key==='Enter'&&e.target.value)navigate(`/dashboard/${e.target.value.toUpperCase()}`)}} />
            <div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#10b981',boxShadow:'0 0 6px #10b981'}} />
            <span style={{fontSize:'0.8rem',color:'#10b981',fontWeight:600,whiteSpace:'nowrap'}}>Markets Open</span>
          </div>
        </div>
        <div style={{flex:1,padding:'24px',overflow:'auto'}}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;