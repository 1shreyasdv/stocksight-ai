import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFA, setTwoFA] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = () => {
    if (!email || !password) { toast.error('Fill all fields!'); return; }
    setLoading(true);
    setTimeout(() => {
      if (email === 'admin@stocksight.com' && password === 'admin123') {
        localStorage.setItem('adminToken', 'admin-authenticated');
        toast.success('Admin access granted!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid admin credentials!');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#060a14', fontFamily:"'DM Sans',sans-serif", position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-200px', left:'50%', transform:'translateX(-50%)', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle,rgba(239,68,68,0.08) 0%,transparent 70%)' }} />
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(239,68,68,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.03) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />

      <div style={{ width:'460px', position:'relative', zIndex:1, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'24px', padding:'48px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'28px' }}>🛡️</div>
          <h2 style={{ color:'white', fontSize:'1.8rem', fontWeight:800, margin:0 }}>Admin Portal</h2>
          <p style={{ color:'#475569', marginTop:'8px', fontSize:'0.9rem' }}>Restricted access — authorized personnel only</p>
        </div>

        <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'12px 16px', marginBottom:'28px', display:'flex', alignItems:'center', gap:'10px' }}>
          <span>⚠️</span>
          <span style={{ color:'#fca5a5', fontSize:'0.85rem' }}>All login attempts are monitored and logged</span>
        </div>

        <div style={{ marginBottom:'16px' }}>
          <label style={{ color:'#64748b', fontSize:'0.8rem', fontWeight:700, display:'block', marginBottom:'8px', letterSpacing:'0.05em' }}>ADMIN EMAIL</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@stocksight.com"
            style={{ width:'100%', padding:'14px 16px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'white', fontSize:'0.95rem', outline:'none', boxSizing:'border-box' }} />
        </div>

        <div style={{ marginBottom:'16px' }}>
          <label style={{ color:'#64748b', fontSize:'0.8rem', fontWeight:700, display:'block', marginBottom:'8px', letterSpacing:'0.05em' }}>PASSWORD</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••••••"
            style={{ width:'100%', padding:'14px 16px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'white', fontSize:'0.95rem', outline:'none', boxSizing:'border-box' }} />
        </div>

        <div style={{ marginBottom:'28px' }}>
          <label style={{ color:'#64748b', fontSize:'0.8rem', fontWeight:700, display:'block', marginBottom:'8px', letterSpacing:'0.05em' }}>2FA CODE (OPTIONAL)</label>
          <input type="text" value={twoFA} onChange={e=>setTwoFA(e.target.value)} placeholder="6-digit code"
            onKeyPress={e=>e.key==='Enter'&&handleAdminLogin()}
            style={{ width:'100%', padding:'14px 16px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'white', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', letterSpacing:'0.2em', textAlign:'center' }} />
        </div>

        <button onClick={handleAdminLogin} disabled={loading} style={{ width:'100%', padding:'16px', borderRadius:'10px', background:loading?'#374151':'linear-gradient(135deg,#dc2626,#ef4444)', border:'none', color:'white', fontSize:'1rem', fontWeight:700, cursor:loading?'not-allowed':'pointer', marginBottom:'20px' }}>
          {loading ? '🔐 Verifying...' : '🛡️ Admin Login'}
        </button>

        <div style={{ textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'20px' }}>
          <p style={{ color:'#334155', fontSize:'0.8rem', margin:'0 0 8px' }}>Default: admin@stocksight.com / admin123</p>
          <button onClick={()=>navigate('/login')} style={{ background:'none', border:'none', color:'#475569', fontSize:'0.85rem', cursor:'pointer' }}>← Back to User Login</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;