import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate  = useNavigate();
  const [fullName,  setFullName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) { toast.error('Fill all fields!'); return; }
    if (password.length < 6) { toast.error('Password must be 6+ characters!'); return; }
    setLoading(true);
    try {
      const username = email.split('@')[0] + Math.floor(Math.random() * 9999);
      await registerUser(email, password, fullName, username);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0]?.msg || 'Registration failed' : detail || 'Registration failed';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width:'100%', padding:'14px 16px', borderRadius:'12px',
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
    color:'white', fontSize:'1rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit',
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes chartDraw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
        @keyframes dotPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.5);opacity:1}}
        @keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:0.7}}
        input:focus{border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.2)!important;}
      `}</style>

      {/* LEFT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'60px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.08) 1px,transparent 1px)', backgroundSize:'50px 50px' }} />
        {[0,1,2].map(i=>(
          <div key={i} style={{ position:'absolute', borderRadius:'50%', background:`radial-gradient(circle,rgba(99,102,241,${0.12-i*0.03}) 0%,transparent 70%)`, width:`${350+i*100}px`, height:`${350+i*100}px`, top:`${i*25}%`, left:`${i*8-10}%`, animation:`pulse ${4+i}s ease-in-out infinite`, animationDelay:`${i*0.8}s`, pointerEvents:'none' }} />
        ))}
        <div style={{ position:'relative', zIndex:1, filter:'drop-shadow(0 0 20px rgba(99,102,241,0.5))', animation:'fadeUp 0.8s ease-out 0.2s both' }}>
          <svg width="380" height="200" viewBox="0 0 420 220">
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,160 L60,130 L120,140 L180,80 L240,95 L300,45 L360,55 L420,30"
              fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"
              strokeDasharray="1000" strokeDashoffset="1000"
              style={{ animation:'chartDraw 2s ease-out 0.5s forwards' }}/>
            <path d="M0,160 L60,130 L120,140 L180,80 L240,95 L300,45 L360,55 L420,30 L420,220 L0,220Z"
              fill="url(#rg)" opacity="0" style={{ animation:'fadeUp 1s ease-out 1.5s forwards' }}/>
            {[{x:60,y:130},{x:180,y:80},{x:300,y:45},{x:420,y:30}].map((p,i)=>(
              <circle key={i} cx={p.x} cy={p.y} r="5" fill="#6366f1"
                style={{ animation:'dotPulse 2s ease-in-out infinite', animationDelay:`${i*0.3}s` }}/>
            ))}
          </svg>
        </div>
        <h1 style={{ color:'white', fontSize:'2.5rem', fontWeight:800, textAlign:'center', marginTop:'16px', position:'relative', zIndex:1, animation:'fadeUp 0.8s ease-out 0.4s both' }}>
          StockSight <span style={{ color:'#6366f1' }}>AI</span>
        </h1>
        <p style={{ color:'#64748b', textAlign:'center', marginTop:'8px', fontSize:'1rem', position:'relative', zIndex:1 }}>
          Join 1,284 traders using AI predictions
        </p>
        {[
          {label:'AAPL',value:'+2.4%',color:'#10b981',top:'18%',delay:'0s'},
          {label:'NVDA',value:'+5.8%',color:'#10b981',top:'44%',delay:'0.4s'},
          {label:'TSLA',value:'-1.2%',color:'#ef4444',top:'70%',delay:'0.8s'},
        ].map((s,i)=>(
          <div key={i} style={{ position:'absolute', top:s.top, right:'8%', background:'rgba(255,255,255,0.06)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'14px', padding:'12px 20px', display:'flex', gap:'12px', alignItems:'center', animation:`floatCard ${3+i*0.5}s ease-in-out infinite`, animationDelay:s.delay, zIndex:1 }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:s.color }}/>
            <span style={{ color:'white', fontWeight:700 }}>{s.label}</span>
            <span style={{ color:s.color, fontWeight:700 }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div style={{ width:'480px', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px', background:'rgba(255,255,255,0.02)', borderLeft:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'20px', padding:'6px 16px', marginBottom:'20px', width:'fit-content' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#10b981' }}/>
          <span style={{ color:'#6366f1', fontSize:'0.85rem', fontWeight:600 }}>Create Free Account</span>
        </div>
        <h2 style={{ color:'white', fontSize:'2rem', fontWeight:800, margin:'0 0 8px' }}>Get Started 🚀</h2>
        <p style={{ color:'#64748b', margin:'0 0 24px' }}>Register to track your portfolio and get AI predictions!</p>

        <div style={{ marginBottom:'16px' }}>
          <label style={{ color:'#94a3b8', fontSize:'0.8rem', fontWeight:600, display:'block', marginBottom:'8px', letterSpacing:'0.05em' }}>FULL NAME</label>
          <input type="text" name="fullname" autoComplete="name" placeholder="Your full name"
            value={fullName} onChange={e => setFullName(e.target.value)}
            onKeyPress={e => e.key==='Enter' && handleRegister()} style={inp}/>
        </div>

        <div style={{ marginBottom:'16px' }}>
          <label style={{ color:'#94a3b8', fontSize:'0.8rem', fontWeight:600, display:'block', marginBottom:'8px', letterSpacing:'0.05em' }}>EMAIL ADDRESS</label>
          <input type="email" name="email" autoComplete="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyPress={e => e.key==='Enter' && handleRegister()} style={inp}/>
        </div>

        <div style={{ marginBottom:'24px' }}>
          <label style={{ color:'#94a3b8', fontSize:'0.8rem', fontWeight:600, display:'block', marginBottom:'8px', letterSpacing:'0.05em' }}>PASSWORD</label>
          <input type="password" name="password" autoComplete="new-password" placeholder="6+ characters"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyPress={e => e.key==='Enter' && handleRegister()} style={inp}/>
        </div>

        <button onClick={handleRegister} disabled={loading}
          style={{ width:'100%', padding:'16px', borderRadius:'12px', background:loading?'#374151':'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', color:'white', fontSize:'1rem', fontWeight:700, cursor:loading?'not-allowed':'pointer', marginBottom:'12px', fontFamily:'inherit' }}>
          {loading ? 'Creating Account...' : '🚀 Create Account'}
        </button>

        <button onClick={() => navigate('/login')}
          style={{ width:'100%', padding:'14px', borderRadius:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:'0.95rem', cursor:'pointer', marginBottom:'16px', fontFamily:'inherit' }}>
          Already have account? Login →
        </button>

        <button onClick={() => navigate('/')}
          style={{ background:'none', border:'none', color:'#334155', fontSize:'0.85rem', cursor:'pointer', fontFamily:'inherit' }}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default Register;