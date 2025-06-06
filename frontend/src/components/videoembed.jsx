import React from "react";
import './styles.css';

const VideoEmbed = () => {
  return (
    <>
      <div className="awareness-campaign">
        <h2>Awareness Campaign</h2>
      </div>
  
      <div className="video-container">
      <iframe width="560" height="315" src="https://www.youtube.com/embed/zq7ec6Mo530?si=CS1-vHMcXf5rvvDv" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
    </>
  );
};

export default VideoEmbed;
