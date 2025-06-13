// echostats/src/services/frontendAuthService.js

export async function registerUser(url, username, password, displayName) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, display_name: displayName }),
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
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
    localStorage.clear(); // Clear all client-side storage
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