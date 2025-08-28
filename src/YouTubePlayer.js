import React, { useState, useRef } from "react";
import YouTube from "react-youtube";
import "./YouTubePlayer.css";

const YouTubePlayer = ({ videoId, videoTitle }) => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true); // autoplay가 켜져 있으므로 초기값은 true

  const opts = {
    // height, width는 wrapper에서 0으로 설정하여 동영상을 숨깁니다.
    playerVars: {
      autoplay: 1, // 1로 설정하면 자동 재생
      controls: 0, // 컨트롤러 숨김
      rel: 0, // 관련 동영상 표시 안함
      modestbranding: 1, // YouTube 로고 최소화
      fs: 0, // 전체화면 버튼 비활성화
    },
  };

  const onReady = (event) => {
    playerRef.current = event.target;
  };

  const onStateChange = (event) => {
    // event.data: 1 = 재생, 2 = 일시정지, 0 = 종료
    if (event.data === 1) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;

    // isPlaying 상태를 직접 사용하는 대신, 플레이어의 실제 상태를 확인하는 것이 더 안정적입니다.
    const playerState = playerRef.current.getPlayerState();
    if (playerState === 1) {
      // 1: playing
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // videoId가 없으면(null) 플레이어를 렌더링하지 않음
  if (!videoId) {
    return null;
  }

  return (
    <div className="audio-player-container">
      <div className="music-info">
        <span className="music-title" title={videoTitle}>
          {videoTitle}
        </span>
      </div>
      <button
        onClick={togglePlay}
        className="play-pause-button"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "❚❚" : "▶"}
      </button>
      {/* 실제 유튜브 플레이어는 보이지 않게 처리 */}
      <div className="youtube-iframe-wrapper">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
        />
      </div>
    </div>
  );
};
export default YouTubePlayer;
