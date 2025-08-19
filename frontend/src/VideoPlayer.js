import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

const VideoPlayer = () => {
  const [overlays, setOverlays] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const isMounted = useRef(true);  // Use useRef to track component mount status

  // Fetch overlays from the backend
  useEffect(() => {
    isMounted.current = true;  // Mark as mounted on effect

    fetch('http://127.0.0.1:5000/api/overlays')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && isMounted.current) {  // Check if still mounted
          setOverlays(data);
        }
      })
      .catch(error => console.error('Error fetching overlays:', error));

    // Video player setup
    const video = document.getElementById('video');
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource('http://127.0.0.1:5000/hls/stream.m3u8');
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = 'http://127.0.0.1:5000/hls/stream.m3u8';
    }

    // Cleanup function when component unmounts
    return () => {
      isMounted.current = false;  // Mark as unmounted on cleanup
    };
  }, []);  // Empty dependency array ensures this effect runs only once

  // Handle play/pause of the video
  const handlePlayPause = () => {
    const video = document.getElementById('video');
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((error) => {
        console.error("Error trying to play the video:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Handle creating a new overlay
  const handleCreateOverlay = () => {
    const newOverlay = {
      text: overlayText,
      position: { top: 50, left: 50 },
    };

    fetch('http://127.0.0.1:5000/api/overlays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOverlay),
    })
      .then(response => response.json())
      .then(() => {
        setOverlays([...overlays, newOverlay]);
        setOverlayText("");  // Clear the input field
      })
      .catch(error => console.error('Error creating overlay:', error));
  };

  // Handle editing an overlay
  const handleEditOverlay = (overlayId) => {
    const updatedOverlay = {
      text: prompt("Enter new text for overlay:"),
      position: { top: 100, left: 100 },
    };

    fetch(`http://127.0.0.1:5000/api/overlays/${overlayId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedOverlay),
    })
      .then(response => response.json())
      .then(() => {
        setOverlays(prevOverlays => prevOverlays.map(overlay => 
          overlay._id === overlayId ? { ...overlay, ...updatedOverlay } : overlay
        ));
      })
      .catch(error => console.error('Error editing overlay:', error));
  };

  // Handle deleting an overlay
  const handleDeleteOverlay = (overlayId) => {
    fetch(`http://127.0.0.1:5000/api/overlays/${overlayId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(() => {
        setOverlays(overlays.filter(overlay => overlay._id !== overlayId));
      })
      .catch(error => console.error('Error deleting overlay:', error));
  };

  // Render overlays on video
  const renderOverlays = () => {
    return overlays.map((overlay) => (
      <div key={overlay._id} className="overlay" style={{
        position: 'absolute',
        top: overlay.position?.top || '50px',
        left: overlay.position?.left || '50px',
        zIndex: 999
      }}>
        {overlay.text}
        <div className="resize-handle"></div>
        <button onClick={() => handleDeleteOverlay(overlay._id)}>Delete</button>
        <button onClick={() => handleEditOverlay(overlay._id)}>Edit</button>
      </div>
    ));
  };

  return (
    <div className="video-player-container">
      <h1>Livestream</h1>
      <video id="video" controls width="800" className="video-element">
        Your browser does not support the video tag.
      </video>
      
      <div className="control-buttons">
        <button onClick={handlePlayPause} className="play-pause-button">
          {isPlaying ? 'Pause' : 'Play'} Video
        </button>
      </div>

      <div className="overlay-input">
        <input 
          type="text" 
          value={overlayText} 
          onChange={(e) => setOverlayText(e.target.value)} 
          placeholder="Enter overlay text"
          className="overlay-text-input"
        />
        <button onClick={handleCreateOverlay} className="add-overlay-button">
          Add Overlay
        </button>
      </div>

      <div className="overlays-container">
        {renderOverlays()}
      </div>
    </div>
  );
};

export default VideoPlayer;
