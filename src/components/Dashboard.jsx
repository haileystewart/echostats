// echostats/src/components/Dashboard.jsx
import React from 'react';
import StatCard from './StatCard';

function Dashboard({
  currentUserName,
  selectedTimeframe,
  setSelectedTimeframe,
  handleLogout,
  error,
  spotifyLinked,
  handleLinkSpotify,
  
  // All the individual timeframe listening data
  minutesListenedAllTime,
  minutesListenedToday, 
  minutesListenedYesterday, 
  minutesListenedThisWeek, 
  minutesListenedLastWeek, 
  minutesListenedThisMonth, 
  minutesListenedLastMonth, 
  minutesListenedLast3Months, 
  minutesListenedLast6Months, 
  minutesListenedThisYear,
  minutesListenedLastYear, 

  loadingListeningTime,
  historicalTopArtists,
  historicalTopSongs,
  historicalTopAlbums,
  historicalGenreBreakdown,
  loadingTopArtists,
  loadingTopSongs,
  loadingTopAlbums,
  loadingGenreBreakdown
}) {
  console.log("Dashboard: Component rendered. Props received:", {
    selectedTimeframe,
    historicalTopArtists, 
    historicalTopSongs,
    historicalTopAlbums,
    historicalGenreBreakdown, 
    loadingGenreBreakdown
  });

  // Helper function to get the current listening time based on selected timeframe
  const getCurrentListeningTime = () => {
    switch(selectedTimeframe) {
      case 'today': return minutesListenedToday;
      case 'yesterday': return minutesListenedYesterday;
      case 'this_week': return minutesListenedThisWeek;
      case 'last_week': return minutesListenedLastWeek;
      case 'this_month': return minutesListenedThisMonth;
      case 'last_month': return minutesListenedLastMonth;
      case 'last_3_months': return minutesListenedLast3Months;
      case 'last_6_months': return minutesListenedLast6Months;
      case 'this_year': return minutesListenedThisYear;
      case 'last_year': return minutesListenedLastYear;
      case 'all_time': return minutesListenedAllTime;
      default: return 0;
    }
  };

  // Check if current timeframe has any listening data
  const hasListeningData = () => {
    const currentMinutes = getCurrentListeningTime();
    return currentMinutes && currentMinutes > 0;
  };

  // Helper function to format timeframe for display
  const formatTimeframeDisplay = (timeframe) => {
    const timeframeMap = {
      'today': 'Today',
      'yesterday': 'Yesterday',
      'this_week': 'This Week',
      'last_week': 'Last Week',
      'this_month': 'This Month',
      'last_month': 'Last Month',
      'last_3_months': 'Last 3 Months',
      'last_6_months': 'Last 6 Months',
      'this_year': 'This Year',
      'last_year': 'Last Year',
      'all_time': 'All Time'
    };
    return timeframeMap[timeframe] || timeframe;
  };

  return (
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
                    backgroundColor: '#1F1F1F',
                    color: '#FFFFFF',
                    cursor: 'pointer'
                }}
            >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="this_year">This Year</option>
                <option value="last_year">Last Year</option>
                <option value="all_time">All Time</option>
            </select>
        </div>
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
      </div>

      {error && (
        <div className="error-message card" style={{ backgroundColor: '#B92727', color: 'white', marginBottom: '1rem' }}>
          <p>{error}</p>
        </div>
      )}

      {!spotifyLinked ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                  You need to link your Spotify account to view your stats.
              </p>
              <button onClick={handleLinkSpotify} className="login-button" style={{ backgroundColor: '#1DB954' }}>
                  Link Spotify Account
              </button>
              {window.location.search.includes('spotify_auth_failed') && (
                  <p style={{ color: '#EF4444', marginTop: '1rem' }}>
                      Spotify linking failed: {decodeURIComponent(window.location.search.split('message=')[1] || 'Unknown error')}. Please try again.
                  </p>
              )}
          </div>
      ) : (
          <div className="grid-layout">
              {/* Fixed Listening Time card showing all timeframes */}
              <StatCard title="Listening Time" loading={loadingListeningTime}>
                <p className="stat-text">Today: <span className="stat-value">{minutesListenedToday ?? 0}</span> minutes</p> 
                <p className="stat-text">Yesterday: <span className="stat-value">{minutesListenedYesterday ?? 0}</span> minutes</p> 
                <p className="stat-text">This Week: <span className="stat-value">{minutesListenedThisWeek ?? 0}</span> minutes</p> 
                <p className="stat-text">Last Week: <span className="stat-value">{minutesListenedLastWeek ?? 0}</span> minutes</p> 
                <p className="stat-text">This Month: <span className="stat-value">{minutesListenedThisMonth ?? 0}</span> minutes</p> 
                <p className="stat-text">Last Month: <span className="stat-value">{minutesListenedLastMonth ?? 0}</span> minutes</p> 
                <p className="stat-text">Last 3 Months: <span className="stat-value">{minutesListenedLast3Months ?? 0}</span> minutes</p> 
                <p className="stat-text">Last 6 Months: <span className="stat-value">{minutesListenedLast6Months ?? 0}</span> minutes</p> 
                <p className="stat-text">This Year: <span className="stat-value">{minutesListenedThisYear ?? 0}</span> minutes</p> 
                <p className="stat-text">Last Year: <span className="stat-value">{minutesListenedLastYear ?? 0}</span> minutes</p>
                <p className="stat-text">All Time: <span className="stat-value">{minutesListenedAllTime ?? 0}</span> minutes</p>
                <p className="note-text">(Data sourced from your listening data since connecting to EchoStats.)</p>
              </StatCard>

              {/* Top Artists for selected timeframe */}
              <StatCard
                title={`Top Artists (${formatTimeframeDisplay(selectedTimeframe)})`}
                loading={loadingTopArtists}
                emptyMessage="No top artists found for this period. Keep listening to populate!"
              >
                {console.log("Dashboard: Rendering Top Artists. historicalTopArtists:", historicalTopArtists)}
                {!hasListeningData() ? (
                  <div className="no-data-message">
                    <p className="stat-text">No listening data for {formatTimeframeDisplay(selectedTimeframe).toLowerCase()}.</p>
                    <p className="note-text">Keep listening to Spotify to see your stats here!</p>
                  </div>
                ) : historicalTopArtists && historicalTopArtists.length > 0 ? (
                    <ul>
                        {historicalTopArtists.map((artist) => (
                            <li key={artist.id} className="list-item">
                                {artist.images && artist.images[0] && (
                                    <img src={artist.images[0].url} alt={artist.name} className="artist-image" />
                                )}
                                <div className="list-item-content">
                                    <div className="list-item-title">{artist.name}</div>
                                </div>
                                {artist.total_minutes_listened !== undefined && (
                                    <span className="list-item-detail">{artist.total_minutes_listened} min</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="stat-text">No top artists found for {formatTimeframeDisplay(selectedTimeframe).toLowerCase()}. Keep listening to populate!</p>
                )}
              </StatCard>

              {/* Top Songs for selected timeframe */}
              <StatCard
                title={`Top Songs (${formatTimeframeDisplay(selectedTimeframe)})`}
                loading={loadingTopSongs}
                emptyMessage="No top songs found for this period. Keep listening to populate!"
              >
                {console.log("Dashboard: Rendering Top Songs. historicalTopSongs:", historicalTopSongs)}
                {!hasListeningData() ? (
                  <div className="no-data-message">
                    <p className="stat-text">No listening data for {formatTimeframeDisplay(selectedTimeframe).toLowerCase()}.</p>
                    <p className="note-text">Keep listening to Spotify to see your stats here!</p>
                  </div>
                ) : historicalTopSongs && historicalTopSongs.length > 0 ? (
                    <ul>
                        {(Array.isArray(historicalTopSongs) ? historicalTopSongs : []).map((track) => (
                            <li key={track.id} className="list-item">
                                {track.images && track.images[0] && (
                                    <img src={track.images[0].url} alt={track.name} className="album-image" style={{ borderRadius: '5px' }} />
                                )}
                                <span>
                                    {track.name} by{" "}
                                    <span className="song-artist-name">
                                        {track.artists.map(a => a?.name)?.join(', ') || 'Unknown Artist'}
                                    </span>
                                </span>
                                {track.total_minutes_listened !== undefined && (
                                    <span className="list-item-detail"> ({track.total_minutes_listened} min)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="stat-text">No top songs found for {formatTimeframeDisplay(selectedTimeframe).toLowerCase()}. Keep listening to populate!</p>
                )}
              </StatCard>

              {/* Top Albums for selected timeframe */}
              <StatCard
                title={`Top Albums (${formatTimeframeDisplay(selectedTimeframe)})`}
                loading={loadingTopAlbums}
                emptyMessage="No top albums found for this period. Keep listening to populate!"
              >
                {console.log("Dashboard: Rendering Top Albums. historicalTopAlbums:", historicalTopAlbums, "Type:", typeof historicalTopAlbums, "isArray:", Array.isArray(historicalTopAlbums))}
                {!hasListeningData() ? (
                  <div className="no-data-message">
                    <p className="stat-text">No listening data for {formatTimeframeDisplay(selectedTimeframe).toLowerCase()}.</p>
                    <p className="note-text">Keep listening to Spotify to see your stats here!</p>
                  </div>
                ) : historicalTopAlbums && historicalTopAlbums.length > 0 ? (
                    <ul>
                        {(Array.isArray(historicalTopAlbums) ? historicalTopAlbums : []).map((album, index) => (
                            <li key={album?.id || index} className="list-item">
                                {album?.images?.[0]?.url && (
                                    <img src={album.images[0].url} alt={album.name} className="album-image" style={{ borderRadius: '5px' }} />
                                )}
                                <span>
                                    {album?.name || 'Unknown Album'} by{" "}
                                    <span className="album-artist-name">
                                        {album?.artists?.map(a => a?.name)?.join(', ') || 'Unknown Artist'}
                                    </span>
                                </span>
                                {album?.total_minutes_listened !== undefined && (
                                    <span className="list-item-detail"> ({album.total_minutes_listened} min)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="stat-text">No top albums found for {formatTimeframeDisplay(selectedTimeframe).toLowerCase()}. Keep listening to populate!</p>
                )}
              </StatCard>

              {/* Genre Breakdown for selected timeframe */}
              <StatCard
                title={`Genre Breakdown (${formatTimeframeDisplay(selectedTimeframe)})`}
                loading={loadingGenreBreakdown}
                emptyMessage="No genre data found for this period. Keep listening to populate!"
              >
                {console.log("Dashboard: Inside Genre Breakdown StatCard. historicalGenreBreakdown BEFORE MAP:", historicalGenreBreakdown, "Type:", typeof historicalGenreBreakdown, "isArray:", Array.isArray(historicalGenreBreakdown))}
                {!hasListeningData() ? (
                  <div className="no-data-message">
                    <p className="stat-text">No listening data for {formatTimeframeDisplay(selectedTimeframe).toLowerCase()}.</p>
                    <p className="note-text">Keep listening to Spotify to see your stats here!</p>
                  </div>
                ) : historicalGenreBreakdown && historicalGenreBreakdown.length > 0 ? (
                    <ul>
                        {(Array.isArray(historicalGenreBreakdown) ? historicalGenreBreakdown : []).map((genreItem, index) => (
                            <li key={genreItem.genre || index} className="list-item"> 
                                <span style={{ textTransform: 'capitalize' }}>{genreItem.genre.replace(/-/g, ' ')}</span>
                                {genreItem.total_minutes !== undefined && (
                                    <span className="list-item-detail"> ({genreItem.total_minutes} min)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="stat-text">No genre data found for {formatTimeframeDisplay(selectedTimeframe).toLowerCase()}. Keep listening to populate!</p>
                )}
              </StatCard>
          </div>
      )}
    </div>
  );
}

export default Dashboard;