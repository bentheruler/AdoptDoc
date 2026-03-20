// client/src/components/common/Navbar.jsx

import { useState } from 'react';

const Navbar = ({ onToggleSidebar, user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    window.location.href = "/login";
  };

  const userInitials = user?.name
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #e2e8f0',
      padding: '0 20px', height: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onToggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>☰</button>
        <span style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 15 }}>AdaptDoc</span>
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <span style={{ cursor: 'pointer', fontSize: 16, color: '#94a3b8', title: 'Messages' }}>✉</span>
        <span style={{ cursor: 'pointer', fontSize: 16, color: '#94a3b8', title: 'Notifications' }}>🔔</span>
        
        {/* User Profile Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700
            }}>
              {userInitials}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: 45,
              right: 0,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              minWidth: 200,
              zIndex: 1000
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e2e8f0',
                fontSize: 13,
                color: '#475569'
              }}>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user?.email}</div>
              </div>
              
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#dc2626',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
