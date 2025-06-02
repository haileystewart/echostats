// src/App.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { redirectToSpotifyAuth, getAccessToken, removeAccessToken, saveTokensFromBackend, getRefreshToken, refreshSpotifyToken } from './utils/auth';
import { getTopArtists, getTopTracks, getRecentlyPlayedTracks } from './api/spotify';

// Backend URL
const BACKEND_LOGIN_URL = 'http://127.0.0.1:8888/login';
const BACKEND_REFRESH_URL = 'http://127.0.0.1:8888/refresh_token';
const BACKEND_LISTENING_TIME_API = 'http://127.0.0.1:8888/api/listening-time';
const BACKEND_TOP_ARTISTS_API = 'http://127.0.0.1:8888/api/top-artists-historical';
const BACKEND_TOP_TRACKS_API = 'http://127.0.0.1:8888/api/top-tracks-historical';
const BACKEND_TOP_ALBUMS_API = 'http://127.0.0.1:8888/api/top-albums-historical'; //
const BACKEND_GENRE_BREAKDOWN_API = 'http://127.0.0.1:8888/api/genre-breakdown-historical'; //

// Frontend's redirect URI (for parsing tokens from backend's redirect)
const FRONTEND_REDIRECT_URI_BASE = 'http://127.0.0.1:5173/callback';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (We are no longer using these, but keeping them as comments for context)
  // const [topArtistsShortTerm, setTopArtistsShortTerm] = useState([]);
  // const [topSongsShortTerm, setTopSongsShortTerm] = useState([]);
  // const [topArtistsMediumTerm, setTopArtistsMediumTerm] = useState([]);
  // const [topSongsMediumTerm, setTopSongsMediumTerm] = useState([]);
  const [minutesListened24Hrs, setMinutesListened24Hrs] = useState(0); //
  const [minutesListened7Days, setMinutesListened7Days] = useState(0); //

  const [selectedTimeframe, setSelectedTimeframe] = useState('6months'); //
  const [historicalTopArtists, setHistoricalTopArtists] = useState([]); //
  const [historicalTopSongs, setHistoricalTopSongs] = useState([]); //
  const [historicalTopAlbums, setHistoricalTopAlbums] = useState([]); //
  const [historicalGenreBreakdown, setHistoricalGenreBreakdown] = useState([]); //

  // --- AUTHENTICATION LOGIC ---

  const handleLogin = useCallback(() => {
    setError(null);
    redirectToSpotifyAuth(BACKEND_LOGIN_URL);
  }, []);

  const handleLogout = useCallback(() => {
    removeAccessToken();
    setAccessToken(null);
    setError(null);
    setLoading(false);
    window.location.href = FRONTEND_REDIRECT_URI_BASE.split('?')[0];
  }, [FRONTEND_REDIRECT_URI_BASE]);

  const handleRefreshTokenAndFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available. Please log in again.');
      }
      const newAccessToken = await refreshSpotifyToken(BACKEND_REFRESH_URL, refreshToken);
      setAccessToken(newAccessToken);
      await fetchData(); // Refetch data with the new token
    } catch (err) {
      console.error("Failed to refresh token:", err);
      setError(err.message || "Failed to refresh token. Please log in again.");
      setAccessToken(null); // Force re-login if refresh fails
      removeAccessToken();
    } finally {
      setLoading(false);
    }
  }, []);

  // --- DATA FETCHING LOGIC ---
  const fetchData = useCallback(async () => {
    setLoading(true); //
    setError(null); //
    try {
      const userId = localStorage.getItem('spotify_user_id'); //
      if (!userId) { //
          setError("User ID not found for fetching historical data. Please log in again."); //
          setLoading(false); //
          return; //
      }

      // Fetch Minutes Listened
      const minutes24HrsResponse = await fetch(`${BACKEND_LISTENING_TIME_API}?user_id=${userId}&timeframe=24hrs`); //
      const data24Hrs = await minutes24HrsResponse.json(); //
      setMinutesListened24Hrs(data24Hrs.total_minutes || 0); //

      const minutes7DaysResponse = await fetch(`${BACKEND_LISTENING_TIME_API}?user_id=${userId}&timeframe=7days`); //
      const data7Days = await minutes7DaysResponse.json(); //
      setMinutesListened7Days(data7Days.total_minutes || 0); //

      // Fetch Top Artists/Songs
      const topArtistsResponse = await fetch(`${BACKEND_TOP_ARTISTS_API}?user_id=${userId}&timeframe=${selectedTimeframe}&limit=10`); //
      const topArtistsData = await topArtistsResponse.json(); //
      setHistoricalTopArtists(topArtistsData); //

      const topSongsResponse = await fetch(`${BACKEND_TOP_TRACKS_API}?user_id=${userId}&timeframe=${selectedTimeframe}&limit=10`); //
      const topSongsData = await topSongsResponse.json(); //
      setHistoricalTopSongs(topSongsData); //

      // NEW: Fetch Top Albums from Backend
      const topAlbumsResponse = await fetch(`${BACKEND_TOP_ALBUMS_API}?user_id=${userId}&timeframe=${selectedTimeframe}&limit=5`); //
      const topAlbumsData = await topAlbumsResponse.json(); //
      setHistoricalTopAlbums(topAlbumsData); //

      // NEW: Fetch Genre Breakdown from Backend
      const genreBreakdownResponse = await fetch(`${BACKEND_GENRE_BREAKDOWN_API}?user_id=${userId}&timeframe=${selectedTimeframe}&limit=10`); //
      const genreBreakdownData = await genreBreakdownResponse.json(); //
      setHistoricalGenreBreakdown(genreBreakdownData); //

    } catch (err) {
      console.error("Failed to fetch data:", err); //
      // More specific error handling. If a backend API returns 400/500, log specific error
      if (err.message.includes("401") || err.message.includes("Unauthorized")) { //
         setError("Session expired or invalid. Attempting to refresh token..."); //
         handleRefreshTokenAndFetch(); //
      } else if (err.message.includes("Failed to fetch")) { //
         setError("Network error or backend not reachable. Please ensure backend is running."); //
      } else {
         setError(`Failed to fetch data: ${err.message}. Please try again later.`); //
      }
      // Only remove access token if it's explicitly an auth issue or unrecoverable
      if (err.message.includes("Failed to refresh token") || err.message.includes("re-authenticate")) { //
         setAccessToken(null); //
         removeAccessToken(); //
      }
    } finally {
      setLoading(false); //
    }
  }, [BACKEND_LISTENING_TIME_API, BACKEND_TOP_ARTISTS_API, BACKEND_TOP_TRACKS_API, BACKEND_TOP_ALBUMS_API, BACKEND_GENRE_BREAKDOWN_API, selectedTimeframe, handleRefreshTokenAndFetch]); //

  // --- INITIAL LOAD AND CALLBACK HANDLING ---

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessTokenFromUrl = urlParams.get('access_token');
    const refreshTokenFromUrl = urlParams.get('refresh_token');
    const expiresInFromUrl = urlParams.get('expires_in');
    const userIdFromUrl = urlParams.get('user_id'); // Ensure user_id is also retrieved from URL

    const currentAccessToken = getAccessToken(); // Get token from localStorage (might be expired)

    if (currentAccessToken) {
      setAccessToken(currentAccessToken);
      fetchData(); // Token exists, fetch data
    } else if (accessTokenFromUrl && refreshTokenFromUrl && expiresInFromUrl && userIdFromUrl) { // Check userIdFromUrl
      // We just returned from backend with tokens in URL
      saveTokensFromBackend(urlParams); // Save them to localStorage
      setAccessToken(accessTokenFromUrl);
      // Clean the URL
      window.history.replaceState({}, document.title, FRONTEND_REDIRECT_URI_BASE.split('?')[0]);
      fetchData(); // Fetch data with new token
    } else {
      // No token and no code/tokens in URL, user needs to log in
      setLoading(false);
    }
  }, [fetchData, FRONTEND_REDIRECT_URI_BASE]); // Dependencies

  // --- RENDER LOGIC ---

  return (
    <div className="container">
      <h1 className="app-title">EchoStats</h1>

      {loading ? (
        <p className="loading-message">Loading your stats...</p>
      ) : accessToken ? (
        // If authenticated, show dashboard
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            {/* Timeframe Selector */}
            <div className="timeframe-selector">
                <label htmlFor="timeframe-select" style={{ marginRight: '10px', color: '#9CA3AF' }}>Show stats for:</label>
                <select
                    id="timeframe-select"
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '5px',
                        border: '1px solid #333',
                        backgroundColor: '#1E293B',
                        color: '#FFFFFF',
                        cursor: 'pointer'
                    }}
                >
                    <option value="24hrs">Last 24 Hours</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="6months">Last 6 Months</option>
                    <option value="1year">Last 1 Year</option>
                    <option value="all_time">All Time</option>
                </select>
            </div>
            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
          </div>

          {error && (
            <div className="error-message card" style={{ backgroundColor: '#BE123C', color: 'white', marginBottom: '1rem' }}>
              <p>{error}</p>
              {!accessToken && (
                <button onClick={handleLogin} className="login-button" style={{ marginTop: '1rem', backgroundColor: '#EF4444' }}>
                  Login with Spotify
                </button>
              )}
              {accessToken && error.includes("refresh") && (
                <button onClick={handleRefreshTokenAndFetch} className="login-button" style={{ marginTop: '1rem', backgroundColor: '#BE123C' }}>
                  Try Refresh Again
                </button>
              )}
            </div>
          )}

          {!error || (error && accessToken) ? (
            <div className="grid-layout">
              {/* Listening Time card - now entirely from backend */}
              <div className="card">
                <h2 className="card-title">Listening Time</h2>
                <p className="stat-text">Last 24 Hours: <span className="stat-value">{minutesListened24Hrs}</span> minutes</p>
                <p className="stat-text">Last 7 Days: <span className="stat-value">{minutesListened7Days}</span> minutes</p>
                <p className="note-text">
                  (Data sourced from your backend's historical collection.)
                </p>
              </div>

              {/* Top Artists (Historical) */}
              <div className="card">
                <h2 className="card-title">Top Artists ({selectedTimeframe === 'all_time' ? 'All Time' : `Last ${selectedTimeframe.replace('days', ' Days').replace('months', ' Months').replace('year', ' Year').replace('hrs', ' Hours')}`})</h2>
                {historicalTopArtists.length > 0 ? (
                    <ul>
                        {historicalTopArtists.map((artist) => (
                            <li key={artist.id} className="list-item">
                                {artist.images && artist.images[0] && (
                                    <img src={artist.images[0].url} alt={artist.name} className="artist-image" />
                                )}
                                <span>{artist.name}</span>
                                {artist.total_minutes_listened !== undefined && (
                                    <span className="list-item-detail"> ({artist.total_minutes_listened} min)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="stat-text">No top artists found for this period in your historical data. Keep listening to populate!</p>
                )}
              </div>

              {/* Top Songs (Historical) */}
              <div className="card">
                <h2 className="card-title">Top Songs ({selectedTimeframe === 'all_time' ? 'All Time' : `Last ${selectedTimeframe.replace('days', ' Days').replace('months', ' Months').replace('year', ' Year').replace('hrs', ' Hours')}`})</h2>
                {historicalTopSongs.length > 0 ? (
                    <ul>
                        {historicalTopSongs.map((track) => (
                            <li key={track.id} className="stat-text">
                                {track.name} by <span className="song-artist-name">{track.artists.map(a => a.name).join(', ')}</span>
                                {track.total_minutes_listened !== undefined && (
                                    <span className="list-item-detail"> ({track.total_minutes_listened} min)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="stat-text">No top songs found for this period in your historical data. Keep listening to populate!</p>
                )}
              </div>

              {/* NEW: Top Albums (Historical) */}
              <div className="card">
                <h2 className="card-title">Top Albums ({selectedTimeframe === 'all_time' ? 'All Time' : `Last ${selectedTimeframe.replace('days', ' Days').replace('months', ' Months').replace('year', ' Year').replace('hrs', ' Hours')}`})</h2>
                {historicalTopAlbums.length > 0 ? ( //
                    <ul> //
                        {historicalTopAlbums.map((album) => ( //
                            <li key={album.id} className="list-item"> //
                                {album.images && album.images[0] && ( //
                                    <img src={album.images[0].url} alt={album.name} className="artist-image" style={{ borderRadius: '5px' }} /> //
                                )}
                                <span>{album.name} by {album.artists.map(a => a.name).join(', ')}</span>
                                {album.total_minutes_listened !== undefined && ( //
                                    <span className="list-item-detail"> ({album.total_minutes_listened} min)</span> //
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="stat-text">No top albums found for this period in your historical data. Keep listening to populate!</p> //
                )}
              </div>

              {/* NEW: Genre Breakdown (Historical) */}
              <div className="card">
                <h2 className="card-title">Genre Breakdown ({selectedTimeframe === 'all_time' ? 'All Time' : `Last ${selectedTimeframe.replace('days', ' Days').replace('months', ' Months').replace('year', ' Year').replace('hrs', ' Hours')}`})</h2>
                {historicalGenreBreakdown.length > 0 ? ( //
                    <ul> //
                        {historicalGenreBreakdown.map((genreItem, index) => ( //
                            <li key={genreItem.genre || index} className="stat-text" style={{ marginBottom: '5px' }}> //
                                <span style={{ textTransform: 'capitalize' }}>{genreItem.genre.replace(/-/g, ' ')}</span>
                                {genreItem.total_minutes !== undefined && ( //
                                    <span className="list-item-detail"> ({genreItem.total_minutes} min)</span> //
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="stat-text">No genre data found for this period in your historical data. Keep listening to populate!</p> //
                )}
              </div>
              {/* No more placeholder cards, these are now implemented */}
            </div>
          ) : null}
        </div>
      ) : (
        // If not authenticated, show the login button
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
            Connect with Spotify to see your listening stats!
          </p>
          <button onClick={handleLogin} className="login-button">
            Login with Spotify
          </button>
        </div>
      )}
    </div>
  );
}

export default App;