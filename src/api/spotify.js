// src/api/spotify.js
import { getAccessToken, removeAccessToken } from '../utils/auth';

// **** THIS IS THE CRITICAL LINE TO CHANGE ****
// It MUST be Spotify's actual Web API base URL, and it MUST use HTTPS.
// It should NOT contain "googleusercontent.com" or any placeholder.
const BASE_URL = 'https://api.spotify.com'; // <--- CORRECT BASE URL (NO /v1)
// ********************************************

/**
 * Makes an authenticated request to the Spotify Web API.
 * @param {string} endpoint - The API endpoint (e.g., 'v1/me', 'v1/me/top/artists').
 * @param {RequestInit} [options] - Standard fetch options (e.g., method, body).
 * @returns {Promise<any>} The JSON response from the Spotify API.
 */
async function fetchSpotify(endpoint, options) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('No Spotify access token available. Please log in.');
  }

  // Correct concatenation: BASE_URL + '/' + endpoint
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (response.status === 401) {
    console.error('Spotify access token expired or invalid. Please re-authenticate.');
    removeAccessToken();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`Spotify API Error: ${endpoint}`, response.status, response.statusText, errorData);
    throw new Error(`Spotify API error: ${errorData.error?.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches a user's top artists from Spotify.
 * @param {'short_term' | 'medium_term' | 'long_term'} timeRange - Over what time frame are the affinities calculated.
 * @param {number} limit - The number of entities to return. Default: 5, Minimum: 1, Maximum: 50.
 * @returns {Promise<any>} Response containing top artists.
 */
export async function getTopArtists(timeRange = 'medium_term', limit = 5) {
  // Endpoint reference: https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  // Endpoint now starts with v1
  return fetchSpotify(`v1/me/top/artists?time_range=${timeRange}&limit=${limit}`);
}

/**
 * Fetches a user's top tracks from Spotify.
 * @param {'short_term' | 'medium_term' | 'long_term'} timeRange - Over what time frame are the affinities calculated.
 * @param {number} limit - The number of entities to return. Default: 5, Minimum: 1, Maximum: 50.
 * @returns {Promise<any>} Response containing top tracks.
 */
export async function getTopTracks(timeRange = 'medium_term', limit = 5) {
  // Endpoint reference: https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  // Endpoint now starts with v1
  return fetchSpotify(`v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
}

/**
 * Fetches a user's recently played tracks from Spotify.
 * @param {number} limit - The number of items to return. Default: 20, Minimum: 1, Maximum: 50.
 * @returns {Promise<any>} Response containing recently played tracks.
 */
export async function getRecentlyPlayedTracks(limit = 50) {
  // Endpoint reference: https://api.spotify.com/v1/me/player/recently-played
  // Endpoint now starts with v1
  return fetchSpotify(`v1/me/player/recently-played?limit=${limit}`);
}