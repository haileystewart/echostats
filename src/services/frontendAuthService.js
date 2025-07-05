// echostats/src/services/frontendAuthService.js

export async function registerUser(url, username, email, password, displayName) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username, 
            email, 
            password, 
            display_name: displayName 
        }),
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        // Handle specific error cases for better user experience
        if (data.errors && Array.isArray(data.errors)) {
            // Password complexity errors
            throw new Error(`${data.message}\n\nPassword requirements not met:\n• ${data.errors.join('\n• ')}`);
        }
        throw new Error(data.message || 'Registration failed.');
    }
    return data;
}

export async function loginLocal(url, username, password) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        // Handle specific login error cases
        if (data.email_verification_required) {
            throw new Error(`${data.message} Please verify your email address before logging in.`);
        }
        throw new Error(data.message || 'Login failed.');
    }
    return data;
}

export async function logoutUser(url) {
    const response = await fetch(url, { method: 'POST', credentials: 'include' });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Logout failed.');
    }
    // Note: Don't use localStorage.clear() in artifacts - not supported
    // If you need to clear local storage in your actual app, uncomment this:
    // localStorage.clear(); // Clear all client-side storage
    return data;
}

export async function checkSession(url) {
    const response = await fetch(url, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to check session.');
    }
    return data;
}

export function redirectToSpotifyAuthLink(url) {
    window.location.href = url;
}

// Additional helper functions for the new security features

export async function forgotPassword(email) {
    const response = await fetch('http://127.0.0.1:8888/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email.');
    }
    return data;
}

export async function resetPassword(token, newPassword) {
    const response = await fetch('http://127.0.0.1:8888/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        // Handle password complexity errors
        if (data.errors && Array.isArray(data.errors)) {
            throw new Error(`${data.message}\n\nPassword requirements not met:\n• ${data.errors.join('\n• ')}`);
        }
        throw new Error(data.message || 'Failed to reset password.');
    }
    return data;
}

export async function verifyEmail(token) {
    const response = await fetch('http://127.0.0.1:8888/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to verify email.');
    }
    return data;
}

export async function resendVerification(email) {
    const response = await fetch('http://127.0.0.1:8888/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email.');
    }
    return data;
}

export async function getPasswordRequirements() {
    const response = await fetch('http://127.0.0.1:8888/password-requirements', {
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error('Failed to fetch password requirements.');
    }
    return data;
}