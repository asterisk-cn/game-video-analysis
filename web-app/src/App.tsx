import { useState } from 'react';
import FileUploader from './components/FileUploader';
import SessionInfoPanel from './components/SessionInfoPanel';
import VideoPlayer from './components/VideoPlayer';
import DataVisualizer from './components/DataVisualizer';
import type { SessionData } from './types/SessionData';
import { loadDataFile, loadVideoFile } from './utils/dataLoader';
import './App.css';

function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [_videoDuration, setVideoDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    const url = loadVideoFile(file);
    setVideoUrl(url);
    setError(null);
  };

  const handleDataSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadDataFile(file);
      setDataFile(file);
      setSessionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました。');
      setSessionData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleDurationChange = (duration: number) => {
    setVideoDuration(duration);
  };

  const handleTimeClick = (time: number) => {
    setCurrentTime(time);
  };

  const isReady = videoUrl && sessionData;

  return (
    <div className="app">
      <header className="app-header">
        <h1>ゲームプレイデータ分析</h1>
      </header>

      <main className="app-main">
        {!isReady && (
          <FileUploader
            onVideoSelect={handleVideoSelect}
            onDataSelect={handleDataSelect}
            hasVideo={!!videoFile}
            hasData={!!dataFile}
          />
        )}

        {error && (
          <div className="error-message">
            <strong>エラー:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            データを読み込んでいます...
          </div>
        )}

        {isReady && (
          <>
            <div className="main-content">
              <div className="video-section">
                <VideoPlayer
                  videoUrl={videoUrl}
                  currentTime={currentTime}
                  onTimeUpdate={handleTimeUpdate}
                  onDurationChange={handleDurationChange}
                />
              </div>

              <DataVisualizer
                dataPoints={sessionData.dataPoints}
                currentTime={currentTime}
                onTimeClick={handleTimeClick}
              />
            </div>

            <SessionInfoPanel
              sessionInfo={sessionData.sessionInfo}
              totalDataPoints={sessionData.dataPoints.length}
            />
          </>
        )}

        {!isReady && !loading && !error && (
          <div className="welcome-message">
            <h2>開始方法</h2>
            <ol>
              <li>動画ファイルを選択してください</li>
              <li>データファイル (.json または .json.gz) を選択してください</li>
              <li>動画とデータが同期して表示されます</li>
            </ol>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
