// client/src/components/common/Navbar.jsx

const Navbar = ({ onToggleSidebar }) => (
  <div style={{
    background: '#fff', borderBottom: '1px solid #e2e8f0',
    padding: '0 20px', height: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onToggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>☰</button>
      <span style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 15 }}>AdaptDoc</span>
    </div>
    <div style={{ display: 'flex', gap: 14, color: '#94a3b8', fontSize: 16 }}>
      <span style={{ cursor: 'pointer' }}>✉</span>
      <span style={{ cursor: 'pointer' }}>🔔</span>
      <span style={{ cursor: 'pointer' }}>⬡</span>
    </div>
  </div>
);

export default Navbar;
