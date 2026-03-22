import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const SHARED_ORDERS_KEY = 'stocksight_orders';
const SHARED_USERS_KEY = 'stocksight_users';

const volumeData = [
  {day:'Mon',volume:4200},{day:'Tue',volume:6800},{day:'Wed',volume:5100},
  {day:'Thu',volume:7900},{day:'Fri',volume:6300},{day:'Sat',volume:3200},{day:'Sun',volume:2800},
];
const userGrowth = [
  {month:'Jan',users:120},{month:'Feb',users:210},{month:'Mar',users:380},
  {month:'Apr',users:520},{month:'May',users:710},{month:'Jun',users:890},
];

const MARKET_DATA = [
  {ticker:'AAPL',name:'Apple Inc.',          price:189.40,change:2.15, vol:'52.3M',cap:'$2.94T'},
  {ticker:'TSLA',name:'Tesla Inc.',          price:248.20,change:-0.86,vol:'31.2M',cap:'$789B'},
  {ticker:'NVDA',name:'NVIDIA Corp.',        price:875.30,change:3.42, vol:'41.8M',cap:'$2.15T'},
  {ticker:'MSFT',name:'Microsoft Corp.',     price:412.10,change:1.23, vol:'22.1M',cap:'$3.06T'},
  {ticker:'AMZN',name:'Amazon.com Inc.',     price:182.50,change:0.94, vol:'28.5M',cap:'$1.89T'},
  {ticker:'GOOGL',name:'Alphabet Inc.',      price:175.20,change:-0.32,vol:'19.4M',cap:'$2.18T'},
  {ticker:'META',name:'Meta Platforms',      price:524.80,change:1.87, vol:'15.6M',cap:'$1.33T'},
  {ticker:'NFLX',name:'Netflix Inc.',        price:628.50,change:0.54, vol:'8.2M', cap:'$270B'},
  {ticker:'AMD', name:'Advanced Micro',      price:178.30,change:2.11, vol:'35.4M',cap:'$288B'},
  {ticker:'INTC',name:'Intel Corp.',         price:42.80, change:-1.24,vol:'42.1M',cap:'$181B'},
  {ticker:'ORCL',name:'Oracle Corp.',        price:128.40,change:0.78, vol:'12.3M',cap:'$352B'},
  {ticker:'CRM', name:'Salesforce Inc.',     price:298.70,change:1.45, vol:'9.8M', cap:'$289B'},
  {ticker:'ADBE',name:'Adobe Inc.',          price:478.20,change:-0.63,vol:'7.4M', cap:'$212B'},
  {ticker:'PYPL',name:'PayPal Holdings',     price:68.40, change:1.12, vol:'18.2M',cap:'$72B'},
  {ticker:'UBER',name:'Uber Technologies',   price:78.90, change:2.34, vol:'22.5M',cap:'$163B'},
  {ticker:'LYFT',name:'Lyft Inc.',           price:14.20, change:-0.84,vol:'11.2M',cap:'$5.8B'},
  {ticker:'SNAP',name:'Snap Inc.',           price:11.80, change:3.51, vol:'28.4M',cap:'$19B'},
  {ticker:'SPOT',name:'Spotify Technology',  price:385.60,change:1.92, vol:'4.1M', cap:'$74B'},
  {ticker:'COIN',name:'Coinbase Global',     price:218.40,change:4.21, vol:'9.8M', cap:'$54B'},
  {ticker:'PLTR',name:'Palantir Tech',       price:24.80, change:3.12, vol:'42.1M',cap:'$52B'},
  {ticker:'ARM', name:'ARM Holdings',        price:128.60,change:2.84, vol:'8.2M', cap:'$134B'},
  {ticker:'SMCI',name:'Super Micro Computer',price:892.40,change:-1.24,vol:'5.6M', cap:'$52B'},
  {ticker:'MU',  name:'Micron Technology',   price:118.20,change:1.84, vol:'18.4M',cap:'$131B'},
  {ticker:'QCOM',name:'Qualcomm Inc.',       price:168.40,change:0.92, vol:'12.1M',cap:'$188B'},
  {ticker:'AVGO',name:'Broadcom Inc.',       price:1342.80,change:1.54,vol:'3.2M', cap:'$624B'},
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [frozenUsers, setFrozenUsers] = useState<string[]>([]);
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketPrices, setMarketPrices] = useState<any>(
    Object.fromEntries(MARKET_DATA.map(m=>[m.ticker, m.price.toFixed(2)]))
  );

  useEffect(()=>{
    if (!localStorage.getItem('adminToken')) { navigate('/admin/login'); return; }
    loadData();
    const interval = setInterval(loadData, 10000);
    return ()=>clearInterval(interval);
  },[navigate]);

  const loadData = () => {
    try {
      const savedUsers = JSON.parse(localStorage.getItem(SHARED_USERS_KEY)||'[]');
      const savedOrders = JSON.parse(localStorage.getItem(SHARED_ORDERS_KEY)||'[]');
      setUsers(savedUsers);
      setOrders(savedOrders);
    } catch {}
  };

  const toggleFreeze = (email: string) => {
    if (frozenUsers.includes(email)) {
      setFrozenUsers(frozenUsers.filter(u=>u!==email));
      toast.success('Account unfrozen!');
    } else {
      setFrozenUsers([...frozenUsers,email]);
      toast.success('Account frozen!');
    }
  };

  const menuItems = [
    {icon:'📊',label:'Dashboard'},{icon:'👥',label:'Users'},
    {icon:'💳',label:'Transactions'},{icon:'📋',label:'Orders'},
    {icon:'📈',label:'Market Data'},{icon:'📄',label:'Reports'},
    {icon:'🔬',label:'Analytics'},{icon:'⚙️',label:'Settings'},
  ];

  const th: React.CSSProperties = {padding:'10px 12px',textAlign:'left',color:'#64748b',fontWeight:600,fontSize:'0.8rem',borderBottom:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.02)'};
  const td: React.CSSProperties = {padding:'11px 12px',borderBottom:'1px solid rgba(255,255,255,0.03)',fontSize:'0.85rem',color:'#94a3b8'};
  const card: React.CSSProperties = {background:'#0f172a',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'16px',padding:'24px',marginBottom:'20px'};

  const totalRevenue = orders.reduce((s,o)=>{
    const total = parseFloat(o.total?.replace('$','')||'0');
    return s + total*0.005;
  },0);

  const renderContent = () => {

    /* ── DASHBOARD ── */
    if (activeMenu==='Dashboard') return (
      <>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px',marginBottom:'24px'}}>
          {[
            {label:'Registered Users',value:users.length||0,change:'+'+users.length,icon:'👥',color:'#6366f1'},
            {label:'Active Traders',value:users.filter(u=>!frozenUsers.includes(u.email)).length,change:'Live',icon:'🏃',color:'#10b981'},
            {label:'Total Trades',value:orders.length,change:'+'+orders.length,icon:'📊',color:'#f59e0b'},
            {label:'Revenue (0.5%)',value:`$${totalRevenue.toFixed(2)}`,change:'Live',icon:'💰',color:'#ef4444'},
          ].map(s=>(
            <div key={s.label} style={card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <p style={{margin:'0 0 8px',color:'#475569',fontSize:'0.8rem',fontWeight:600}}>{s.label.toUpperCase()}</p>
                  <p style={{margin:0,fontSize:'1.8rem',fontWeight:800,color:'white'}}>{s.value}</p>
                  <span style={{color:'#10b981',fontSize:'0.8rem',fontWeight:600}}>{s.change}</span>
                </div>
                <div style={{width:'44px',height:'44px',borderRadius:'12px',background:`${s.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'24px'}}>
          <div style={card}>
            <h3 style={{margin:'0 0 20px',fontSize:'1rem',fontWeight:700,color:'white'}}>📊 Trading Volume</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{fill:'#475569',fontSize:12}} />
                <YAxis tick={{fill:'#475569',fontSize:12}} />
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'white'}} />
                <Bar dataKey="volume" fill="#ef4444" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={card}>
            <h3 style={{margin:'0 0 20px',fontSize:'1rem',fontWeight:700,color:'white'}}>👥 User Growth</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{fill:'#475569',fontSize:12}} />
                <YAxis tick={{fill:'#475569',fontSize:12}} />
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'white'}} />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} dot={{fill:'#6366f1'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Users + Recent Orders */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div style={card}>
            <h3 style={{margin:'0 0 16px',fontSize:'1rem',fontWeight:700,color:'white'}}>👥 Recent Registrations</h3>
            {users.length===0?(
              <p style={{color:'#475569',textAlign:'center',padding:'20px'}}>No users registered yet!</p>
            ):(
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr>{['Name','Email','Status','Action'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {users.slice(0,5).map((u,i)=>(
                    <tr key={i}>
                      <td style={{...td,color:'white',fontWeight:600}}>{u.full_name||u.name}</td>
                      <td style={{...td,fontSize:'0.78rem'}}>{u.email}</td>
                      <td style={td}><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,background:frozenUsers.includes(u.email)?'rgba(239,68,68,0.15)':'rgba(16,185,129,0.15)',color:frozenUsers.includes(u.email)?'#ef4444':'#10b981'}}>{frozenUsers.includes(u.email)?'Frozen':'Active'}</span></td>
                      <td style={td}><button onClick={()=>toggleFreeze(u.email)} style={{padding:'4px 10px',borderRadius:'6px',border:'none',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,background:frozenUsers.includes(u.email)?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:frozenUsers.includes(u.email)?'#10b981':'#ef4444'}}>{frozenUsers.includes(u.email)?'Unfreeze':'Freeze'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={card}>
            <h3 style={{margin:'0 0 16px',fontSize:'1rem',fontWeight:700,color:'white'}}>📋 Recent Trades</h3>
            {orders.length===0?(
              <p style={{color:'#475569',textAlign:'center',padding:'20px'}}>No trades yet!</p>
            ):(
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr>{['User','Ticker','Type','Total'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {orders.slice(0,5).map((o,i)=>(
                    <tr key={i}>
                      <td style={{...td,color:'white',fontWeight:600,fontSize:'0.8rem'}}>{o.userName||o.userEmail}</td>
                      <td style={{...td,color:'#6366f1',fontWeight:700}}>{o.ticker}</td>
                      <td style={td}><span style={{padding:'3px 8px',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,background:o.type==='BUY'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:o.type==='BUY'?'#10b981':'#ef4444'}}>{o.type}</span></td>
                      <td style={{...td,color:'white',fontWeight:600}}>{o.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </>
    );

    /* ── USERS ── */
    if (activeMenu==='Users') return (
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h3 style={{margin:0,fontSize:'1.1rem',fontWeight:700,color:'white'}}>👥 All Registered Users ({users.length})</h3>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            <input placeholder="Search users..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              style={{padding:'8px 14px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'white',outline:'none',width:'200px',fontSize:'0.85rem'}} />
            <button onClick={loadData} style={{padding:'8px 14px',borderRadius:'10px',border:'none',background:'rgba(99,102,241,0.2)',color:'#6366f1',fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>🔄 Refresh</button>
          </div>
        </div>
        {users.length===0?(
          <div style={{textAlign:'center',padding:'40px',color:'#475569'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>👥</div>
            <p>No users have registered yet!</p>
            <p style={{fontSize:'0.85rem'}}>Users will appear here when they sign up at /register</p>
          </div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Name','Email','Joined','Trades','Status','Actions'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {users.filter(u=>(u.full_name||u.name||'').toLowerCase().includes(searchQuery.toLowerCase())||(u.email||'').toLowerCase().includes(searchQuery.toLowerCase())).map((u,i)=>(
                <tr key={i}>
                  <td style={{...td,color:'white',fontWeight:600}}>{u.full_name||u.name||'Unknown'}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>{u.joined||'Today'}</td>
                  <td style={td}>{orders.filter(o=>o.userEmail===u.email).length}</td>
                  <td style={td}><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,background:frozenUsers.includes(u.email)?'rgba(239,68,68,0.15)':'rgba(16,185,129,0.15)',color:frozenUsers.includes(u.email)?'#ef4444':'#10b981'}}>{frozenUsers.includes(u.email)?'Frozen':'Active'}</span></td>
                  <td style={td}>
                    <button onClick={()=>toggleFreeze(u.email)} style={{padding:'4px 10px',borderRadius:'6px',border:'none',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,background:frozenUsers.includes(u.email)?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:frozenUsers.includes(u.email)?'#10b981':'#ef4444',marginRight:'6px'}}>{frozenUsers.includes(u.email)?'✅ Unfreeze':'🧊 Freeze'}</button>
                    <button onClick={()=>toast.success(`Email sent to ${u.email}!`)} style={{padding:'4px 10px',borderRadius:'6px',border:'none',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,background:'rgba(99,102,241,0.15)',color:'#6366f1'}}>📧 Email</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );

    /* ── TRANSACTIONS ── */
    if (activeMenu==='Transactions') return (
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h3 style={{margin:0,fontSize:'1.1rem',fontWeight:700,color:'white'}}>💳 All User Transactions ({orders.length})</h3>
          <button onClick={loadData} style={{padding:'8px 14px',borderRadius:'10px',border:'none',background:'rgba(99,102,241,0.2)',color:'#6366f1',fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>🔄 Refresh</button>
        </div>
        {orders.length===0?(
          <div style={{textAlign:'center',padding:'40px',color:'#475569'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>💳</div>
            <p>No transactions yet! Users need to place orders first.</p>
          </div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['User','Email','Ticker','Type','Qty','Price','Total','Date','Time'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {orders.map((o,i)=>(
                <tr key={i}>
                  <td style={{...td,color:'white',fontWeight:600}}>{o.userName||'User'}</td>
                  <td style={{...td,fontSize:'0.78rem'}}>{o.userEmail}</td>
                  <td style={{...td,color:'#6366f1',fontWeight:700}}>{o.ticker}</td>
                  <td style={td}><span style={{padding:'3px 8px',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,background:o.type==='BUY'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:o.type==='BUY'?'#10b981':'#ef4444'}}>{o.type}</span></td>
                  <td style={td}>{o.qty}</td>
                  <td style={td}>{o.price}</td>
                  <td style={{...td,color:'white',fontWeight:600}}>{o.total}</td>
                  <td style={td}>{o.date}</td>
                  <td style={td}>{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );

    /* ── ORDERS ── */
    if (activeMenu==='Orders') return (
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h3 style={{margin:0,fontSize:'1.1rem',fontWeight:700,color:'white'}}>📋 All Orders ({orders.length})</h3>
          <div style={{display:'flex',gap:'16px'}}>
            <div style={{textAlign:'center',padding:'8px 16px',background:'rgba(16,185,129,0.1)',borderRadius:'10px'}}>
              <div style={{color:'#10b981',fontWeight:700}}>{orders.filter(o=>o.type==='BUY').length}</div>
              <div style={{color:'#475569',fontSize:'0.75rem'}}>BUY Orders</div>
            </div>
            <div style={{textAlign:'center',padding:'8px 16px',background:'rgba(239,68,68,0.1)',borderRadius:'10px'}}>
              <div style={{color:'#ef4444',fontWeight:700}}>{orders.filter(o=>o.type==='SELL').length}</div>
              <div style={{color:'#475569',fontSize:'0.75rem'}}>SELL Orders</div>
            </div>
          </div>
        </div>
        {orders.length===0?(
          <div style={{textAlign:'center',padding:'40px',color:'#475569'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>📋</div>
            <p>No orders placed yet!</p>
          </div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['#','Trader','Ticker','Type','Qty','Price','Total','Date','Status'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {orders.map((o,i)=>(
                <tr key={i}>
                  <td style={{...td,color:'#475569'}}>{orders.length-i}</td>
                  <td style={{...td,color:'white',fontWeight:600}}>{o.userName||'User'}</td>
                  <td style={{...td,color:'#6366f1',fontWeight:700}}>{o.ticker}</td>
                  <td style={td}><span style={{padding:'3px 8px',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,background:o.type==='BUY'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:o.type==='BUY'?'#10b981':'#ef4444'}}>{o.type}</span></td>
                  <td style={td}>{o.qty}</td>
                  <td style={td}>{o.price}</td>
                  <td style={{...td,color:'white',fontWeight:600}}>{o.total}</td>
                  <td style={td}>{o.date}</td>
                  <td style={td}><span style={{color:'#10b981',fontWeight:600,fontSize:'0.8rem'}}>✅ Filled</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );

    /* ── MARKET DATA ── */
    if (activeMenu==='Market Data') return (
      <>
        <div style={card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <h3 style={{margin:0,fontSize:'1.1rem',fontWeight:700,color:'white'}}>📈 Live Market Data — 25 Stocks</h3>
            <button onClick={()=>toast.success('Market data refreshed!')} style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#94a3b8',fontWeight:600,cursor:'pointer'}}>🔄 Refresh</button>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Ticker','Company','Price','Change','Volume','Market Cap','Status'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {MARKET_DATA.map(m=>(
                  <tr key={m.ticker}>
                    <td style={{...td,color:'#6366f1',fontWeight:800}}>{m.ticker}</td>
                    <td style={td}>{m.name}</td>
                    <td style={{...td,color:'white',fontWeight:700}}>${marketPrices[m.ticker]||m.price.toFixed(2)}</td>
                    <td style={td}><span style={{color:m.change>=0?'#10b981':'#ef4444',fontWeight:700}}>{m.change>=0?'▲':'▼'} {Math.abs(m.change).toFixed(2)}%</span></td>
                    <td style={td}>{m.vol}</td>
                    <td style={td}>{m.cap}</td>
                    <td style={td}><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,background:'rgba(16,185,129,0.15)',color:'#10b981'}}>Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={card}>
          <h3 style={{margin:'0 0 16px',fontSize:'1rem',fontWeight:700,color:'white'}}>⚡ Update Stock Price</h3>
          <div style={{display:'flex',gap:'16px',alignItems:'flex-end',flexWrap:'wrap'}}>
            <div>
              <label style={{color:'#475569',fontSize:'0.8rem',display:'block',marginBottom:'8px'}}>TICKER</label>
              <select value={newStock} onChange={e=>setNewStock(e.target.value)} style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'white',outline:'none',width:'160px'}}>
                <option value="">Select...</option>
                {MARKET_DATA.map(m=><option key={m.ticker} value={m.ticker}>{m.ticker}</option>)}
              </select>
            </div>
            <div>
              <label style={{color:'#475569',fontSize:'0.8rem',display:'block',marginBottom:'8px'}}>NEW PRICE ($)</label>
              <input value={newPrice} onChange={e=>setNewPrice(e.target.value)} placeholder="e.g. 195.00" type="number"
                style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'white',outline:'none',width:'140px'}} />
            </div>
            <button onClick={()=>{
              if(!newStock||!newPrice){toast.error('Select ticker and enter price!');return;}
              setMarketPrices({...marketPrices,[newStock]:parseFloat(newPrice).toFixed(2)});
              toast.success(`${newStock} updated to $${newPrice}!`);
              setNewStock('');setNewPrice('');
            }} style={{padding:'10px 20px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',fontWeight:700,cursor:'pointer'}}>
              Update Price
            </button>
          </div>
        </div>
      </>
    );

    /* ── REPORTS ── */
    if (activeMenu==='Reports') return (
      <div style={card}>
        <h3 style={{margin:'0 0 24px',fontSize:'1.1rem',fontWeight:700,color:'white'}}>📄 Platform Reports</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
          {[
            {title:'User Report',     desc:`${users.length} registered users`,icon:'👥',color:'#6366f1'},
            {title:'Trade Report',    desc:`${orders.length} total trades`,   icon:'📊',color:'#10b981'},
            {title:'Revenue Report',  desc:`$${totalRevenue.toFixed(2)} earned`,icon:'💰',color:'#f59e0b'},
            {title:'Orders Report',   desc:`BUY: ${orders.filter(o=>o.type==='BUY').length} SELL: ${orders.filter(o=>o.type==='SELL').length}`,icon:'📋',color:'#ef4444'},
            {title:'Market Report',   desc:'25 stocks performance',           icon:'📈',color:'#8b5cf6'},
            {title:'Analytics Report',desc:'Platform usage analytics',        icon:'🔬',color:'#06b6d4'},
          ].map(r=>(
            <div key={r.title} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'20px'}}>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>{r.icon}</div>
              <h4 style={{margin:'0 0 8px',color:'white',fontWeight:700}}>{r.title}</h4>
              <p style={{margin:'0 0 16px',color:'#475569',fontSize:'0.85rem'}}>{r.desc}</p>
              <button onClick={()=>toast.success(`${r.title} downloaded!`)} style={{width:'100%',padding:'8px',borderRadius:'8px',border:`1px solid ${r.color}40`,background:`${r.color}15`,color:r.color,fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>
                📥 Download
              </button>
            </div>
          ))}
        </div>
      </div>
    );

    /* ── ANALYTICS ── */
    if (activeMenu==='Analytics') return (
      <>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'20px'}}>
          {[
            {label:'Avg Trades/User',value:users.length?+(orders.length/users.length).toFixed(1):0,color:'#6366f1'},
            {label:'Total Volume',value:`$${orders.reduce((s,o)=>s+parseFloat(o.total?.replace('$','')||'0'),0).toFixed(0)}`,color:'#10b981'},
            {label:'Top Stock',value:orders.length?orders.reduce((acc:any,o)=>{acc[o.ticker]=(acc[o.ticker]||0)+1;return acc;},{})?Object.entries(orders.reduce((acc:any,o)=>{acc[o.ticker]=(acc[o.ticker]||0)+1;return acc;},{})).sort((a:any,b:any)=>b[1]-a[1])[0]?.[0]||'N/A':'N/A':'N/A',color:'#f59e0b'},
            {label:'Platform Revenue',value:`$${totalRevenue.toFixed(2)}`,color:'#ef4444'},
          ].map(s=>(
            <div key={s.label} style={{...card,textAlign:'center',marginBottom:0}}>
              <div style={{fontSize:'1.6rem',fontWeight:800,color:s.color,marginBottom:'4px'}}>{s.value}</div>
              <div style={{color:'#475569',fontSize:'0.8rem'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div style={card}>
            <h3 style={{margin:'0 0 20px',fontSize:'1rem',fontWeight:700,color:'white'}}>📊 Trading Volume</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{fill:'#475569',fontSize:12}} />
                <YAxis tick={{fill:'#475569',fontSize:12}} />
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'white'}} />
                <Bar dataKey="volume" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={card}>
            <h3 style={{margin:'0 0 20px',fontSize:'1rem',fontWeight:700,color:'white'}}>👥 User Growth</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{fill:'#475569',fontSize:12}} />
                <YAxis tick={{fill:'#475569',fontSize:12}} />
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'white'}} />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} dot={{fill:'#10b981'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );

    /* ── SETTINGS ── */
    if (activeMenu==='Settings') return (
      <div style={card}>
        <h3 style={{margin:'0 0 24px',fontSize:'1.1rem',fontWeight:700,color:'white'}}>⚙️ Admin Settings</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}>
          {[
            {label:'Platform Name',    value:'StockSight AI',     type:'text'},
            {label:'Admin Email',      value:'admin@stocksight.com',type:'email'},
            {label:'Trading Fee (%)',  value:'0.5',               type:'number'},
            {label:'Max Withdrawal ($)',value:'50000',             type:'number'},
          ].map(s=>(
            <div key={s.label}>
              <label style={{color:'#64748b',fontSize:'0.8rem',fontWeight:700,display:'block',marginBottom:'8px'}}>{s.label.toUpperCase()}</label>
              <input defaultValue={s.value} type={s.type}
                style={{width:'100%',padding:'12px 16px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'white',fontSize:'0.95rem',outline:'none',boxSizing:'border-box'}} />
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={()=>toast.success('Settings saved!')} style={{padding:'12px 24px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',fontWeight:700,cursor:'pointer'}}>
            💾 Save Settings
          </button>
          <button onClick={()=>{localStorage.removeItem('adminToken');navigate('/admin/login');}} style={{padding:'12px 24px',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.1)',color:'#ef4444',fontWeight:600,cursor:'pointer'}}>
            🚪 Logout
          </button>
        </div>
      </div>
    );

    return null;
  };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#060a14',fontFamily:"'DM Sans',sans-serif",color:'white'}}>
      {/* SIDEBAR */}
      <div style={{width:'240px',minHeight:'100vh',background:'#0f172a',borderRight:'1px solid rgba(255,255,255,0.06)',display:'flex',flexDirection:'column',padding:'24px 0',flexShrink:0}}>
        <div style={{padding:'0 20px 24px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,#dc2626,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🛡️</div>
            <div>
              <div style={{fontWeight:800,fontSize:'1rem'}}>StockSight</div>
              <div style={{fontSize:'0.7rem',color:'#ef4444',fontWeight:600}}>ADMIN PANEL</div>
            </div>
          </div>
        </div>
        <nav style={{padding:'16px 12px',flex:1}}>
          {menuItems.map(item=>(
            <button key={item.label} onClick={()=>setActiveMenu(item.label)} style={{width:'100%',display:'flex',alignItems:'center',gap:'12px',padding:'10px 12px',borderRadius:'10px',border:'none',cursor:'pointer',background:activeMenu===item.label?'rgba(239,68,68,0.15)':'transparent',color:activeMenu===item.label?'#fca5a5':'#64748b',fontSize:'0.9rem',fontWeight:activeMenu===item.label?700:400,marginBottom:'4px',textAlign:'left',transition:'all 0.15s'}}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'16px 20px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{padding:'12px',background:'rgba(255,255,255,0.03)',borderRadius:'10px',marginBottom:'12px'}}>
            <div style={{fontWeight:700,fontSize:'0.85rem',color:'white'}}>Admin</div>
            <div style={{fontSize:'0.75rem',color:'#475569'}}>admin@stocksight.com</div>
          </div>
          <button onClick={()=>{localStorage.removeItem('adminToken');navigate('/admin/login');}} style={{width:'100%',padding:'10px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',cursor:'pointer',fontWeight:600,fontSize:'0.85rem'}}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'auto'}}>
        <div style={{height:'64px',background:'#0f172a',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',flexShrink:0}}>
          <div>
            <h1 style={{margin:0,fontSize:'1.2rem',fontWeight:800}}>{activeMenu}</h1>
            <p style={{margin:0,fontSize:'0.75rem',color:'#475569'}}>StockSight AI Admin • {users.length} users • {orders.length} trades</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <button onClick={loadData} style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'transparent',color:'#94a3b8',fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>🔄 Refresh Data</button>
            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#dc2626,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.9rem'}}>A</div>
          </div>
        </div>
        <div style={{padding:'32px',flex:1}}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;