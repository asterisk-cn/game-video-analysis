import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { DataPoint } from '../types/SessionData';
import { formatTime } from '../utils/formatters';

interface DataVisualizerProps {
  dataPoints: DataPoint[];
  currentTime: number;
  onTimeClick?: (time: number) => void;
}

interface Variable {
  key: string;
  label: string;
  color: string;
}

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ff7300',
  '#387908',
  '#0088aa',
  '#a05195',
  '#d45087',
  '#f95d6a',
  '#ff7c43',
  '#ffa600',
  '#665191',
  '#2f4b7c',
];

// オブジェクトを再帰的に探索して数値プロパティを抽出
const extractNumericProperties = (obj: any, prefix: string = ''): Record<string, number> => {
  const result: Record<string, number> = {};

  for (const [key, value] of Object.entries(obj)) {
    // timestampは除外
    if (key === 'timestamp') continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'number') {
      result[fullKey] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // ネストされたオブジェクトを再帰的に処理
      const nested = extractNumericProperties(value, fullKey);
      Object.assign(result, nested);
    }
  }

  return result;
};

const DataVisualizer = ({
  dataPoints,
  currentTime,
  onTimeClick,
}: DataVisualizerProps) => {
  // JSONデータから利用可能な変数を抽出
  const availableVariables = useMemo((): Variable[] => {
    if (!dataPoints || dataPoints.length === 0) return [];

    const allKeys = new Set<string>();

    // すべてのデータポイントから数値型のキーを収集
    dataPoints.forEach(point => {
      const numericProps = extractNumericProperties(point);
      Object.keys(numericProps).forEach(key => allKeys.add(key));
    });

    // 変数リストを作成
    const variables: Variable[] = [];
    let colorIndex = 0;

    allKeys.forEach(key => {
      variables.push({
        key,
        label: key,
        color: COLORS[colorIndex++ % COLORS.length]
      });
    });

    return variables;
  }, [dataPoints]);

  // デフォルトで最初の2つの変数を選択
  const [selectedVariables, setSelectedVariables] = useState<string[]>(() => {
    return availableVariables.slice(0, 2).map(v => v.key);
  });

  // 現在地の表示・非表示
  const [showCurrentPosition, setShowCurrentPosition] = useState<boolean>(true);

  // 利用可能な変数が変わったら選択を更新
  useMemo(() => {
    if (availableVariables.length > 0 && selectedVariables.length === 0) {
      setSelectedVariables(availableVariables.slice(0, 2).map(v => v.key));
    }
  }, [availableVariables]);

  // チャート用データの準備
  const chartData = useMemo(() => {
    return dataPoints.map((point) => {
      const data: any = {
        timestamp: point.timestamp,
        formattedTime: formatTime(point.timestamp),
      };

      // すべての数値プロパティを抽出してフラットに追加
      const numericProps = extractNumericProperties(point);
      Object.assign(data, numericProps);

      return data;
    });
  }, [dataPoints]);

  const handleChartClick = (e: any) => {
    // チャート上のクリック位置からtimestampを取得
    if (e && e.activeLabel !== undefined && onTimeClick) {
      onTimeClick(Number(e.activeLabel));
    }
  };

  const toggleVariable = (key: string) => {
    setSelectedVariables((prev) => {
      if (prev.includes(key)) {
        // 最低1つは選択状態を維持
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  if (availableVariables.length === 0) {
    return (
      <div className="data-visualizer">
        <p>表示可能なデータがありません</p>
      </div>
    );
  }

  return (
    <div className="data-visualizer">
      <div className="visualizer-layout">
        <div className="variable-selector-panel">
          <label className="selector-label">表示する変数:</label>
          <div className="variable-list">
            {availableVariables.map((variable) => (
              <button
                key={variable.key}
                className={`variable-button ${selectedVariables.includes(variable.key) ? 'active' : ''}`}
                onClick={() => toggleVariable(variable.key)}
                style={{
                  borderColor: selectedVariables.includes(variable.key) ? variable.color : '#ccc',
                }}
              >
                {variable.label}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-area">
          <div className="chart-controls">
            <div className="position-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={showCurrentPosition}
                  onChange={(e) => setShowCurrentPosition(e.target.checked)}
                />
                現在地を表示
              </label>
            </div>
          </div>

          <div className="chart-section">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            onClick={handleChartClick}
            margin={{ bottom: 30 }}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatTime}
              label={{ value: '時間', position: 'insideBottom', offset: -20 }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => formatTime(Number(value))}
              isAnimationActive={false}
            />
            <Legend verticalAlign="top" height={36} />
            {showCurrentPosition && (
              <ReferenceLine
                x={currentTime}
                stroke="#ff0000"
                strokeWidth={3}
                strokeDasharray="5 5"
                label={{ value: '現在地', position: 'top', fill: '#ff0000' }}
                ifOverflow="extendDomain"
              />
            )}
            {selectedVariables.map((varKey) => {
              const variable = availableVariables.find((v) => v.key === varKey);
              if (!variable) return null;
              return (
                <Line
                  key={varKey}
                  type="monotone"
                  dataKey={varKey}
                  stroke={variable.color}
                  name={variable.label}
                  dot={false}
                  activeDot={{ r: 5, fill: variable.color }}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizer;
