import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';

const UserLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { toast.error('Fill all fields!'); return; }
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const users = JSON.parse(localStorage.getItem('stocksight_users')||'[]');
      const exists = users.find((u:any)=>u.email===data.user?.email);
      if (!exists && data.user) {
        users.push({full_name:data.user.full_name, email:data.user.email, joined:new Date().toISOString().slice(0,10), trades:0, status:'Active'});
        localStorage.setItem('stocksight_users', JSON.stringify(users));
      }
      toast.success('🎉 Welcome back!');
      navigate('/user/dashboard');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-15px)}}
        @keyframes floatCard{0%,100%{transform:translateY(0px)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0.7;transform:scale(1.05)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes chartDraw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3)}50%{box-shadow:0 0 40px rgba(99,102,241,0.6)}}
        @keyframes dotPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.5);opacity:1}}
        .inp{transition:all 0.3s ease!important}
        .inp:focus{border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.2)!important;background:rgba(99,102,241,0.08)!important}
        .login-btn{transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1)!important;position:relative;overflow:hidden}
        .login-btn:hover:not(:disabled){transform:translateY(-3px) scale(1.02)!important;box-shadow:0 12px 30px rgba(99,102,241,0.5)!important}
        .login-btn:active{transform:scale(0.97)!important}
        .link-btn{transition:all 0.2s ease!important}
        .link-btn:hover{background:rgba(255,255,255,0.08)!important;color:white!important;border-color:rgba(255,255,255,0.2)!important}
        .stat-card{transition:all 0.3s ease!important}
        .stat-card:hover{transform:translateX(-5px)!important;background:rgba(255,255,255,0.1)!important}
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'60px',position:'relative',overflow:'hidden'}}>
        
        {/* Animated grid */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(99,102,241,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.08) 1px,transparent 1px)',backgroundSize:'50px 50px',animation:'fadeIn 1s ease-out'}} />
        
        {/* Glowing orbs */}
        {[...Array(3)].map((_,i)=>(
          <div key={i} style={{position:'absolute',borderRadius:'50%',background:`radial-gradient(circle,rgba(99,102,241,${0.12-i*0.03}) 0%,transparent 70%)`,width:`${350+i*100}px`,height:`${350+i*100}px`,top:`${i*25}%`,left:`${i*8-10}%`,animation:`pulse ${4+i}s ease-in-out infinite`,animationDelay:`${i*0.8}s`,pointerEvents:'none'}} />
        ))}

        {/* Animated SVG chart */}
        <div style={{position:'relative',zIndex:1,animation:'fadeUp 0.8s ease-out 0.2s both',filter:'drop-shadow(0 0 20px rgba(99,102,241,0.5))'}}>
          <svg width="420" height="220" viewBox="0 0 420 220">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,160 L60,130 L120,140 L180,80 L240,95 L300,45 L360,55 L420,30"
              fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"
              strokeDasharray="1000" strokeDashoffset="1000"
              style={{animation:'chartDraw 2s ease-out 0.5s forwards'}}/>
            <path d="M0,160 L60,130 L120,140 L180,80 L240,95 L300,45 L360,55 L420,30 L420,220 L0,220Z"
              fill="url(#g1)" opacity="0" style={{animation:'fadeIn 1s ease-out 1.5s forwards'}}/>
            {[{x:60,y:130},{x:180,y:80},{x:300,y:45},{x:420,y:30}].map((p,i)=>(
              <circle key={i} cx={p.x} cy={p.y} r="5" fill="#6366f1"
                style={{animation:`dotPulse 2s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
            ))}
          </svg>
        </div>

        {/* Title */}
        <h1 style={{color:'white',fontSize:'2.8rem',fontWeight:800,textAlign:'center',marginTop:'20px',position:'relative',zIndex:1,animation:'fadeUp 0.8s ease-out 0.4s both'}}>
          StockSight <span style={{color:'#6366f1',textShadow:'0 0 30px rgba(99,102,241,0.8)'}}>AI</span>
        </h1>
        <p style={{color:'#64748b',textAlign:'center',marginTop:'8px',fontSize:'1.1rem',position:'relative',zIndex:1,animation:'fadeUp 0.8s ease-out 0.6s both'}}>
          AI-powered predictions for smarter trading
        </p>

        {/* Floating stock cards */}
        {[
          {label:'AAPL',value:'+2.4%',color:'#10b981',top:'18%',delay:'0s'},
          {label:'TSLA',value:'-1.2%',color:'#ef4444',top:'44%',delay:'0.4s'},
          {label:'NVDA',value:'+5.8%',color:'#10b981',top:'70%',delay:'0.8s'},
        ].map((s,i)=>(
          <div key={i} className="stat-card" style={{position:'absolute',top:s.top,right:'8%',background:'rgba(255,255,255,0.06)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'14px',padding:'12px 20px',display:'flex',gap:'12px',alignItems:'center',animation:`floatCard ${3+i*0.5}s ease-in-out infinite`,animationDelay:s.delay,zIndex:1}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:s.color,animation:'dotPulse 1.5s ease-in-out infinite'}}/>
            <span style={{color:'white',fontWeight:700,fontSize:'0.95rem'}}>{s.label}</span>
            <span style={{color:s.color,fontWeight:700,fontSize:'0.95rem'}}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{width:'480px',display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px',background:'rgba(255,255,255,0.02)',borderLeft:'1px solid rgba(255,255,255,0.07)',animation:'fadeUp 0.7s ease-out 0.1s both'}}>
        
        {/* Badge */}
        <div style={{marginBottom:'36px',animation:'fadeUp 0.6s ease-out 0.3s both'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'20px',padding:'6px 16px',marginBottom:'20px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#10b981',animation:'dotPulse 1.5s ease-in-out infinite'}}/>
            <span style={{color:'#6366f1',fontSize:'0.85rem',fontWeight:600}}>Trader Portal</span>
          </div>
          <h2 style={{color:'white',fontSize:'2rem',fontWeight:800,margin:'0 0 8px'}}>Welcome back 👋</h2>
          <p style={{color:'#64748b',margin:0}}>Sign in to your trading account</p>
        </div>

        {/* Email */}
        <div style={{marginBottom:'20px',animation:'fadeUp 0.6s ease-out 0.4s both'}}>
          <label style={{color:'#94a3b8',fontSize:'0.8rem',fontWeight:600,display:'block',marginBottom:'8px',letterSpacing:'0.05em'}}>EMAIL ADDRESS</label>
          <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)}
            onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')}
            onKeyPress={e=>e.key==='Enter'&&handleLogin()} placeholder="you@example.com"
            style={{width:'100%',padding:'14px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.05)',border:`1px solid ${focused==='email'?'#6366f1':'rgba(255,255,255,0.1)'}`,color:'white',fontSize:'1rem',outline:'none',boxSizing:'border-box'}}/>
        </div>

        {/* Password */}
        <div style={{marginBottom:'28px',animation:'fadeUp 0.6s ease-out 0.5s both'}}>
          <label style={{color:'#94a3b8',fontSize:'0.8rem',fontWeight:600,display:'block',marginBottom:'8px',letterSpacing:'0.05em'}}>PASSWORD</label>
          <input className="inp" type="password" value={password} onChange={e=>setPassword(e.target.value)}
            onFocus={()=>setFocused('pass')} onBlur={()=>setFocused('')}
            onKeyPress={e=>e.key==='Enter'&&handleLogin()} placeholder="••••••••"
            style={{width:'100%',padding:'14px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.05)',border:`1px solid ${focused==='pass'?'#6366f1':'rgba(255,255,255,0.1)'}`,color:'white',fontSize:'1rem',outline:'none',boxSizing:'border-box'}}/>
        </div>

        {/* Login button */}
        <button className="login-btn" onClick={handleLogin} disabled={loading}
          style={{width:'100%',padding:'16px',borderRadius:'12px',background:loading?'#374151':'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',color:'white',fontSize:'1rem',fontWeight:700,cursor:loading?'not-allowed':'pointer',marginBottom:'12px',animation:'fadeUp 0.6s ease-out 0.6s both'}}>
          {loading?(
            <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
              <span style={{width:'18px',height:'18px',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>
              Signing in...
            </span>
          ):'🚀 Sign In →'}
        </button>

        {/* Register button */}
        <button className="link-btn" onClick={()=>{ console.log('going to register'); navigate('/register'); }}
          style={{width:'100%',padding:'14px',borderRadius:'12px',background:'transparent',border:'1px solid rgba(255,255,255,0.1)',color:'#94a3b8',fontSize:'0.95rem',cursor:'pointer',marginBottom:'20px',animation:'fadeUp 0.6s ease-out 0.7s both'}}>
          Don't have an account? Register →
        </button>

        {/* Admin link */}
        <div style={{textAlign:'center',animation:'fadeUp 0.6s ease-out 0.8s both',display:'flex',justifyContent:'space-between'}}>
          <button onClick={()=>navigate('/')} style={{background:'none',border:'none',color:'#334155',fontSize:'0.85rem',cursor:'pointer',transition:'color 0.2s'}}>
            ← Home
          </button>
          <button onClick={()=>navigate('/admin/login')} style={{background:'none',border:'none',color:'#334155',fontSize:'0.85rem',cursor:'pointer',transition:'color 0.2s'}}>
            Admin Login →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;