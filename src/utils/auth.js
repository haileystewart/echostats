// src/utils/auth.js

// --- Helper to handle tokens received from backend ---
export const saveTokensFromBackend = (params) => {
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const expiresIn = params.get('expires_in');
  const userId = params.get('user_id');

  if (accessToken) {
    localStorage.setItem('spotify_access_token', accessToken);
    localStorage.setItem('spotify_refresh_token', refreshToken);
    localStorage.setItem('spotify_expires_in', expiresIn);
    localStorage.setItem('spotify_token_expiry', (new Date().getTime() + (parseInt(expiresIn) * 1000)).toString());
    localStorage.setItem('spotify_user_id', userId);
  }
};

/**
 * Initiates the Spotify OAuth flow by redirecting to YOUR BACKEND'S login endpoint.
 * @param {string} backendLoginUrl - The URL of your backend's /login endpoint.
 */
export const redirectToSpotifyAuth = (backendLoginUrl) => {
  window.location.href = backendLoginUrl;
};

/**
 * Retrieves the stored access token from localStorage.
 * @returns {string | null} The access token, or null if not found.
 */
export const getAccessToken = () => {
  const token = localStorage.getItem('spotify_access_token');
  const expiry = localStorage.getItem('spotify_token_expiry');

  if (!token || !expiry) {
    return null;
  }

  const currentTime = Date.now();
  if (currentTime > parseInt(expiry)) {
    console.log('Access token expired. Attempting to refresh...');
    removeAccessToken();
    return null;
  }

  return token;
};

/**
 * Retrieves the stored refresh token from localStorage.
 * @returns {string | null} The refresh token, or null if not found.
 */
export const getRefreshToken = () => {
  return localStorage.getItem('spotify_refresh_token');
};

/**
 * Removes all Spotify related tokens from localStorage, effectively logging out the user.
 */
export const removeAccessToken = () => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_expires_in');
  localStorage.removeItem('spotify_token_expiry');
  localStorage.removeItem('spotify_user_id'); // Ensure user ID is also cleared
};

/**
 * Calls backend to refresh access token
 * @param {string} backendRefreshUrl - URL of backend's /refresh_token endpoint
 * @param {string} refreshToken - User's refresh token
 * @returns {Promise<string>} New access token
 */
export const refreshSpotifyToken = async (backendRefreshUrl, refreshToken) => {
    try {
        // *** CRITICAL FIX 3: Ensure NO <span class="math-inline"> TAGS ARE HERE ***
        const response = await fetch(`${backendRefreshUrl}?refresh_token=${refreshToken}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to refresh token');
        }
        const data = await response.json();
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_expires_in', (new Date().getTime() + (parseInt(data.expires_in) * 1000)).toString());
        if (data.refresh_token) {
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
        return data.access_token;
    } catch (error) {
        console.error("Error refreshing token:", error);
        removeAccessToken();
        throw error;
    }
};