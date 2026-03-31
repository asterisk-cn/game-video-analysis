/**
 * Vector3データ型
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * データポイント
 */
export interface DataPoint {
  timestamp: number;
  value: Record<string, any>;
  event?: Record<string, any> | null;
}

/**
 * セッション情報
 */
export interface SessionInfo {
  sessionId: string;
  gameTitle: string;
  startTime: string;
  endTime: string;
  playerAttributes?: Record<string, any>;
  gameSettings?: Record<string, any>;
}

/**
 * セッションデータ全体
 */
export interface SessionData {
  sessionInfo: SessionInfo;
  dataPoints: DataPoint[];
}

/**
 * チャートデータポイント（表示用）
 */
export interface ChartDataPoint extends DataPoint {
  formattedTime: string;
}
