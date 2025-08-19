import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';  // Import the CSS file to apply styles globally

import VideoPlayer from './VideoPlayer';  // Import the VideoPlayer component

ReactDOM.render(
  <React.StrictMode>
    <VideoPlayer />  {/* Use the VideoPlayer component to display the livestream */}
  </React.StrictMode>,
  document.getElementById('root')
);
