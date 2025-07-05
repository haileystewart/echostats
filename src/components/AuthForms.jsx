// echostats/src/components/AuthForms.jsx
import React, { useState, useEffect } from 'react';

function AuthForms({ 
  onAuthSubmit, 
  isRegisterMode, 
  setIsRegisterMode, 
  error, 
  usernameInput, 
  setUsernameInput, 
  passwordInput, 
  setPasswordInput, 
  displayNameInput, 
  setDisplayNameInput,
  emailInput,
  setEmailInput,
  loading = false,
  successMessage = ''
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState([]);

  // Fetch password requirements on component mount
  useEffect(() => {
    if (isRegisterMode) {
      fetch('http://127.0.0.1:8888/password-requirements')
        .then(response => response.json())
        .then(data => setPasswordRequirements(data.requirements || []))
        .catch(error => {
          console.error('Failed to fetch password requirements:', error);
          setPasswordRequirements([
            'At least 8 characters long',
            'Contains at least one lowercase letter (a-z)',
            'Contains at least one uppercase letter (A-Z)', 
            'Contains at least one number (0-9)',
            'Contains at least one special character',
            'Cannot be a commonly used password'
          ]);
        });
    }
  }, [isRegisterMode]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '80vh',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '0 1rem'
    }}>
      {error && (
        <div className="card" style={{ 
          backgroundColor: '#BE123C', 
          color: 'white', 
          marginBottom: '1.5rem',
          padding: '1rem',
          border: '1px solid #DC2626',
          width: '100%'
        }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="card" style={{ 
          backgroundColor: '#1DB954', 
          color: 'white', 
          marginBottom: '1.5rem',
          padding: '1rem',
          border: '1px solid #22C55E',
          width: '100%'
        }}>
          <p style={{ margin: 0 }}>{successMessage}</p>
        </div>
      )}

      <h2 style={{ 
        marginBottom: '2rem', 
        textAlign: 'center',
        fontSize: '1.75rem',
        fontWeight: '600' 
      }}>
        {isRegisterMode ? 'Register for EchoStats' : 'Login to EchoStats'}
      </h2>
      
      <form onSubmit={onAuthSubmit} className="card" style={{ 
        textAlign: 'left',
        width: '100%'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="username" 
            style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#ADADAD',
              fontWeight: '500'
            }}
          >
            Username{!isRegisterMode && ' or Email'}:
          </label>
          <input
            type="text"
            id="username"
            value={usernameInput || ''}
            onChange={(e) => setUsernameInput(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              border: '1px solid #444',
              backgroundColor: '#1F1F1F',
              color: '#FFFFFF',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1DB954'}
            onBlur={(e) => e.target.style.borderColor = '#444'}
          />
        </div>

        {isRegisterMode && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#ADADAD',
                fontWeight: '500'
              }}
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={emailInput || ''}
              onChange={(e) => {
                if (setEmailInput) {
                  setEmailInput(e.target.value);
                }
              }}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                border: '1px solid #444',
                backgroundColor: '#1F1F1F',
                color: '#FFFFFF',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1DB954'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="password" 
            style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#ADADAD',
              fontWeight: '500'
            }}
          >
            Password:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={passwordInput || ''}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                paddingRight: '3rem',
                borderRadius: '0.5rem', 
                border: '1px solid #444',
                backgroundColor: '#1F1F1F',
                color: '#FFFFFF',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1DB954'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                right: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                background: 'none', 
                border: 'none', 
                color: '#ADADAD', 
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0',
                height: 'auto'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {isRegisterMode && passwordRequirements.length > 0 && (
            <div style={{ 
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: '#181818',
              borderRadius: '0.375rem',
              border: '1px solid #333'
            }}>
              <p style={{ 
                color: '#ADADAD', 
                fontSize: '0.875rem', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Password Requirements:
              </p>
              <ul style={{ 
                fontSize: '0.8rem', 
                margin: 0, 
                paddingLeft: '1rem',
                listStyle: 'disc'
              }}>
                {passwordRequirements.map((req, index) => (
                  <li key={index} style={{ 
                    color: '#9CA3AF', 
                    marginBottom: '0.25rem',
                    lineHeight: '1.4'
                  }}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isRegisterMode && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="displayname" 
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#ADADAD',
                fontWeight: '500'
              }}
            >
              Your Name:
            </label>
            <input
              type="text"
              id="displayname"
              value={displayNameInput || ''}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                border: '1px solid #444',
                backgroundColor: '#1F1F1F',
                color: '#FFFFFF',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1DB954'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '0.875rem',
            backgroundColor: loading ? '#555' : '#1DB954',
            color: loading ? '#ADADAD' : '#181818',
            border: 'none',
            borderRadius: '2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '1rem'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#22C55E';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#1DB954';
            }
          }}
        >
          {loading ? 'Loading...' : (isRegisterMode ? 'Register' : 'Login')}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button 
          onClick={() => setIsRegisterMode(!isRegisterMode)} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#1DB954', 
            cursor: 'pointer',
            fontSize: '1rem',
            textDecoration: 'underline',
            padding: '0.5rem'
          }}
          onMouseEnter={(e) => e.target.style.color = '#22C55E'}
          onMouseLeave={(e) => e.target.style.color = '#1DB954'}
        >
          {isRegisterMode ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}

export default AuthForms;