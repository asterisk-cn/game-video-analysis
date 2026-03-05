import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
}

const VideoPlayer = ({
  videoUrl,
  currentTime,
  onTimeUpdate,
  onDurationChange,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      onDurationChange(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onTimeUpdate, onDurationChange]);

  // 外部からの時間変更を反映
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // グラフクリックなどで外部から時間が変更された場合に反映
    if (Math.abs(video.currentTime - currentTime) > 0.1) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        style={{ width: '100%', maxHeight: '500px', backgroundColor: '#000' }}
      />
    </div>
  );
};

export default VideoPlayer;
