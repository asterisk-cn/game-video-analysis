import { useRef } from 'react';

interface FileUploaderProps {
  onVideoSelect: (file: File) => void;
  onDataSelect: (file: File) => void;
  hasVideo: boolean;
  hasData: boolean;
}

const FileUploader = ({
  onVideoSelect,
  onDataSelect,
  hasVideo,
  hasData,
}: FileUploaderProps) => {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const dataInputRef = useRef<HTMLInputElement>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoSelect(file);
    }
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onDataSelect(file);
    }
  };

  return (
    <div className="file-uploader">
      <h2>ファイル選択</h2>
      <div className="upload-section">
        <div className="upload-item">
          <label htmlFor="video-upload">
            <span className={`upload-label ${hasVideo ? 'uploaded' : ''}`}>
              {hasVideo ? '✓ 動画ファイル' : '動画ファイル'}
            </span>
          </label>
          <input
            ref={videoInputRef}
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => videoInputRef.current?.click()}
            className="upload-button"
          >
            {hasVideo ? '変更' : '選択'}
          </button>
        </div>

        <div className="upload-item">
          <label htmlFor="data-upload">
            <span className={`upload-label ${hasData ? 'uploaded' : ''}`}>
              {hasData ? '✓ データファイル' : 'データファイル (.json / .json.gz)'}
            </span>
          </label>
          <input
            ref={dataInputRef}
            id="data-upload"
            type="file"
            accept=".json,.gz"
            onChange={handleDataChange}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => dataInputRef.current?.click()}
            className="upload-button"
          >
            {hasData ? '変更' : '選択'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
