import React from "react";
import "./MusicSelector.css";

const MusicSelector = ({ musicPresets, selectedVideoId, onSelect }) => {
  const handleChange = (e) => {
    onSelect(e.target.value);
  };

  return (
    <div className="music-selector-container">
      <label htmlFor="music-select">배경 음악 추천</label>
      <select
        id="music-select"
        value={selectedVideoId}
        onChange={handleChange}
        className="music-select"
      >
        {musicPresets.map((music) => (
          <option
            key={music.videoId || "no-music"}
            value={music.videoId || "null"}
          >
            {music.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MusicSelector;
