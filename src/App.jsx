// src/App.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  registerUser, loginLocal, logoutUser, checkSession,
  redirectToSpotifyAuthLink
} from './services/frontendAuthService';
import AuthForms from './components/AuthForms';
import Dashboard from './components/Dashboard';

// Backend URLs (updated)
const BACKEND_LOGIN_LOCAL_URL = 'http://127.0.0.1:8888/login/local';
const BACKEND_REGISTER_URL = 'http://127.0.0.1:8888/register';
const BACKEND_LOGOUT_URL = 'http://127.0.0.1:8888/logout';
const BACKEND_SESSION_URL = 'http://127.0.0.1:8888/session';
const BACKEND_SPOTIFY_LINK_URL = 'http://127.0.0.1:8888/login/spotify';

// Add ALL Backend API URLs for stats
const BACKEND_LISTENING_TIME_API = 'http://127.0.0.1:8888/api/listening-time';
const BACKEND_TOP_ARTISTS_API = 'http://127.0.0.1:8888/api/top-artists-historical';
const BACKEND_TOP_TRACKS_API = 'http://127.0.0.1:8888/api/top-tracks-historical';
const BACKEND_TOP_ALBUMS_API = 'http://127.0.0.1:8888/api/top-albums-historical';
const BACKEND_GENRE_BREAKDOWN_API = 'http://127.0.0.1:8888/api/genre-breakdown-historical';

const FRONTEND_DASHBOARD_PATH = 'http://127.0.0.1:5173/dashboard';

function App() {
  // --- Core Authentication States ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Global loading for initial app startup
  const [error, setError] = useState(null); // General error message display
  const [spotifyLinked, setSpotifyLinked] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('Guest');
  const [currentLocalUserId, setCurrentLocalUserId] = useState(null);

  const [minutesListenedAllTime, setMinutesListenedAllTime] = useState(0);

  // CALENDAR-ALIGNED STATES
  const [minutesListenedToday, setMinutesListenedToday] = useState(0); 
  const [minutesListenedYesterday, setMinutesListenedYesterday] = useState(0); 
  const [minutesListenedThisWeek, setMinutesListenedThisWeek] = useState(0);
  const [minutesListenedLastWeek, setMinutesListenedLastWeek] = useState(0);
  const [minutesListenedThisMonth, setMinutesListenedThisMonth] = useState(0); 
  const [minutesListenedLastMonth, setMinutesListenedLastMonth] = useState(0); 
  const [minutesListenedLast3Months, setMinutesListenedLast3Months] = useState(0);
  const [minutesListenedLast6Months, setMinutesListenedLast6Months] = useState(0);
  const [minutesListenedThisYear, setMinutesListenedThisYear] = useState(0); 
  const [minutesListenedLastYear, setMinutesListenedLastYear] = useState(0); 

  const [selectedTimeframe, setSelectedTimeframe] = useState('this_week'); // Changed from '7days' to 'this_week'

  const [historicalTopArtists, setHistoricalTopArtists] = useState([]);
  const [historicalTopSongs, setHistoricalTopSongs] = useState([]);
  const [historicalTopAlbums, setHistoricalTopAlbums] = useState([]);
  const [historicalGenreBreakdown, setHistoricalGenreBreakdown] = useState([]);

  // --- Granular Loading States (for individual sections within Dashboard) ---
  const [loadingListeningTime, setLoadingListeningTime] = useState(true);
  const [loadingTopArtists, setLoadingTopArtists] = useState(true);
  const [loadingTopSongs, setLoadingTopSongs] = useState(true);
  const [loadingTopAlbums, setLoadingTopAlbums] = useState(true);
  const [loadingGenreBreakdown, setLoadingGenreBreakdown] = useState(true);

  // --- Auth Form Input States (passed as props to AuthForms) ---
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Clear form inputs when switching between login/register modes
  const clearFormInputs = () => {
    setUsernameInput('');
    setPasswordInput('');
    setDisplayNameInput('');
    setEmailInput('');
    setError(null);
    setSuccessMessage('');
  };

  // --- DATA FETCHING LOGIC ---
  const fetchData = useCallback(async () => {
    console.log("App: fetchData started."); // DEBUG
    // Reset all granular loading states to true at the beginning of each fetch cycle
    setLoadingListeningTime(true);
    setLoadingTopArtists(true);
    setLoadingTopSongs(true);
    setLoadingTopAlbums(true);
    setLoadingGenreBreakdown(true);
    setError(null); // Clear any previous errors when starting a new fetch

    try {
      const sessionStatus = await checkSession(BACKEND_SESSION_URL);
      console.log("App: Session status from backend (inside fetchData):", sessionStatus); // DEBUG

      // Update core authentication states
      setIsLoggedIn(sessionStatus.loggedIn);
      setCurrentLocalUserId(sessionStatus.userId);
      setCurrentUserName(sessionStatus.displayName);
      setSpotifyLinked(sessionStatus.spotifyLinked);

      if (!sessionStatus.loggedIn) {
        console.log("App: Not logged in, aborting fetchData and clearing data.");
        setError("You are not logged in locally. Please log in to EchoStats.");
        // Clear all minutes listened states on early exit
        setMinutesListenedAllTime(0);
        setMinutesListenedToday(0); setMinutesListenedYesterday(0); 
        setMinutesListenedThisWeek(0); setMinutesListenedLastWeek(0); 
        setMinutesListenedThisMonth(0); setMinutesListenedLastMonth(0); 
        setMinutesListenedLast3Months(0); setMinutesListenedLast6Months(0);
        setMinutesListenedThisYear(0); setMinutesListenedLastYear(0); 

        setHistoricalTopArtists([]); setHistoricalTopSongs([]);
        setHistoricalTopAlbums([]); setHistoricalGenreBreakdown([]);
        setLoadingListeningTime(false);
        setLoadingTopArtists(false); setLoadingTopSongs(false);
        setLoadingTopAlbums(false); setLoadingGenreBreakdown(false);
        return;
      }

      if (!sessionStatus.spotifyLinked) {
        console.log("App: Spotify not linked, aborting fetchData and clearing data.");
        setError("Spotify account not linked. Please link your Spotify account.");
        // Clear all minutes listened states on early exit
        setMinutesListenedAllTime(0);
        setMinutesListenedToday(0); setMinutesListenedYesterday(0);
        setMinutesListenedThisWeek(0); setMinutesListenedLastWeek(0);
        setMinutesListenedThisMonth(0); setMinutesListenedLastMonth(0); 
        setMinutesListenedLast3Months(0); setMinutesListenedLast6Months(0);
        setMinutesListenedThisYear(0); setMinutesListenedLastYear(0); 

        setHistoricalTopArtists([]); setHistoricalTopSongs([]);
        setHistoricalTopAlbums([]); setHistoricalGenreBreakdown([]);
        setLoadingListeningTime(false);
        setLoadingTopArtists(false); setLoadingTopSongs(false);
        setLoadingTopAlbums(false); setLoadingGenreBreakdown(false);
        return;
      }

      // --- User is logged in and Spotify linked. Proceed to fetch data. ---
      console.log("App: User logged in and Spotify linked. Proceeding to fetch all stats..."); // DEBUG

      // Fetch Listening Time for All Time
      try {
          console.log("App: Fetching all_time listening time...");
          const minutesAllTimeResponse = await fetch(`${BACKEND_LISTENING_TIME_API}?timeframe=all_time`, { credentials: 'include' });
          if (!minutesAllTimeResponse.ok) throw new Error(`HTTP error! status: ${minutesAllTimeResponse.status}`);
          const dataAllTime = await minutesAllTimeResponse.json();
          setMinutesListenedAllTime(dataAllTime.total_minutes || 0);
          console.log("App: Fetched all_time listening time data:", dataAllTime);
      } catch (err) {
          console.error("App: Error fetching all_time listening time:", err);
          setError(`Failed to load all-time listening time. Data might be temporarily unavailable.`);
          setMinutesListenedAllTime(0);
      }

      // ADD NEW CALENDAR-ALIGNED LISTENING TIME FETCH CALLS
      const timeframes = [
        { key: 'today', setter: setMinutesListenedToday },
        { key: 'yesterday', setter: setMinutesListenedYesterday },
        { key: 'this_week', setter: setMinutesListenedThisWeek },
        { key: 'last_week', setter: setMinutesListenedLastWeek },
        { key: 'this_month', setter: setMinutesListenedThisMonth },
        { key: 'last_month', setter: setMinutesListenedLastMonth },
        { key: 'last_3_months', setter: setMinutesListenedLast3Months },
        { key: 'last_6_months', setter: setMinutesListenedLast6Months },
        { key: 'this_year', setter: setMinutesListenedThisYear },
        { key: 'last_year', setter: setMinutesListenedLastYear }
      ];

      for (const timeframe of timeframes) {
        try {
          console.log(`App: Fetching ${timeframe.key} listening time...`);
          const response = await fetch(`${BACKEND_LISTENING_TIME_API}?timeframe=${timeframe.key}`, { credentials: 'include' });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          timeframe.setter(Number(data.total_minutes) || 0);
          console.log(`App: Fetched ${timeframe.key} listening time data:`, data);
        } catch (err) {
          console.error(`App: Error fetching ${timeframe.key} listening time:`, err);
          timeframe.setter(0);
        }
      }

      setLoadingListeningTime(false);

      // Fetch Top Artists (historical)
      try {
          console.log("App: Fetching top artists..."); // DEBUG
          const topArtistsResponse = await fetch(`${BACKEND_TOP_ARTISTS_API}?timeframe=${selectedTimeframe}&limit=10`, { credentials: 'include' });
          if (!topArtistsResponse.ok) throw new Error(`HTTP error! status: ${topArtistsResponse.status}`);
          const topArtistsData = await topArtistsResponse.json();
          setHistoricalTopArtists(topArtistsData || []); // Ensure array
          console.log("App: Fetched Top Artists data:", topArtistsData); // DEBUG
      } catch (err) {
          console.error("App: Error fetching top artists:", err); // DEBUG
          setError(`Failed to load top artists. Data might be temporarily unavailable.`);
          setHistoricalTopArtists([]); // Reset to empty array on error
      } finally { setLoadingTopArtists(false); }

      // Fetch Top Songs (historical)
      try {
          console.log("App: Fetching top songs..."); // DEBUG
          const topSongsResponse = await fetch(`${BACKEND_TOP_TRACKS_API}?timeframe=${selectedTimeframe}&limit=10`, { credentials: 'include' });
          if (!topSongsResponse.ok) throw new Error(`HTTP error! status: ${topSongsResponse.status}`);
          const topSongsData = await topSongsResponse.json();
          setHistoricalTopSongs(topSongsData || []); // Ensure array
          console.log("App: Fetched Top Songs data:", topSongsData); // DEBUG
      } catch (err) {
          console.error("App: Error fetching top songs:", err); // DEBUG
          setError(`Failed to load top songs. Data might be temporarily unavailable.`);
          setHistoricalTopSongs([]); // Reset to empty array on error
      } finally { setLoadingTopSongs(false); }

      // Fetch Top Albums (historical)
      try {
          console.log("App: Fetching top albums..."); // DEBUG
          const topAlbumsResponse = await fetch(`${BACKEND_TOP_ALBUMS_API}?timeframe=${selectedTimeframe}&limit=10`, { credentials: 'include' }); 
          if (!topAlbumsResponse.ok) throw new Error(`HTTP error! status: ${topAlbumsResponse.status}`);
          const topAlbumsData = await topAlbumsResponse.json();
          setHistoricalTopAlbums(topAlbumsData || []); // Ensure array
          console.log("App: Fetched Top Albums data:", topAlbumsData); // DEBUG
      } catch (err) {
          console.error("App: Error fetching top albums:", err); // DEBUG
          setError(`Failed to load top albums. Data might be temporarily unavailable.`);
          setHistoricalTopAlbums([]); // Reset to empty array on error
      } finally { setLoadingTopAlbums(false); }

      // Fetch Genre Breakdown (historical)
      try {
          console.log("App: Fetching genre breakdown..."); // DEBUG
          const genreBreakdownResponse = await fetch(`${BACKEND_GENRE_BREAKDOWN_API}?timeframe=${selectedTimeframe}&limit=10`, { credentials: 'include' });
          if (!genreBreakdownResponse.ok) throw new Error(`HTTP error! status: ${genreBreakdownResponse.status}`);
          const genreBreakdownData = await genreBreakdownResponse.json();
          setHistoricalGenreBreakdown(genreBreakdownData || []); // Ensure array
          console.log("App: Fetched Genre Breakdown data:", genreBreakdownData); // DEBUG
      } catch (err) {
          console.error("App: Error fetching genre breakdown:", err); // DEBUG
          setError(`Failed to load genre breakdown. Data might be temporarily unavailable.`);
          setHistoricalGenreBreakdown([]); // Reset to empty array on error
      } finally { setLoadingGenreBreakdown(false); }

    } catch (err) {
      console.error("App: Overall data fetching or session error (caught by outer try-catch):", err); // DEBUG
      setError(`An unexpected error occurred during data load: ${err.message}. Please ensure backend is running.`);
      // Ensure all loading states are off and data is cleared on overall error
      setLoadingListeningTime(false);
      setLoadingTopArtists(false); setLoadingTopSongs(false);
      setLoadingTopAlbums(false); setLoadingGenreBreakdown(false);
      setHistoricalTopArtists([]); setHistoricalTopSongs([]);
      setHistoricalTopAlbums([]); setHistoricalGenreBreakdown([]);
    } finally {
      setLoading(false); // Global loading false
      console.log("App: fetchData completed. Global loading set to false."); // DEBUG
    }
  }, [
      BACKEND_LISTENING_TIME_API, BACKEND_TOP_ARTISTS_API, BACKEND_TOP_TRACKS_API,
      BACKEND_TOP_ALBUMS_API, BACKEND_GENRE_BREAKDOWN_API, selectedTimeframe
  ]);

  // --- AUTHENTICATION HANDLERS ---
  const handleAuthSubmit = useCallback(async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    setSuccessMessage('');
    console.log("App: handleAuthSubmit called."); // DEBUG

    try {
      let response;
      if (isRegisterMode) {
        // Updated to pass email to registerUser function
        response = await registerUser(BACKEND_REGISTER_URL, usernameInput, emailInput, passwordInput, displayNameInput);
        console.log("App: Registered user response:", response); // DEBUG
        
        // Handle registration success - don't auto-login, show success message
        if (response.email_verification_required) {
          setSuccessMessage("Registration successful! Please check your email to verify your account before logging in.");
          setIsRegisterMode(false); // Switch to login mode
          clearFormInputs();
          return; // Don't proceed to login
        }
      } else {
        response = await loginLocal(BACKEND_LOGIN_LOCAL_URL, usernameInput, passwordInput);
        console.log("App: Logged in local user response:", response); // DEBUG
      }
      
      // Only set login state if we're actually logging in (not just registering)
      if (!isRegisterMode || !response.email_verification_required) {
        setIsLoggedIn(true);
        setCurrentLocalUserId(response.userId);
        setCurrentUserName(response.displayName || response.display_name);
        setSpotifyLinked(false); // Reset this, will be updated by fetchData
        window.history.replaceState({}, document.title, FRONTEND_DASHBOARD_PATH);
        clearFormInputs();
        fetchData(); // Trigger data fetch after successful login
      }

    } catch (err) {
      console.error("App: Auth error (handleAuthSubmit):", err); // DEBUG
      setError(err.message || "Authentication failed.");
      
      // Handle specific email verification error
      if (err.message && err.message.includes('verify your email')) {
        // Don't clear email input for verification errors
        setUsernameInput('');
        setPasswordInput('');
        setDisplayNameInput('');
      }
    } finally {
      setAuthLoading(false);
      console.log("App: handleAuthSubmit completed."); // DEBUG
    }
  }, [usernameInput, emailInput, passwordInput, displayNameInput, isRegisterMode, fetchData]);

  const handleLogout = useCallback(async () => {
    console.log("App: handleLogout called."); // DEBUG
    setLoading(true);
    setError(null);
    try {
      await logoutUser(BACKEND_LOGOUT_URL);
      setIsLoggedIn(false);
      setCurrentLocalUserId(null);
      setCurrentUserName('Guest');
      setSpotifyLinked(false);
      setHistoricalTopArtists([]); setHistoricalTopSongs([]);
      setHistoricalTopAlbums([]); setHistoricalGenreBreakdown([]);
      clearFormInputs();
      window.history.replaceState({}, document.title, '/');
      console.log("App: User logged out and data cleared."); // DEBUG
    } catch (err) {
      console.error("App: Logout error:", err); // DEBUG
      setError(err.message || "Logout failed.");
    } finally {
      setLoading(false);
      console.log("App: handleLogout completed."); // DEBUG
    }
  }, [BACKEND_LOGOUT_URL]); // Dependency for handleLogout. Setters are stable.

  const handleLinkSpotify = useCallback(() => {
    console.log("App: handleLinkSpotify called. Redirecting to backend Spotify auth."); // DEBUG
    setError(null);
    redirectToSpotifyAuthLink(BACKEND_SPOTIFY_LINK_URL);
  }, [BACKEND_SPOTIFY_LINK_URL]); // Dependency for handleLinkSpotify

  // Handle mode switching
  const handleModeSwitch = useCallback((newMode) => {
    setIsRegisterMode(newMode);
    clearFormInputs();
  }, []);

  // --- INITIAL LOAD AND SESSION CHECK ---
  useEffect(() => {
    const checkInitialSessionAndFetch = async () => {
      console.log("App: useEffect - Initial session check started."); // DEBUG
      setLoading(true);
      setError(null);

      try {
        const sessionStatus = await checkSession(BACKEND_SESSION_URL);
        console.log("App: Initial session status from backend (in useEffect):", sessionStatus); // DEBUG

        setIsLoggedIn(sessionStatus.loggedIn);
        setCurrentLocalUserId(sessionStatus.userId);
        setCurrentUserName(sessionStatus.displayName);
        setSpotifyLinked(sessionStatus.spotifyLinked);

        if (sessionStatus.loggedIn && sessionStatus.spotifyLinked) {
          console.log("App: Logged in and Spotify linked. Calling fetchData."); // DEBUG
          fetchData();
        } else if (sessionStatus.loggedIn && !sessionStatus.spotifyLinked) {
          console.log("App: Logged in but Spotify not linked. Showing link prompt. Setting global loading to false."); // DEBUG
          setLoading(false);
        } else {
          console.log("App: Not logged in. Showing auth forms. Setting global loading to false."); // DEBUG
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('error')) {
              setError(urlParams.get('message') || 'An authentication error occurred.');
              window.history.replaceState({}, document.title, '/');
          }
          setLoading(false);
        }

        // Clean up URL if it came from Spotify callback
        if (window.location.pathname === '/dashboard' || window.location.search.includes('code') || window.location.search.includes('access_token')) {
            console.log("App: Cleaning URL to dashboard path."); // DEBUG
            window.history.replaceState({}, document.title, FRONTEND_DASHBOARD_PATH);
        }

      } catch (err) {
        console.error("App: Initial session check error (critical) - caught by useEffect:", err); // DEBUG
        setError(err.message || "Failed to check session. Please ensure backend is running and reachable.");
        setIsLoggedIn(false);
        setCurrentLocalUserId(null);
        setCurrentUserName('Guest');
        setSpotifyLinked(false);
        setLoading(false);
      }
    };

    checkInitialSessionAndFetch();
  }, [fetchData]); // Dependency: fetchData (it's a useCallback, so it's stable)

  // --- Auto-Refresh Data Interval ---
  useEffect(() => {
    let intervalId;
    if (isLoggedIn && spotifyLinked) {
      console.log("App: Auto-refresh interval set up."); // DEBUG
      intervalId = setInterval(() => {
        console.log("App: Auto-refreshing data..."); // DEBUG
        fetchData();
      }, 5 * 60 * 1000); // 5 minutes refresh
    } else {
        console.log("App: Auto-refresh interval cleared/not set. isLoggedIn:", isLoggedIn, "spotifyLinked:", spotifyLinked); // DEBUG
        // Ensure interval is cleared if it exists when conditions are not met
        if (intervalId) { // Check if intervalId has a value before trying to clear
             clearInterval(intervalId);
             intervalId = null; // Set to null to prevent stale closure issues
        }
    }

    return () => {
      if (intervalId) {
        console.log("App: Clearing auto-refresh interval on unmount/dependency change."); // DEBUG
        clearInterval(intervalId);
      }
    };
  }, [isLoggedIn, spotifyLinked, fetchData]);

  // --- MAIN RENDER LOGIC ---
  return (
    <div className="container">
      {/* Only show main title when logged in */}
      {isLoggedIn && <h1 className="app-title">EchoStats for {currentUserName}</h1>}

      {console.log("App: Rendering. isLoggedIn:", isLoggedIn, "loading:", loading, "handleLogout type:", typeof handleLogout)} {/* ADD THIS DEBUG */}

      {loading ? (
        <p className="loading-message">Loading app...</p>
      ) : isLoggedIn ? (
        <Dashboard
            currentUserName={currentUserName}
            selectedTimeframe={selectedTimeframe}
            setSelectedTimeframe={setSelectedTimeframe}
            handleLogout={handleLogout}
            error={error}
            spotifyLinked={spotifyLinked}
            handleLinkSpotify={handleLinkSpotify}
            
            // Rolling timeframes (existing)
            minutesListenedAllTime={minutesListenedAllTime}
            
            // Calendar timeframes
            minutesListenedToday={minutesListenedToday}
            minutesListenedYesterday={minutesListenedYesterday}
            minutesListenedThisWeek={minutesListenedThisWeek}
            minutesListenedLastWeek={minutesListenedLastWeek}
            minutesListenedThisMonth={minutesListenedThisMonth}
            minutesListenedLastMonth={minutesListenedLastMonth}
            minutesListenedLast3Months={minutesListenedLast3Months}
            minutesListenedLast6Months={minutesListenedLast6Months}
            minutesListenedThisYear={minutesListenedThisYear}
            minutesListenedLastYear={minutesListenedLastYear}
            
            // Other props (existing)
            loadingListeningTime={loadingListeningTime}
            historicalTopArtists={historicalTopArtists}
            historicalTopSongs={historicalTopSongs}
            historicalTopAlbums={historicalTopAlbums}
            historicalGenreBreakdown={historicalGenreBreakdown}
            loadingTopArtists={loadingTopArtists}
            loadingTopSongs={loadingTopSongs}
            loadingTopAlbums={loadingTopAlbums}
            loadingGenreBreakdown={loadingGenreBreakdown}
            />
      ) : (
        <AuthForms
          onAuthSubmit={handleAuthSubmit}
          isRegisterMode={isRegisterMode}
          setIsRegisterMode={handleModeSwitch}
          error={error}
          usernameInput={usernameInput}
          setUsernameInput={setUsernameInput}
          passwordInput={passwordInput}
          setPasswordInput={setPasswordInput}
          displayNameInput={displayNameInput}
          setDisplayNameInput={setDisplayNameInput}
          emailInput={emailInput}
          setEmailInput={setEmailInput}
          loading={authLoading}
          successMessage={successMessage}
        />
      )}
    </div>
  );
}

export default App;