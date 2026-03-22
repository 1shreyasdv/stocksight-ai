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
        toast.success('🛡️ Admin access granted!');
        navigate('/admin/dashboard');
      } else {
        toast.error('❌ Invalid admin credentials!');
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060a14', fontFamily: "'DM Sans',sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:0.7}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes scanline{0%{top:-10%}100%{top:110%}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        .inp:focus{border-color:#ef4444!important;box-shadow:0 0 0 3px rgba(239,68,68,0.15)!important;background:rgba(239,68,68,0.05)!important}
        .admin-btn{transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1)!important}
        .admin-btn:hover{transform:translateY(-3px) scale(1.02)!important;box-shadow:0 12px 30px rgba(239,68,68,0.4)!important}
        .admin-btn:active{transform:scale(0.97)!important}
      `}</style>

      {/* Background effects */}
      <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(239,68,68,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(239,68,68,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Scanline effect */}
      <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,rgba(239,68,68,0.3),transparent)', animation: 'scanline 4s linear infinite', pointerEvents: 'none' }} />

      <div style={{ width: '460px', position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '24px', padding: '48px', backdropFilter: 'blur(20px)', animation: 'fadeUp 0.6s ease-out', boxShadow: '0 0 60px rgba(239,68,68,0.1)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', boxShadow: '0 0 30px rgba(239,68,68,0.4)', animation: 'pulse 2s ease-in-out infinite' }}>🛡️</div>
          <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>Admin Portal</h2>
          <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem' }}>Restricted access — authorized personnel only</p>
        </div>

        {/* Warning */}
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ animation: 'blink 2s ease-in-out infinite', fontSize: '16px' }}>⚠️</span>
          <span style={{ color: '#fca5a5', fontSize: '0.85rem' }}>All login attempts are monitored and logged</span>
        </div>

        {[
          {label:'ADMIN EMAIL', value:email, setter:setEmail, type:'email', placeholder:'admin@stocksight.com', key:'email'},
          {label:'PASSWORD', value:password, setter:setPassword, type:'password', placeholder:'••••••••••••', key:'pass'},
          {label:'2FA CODE (OPTIONAL)', value:twoFA, setter:setTwoFA, type:'text', placeholder:'6-digit code', key:'tfa'},
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '16px' }}>
            <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>{f.label}</label>
            <input className="inp" type={f.type} value={f.value} onChange={e => f.setter(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAdminLogin()}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${focused===f.key?'#ef4444':'rgba(255,255,255,0.08)'}`, color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s', textAlign: f.key==='tfa'?'center':'left', letterSpacing: f.key==='tfa'?'0.2em':'normal' }}
              onFocus={() => setFocused(f.key)} onBlur={() => setFocused('')} />
          </div>
        ))}

        <button className="admin-btn" onClick={handleAdminLogin} disabled={loading}
          style={{ width: '100%', padding: '16px', borderRadius: '10px', background: loading ? '#374151' : 'linear-gradient(135deg,#dc2626,#ef4444)', border: 'none', color: 'white', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '20px', marginTop: '8px' }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              Verifying...
            </span>
          ) : '🛡️ Admin Login'}
        </button>

        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          <p style={{ color: '#334155', fontSize: '0.8rem', margin: '0 0 10px' }}>Default: admin@stocksight.com / admin123</p>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.85rem', cursor: 'pointer' }}>← Back to User Login</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;