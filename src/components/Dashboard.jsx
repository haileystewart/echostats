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
  minutesListened24Hrs,
  minutesListened7Days,
  minutesListened30Days, 
  minutesListened90Days, 
  minutesListened6Months, 
  minutesListened1Year, 
  minutesListenedAllTime, 
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
  console.log("Dashboard: Component rendered. Props received (AGAINST ERROR):", {
    historicalGenreBreakdown, 
    loadingGenreBreakdown
  });

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
              {/* Listening Time card */}
              <StatCard title="Listening Time" loading={loadingListeningTime}>
                <p className="stat-text">Last 24 Hours: <span className="stat-value">{minutesListened24Hrs}</span> minutes</p>
                <p className="stat-text">Last 7 Days: <span className="stat-value">{minutesListened7Days}</span> minutes</p>
                <p className="stat-text">Last 30 Days: <span className="stat-value">{minutesListened30Days}</span> minutes</p> 
                <p className="stat-text">Last 90 Days: <span className="stat-value">{minutesListened90Days}</span> minutes</p>
                <p className="stat-text">Last 6 Months: <span className="stat-value">{minutesListened6Months}</span> minutes</p> 
                <p className="stat-text">Last 1 Year: <span className="stat-value">{minutesListened1Year}</span> minutes</p> 
                <p className="stat-text">All Time: <span className="stat-value">{minutesListenedAllTime}</span> minutes</p> 
                <p className="note-text">(Data sourced from your backend's historical collection.)</p>
              </StatCard>

              {/* Top Artists (Historical) */}
              <StatCard
                title={`Top Artists (${selectedTimeframe === 'all_time' ? 'All Time' : `Last ${selectedTimeframe.replace('days', ' Days').replace('months', ' Months').replace('year', ' Year').replace('hrs', ' Hours')}`})`}
                loading={loadingTopArtists}
                emptyMessage="No top artists found for this period. Keep listening to populate!"
              >
                {console.log("Dashboard: Rendering Top Artists. historicalTopArtists:", historicalTopArtists)}
                {historicalTopArtists && historicalTopArtists.length > 0 ? (
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
                    <p className="stat-text">No top artists found since you connected to EchoStats. Keep listening to populate!</p>
                )}
              </StatCard>

              {/* Top Songs (Historical) */}
              <StatCard
                title={`Top Songs (${selectedTimeframe === 'all_time' ? 'All Time' : `Last ${selectedTimeframe.replace('days', ' Days').replace('months', ' Months').replace('year', ' Year').replace('hrs', ' Hours')}`})`}
                loading={loadingTopSongs}
                emptyMessage="No top songs found for this period. Keep listening to populate!"
              >
                {console.log("Dashboard: Rendering Top Songs. historicalTopSongs:", historicalTopSongs)}
                {historicalTopSongs && historicalTopSongs.length > 0 ? (
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
                    <p className="stat-text">No top songs found since you connected to EchoStats. Keep listening to populate!</p>
                )}
              </StatCard>

              {/* Top Albums (Historical) */}
              <StatCard
                title={`Top Albums (${selectedTimeframe === 'all_time' ? 'All Time' : `Last ${selectedTimeframe.replace('days', ' Days').replace('months', ' Months').replace('year', ' Year').replace('hrs', ' Hours')}`})`}
                loading={loadingTopAlbums}
                emptyMessage="No top albums found for this period. Keep listening to populate!"
              >
                {console.log("Dashboard: Rendering Top Albums. historicalTopAlbums:", historicalTopAlbums, "Type:", typeof historicalTopAlbums, "isArray:", Array.isArray(historicalTopAlbums))}
                {historicalTopAlbums && historicalTopAlbums.length > 0 ? (
                    <ul>
                        {/* EXTREMELY DEFENSIVE MAP:
                            - Check if historicalTopAlbums is an array and not null/undefined.
                            - Use nullish coalescing (?? []) to provide an empty array if it's ever null/undefined.
                            - Use optional chaining (?.) for nested properties to avoid errors.
                        */}
                        {(Array.isArray(historicalTopAlbums) ? historicalTopAlbums : []).map((album, index) => ( // CRUCIAL FIX HERE: Use index as fallback key
                            <li key={album?.id || index} className="list-item"> {/* Use optional chaining and index fallback */}
                                {album?.images?.[0]?.url && ( // Optional chaining
                                    <img src={album.images[0].url} alt={album.name} className="album-image" style={{ borderRadius: '5px' }} />
                                )}
                                <span>{album?.name || 'Unknown Album'} by {album?.artists?.map(a => a?.name)?.join(', ') || 'Unknown Artist'}</span> {/* Optional chaining and fallbacks */}
                                {album?.total_minutes_listened !== undefined && (
                                    <span className="list-item-detail"> ({album.total_minutes_listened} min)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="stat-text">No top albums found since you connected to EchoStats. Keep listening to populate!</p>
                )}
              </StatCard>

              {/* Genre Breakdown (Historical) */}
              <StatCard
                title={`Genre Breakdown (${selectedTimeframe === 'all_time' ? 'All Time' : `Last ${selectedTimeframe.replace('days', ' Days').replace('months', ' Months').replace('year', ' Year').replace('hrs', ' Hours')}`})`}
                loading={loadingGenreBreakdown}
                emptyMessage="No genre data found for this period. Keep listening to populate!"
              >
                {console.log("Dashboard: Inside Genre Breakdown StatCard. historicalGenreBreakdown BEFORE MAP:", historicalGenreBreakdown, "Type:", typeof historicalGenreBreakdown, "isArray:", Array.isArray(historicalGenreBreakdown))}
                {historicalGenreBreakdown && historicalGenreBreakdown.length > 0 ? (
                    <ul>
                        {historicalGenreBreakdown.map((genreItem, index) => (
                            <li key={genreItem.genre || index} className="stat-text" style={{ marginBottom: '5px' }}>
                                <span style={{ textTransform: 'capitalize' }}>{genreItem.genre.replace(/-/g, ' ')}</span>
                                {genreItem.total_minutes !== undefined && (
                                    <span className="list-item-detail"> ({genreItem.total_minutes} min)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="stat-text">No genre data found since you connected to EchoStats. Keep listening to populate!</p>
                )}
              </StatCard>
          </div>
      )}
    </div>
  );
}

export default Dashboard;