import React from 'react';
import { SIDEBAR_ITEMS } from '../../constants';

const Sidebar = ({ activeTab, onNavigate, isOpen, user, onLogout }) => {
  const initials = user?.name
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback if no onLogout provided
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    window.location.href = "/login";
  };

  return (
    <div style={{
      width: isOpen ? 210 : 56,
      background: '#1e3a5f',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease',
      overflow: 'hidden', flexShrink: 0,
      height: '100vh'
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #ffffff20' }}>
        <div style={{ width: 30, height: 30, background: '#3b82f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>AT</div>
        {isOpen && <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>AdaptDoc</span>}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column" }}>
        {SIDEBAR_ITEMS.map(item => (
          <button 
            key={item.id} 
            onClick={() => onNavigate(item.id)} 
            style={{ 
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", marginBottom: 2, 
              background: activeTab === item.id ? "#ffffff20" : "transparent", 
              border: "none", borderLeft: activeTab === item.id ? "3px solid #60a5fa" : "3px solid transparent", 
              borderRadius: 8, cursor: "pointer", color: activeTab === item.id ? "#fff" : "#93c5fd", 
              fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400, textAlign: "left", whiteSpace: "nowrap", transition: "all 0.15s" 
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            {isOpen && item.label}
          </button>
        ))}

        {/* Spacer to push Logout to bottom */}
        <div style={{ flex: 1 }} />

        {/* The Logout Button Added Here */}
        <button 
          onClick={handleLogout} 
          style={{ 
            width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", background: "transparent", 
            border: "none", borderRadius: 8, cursor: "pointer", color: "#fb7185", fontSize: 13, fontWeight: 600, textAlign: "left", whiteSpace: "nowrap", transition: "all 0.15s"
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>⬅</span>
          {isOpen && "Logout"}
        </button>
      </nav>

      {/* User footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #ffffff20', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        {isOpen && <span style={{ color: '#93c5fd', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', title: user?.name || user?.email || 'User' }}>{user?.name || user?.email || 'User'}</span>}
      </div>
    </div>
  );
};

export default Sidebar;
