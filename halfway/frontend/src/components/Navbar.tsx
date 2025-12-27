import { useState } from 'react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onAddUser?: () => void;
  onUserList?: () => void;
}

export default function Navbar({ user, onLogout, onAddUser, onUserList }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      background: '#2c3e50',
      color: 'white',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      <h2 style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 24px)' }}>Halfway Sheffield</h2>
      
      {/* Hamburger Icon */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '5px'
        }}
        className="hamburger"
      >
        ☰
      </button>

      {/* Desktop Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="desktop-menu">
        {user.role === 'admin' && (
          <>
            <button
              onClick={onUserList}
              style={{
                padding: '8px 16px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              User List
            </button>
            <button
              onClick={onAddUser}
              style={{
                padding: '8px 16px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Add User
            </button>
          </>
        )}
        <button
          onClick={onLogout}
          style={{
            padding: '8px 20px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          background: '#34495e',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          borderRadius: '0 0 8px 8px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          minWidth: '150px',
          zIndex: 1000
        }}>
          {user.role === 'admin' && (
            <>
              <button
                onClick={() => {
                  onUserList?.();
                  setMenuOpen(false);
                }}
                style={{
                  padding: '10px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                User List
              </button>
              <button
                onClick={() => {
                  onAddUser?.();
                  setMenuOpen(false);
                }}
                style={{
                  padding: '10px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                Add User
              </button>
            </>
          )}
          <button
            onClick={() => {
              onLogout();
              setMenuOpen(false);
            }}
            style={{
              padding: '10px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%'
            }}
          >
            Logout
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hamburger {
            display: block !important;
          }
          .desktop-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
