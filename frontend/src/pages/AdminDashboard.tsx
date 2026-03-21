import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const volumeData = [
  {day:'Mon',volume:4200},{day:'Tue',volume:6800},{day:'Wed',volume:5100},
  {day:'Thu',volume:7900},{day:'Fri',volume:6300},{day:'Sat',volume:3200},{day:'Sun',volume:2800},
];
const userGrowth = [
  {month:'Jan',users:120},{month:'Feb',users:210},{month:'Mar',users:380},
  {month:'Apr',users:520},{month:'May',users:710},{month:'Jun',users:890},
];
const recentUsers = [
  {name:'Arjun Sharma', email:'arjun@gmail.com', joined:'2026-03-20',status:'Active', trades:12},
  {name:'Priya Patel',  email:'priya@gmail.com',  joined:'2026-03-19',status:'Active', trades:8},
  {name:'Rohan Mehta',  email:'rohan@gmail.com',  joined:'2026-03-18',status:'Pending',trades:0},
  {name:'Sneha Reddy',  email:'sneha@gmail.com',  joined:'2026-03-17',status:'Active', trades:24},
  {name:'Vikram Singh', email:'vikram@gmail.com', joined:'2026-03-16',status:'Frozen', trades:3},
];
const recentTrades = [
  {user:'Arjun Sharma',ticker:'AAPL',type:'BUY', qty:10,price:'$189.40',time:'10:24 AM'},
  {user:'Priya Patel',  ticker:'TSLA',type:'SELL',qty:5, price:'$248.20',time:'10:18 AM'},
  {user:'Sneha Reddy',  ticker:'NVDA',type:'BUY', qty:8, price:'$875.30',time:'09:55 AM'},
  {user:'Arjun Sharma', ticker:'MSFT',type:'BUY', qty:15,price:'$412.10',time:'09:41 AM'},
  {user:'Priya Patel',  ticker:'AMZN',type:'SELL',qty:3, price:'$182.50',time:'09:30 AM'},
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [frozenUsers, setFrozenUsers] = useState<string[]>(['Vikram Singh']);
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) navigate('/admin/login');
  }, [navigate]);

  const menuItems = [
    {icon:'📊',label:'Dashboard'},{icon:'👥',label:'Users'},
    {icon:'✅',label:'KYC Verification'},{icon:'💳',label:'Transactions'},
    {icon:'📋',label:'Orders'},{icon:'📈',label:'Market Data'},
    {icon:'📄',label:'Reports'},{icon:'🔬',label:'Analytics'},{icon:'⚙️',label:'Settings'},
  ];

  const stats = [
    {label:'Total Users',   value:'1,284',change:'+12%',icon:'👥',color:'#6366f1'},
    {label:'Active Traders',value:'847',  change:'+8%', icon:'🏃',color:'#10b981'},
    {label:'Trades Today',  value:'3,492',change:'+24%',icon:'📊',color:'#f59e0b'},
    {label:'Revenue Today', value:'$8,741',change:'+15%',icon:'💰',color:'#ef4444'},
  ];

  const toggleFreeze = (name: string) => {
    if (frozenUsers.includes(name)) {
      setFrozenUsers(frozenUsers.filter(u=>u!==name));
      toast.success(`${name} unfrozen!`);
    } else {
      setFrozenUsers([...frozenUsers,name]);
      toast.success(`${name} frozen!`);
    }
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#060a14', fontFamily:"'DM Sans',sans-serif", color:'white' }}>

      {/* SIDEBAR */}
      <div style={{ width:'240px', minHeight:'100vh', background:'#0f172a', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', padding:'24px 0', flexShrink:0 }}>
        <div style={{ padding:'0 20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#dc2626,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🛡️</div>
            <div>
              <div style={{ fontWeight:800, fontSize:'1rem' }}>StockSight</div>
              <div style={{ fontSize:'0.7rem', color:'#ef4444', fontWeight:600 }}>ADMIN PANEL</div>
            </div>
          </div>
        </div>
        <nav style={{ padding:'16px 12px', flex:1 }}>
          {menuItems.map(item => (
            <button key={item.label} onClick={()=>setActiveMenu(item.label)} style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'10px', border:'none', cursor:'pointer', background:activeMenu===item.label?'rgba(239,68,68,0.15)':'transparent', color:activeMenu===item.label?'#fca5a5':'#64748b', fontSize:'0.9rem', fontWeight:activeMenu===item.label?700:400, marginBottom:'4px', textAlign:'left' }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={()=>{localStorage.removeItem('adminToken');navigate('/admin/login');}} style={{ width:'100%', padding:'10px', borderRadius:'10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'auto' }}>

        {/* NAVBAR */}
        <div style={{ height:'64px', background:'#0f172a', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', flexShrink:0 }}>
          <div>
            <h1 style={{ margin:0, fontSize:'1.2rem', fontWeight:800 }}>{activeMenu}</h1>
            <p style={{ margin:0, fontSize:'0.75rem', color:'#475569' }}>Admin Dashboard • StockSight AI</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <input placeholder="Search users, trades..." style={{ padding:'8px 16px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'white', fontSize:'0.85rem', outline:'none', width:'220px' }} />
            <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.9rem' }}>A</div>
          </div>
        </div>

        <div style={{ padding:'32px', flex:1 }}>

          {/* STAT CARDS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'20px', marginBottom:'28px' }}>
            {stats.map(s => (
              <div key={s.label} style={{ background:'#0f172a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <p style={{ margin:'0 0 8px', color:'#475569', fontSize:'0.8rem', fontWeight:600 }}>{s.label.toUpperCase()}</p>
                    <p style={{ margin:0, fontSize:'2rem', fontWeight:800 }}>{s.value}</p>
                    <span style={{ color:'#10b981', fontSize:'0.8rem', fontWeight:600 }}>{s.change} this week</span>
                  </div>
                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${s.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'28px' }}>
            <div style={{ background:'#0f172a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px' }}>
              <h3 style={{ margin:'0 0 20px', fontSize:'1rem', fontWeight:700 }}>📊 Trading Volume (This Week)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{fill:'#475569',fontSize:12}} />
                  <YAxis tick={{fill:'#475569',fontSize:12}} />
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155'}} />
                  <Bar dataKey="volume" fill="#ef4444" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background:'#0f172a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px' }}>
              <h3 style={{ margin:'0 0 20px', fontSize:'1rem', fontWeight:700 }}>👥 User Growth (2026)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{fill:'#475569',fontSize:12}} />
                  <YAxis tick={{fill:'#475569',fontSize:12}} />
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155'}} />
                  <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} dot={{fill:'#6366f1'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLES */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'28px' }}>
            <div style={{ background:'#0f172a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px' }}>
              <h3 style={{ margin:'0 0 20px', fontSize:'1rem', fontWeight:700 }}>👥 Recent Users</h3>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    {['Name','Status','Trades','Action'].map(h=>(
                      <th key={h} style={{ padding:'8px', textAlign:'left', color:'#475569', fontWeight:600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(u=>(
                    <tr key={u.name} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding:'10px 8px' }}>
                        <div style={{ fontWeight:600 }}>{u.name}</div>
                        <div style={{ color:'#475569', fontSize:'0.75rem' }}>{u.email}</div>
                      </td>
                      <td style={{ padding:'10px 8px' }}>
                        <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600, background:frozenUsers.includes(u.name)?'rgba(239,68,68,0.15)':u.status==='Active'?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)', color:frozenUsers.includes(u.name)?'#ef4444':u.status==='Active'?'#10b981':'#f59e0b' }}>
                          {frozenUsers.includes(u.name)?'Frozen':u.status}
                        </span>
                      </td>
                      <td style={{ padding:'10px 8px', color:'#94a3b8' }}>{u.trades}</td>
                      <td style={{ padding:'10px 8px' }}>
                        <button onClick={()=>toggleFreeze(u.name)} style={{ padding:'4px 10px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'0.75rem', fontWeight:600, background:frozenUsers.includes(u.name)?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)', color:frozenUsers.includes(u.name)?'#10b981':'#ef4444' }}>
                          {frozenUsers.includes(u.name)?'✅ Unfreeze':'🧊 Freeze'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background:'#0f172a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px' }}>
              <h3 style={{ margin:'0 0 20px', fontSize:'1rem', fontWeight:700 }}>📋 Latest Trades</h3>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    {['User','Ticker','Type','Price','Time'].map(h=>(
                      <th key={h} style={{ padding:'8px', textAlign:'left', color:'#475569', fontWeight:600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((t,i)=>(
                    <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding:'10px 8px', fontWeight:600, fontSize:'0.8rem' }}>{t.user}</td>
                      <td style={{ padding:'10px 8px', color:'#6366f1', fontWeight:700 }}>{t.ticker}</td>
                      <td style={{ padding:'10px 8px' }}>
                        <span style={{ padding:'3px 8px', borderRadius:'6px', fontSize:'0.75rem', fontWeight:700, background:t.type==='BUY'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)', color:t.type==='BUY'?'#10b981':'#ef4444' }}>{t.type}</span>
                      </td>
                      <td style={{ padding:'10px 8px', color:'#94a3b8' }}>{t.price}</td>
                      <td style={{ padding:'10px 8px', color:'#475569', fontSize:'0.8rem' }}>{t.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ background:'#0f172a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px' }}>
            <h3 style={{ margin:'0 0 20px', fontSize:'1rem', fontWeight:700 }}>⚡ Quick Actions</h3>
            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', alignItems:'flex-end' }}>
              <div>
                <label style={{ color:'#475569', fontSize:'0.8rem', display:'block', marginBottom:'8px' }}>STOCK TICKER</label>
                <input value={newStock} onChange={e=>setNewStock(e.target.value)} placeholder="e.g. AAPL"
                  style={{ padding:'10px 14px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'white', outline:'none', width:'140px' }} />
              </div>
              <div>
                <label style={{ color:'#475569', fontSize:'0.8rem', display:'block', marginBottom:'8px' }}>PRICE ($)</label>
                <input value={newPrice} onChange={e=>setNewPrice(e.target.value)} placeholder="e.g. 189.40"
                  style={{ padding:'10px 14px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'white', outline:'none', width:'140px' }} />
              </div>
              <button onClick={()=>{if(!newStock||!newPrice){toast.error('Fill both fields!');return;}toast.success(`${newStock.toUpperCase()} updated to $${newPrice}!`);setNewStock('');setNewPrice('');}} style={{ padding:'10px 20px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', fontWeight:700, cursor:'pointer' }}>
                + Add / Update Stock
              </button>
              <button onClick={()=>toast.success('Market data refreshed!')} style={{ padding:'10px 20px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#94a3b8', fontWeight:600, cursor:'pointer' }}>
                🔄 Refresh Market Data
              </button>
              <button onClick={()=>toast.success('Report generated!')} style={{ padding:'10px 20px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#94a3b8', fontWeight:600, cursor:'pointer' }}>
                📄 Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;