// echostats/src/components/AuthForms.jsx
import React from 'react';

function AuthForms({ onAuthSubmit, isRegisterMode, setIsRegisterMode, error, usernameInput, setUsernameInput, passwordInput, setPasswordInput, displayNameInput, setDisplayNameInput }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {error && (
        <div className="error-message card" style={{ backgroundColor: '#BE123C', color: 'white', marginBottom: '1rem' }}>
          <p>{error}</p>
        </div>
      )}
      <h2>{isRegisterMode ? 'Register for EchoStats' : 'Login to EchoStats'}</h2>
      <form onSubmit={onAuthSubmit} style={{ maxWidth: '300px', margin: '20px auto', padding: '20px', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#1E293B' }}>
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px', color: '#9CA3AF' }}>Username:</label>
          <input
            type="text"
            id="username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2D3748', color: '#FFF' }}
          />
        </div>
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', color: '#9CA3AF' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2D3748', color: '#FFF' }}
          />
        </div>
        {isRegisterMode && (
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label htmlFor="displayname" style={{ display: 'block', marginBottom: '5px', color: '#9CA3AF' }}>Your Name:</label>
            <input
              type="text"
              id="displayname"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2D3748', color: '#FFF' }}
            />
          </div>
        )}
        <button type="submit" className="login-button" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
          {isRegisterMode ? 'Register' : 'Login'}
        </button>
      </form>
      <button onClick={() => setIsRegisterMode(!isRegisterMode)} style={{ background: 'none', border: 'none', color: '#1DB954', cursor: 'pointer', marginTop: '15px' }}>
        {isRegisterMode ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
}

export default AuthForms;