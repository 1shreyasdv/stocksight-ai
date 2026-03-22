import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFA, setTwoFA] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleAdminLogin = () => {
    if (!email || !password) { toast.error('Fill all fields!'); return; }
    setLoading(true);
    setTimeout(() => {
      if (email === 'admin@stocksight.com' && password === 'admin123') {
        localStorage.setItem('adminToken', 'admin-authenticated');
        toast.success('✅ Admin access granted!');
        navigate('/admin/dashboard');
      } else {
        toast.error('❌ Invalid credentials!');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'#f8fafc',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-12px)}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes chartDraw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
        @keyframes dotPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.5);opacity:1}}
        @keyframes slideRight{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .inp{transition:all 0.3s ease!important}
        .inp:focus{border-color:#ef4444!important;box-shadow:0 0 0 3px rgba(239,68,68,0.15)!important;background:#fff5f5!important}
        .admin-btn{transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1)!important}
        .admin-btn:hover:not(:disabled){transform:translateY(-3px) scale(1.02)!important;box-shadow:0 12px 30px rgba(239,68,68,0.4)!important}
        .admin-btn:active{transform:scale(0.97)!important}
        .link-btn2:hover{color:#ef4444!important}
      `}</style>

      {/* LEFT - Visual Panel */}
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'60px',position:'relative',overflow:'hidden',background:'linear-gradient(135deg,#fff5f5 0%,#fef2f2 100%)'}}>
        
        {/* Background pattern */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(239,68,68,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.06) 1px,transparent 1px)',backgroundSize:'50px 50px',animation:'fadeIn 1s ease-out'}} />
        
        {/* Glowing orbs */}
        {[...Array(3)].map((_,i)=>(
          <div key={i} style={{position:'absolute',borderRadius:'50%',background:`radial-gradient(circle,rgba(239,68,68,${0.08-i*0.02}) 0%,transparent 70%)`,width:`${300+i*100}px`,height:`${300+i*100}px`,top:`${i*25}%`,left:`${i*8-5}%`,animation:`pulse ${4+i}s ease-in-out infinite`,animationDelay:`${i*0.8}s`,pointerEvents:'none'}} />
        ))}

        {/* Animated SVG chart */}
        <div style={{position:'relative',zIndex:1,animation:'fadeUp 0.8s ease-out 0.2s both',filter:'drop-shadow(0 0 15px rgba(239,68,68,0.3))'}}>
          <svg width="420" height="220" viewBox="0 0 420 220">
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,160 L60,140 L120,150 L180,100 L240,120 L300,70 L360,85 L420,50"
              fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"
              strokeDasharray="1000" strokeDashoffset="1000"
              style={{animation:'chartDraw 2s ease-out 0.5s forwards'}}/>
            <path d="M0,160 L60,140 L120,150 L180,100 L240,120 L300,70 L360,85 L420,50 L420,220 L0,220Z"
              fill="url(#rg)" opacity="0" style={{animation:'fadeIn 1s ease-out 1.5s forwards'}}/>
            {[{x:60,y:140},{x:180,y:100},{x:300,y:70},{x:420,y:50}].map((p,i)=>(
              <circle key={i} cx={p.x} cy={p.y} r="5" fill="#ef4444"
                style={{animation:`dotPulse 2s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
            ))}
          </svg>
        </div>

        <h1 style={{color:'#0f172a',fontSize:'2.8rem',fontWeight:800,textAlign:'center',marginTop:'20px',position:'relative',zIndex:1,animation:'fadeUp 0.8s ease-out 0.4s both'}}>
          StockSight <span style={{color:'#ef4444'}}>Admin</span>
        </h1>
        <p style={{color:'#64748b',textAlign:'center',marginTop:'8px',fontSize:'1.1rem',position:'relative',zIndex:1,animation:'fadeUp 0.8s ease-out 0.6s both'}}>
          Platform administration & analytics
        </p>

        {/* Floating stat cards */}
        {[
          {label:'Users',value:'1,284',color:'#6366f1',top:'18%',delay:'0s'},
          {label:'Trades',value:'3,492',color:'#10b981',top:'44%',delay:'0.4s'},
          {label:'Revenue',value:'$8,741',color:'#ef4444',top:'70%',delay:'0.8s'},
        ].map((s,i)=>(
          <div key={i} style={{position:'absolute',top:s.top,right:'8%',background:'white',border:'1px solid #f1f5f9',borderRadius:'14px',padding:'12px 20px',display:'flex',gap:'12px',alignItems:'center',animation:`float ${3+i*0.5}s ease-in-out infinite`,animationDelay:s.delay,zIndex:1,boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:s.color,animation:'dotPulse 1.5s ease-in-out infinite'}}/>
            <span style={{color:'#0f172a',fontWeight:700,fontSize:'0.95rem'}}>{s.label}</span>
            <span style={{color:s.color,fontWeight:700,fontSize:'0.95rem'}}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* RIGHT - Form Panel */}
      <div style={{width:'480px',display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px',background:'white',borderLeft:'1px solid #e2e8f0',animation:'fadeUp 0.7s ease-out 0.1s both',boxShadow:'-4px 0 20px rgba(0,0,0,0.06)'}}>

        {/* Shield icon */}
        <div style={{marginBottom:'32px',animation:'fadeUp 0.6s ease-out 0.3s both'}}>
          <div style={{width:'64px',height:'64px',borderRadius:'18px',background:'linear-gradient(135deg,#dc2626,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px',fontSize:'28px',boxShadow:'0 8px 24px rgba(239,68,68,0.3)',animation:'float 3s ease-in-out infinite'}}>🛡️</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'20px',padding:'6px 16px',marginBottom:'16px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#ef4444',animation:'dotPulse 1.5s ease-in-out infinite'}}/>
            <span style={{color:'#dc2626',fontSize:'0.85rem',fontWeight:600}}>Admin Portal</span>
          </div>
          <h2 style={{color:'#0f172a',fontSize:'2rem',fontWeight:800,margin:'0 0 8px'}}>Admin Login</h2>
          <p style={{color:'#64748b',margin:0}}>Restricted access — authorized personnel only</p>
        </div>

        {/* Warning banner */}
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'12px',padding:'12px 16px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'10px',animation:'fadeUp 0.6s ease-out 0.4s both'}}>
          <span style={{fontSize:'16px'}}>⚠️</span>
          <span style={{color:'#dc2626',fontSize:'0.85rem',fontWeight:500}}>All login attempts are monitored and logged</span>
        </div>

        {/* Fields */}
        {[
          {label:'ADMIN EMAIL',value:email,setter:setEmail,type:'email',placeholder:'admin@stocksight.com',key:'email'},
          {label:'PASSWORD',value:password,setter:setPassword,type:'password',placeholder:'••••••••••••',key:'pass'},
          {label:'2FA CODE (OPTIONAL)',value:twoFA,setter:setTwoFA,type:'text',placeholder:'6-digit code',key:'tfa'},
        ].map((f,i)=>(
          <div key={f.key} style={{marginBottom:'16px',animation:`fadeUp 0.6s ease-out ${0.4+i*0.1}s both`}}>
            <label style={{color:'#64748b',fontSize:'0.8rem',fontWeight:600,display:'block',marginBottom:'8px',letterSpacing:'0.05em'}}>{f.label}</label>
            <input className="inp" type={f.type} value={f.value}
              onChange={e=>f.setter(e.target.value)}
              onFocus={()=>setFocused(f.key)} onBlur={()=>setFocused('')}
              onKeyPress={e=>e.key==='Enter'&&handleAdminLogin()}
              placeholder={f.placeholder}
              style={{width:'100%',padding:'14px 16px',borderRadius:'12px',background:'#f8fafc',border:`1px solid ${focused===f.key?'#ef4444':'#e2e8f0'}`,color:'#0f172a',fontSize:'0.95rem',outline:'none',boxSizing:'border-box',textAlign:f.key==='tfa'?'center':'left',letterSpacing:f.key==='tfa'?'0.2em':'normal'}}/>
          </div>
        ))}

        {/* Login button */}
        <button className="admin-btn" onClick={handleAdminLogin} disabled={loading}
          style={{width:'100%',padding:'16px',borderRadius:'12px',background:loading?'#f1f5f9':'linear-gradient(135deg,#dc2626,#ef4444)',border:'none',color:loading?'#94a3b8':'white',fontSize:'1rem',fontWeight:700,cursor:loading?'not-allowed':'pointer',marginBottom:'16px',marginTop:'8px',animation:'fadeUp 0.6s ease-out 0.7s both'}}>
          {loading?(
            <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
              <span style={{width:'18px',height:'18px',border:'2px solid #e2e8f0',borderTop:'2px solid #ef4444',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>
              Verifying...
            </span>
          ):'🛡️ Admin Login'}
        </button>

        {/* Footer */}
        <div style={{textAlign:'center',borderTop:'1px solid #f1f5f9',paddingTop:'20px',animation:'fadeUp 0.6s ease-out 0.8s both'}}>
          <p style={{color:'#94a3b8',fontSize:'0.8rem',margin:'0 0 12px'}}>Default: admin@stocksight.com / admin123</p>
          <button className="link-btn2" onClick={()=>navigate('/login')}
            style={{background:'none',border:'none',color:'#94a3b8',fontSize:'0.85rem',cursor:'pointer',transition:'color 0.2s'}}>
            ← Back to User Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;