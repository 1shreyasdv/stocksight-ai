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
const allUsers = [
  {name:'Arjun Sharma', email:'arjun@gmail.com', joined:'2026-03-20',status:'Active', trades:12, kyc:'Verified'},
  {name:'Priya Patel',  email:'priya@gmail.com',  joined:'2026-03-19',status:'Active', trades:8,  kyc:'Verified'},
  {name:'Rohan Mehta',  email:'rohan@gmail.com',  joined:'2026-03-18',status:'Pending',trades:0,  kyc:'Pending'},
  {name:'Sneha Reddy',  email:'sneha@gmail.com',  joined:'2026-03-17',status:'Active', trades:24, kyc:'Verified'},
  {name:'Vikram Singh', email:'vikram@gmail.com', joined:'2026-03-16',status:'Frozen', trades:3,  kyc:'Rejected'},
  {name:'Anita Kumar',  email:'anita@gmail.com',  joined:'2026-03-15',status:'Active', trades:17, kyc:'Verified'},
  {name:'Rahul Gupta',  email:'rahul@gmail.com',  joined:'2026-03-14',status:'Pending',trades:0,  kyc:'Pending'},
];
const allTrades = [
  {user:'Arjun Sharma', ticker:'AAPL',type:'BUY', qty:10,price:'$189.40',total:'$1,894',time:'10:24 AM',date:'2026-03-21'},
  {user:'Priya Patel',  ticker:'TSLA',type:'SELL',qty:5, price:'$248.20',total:'$1,241',time:'10:18 AM',date:'2026-03-21'},
  {user:'Sneha Reddy',  ticker:'NVDA',type:'BUY', qty:8, price:'$875.30',total:'$7,002',time:'09:55 AM',date:'2026-03-21'},
  {user:'Arjun Sharma', ticker:'MSFT',type:'BUY', qty:15,price:'$412.10',total:'$6,181',time:'09:41 AM',date:'2026-03-21'},
  {user:'Priya Patel',  ticker:'AMZN',type:'SELL',qty:3, price:'$182.50',total:'$547', time:'09:30 AM',date:'2026-03-20'},
  {user:'Anita Kumar',  ticker:'GOOGL',type:'BUY',qty:6, price:'$175.20',total:'$1,051',time:'03:15 PM',date:'2026-03-20'},
  {user:'Rahul Gupta',  ticker:'META', type:'BUY',qty:4, price:'$524.80',total:'$2,099',time:'02:45 PM',date:'2026-03-20'},
];
const transactions = [
  {user:'Arjun Sharma', type:'Deposit',   amount:'$5,000',method:'Bank Transfer',status:'Completed',date:'2026-03-21'},
  {user:'Priya Patel',  type:'Withdrawal',amount:'$1,200',method:'UPI',           status:'Completed',date:'2026-03-21'},
  {user:'Sneha Reddy',  type:'Deposit',   amount:'$10,000',method:'Wire Transfer',status:'Pending',  date:'2026-03-20'},
  {user:'Rohan Mehta',  type:'Deposit',   amount:'$2,500',method:'Bank Transfer', status:'Completed',date:'2026-03-20'},
  {user:'Vikram Singh', type:'Withdrawal',amount:'$800',  method:'UPI',           status:'Failed',   date:'2026-03-19'},
  {user:'Anita Kumar',  type:'Deposit',   amount:'$3,000',method:'Bank Transfer', status:'Completed',date:'2026-03-19'},
];
const marketData = [
  {ticker:'AAPL', name:'Apple Inc.',       price:'$189.40',change:'+2.15%',volume:'52.3M',cap:'$2.94T',status:'Active'},
  {ticker:'TSLA', name:'Tesla Inc.',       price:'$248.20',change:'-0.86%',volume:'31.2M',cap:'$789B', status:'Active'},
  {ticker:'NVDA', name:'NVIDIA Corp.',     price:'$875.30',change:'+3.42%',volume:'41.8M',cap:'$2.15T',status:'Active'},
  {ticker:'MSFT', name:'Microsoft Corp.',  price:'$412.10',change:'+1.23%',volume:'22.1M',cap:'$3.06T',status:'Active'},
  {ticker:'AMZN', name:'Amazon.com Inc.',  price:'$182.50',change:'+0.94%',volume:'28.5M',cap:'$1.89T',status:'Active'},
  {ticker:'GOOGL',name:'Alphabet Inc.',    price:'$175.20',change:'-0.32%',volume:'19.4M',cap:'$2.18T',status:'Active'},
  {ticker:'META', name:'Meta Platforms',   price:'$524.80',change:'+1.87%',volume:'15.6M',cap:'$1.33T',status:'Active'},
];

const S = (style: React.CSSProperties) => style;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [frozenUsers, setFrozenUsers] = useState<string[]>(['Vikram Singh']);
  const [kycStatus, setKycStatus] = useState<any>({
    'Rohan Mehta':'Pending','Rahul Gupta':'Pending',
    'Arjun Sharma':'Verified','Priya Patel':'Verified',
    'Sneha Reddy':'Verified','Anita Kumar':'Verified','Vikram Singh':'Rejected'
  });
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const updateKYC = (name: string, status: string) => {
    setKycStatus({...kycStatus,[name]:status});
    toast.success(`${name} KYC ${status}!`);
  };

  const cardStyle: React.CSSProperties = {
    background:'#0f172a', border:'1px solid rgba(255,255,255,0.06)',
    borderRadius:'16px', padding:'24px', marginBottom:'20px'
  };

  const thStyle: React.CSSProperties = {
    padding:'10px 12px', textAlign:'left', color:'#475569',
    fontWeight:600, fontSize:'0.8rem', borderBottom:'1px solid rgba(255,255,255,0.06)'
  };

  const tdStyle: React.CSSProperties = {
    padding:'12px', borderBottom:'1px solid rgba(255,255,255,0.03)',
    fontSize:'0.85rem'
  };

  const renderContent = () => {

    /* ── DASHBOARD ── */
    if (activeMenu === 'Dashboard') return (
      <>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px',marginBottom:'28px'}}>
          {stats.map(s=>(
            <div key={s.label} style={cardStyle}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <p style={{margin:'0 0 8px',color:'#475569',fontSize:'0.8rem',fontWeight:600}}>{s.label.toUpperCase()}</p>
                  <p style={{margin:0,fontSize:'2rem',fontWeight:800}}>{s.value}</p>
                  <span style={{color:'#10b981',fontSize:'0.8rem',fontWeight:600}}>{s.change} this week</span>
                </div>
                <div style={{width:'44px',height:'44px',borderRadius:'12px',background:`${s.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'28px'}}>
          <div style={cardStyle}>
            <h3 style={{margin:'0 0 20px',fontSize:'1rem',fontWeight:700}}>📊 Trading Volume (This Week)</h3>
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
          <div style={cardStyle}>
            <h3 style={{margin:'0 0 20px',fontSize:'1rem',fontWeight:700}}>👥 User Growth (2026)</h3>
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
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div style={cardStyle}>
            <h3 style={{margin:'0 0 16px',fontSize:'1rem',fontWeight:700}}>👥 Recent Registrations</h3>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Name','Status','Action'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {allUsers.slice(0,5).map(u=>(
                  <tr key={u.name}>
                    <td style={tdStyle}><div style={{fontWeight:600,color:'white'}}>{u.name}</div><div style={{color:'#475569',fontSize:'0.75rem'}}>{u.email}</div></td>
                    <td style={tdStyle}><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,background:frozenUsers.includes(u.name)?'rgba(239,68,68,0.15)':u.status==='Active'?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)',color:frozenUsers.includes(u.name)?'#ef4444':u.status==='Active'?'#10b981':'#f59e0b'}}>{frozenUsers.includes(u.name)?'Frozen':u.status}</span></td>
                    <td style={tdStyle}><button onClick={()=>toggleFreeze(u.name)} style={{padding:'4px 10px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,background:frozenUsers.includes(u.name)?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:frozenUsers.includes(u.name)?'#10b981':'#ef4444'}}>{frozenUsers.includes(u.name)?'✅ Unfreeze':'🧊 Freeze'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={cardStyle}>
            <h3 style={{margin:'0 0 16px',fontSize:'1rem',fontWeight:700}}>📋 Latest Trades</h3>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['User','Ticker','Type','Price'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {allTrades.slice(0,5).map((t,i)=>(
                  <tr key={i}>
                    <td style={{...tdStyle,color:'white',fontWeight:600,fontSize:'0.8rem'}}>{t.user}</td>
                    <td style={{...tdStyle,color:'#6366f1',fontWeight:700}}>{t.ticker}</td>
                    <td style={tdStyle}><span style={{padding:'3px 8px',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,background:t.type==='BUY'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:t.type==='BUY'?'#10b981':'#ef4444'}}>{t.type}</span></td>
                    <td style={{...tdStyle,color:'#94a3b8'}}>{t.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );

    /* ── USERS ── */
    if (activeMenu === 'Users') return (
      <div style={cardStyle}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h3 style={{margin:0,fontSize:'1.1rem',fontWeight:700}}>👥 All Users ({allUsers.length})</h3>
          <input placeholder="Search users..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            style={{padding:'8px 14px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'white',outline:'none',width:'200px'}} />
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Name','Email','Joined','Trades','KYC','Status','Actions'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {allUsers.filter(u=>u.name.toLowerCase().includes(searchQuery.toLowerCase())||u.email.toLowerCase().includes(searchQuery.toLowerCase())).map(u=>(
              <tr key={u.name}>
                <td style={{...tdStyle,color:'white',fontWeight:600}}>{u.name}</td>
                <td style={{...tdStyle,color:'#475569'}}>{u.email}</td>
                <td style={{...tdStyle,color:'#475569'}}>{u.joined}</td>
                <td style={{...tdStyle,color:'#94a3b8'}}>{u.trades}</td>
                <td style={tdStyle}><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,background:kycStatus[u.name]==='Verified'?'rgba(16,185,129,0.15)':kycStatus[u.name]==='Rejected'?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)',color:kycStatus[u.name]==='Verified'?'#10b981':kycStatus[u.name]==='Rejected'?'#ef4444':'#f59e0b'}}>{kycStatus[u.name]}</span></td>
                <td style={tdStyle}><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,background:frozenUsers.includes(u.name)?'rgba(239,68,68,0.15)':u.status==='Active'?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)',color:frozenUsers.includes(u.name)?'#ef4444':u.status==='Active'?'#10b981':'#f59e0b'}}>{frozenUsers.includes(u.name)?'Frozen':u.status}</span></td>
                <td style={tdStyle}>
                  <button onClick={()=>toggleFreeze(u.name)} style={{padding:'4px 8px',borderRadius:'6px',border:'none',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,background:frozenUsers.includes(u.name)?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:frozenUsers.includes(u.name)?'#10b981':'#ef4444',marginRight:'6px'}}>{frozenUsers.includes(u.name)?'Unfreeze':'Freeze'}</button>
                  <button onClick={()=>toast.success(`Email sent to ${u.name}!`)} style={{padding:'4px 8px',borderRadius:'6px',border:'none',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,background:'rgba(99,102,241,0.15)',color:'#6366f1'}}>📧 Email</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    /* ── KYC ── */
    if (activeMenu === 'KYC Verification') return (
      <div style={cardStyle}>
        <h3 style={{margin:'0 0 20px',fontSize:'1.1rem',fontWeight:700}}>✅ KYC Verification Requests</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'24px'}}>
          {[{label:'Total Requests',value:allUsers.length,color:'#6366f1'},{label:'Pending',value:allUsers.filter(u=>kycStatus[u.name]==='Pending').length,color:'#f59e0b'},{label:'Verified',value:allUsers.filter(u=>kycStatus[u.name]==='Verified').length,color:'#10b981'}].map(s=>(
            <div key={s.label} style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${s.color}30`,borderRadius:'12px',padding:'16px',textAlign:'center'}}>
              <div style={{fontSize:'1.8rem',fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{color:'#475569',fontSize:'0.85rem'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['User','Email','Joined','Current Status','Actions'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {allUsers.map(u=>(
              <tr key={u.name}>
                <td style={{...tdStyle,color:'white',fontWeight:600}}>{u.name}</td>
                <td style={{...tdStyle,color:'#475569'}}>{u.email}</td>
                <td style={{...tdStyle,color:'#475569'}}>{u.joined}</td>
                <td style={tdStyle}><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,background:kycStatus[u.name]==='Verified'?'rgba(16,185,129,0.15)':kycStatus[u.name]==='Rejected'?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)',color:kycStatus[u.name]==='Verified'?'#10b981':kycStatus[u.name]==='Rejected'?'#ef4444':'#f59e0b'}}>{kycStatus[u.name]}</span></td>
                <td style={tdStyle}>
                  <button onClick={()=>updateKYC(u.name,'Verified')} style={{padding:'4px 10px',borderRadius:'6px',border:'none',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,background:'rgba(16,185,129,0.15)',color:'#10b981',marginRight:'6px'}}>✅ Approve</button>
                  <button onClick={()=>updateKYC(u.name,'Rejected')} style={{padding:'4px 10px',borderRadius:'6px',border:'none',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,background:'rgba(239,68,68,0.15)',color:'#ef4444',marginRight:'6px'}}>❌ Reject</button>
                  <button onClick={()=>updateKYC(u.name,'Pending')} style={{padding:'4px 10px',borderRadius:'6px',border:'none',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}>⏳ Pending</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    /* ── TRANSACTIONS ── */
    if (activeMenu === 'Transactions') return (
      <div style={cardStyle}>
        <h3 style={{margin:'0 0 20px',fontSize:'1.1rem',fontWeight:700}}>💳 All Transactions</h3>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['User','Type','Amount','Method','Status','Date'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {transactions.map((t,i)=>(
              <tr key={i}>
                <td style={{...tdStyle,color:'white',fontWeight:600}}>{t.user}</td>
                <td style={tdStyle}><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,background:t.type==='Deposit'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:t.type==='Deposit'?'#10b981':'#ef4444'}}>{t.type}</span></td>
                <td style={{...tdStyle,color:'white',fontWeight:700}}>{t.amount}</td>
                <td style={{...tdStyle,color:'#475569'}}>{t.method}</td>
                <td style={tdStyle}><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,background:t.status==='Completed'?'rgba(16,185,129,0.15)':t.status==='Pending'?'rgba(245,158,11,0.15)':'rgba(239,68,68,0.15)',color:t.status==='Completed'?'#10b981':t.status==='Pending'?'#f59e0b':'#ef4444'}}>{t.status}</span></td>
                <td style={{...tdStyle,color:'#475569'}}>{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    /* ── ORDERS ── */
    if (activeMenu === 'Orders') return (
      <div style={cardStyle}>
        <h3 style={{margin:'0 0 20px',fontSize:'1.1rem',fontWeight:700}}>📋 All Orders & Trades</h3>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['User','Ticker','Type','Qty','Price','Total','Time','Date'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {allTrades.map((t,i)=>(
              <tr key={i}>
                <td style={{...tdStyle,color:'white',fontWeight:600,fontSize:'0.8rem'}}>{t.user}</td>
                <td style={{...tdStyle,color:'#6366f1',fontWeight:700}}>{t.ticker}</td>
                <td style={tdStyle}><span style={{padding:'3px 8px',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,background:t.type==='BUY'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',color:t.type==='BUY'?'#10b981':'#ef4444'}}>{t.type}</span></td>
                <td style={{...tdStyle,color:'#94a3b8'}}>{t.qty}</td>
                <td style={{...tdStyle,color:'#94a3b8'}}>{t.price}</td>
                <td style={{...tdStyle,color:'white',fontWeight:600}}>{t.total}</td>
                <td style={{...tdStyle,color:'#475569'}}>{t.time}</td>
                <td style={{...tdStyle,color:'#475569'}}>{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    /* ── MARKET DATA ── */
    if (activeMenu === 'Market Data') return (
      <>
        <div style={{...cardStyle,marginBottom:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <h3 style={{margin:0,fontSize:'1.1rem',fontWeight:700}}>📈 Live Market Data</h3>
            <button onClick={()=>toast.success('Market data refreshed!')} style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#94a3b8',cursor:'pointer',fontWeight:600}}>🔄 Refresh</button>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Ticker','Company','Price','Change','Volume','Market Cap','Status'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {marketData.map(m=>(
                <tr key={m.ticker}>
                  <td style={{...tdStyle,color:'#6366f1',fontWeight:800}}>{m.ticker}</td>
                  <td style={{...tdStyle,color:'white'}}>{m.name}</td>
                  <td style={{...tdStyle,color:'white',fontWeight:700}}>{m.price}</td>
                  <td style={tdStyle}><span style={{color:m.change.startsWith('+')?'#10b981':'#ef4444',fontWeight:700}}>{m.change}</span></td>
                  <td style={{...tdStyle,color:'#475569'}}>{m.volume}</td>
                  <td style={{...tdStyle,color:'#94a3b8'}}>{m.cap}</td>
                  <td style={tdStyle}><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:600,background:'rgba(16,185,129,0.15)',color:'#10b981'}}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={cardStyle}>
          <h3 style={{margin:'0 0 16px',fontSize:'1rem',fontWeight:700}}>⚡ Update Stock Price</h3>
          <div style={{display:'flex',gap:'16px',alignItems:'flex-end'}}>
            <div>
              <label style={{color:'#475569',fontSize:'0.8rem',display:'block',marginBottom:'8px'}}>TICKER</label>
              <input value={newStock} onChange={e=>setNewStock(e.target.value)} placeholder="e.g. AAPL"
                style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'white',outline:'none',width:'140px'}} />
            </div>
            <div>
              <label style={{color:'#475569',fontSize:'0.8rem',display:'block',marginBottom:'8px'}}>NEW PRICE ($)</label>
              <input value={newPrice} onChange={e=>setNewPrice(e.target.value)} placeholder="e.g. 195.00"
                style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'white',outline:'none',width:'140px'}} />
            </div>
            <button onClick={()=>{if(!newStock||!newPrice){toast.error('Fill both fields!');return;}toast.success(`${newStock.toUpperCase()} updated to $${newPrice}!`);setNewStock('');setNewPrice('');}} style={{padding:'10px 20px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',fontWeight:700,cursor:'pointer'}}>
              Update Price
            </button>
          </div>
        </div>
      </>
    );

    /* ── REPORTS ── */
    if (activeMenu === 'Reports') return (
      <div style={cardStyle}>
        <h3 style={{margin:'0 0 20px',fontSize:'1.1rem',fontWeight:700}}>📄 Generate Reports</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
          {[
            {title:'User Report',     desc:'All registered users with KYC status',    icon:'👥',color:'#6366f1'},
            {title:'Trade Report',    desc:'All trades and orders summary',             icon:'📊',color:'#10b981'},
            {title:'Revenue Report',  desc:'Brokerage earnings and commissions',       icon:'💰',color:'#f59e0b'},
            {title:'KYC Report',      desc:'KYC verification status summary',          icon:'✅',color:'#ef4444'},
            {title:'Transaction Log', desc:'All deposits and withdrawals',             icon:'💳',color:'#8b5cf6'},
            {title:'Market Summary',  desc:'Daily market performance report',          icon:'📈',color:'#06b6d4'},
          ].map(r=>(
            <div key={r.title} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'20px'}}>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>{r.icon}</div>
              <h4 style={{margin:'0 0 8px',color:'white',fontWeight:700}}>{r.title}</h4>
              <p style={{margin:'0 0 16px',color:'#475569',fontSize:'0.85rem'}}>{r.desc}</p>
              <button onClick={()=>toast.success(`${r.title} generated!`)} style={{width:'100%',padding:'8px',borderRadius:'8px',border:`1px solid ${r.color}40`,background:`${r.color}15`,color:r.color,fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>
                📥 Download
              </button>
            </div>
          ))}
        </div>
      </div>
    );

    /* ── ANALYTICS ── */
    if (activeMenu === 'Analytics') return (
      <>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}>
          <div style={cardStyle}>
            <h3 style={{margin:'0 0 20px',fontSize:'1rem',fontWeight:700}}>📊 Trading Volume Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{fill:'#475569',fontSize:12}} />
                <YAxis tick={{fill:'#475569',fontSize:12}} />
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155'}} />
                <Bar dataKey="volume" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={cardStyle}>
            <h3 style={{margin:'0 0 20px',fontSize:'1rem',fontWeight:700}}>👥 User Growth Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{fill:'#475569',fontSize:12}} />
                <YAxis tick={{fill:'#475569',fontSize:12}} />
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155'}} />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} dot={{fill:'#10b981'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px'}}>
          {[
            {label:'Avg Trades/User',value:'4.1', icon:'📊',color:'#6366f1'},
            {label:'Avg Revenue/Trade',value:'$2.50',icon:'💰',color:'#10b981'},
            {label:'User Retention',value:'78%',icon:'🔄',color:'#f59e0b'},
            {label:'KYC Pass Rate',value:'71%',icon:'✅',color:'#ef4444'},
          ].map(s=>(
            <div key={s.label} style={{...cardStyle,textAlign:'center',marginBottom:0}}>
              <div style={{fontSize:'28px',marginBottom:'8px'}}>{s.icon}</div>
              <div style={{fontSize:'1.8rem',fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{color:'#475569',fontSize:'0.8rem',marginTop:'4px'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </>
    );

    /* ── SETTINGS ── */
    if (activeMenu === 'Settings') return (
      <div style={cardStyle}>
        <h3 style={{margin:'0 0 24px',fontSize:'1.1rem',fontWeight:700}}>⚙️ Admin Settings</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          {[
            {label:'Platform Name',    value:'StockSight AI',type:'text'},
            {label:'Admin Email',      value:'admin@stocksight.com',type:'email'},
            {label:'Trading Fee (%)',  value:'0.05',type:'number'},
            {label:'Max Withdrawal ($)',value:'50000',type:'number'},
          ].map(s=>(
            <div key={s.label}>
              <label style={{color:'#64748b',fontSize:'0.8rem',fontWeight:700,display:'block',marginBottom:'8px'}}>{s.label.toUpperCase()}</label>
              <input defaultValue={s.value} type={s.type}
                style={{width:'100%',padding:'12px 16px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'white',fontSize:'0.95rem',outline:'none',boxSizing:'border-box'}} />
            </div>
          ))}
        </div>
        <div style={{marginTop:'20px',display:'flex',gap:'12px'}}>
          <button onClick={()=>toast.success('Settings saved!')} style={{padding:'12px 24px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',fontWeight:700,cursor:'pointer'}}>
            💾 Save Settings
          </button>
          <button onClick={()=>toast.success('Cache cleared!')} style={{padding:'12px 24px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#94a3b8',fontWeight:600,cursor:'pointer'}}>
            🗑️ Clear Cache
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
            <button key={item.label} onClick={()=>setActiveMenu(item.label)} style={{width:'100%',display:'flex',alignItems:'center',gap:'12px',padding:'10px 12px',borderRadius:'10px',border:'none',cursor:'pointer',background:activeMenu===item.label?'rgba(239,68,68,0.15)':'transparent',color:activeMenu===item.label?'#fca5a5':'#64748b',fontSize:'0.9rem',fontWeight:activeMenu===item.label?700:400,marginBottom:'4px',textAlign:'left'}}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'16px 20px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
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
            <p style={{margin:0,fontSize:'0.75rem',color:'#475569'}}>Admin Dashboard • StockSight AI</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <input placeholder="Search..." style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'white',fontSize:'0.85rem',outline:'none',width:'200px'}} />
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