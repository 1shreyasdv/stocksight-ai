import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';

const UserLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { toast.error('Fill all fields!'); return; }
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Logged in successfully!');
      navigate('/user/dashboard');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)', fontFamily:"'DM Sans',sans-serif" }}>
      {/* LEFT PANEL */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'60px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.1) 1px,transparent 1px)', backgroundSize:'50px 50px' }} />
        <svg width="400" height="200" viewBox="0 0 400 200" style={{ position:'relative', zIndex:1 }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,150 L50,120 L100,130 L150,80 L200,90 L250,50 L300,60 L350,30 L400,40" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
          <path d="M0,150 L50,120 L100,130 L150,80 L200,90 L250,50 L300,60 L350,30 L400,40 L400,200 L0,200Z" fill="url(#chartGrad)" />
          {[0,50,100,150,200,250,300,350,400].map((x,i) => {
            const ys=[150,120,130,80,90,50,60,30,40];
            return <circle key={i} cx={x} cy={ys[i]} r="4" fill="#6366f1" />;
          })}
        </svg>
        <h1 style={{ color:'white', fontSize:'2.5rem', fontWeight:800, textAlign:'center', marginTop:'32px', position:'relative', zIndex:1 }}>
          StockSight <span style={{ color:'#6366f1' }}>AI</span>
        </h1>
        <p style={{ color:'#94a3b8', textAlign:'center', marginTop:'12px', fontSize:'1.1rem', position:'relative', zIndex:1 }}>
          AI-powered predictions for smarter trading
        </p>
        {[{label:'AAPL',value:'+2.4%',color:'#10b981'},{label:'TSLA',value:'-1.2%',color:'#ef4444'},{label:'NVDA',value:'+5.8%',color:'#10b981'}].map((s,i) => (
          <div key={i} style={{ position:'absolute', top:`${20+i*25}%`, right:'10%', background:'rgba(255,255,255,0.05)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 20px', display:'flex', gap:'12px', alignItems:'center' }}>
            <span style={{ color:'white', fontWeight:700 }}>{s.label}</span>
            <span style={{ color:s.color, fontWeight:700 }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:'480px', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px', background:'rgba(255,255,255,0.03)', borderLeft:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ marginBottom:'40px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'20px', padding:'6px 16px', marginBottom:'24px' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#6366f1' }} />
            <span style={{ color:'#6366f1', fontSize:'0.85rem', fontWeight:600 }}>Trader Portal</span>
          </div>
          <h2 style={{ color:'white', fontSize:'2rem', fontWeight:800, margin:0 }}>Welcome back</h2>
          <p style={{ color:'#64748b', marginTop:'8px' }}>Sign in to your trading account</p>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <label style={{ color:'#94a3b8', fontSize:'0.85rem', fontWeight:600, display:'block', marginBottom:'8px' }}>EMAIL ADDRESS</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
            style={{ width:'100%', padding:'14px 16px', borderRadius:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'1rem', outline:'none', boxSizing:'border-box' }} />
        </div>

        <div style={{ marginBottom:'28px' }}>
          <label style={{ color:'#94a3b8', fontSize:'0.85rem', fontWeight:600, display:'block', marginBottom:'8px' }}>PASSWORD</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
            onKeyPress={e=>e.key==='Enter'&&handleLogin()}
            style={{ width:'100%', padding:'14px 16px', borderRadius:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'1rem', outline:'none', boxSizing:'border-box' }} />
        </div>

        <button onClick={handleLogin} disabled={loading} style={{ width:'100%', padding:'16px', borderRadius:'12px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', color:'white', fontSize:'1rem', fontWeight:700, cursor:'pointer', marginBottom:'16px', opacity:loading?0.7:1 }}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        <button onClick={()=>navigate('/register')} style={{ width:'100%', padding:'14px', borderRadius:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:'0.95rem', cursor:'pointer', marginBottom:'24px' }}>
          Don't have an account? Register
        </button>

        <div style={{ textAlign:'center' }}>
          <button onClick={()=>navigate('/admin/login')} style={{ background:'none', border:'none', color:'#475569', fontSize:'0.85rem', cursor:'pointer' }}>
            Admin Login →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;