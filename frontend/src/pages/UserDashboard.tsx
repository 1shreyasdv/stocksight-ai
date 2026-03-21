import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const TICKERS = ['AAPL','TSLA','NVDA','MSFT','AMZN'];

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Overview');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [orderType, setOrderType] = useState<'BUY'|'SELL'>('BUY');
  const [orderQty, setOrderQty] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>({full_name:'Trader'});

  useEffect(()=>{
    try {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    } catch {}
  },[]);

  const mockStockData: any = {
    AAPL: {current_price:189.40, change_percent:2.15,  day_high:191.20, market_cap:2940000000000, week_52_high:199.62, pe_ratio:28.5},
    TSLA: {current_price:248.20, change_percent:-0.86, day_high:252.10, market_cap:789000000000,  week_52_high:271.00, pe_ratio:55.2},
    NVDA: {current_price:875.30, change_percent:3.42,  day_high:881.50, market_cap:2150000000000, week_52_high:974.00, pe_ratio:68.1},
    MSFT: {current_price:412.10, change_percent:1.23,  day_high:415.30, market_cap:3060000000000, week_52_high:430.82, pe_ratio:35.4},
    AMZN: {current_price:182.50, change_percent:0.94,  day_high:184.20, market_cap:1890000000000, week_52_high:201.20, pe_ratio:42.3},
  };

  const mockChartData = Array.from({length:30},(_,i)=>({
    date:`03/${String(i+1).padStart(2,'0')}`,
    price: mockStockData[selectedStock].current_price * (0.95 + Math.random()*0.1)
  }));

  const placeOrder = () => {
    if (!orderQty) { toast.error('Enter quantity!'); return; }
    const price = mockStockData[selectedStock].current_price;
    setOrders([{ticker:selectedStock,type:orderType,qty:orderQty,price:`$${price.toFixed(2)}`,time:new Date().toLocaleTimeString(),status:'Filled'},...orders]);
    toast.success(`${orderType} ${orderQty} ${selectedStock} @ $${price.toFixed(2)}`);
    setOrderQty('');
  };

  const menuItems = [
    {icon:'📊',label:'Overview'},{icon:'📈',label:'Market'},
    {icon:'💼',label:'Portfolio'},{icon:'⭐',label:'Watchlist'},
    {icon:'💳',label:'Transactions'},{icon:'🧠',label:'Insights'},
    {icon:'📄',label:'Reports'},{icon:'📰',label:'News'},{icon:'⚙️',label:'Settings'},
  ];

  const totalValue = TICKERS.reduce((s,t)=>s+mockStockData[t].current_price,0);
  const stock = mockStockData[selectedStock];

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
                <button key={item.label} onClick={()=>setActiveMenu(item.label)} style={{width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'9px 16px',border:'none',cursor:'pointer',textAlign:'left',background:activeMenu===item.label?'#f0f0ff':'transparent',color:activeMenu===item.label?'#6366f1':'#64748b',fontSize:'0.875rem',fontWeight:activeMenu===item.label?700:400,borderRight:activeMenu===item.label?'3px solid #6366f1':'3px solid transparent'}}>
                  <span style={{fontSize:'16px'}}>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div style={{padding:'16px',borderTop:'1px solid #f1f5f9'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px',background:'#f8fafc',borderRadius:'10px',marginBottom:'8px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'12px'}}>
              {user?.full_name?.[0]||'U'}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:'0.8rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.full_name||'Trader'}</div>
              <div style={{fontSize:'0.65rem',color:'#94a3b8'}}>Active Trader</div>
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
          <div style={{display:'flex',gap:'20px'}}>
            {TICKERS.map(t=>(
              <div key={t} onClick={()=>setSelectedStock(t)} style={{display:'flex',alignItems:'center',gap:'5px',cursor:'pointer'}}>
                <span style={{fontWeight:700,fontSize:'0.85rem'}}>{t}</span>
                <span style={{fontSize:'0.8rem',color:mockStockData[t].change_percent>=0?'#10b981':'#ef4444',fontWeight:600}}>
                  {mockStockData[t].change_percent>=0?'▲':'▼'}{Math.abs(mockStockData[t].change_percent).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <input placeholder="Search stocks..." style={{padding:'7px 14px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'0.85rem',outline:'none',width:'180px'}}
              onKeyPress={(e:any)=>{if(e.key==='Enter')navigate(`/dashboard/${e.target.value.toUpperCase()}`)}} />
            <div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#10b981',boxShadow:'0 0 6px #10b981'}} />
            <span style={{fontSize:'0.8rem',color:'#10b981',fontWeight:600}}>Markets Open</span>
          </div>
        </div>

        {/* BODY */}
        <div style={{flex:1,padding:'24px',overflow:'auto',display:'flex',gap:'24px'}}>

          {/* LEFT */}
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:'20px'}}>

            {/* Market Highlights */}
            <div style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',border:'1px solid #f1f5f9'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <h2 style={{margin:0,fontSize:'1rem',fontWeight:800}}>⭐ Market Highlights</h2>
                <span style={{fontSize:'0.75rem',color:'#94a3b8'}}>Recommended stocks for today</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
                {['AAPL','TSLA','NVDA'].map(t=>(
                  <div key={t} onClick={()=>navigate(`/dashboard/${t}`)} style={{padding:'16px',borderRadius:'12px',border:'1px solid #f1f5f9',cursor:'pointer',background:selectedStock===t?'#f0f0ff':'#fafafa'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                      <span style={{fontWeight:800}}>{t}</span>
                      <span>{t==='AAPL'?'🍎':t==='TSLA'?'⚡':'🖥️'}</span>
                    </div>
                    <div style={{fontSize:'1.3rem',fontWeight:800}}>${mockStockData[t].current_price.toFixed(2)}</div>
                    <div style={{fontSize:'0.8rem',color:mockStockData[t].change_percent>=0?'#10b981':'#ef4444',fontWeight:600}}>
                      {mockStockData[t].change_percent>=0?'+':''}{mockStockData[t].change_percent.toFixed(2)}% today
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',border:'1px solid #f1f5f9'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <div>
                  <h2 style={{margin:0,fontSize:'1rem',fontWeight:800}}>{selectedStock} — 1 Month Chart</h2>
                  <div style={{fontSize:'1.5rem',fontWeight:800}}>
                    ${stock.current_price.toFixed(2)}
                    <span style={{fontSize:'0.9rem',marginLeft:'8px',color:stock.change_percent>=0?'#10b981':'#ef4444'}}>
                      {stock.change_percent>=0?'+':''}{stock.change_percent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div style={{display:'flex',gap:'6px'}}>
                  {TICKERS.map(t=>(
                    <button key={t} onClick={()=>setSelectedStock(t)} style={{padding:'5px 10px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'0.78rem',fontWeight:600,background:selectedStock===t?'#6366f1':'#f1f5f9',color:selectedStock===t?'white':'#64748b'}}>{t}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fill:'#94a3b8',fontSize:11}} />
                  <YAxis tick={{fill:'#94a3b8',fontSize:11}} domain={['auto','auto']} />
                  <Tooltip contentStyle={{background:'white',border:'1px solid #e2e8f0',borderRadius:'8px'}} />
                  <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{display:'flex',gap:'12px',marginTop:'16px'}}>
                {[
                  {label:'Day High',  value:`$${stock.day_high.toFixed(2)}`},
                  {label:'Market Cap',value:`$${(stock.market_cap/1e12).toFixed(2)}T`},
                  {label:'52W High',  value:`$${stock.week_52_high.toFixed(2)}`},
                  {label:'P/E Ratio', value:stock.pe_ratio.toFixed(1)},
                ].map(s=>(
                  <div key={s.label} style={{flex:1,padding:'10px',background:'#f8fafc',borderRadius:'10px'}}>
                    <div style={{fontSize:'0.7rem',color:'#94a3b8',fontWeight:600}}>{s.label}</div>
                    <div style={{fontWeight:700,fontSize:'0.9rem'}}>{s.value}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>navigate(`/dashboard/${selectedStock}`)} style={{marginTop:'12px',width:'100%',padding:'10px',borderRadius:'10px',border:'1px solid #e2e8f0',background:'white',color:'#6366f1',fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>
                📊 View Full AI Analysis for {selectedStock} →
              </button>
            </div>

            {/* Orders Table */}
            <div style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',border:'1px solid #f1f5f9'}}>
              <h3 style={{margin:'0 0 16px',fontSize:'1rem',fontWeight:800}}>📋 My Orders</h3>
              {orders.length===0?(
                <p style={{color:'#94a3b8',textAlign:'center',padding:'20px 0'}}>No orders yet. Place your first order →</p>
              ):(
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
                  <thead>
                    <tr style={{borderBottom:'1px solid #f1f5f9'}}>
                      {['Ticker','Type','Qty','Price','Time','Status'].map(h=>(
                        <th key={h} style={{padding:'8px',textAlign:'left',color:'#94a3b8',fontWeight:600,fontSize:'0.75rem'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o,i)=>(
                      <tr key={i} style={{borderBottom:'1px solid #f8fafc'}}>
                        <td style={{padding:'10px 8px',fontWeight:700,color:'#6366f1'}}>{o.ticker}</td>
                        <td style={{padding:'10px 8px'}}><span style={{padding:'3px 8px',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,background:o.type==='BUY'?'#dcfce7':'#fee2e2',color:o.type==='BUY'?'#16a34a':'#dc2626'}}>{o.type}</span></td>
                        <td style={{padding:'10px 8px'}}>{o.qty}</td>
                        <td style={{padding:'10px 8px',color:'#64748b'}}>{o.price}</td>
                        <td style={{padding:'10px 8px',color:'#94a3b8'}}>{o.time}</td>
                        <td style={{padding:'10px 8px'}}><span style={{color:'#10b981',fontWeight:600,fontSize:'0.8rem'}}>✅ {o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{width:'280px',flexShrink:0,display:'flex',flexDirection:'column',gap:'16px'}}>

            {/* Portfolio */}
            <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'16px',padding:'20px',color:'white'}}>
              <p style={{margin:'0 0 4px',fontSize:'0.75rem',opacity:0.8,fontWeight:600}}>PORTFOLIO VALUE</p>
              <p style={{margin:'0 0 8px',fontSize:'2rem',fontWeight:800}}>${totalValue.toFixed(2)}</p>
              <p style={{margin:0,fontSize:'0.8rem',opacity:0.7}}>Across {TICKERS.length} stocks</p>
              <button onClick={()=>navigate('/portfolio')} style={{marginTop:'16px',width:'100%',padding:'10px',borderRadius:'10px',background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)',color:'white',fontWeight:700,cursor:'pointer',fontSize:'0.85rem'}}>
                View Full Portfolio →
              </button>
            </div>

            {/* Order Panel */}
            <div style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',border:'1px solid #f1f5f9'}}>
              <h3 style={{margin:'0 0 16px',fontWeight:800,fontSize:'0.95rem'}}>📦 Place Order</h3>
              <div style={{display:'flex',marginBottom:'16px',border:'1px solid #e2e8f0',borderRadius:'10px',overflow:'hidden'}}>
                {(['BUY','SELL'] as const).map(t=>(
                  <button key={t} onClick={()=>setOrderType(t)} style={{flex:1,padding:'10px',border:'none',cursor:'pointer',fontWeight:700,fontSize:'0.9rem',background:orderType===t?(t==='BUY'?'#dcfce7':'#fee2e2'):'white',color:orderType===t?(t==='BUY'?'#16a34a':'#dc2626'):'#94a3b8'}}>{t}</button>
                ))}
              </div>
              <div style={{marginBottom:'12px'}}>
                <label style={{fontSize:'0.75rem',color:'#94a3b8',fontWeight:600,display:'block',marginBottom:'6px'}}>SELECT STOCK</label>
                <select value={selectedStock} onChange={e=>setSelectedStock(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'0.9rem',outline:'none',fontWeight:700}}>
                  {TICKERS.map(t=><option key={t} value={t}>{t} — ${mockStockData[t].current_price.toFixed(2)}</option>)}
                </select>
              </div>
              <div style={{marginBottom:'12px'}}>
                <label style={{fontSize:'0.75rem',color:'#94a3b8',fontWeight:600,display:'block',marginBottom:'6px'}}>QUANTITY</label>
                <input type="number" value={orderQty} onChange={e=>setOrderQty(e.target.value)} placeholder="0"
                  style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}} />
              </div>
              <div style={{marginBottom:'16px',padding:'12px',background:'#f8fafc',borderRadius:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                  <span style={{fontSize:'0.8rem',color:'#94a3b8'}}>Last Price</span>
                  <span style={{fontWeight:700}}>${stock.current_price.toFixed(2)}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:'0.8rem',color:'#94a3b8'}}>Est. Total</span>
                  <span style={{fontWeight:700,color:'#6366f1'}}>${(stock.current_price*(parseFloat(orderQty)||0)).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={placeOrder} style={{width:'100%',padding:'14px',borderRadius:'10px',border:'none',cursor:'pointer',background:orderType==='BUY'?'linear-gradient(135deg,#16a34a,#22c55e)':'linear-gradient(135deg,#dc2626,#ef4444)',color:'white',fontWeight:800,fontSize:'1rem'}}>
                {orderType==='BUY'?'🟢':'🔴'} Place {orderType} Order
              </button>
            </div>

            {/* Watchlist */}
            <div style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',border:'1px solid #f1f5f9'}}>
              <h3 style={{margin:'0 0 12px',fontWeight:800,fontSize:'0.95rem'}}>⭐ Watchlist</h3>
              {TICKERS.map(t=>(
                <div key={t} onClick={()=>navigate(`/dashboard/${t}`)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f8fafc',cursor:'pointer'}}>
                  <span style={{fontWeight:700,fontSize:'0.9rem'}}>{t}</span>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:700,fontSize:'0.85rem'}}>${mockStockData[t].current_price.toFixed(2)}</div>
                    <div style={{fontSize:'0.75rem',color:mockStockData[t].change_percent>=0?'#10b981':'#ef4444',fontWeight:600}}>
                      {mockStockData[t].change_percent>=0?'+':''}{mockStockData[t].change_percent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;