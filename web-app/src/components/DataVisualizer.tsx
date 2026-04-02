import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
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

// valueオブジェクト内の数値プロパティを抽出
const extractNumericPropertiesFromValue = (obj: any): Record<string, number> => {
  const result: Record<string, number> = {};

  // valueオブジェクトが存在する場合のみ処理
  if (!obj.value || typeof obj.value !== 'object') {
    return result;
  }

  for (const [key, value] of Object.entries(obj.value)) {
    if (typeof value === 'number') {
      result[key] = value;
    }
  }

  return result;
};

const DataVisualizer = ({
  dataPoints,
  currentTime,
  onTimeClick,
}: DataVisualizerProps) => {
  // JSONデータから利用可能な変数を抽出（value以下のみ）
  const availableVariables = useMemo((): Variable[] => {
    if (!dataPoints || dataPoints.length === 0) return [];

    const allKeys = new Set<string>();

    // すべてのデータポイントのvalueオブジェクトから数値型のキーを収集
    dataPoints.forEach(point => {
      const numericProps = extractNumericPropertiesFromValue(point);
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

  // JSONデータから利用可能なイベントを抽出
  const availableEvents = useMemo((): string[] => {
    if (!dataPoints || dataPoints.length === 0) return [];

    const allEvents = new Set<string>();

    dataPoints.forEach(point => {
      if (point.event && typeof point.event === 'object' && point.event !== null) {
        Object.keys(point.event).forEach(key => allEvents.add(key));
      }
    });

    return Array.from(allEvents).sort();
  }, [dataPoints]);

  // デフォルトで最初の2つの変数を選択
  const [selectedVariables, setSelectedVariables] = useState<string[]>(() => {
    return availableVariables.slice(0, 2).map(v => v.key);
  });

  // デフォルトで全てのイベントを選択
  const [selectedEvents, setSelectedEvents] = useState<string[]>(() => {
    return availableEvents;
  });

  // 現在地の表示・非表示
  const [showCurrentPosition, setShowCurrentPosition] = useState<boolean>(true);

  // 利用可能な変数が変わったら選択を更新
  useMemo(() => {
    if (availableVariables.length > 0 && selectedVariables.length === 0) {
      setSelectedVariables(availableVariables.slice(0, 2).map(v => v.key));
    }
  }, [availableVariables]);

  // 利用可能なイベントが変わったら選択を更新
  useMemo(() => {
    if (availableEvents.length > 0) {
      setSelectedEvents(availableEvents);
    }
  }, [availableEvents]);

  // チャート用データの準備
  const chartData = useMemo(() => {
    return dataPoints.map((point) => {
      const data: any = {
        timestamp: point.timestamp,
        formattedTime: formatTime(point.timestamp),
      };

      // valueオブジェクト内の数値プロパティを抽出
      const numericProps = extractNumericPropertiesFromValue(point);
      Object.assign(data, numericProps);

      return data;
    });
  }, [dataPoints]);

  // チャートデータにイベントマーカーを追加
  const chartDataWithEvents = useMemo(() => {
    // 選択されている変数の最大値を計算
    let maxValue = -Infinity;
    chartData.forEach((point) => {
      selectedVariables.forEach((varKey) => {
        if (point[varKey] !== undefined) {
          if (point[varKey] > maxValue) maxValue = point[varKey];
        }
      });
    });

    // 最大値の10%上に配置
    const eventYPosition = maxValue * 1.1;

    const data = chartData.map((point) => {
      const eventPoint = dataPoints.find(dp => dp.timestamp === point.timestamp);

      // eventがオブジェクトの場合、選択されているイベントキーが含まれているかチェック
      let hasEvent = false;
      let eventData = null;

      if (eventPoint?.event && typeof eventPoint.event === 'object' && eventPoint.event !== null) {
        const eventKeys = Object.keys(eventPoint.event);
        const matchedKey = eventKeys.find(key => selectedEvents.includes(key));
        if (matchedKey) {
          hasEvent = true;
          eventData = { [matchedKey]: eventPoint.event[matchedKey] };
        }
      }

      return {
        ...point,
        hasEvent,
        eventData,
        eventY: hasEvent ? eventYPosition : null
      };
    });

    return data;
  }, [chartData, dataPoints, selectedVariables, selectedEvents]);

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

  const toggleEvent = (eventName: string) => {
    setSelectedEvents((prev) => {
      if (prev.includes(eventName)) {
        return prev.filter((e) => e !== eventName);
      } else {
        return [...prev, eventName];
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

          {availableEvents.length > 0 && (
            <>
              <label className="selector-label" style={{ marginTop: '1.5rem' }}>表示するイベント:</label>
              <div className="variable-list">
                {availableEvents.map((eventName) => (
                  <button
                    key={eventName}
                    className={`variable-button ${selectedEvents.includes(eventName) ? 'active' : ''}`}
                    onClick={() => toggleEvent(eventName)}
                    style={{
                      borderColor: selectedEvents.includes(eventName) ? '#ff6b6b' : '#ccc',
                    }}
                  >
                    {eventName}
                  </button>
                ))}
              </div>
            </>
          )}
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
        <ResponsiveContainer width="100%" height={450}>
          <ComposedChart
            data={chartDataWithEvents}
            onClick={handleChartClick}
            margin={{ top: 20, bottom: 30 }}
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
            <YAxis
              tickLine={false}
              tick={(props: any) => {
                const { x, y, payload, visibleTicksCount, index } = props;
                // 最上部のtickは非表示
                if (index === visibleTicksCount - 1) {
                  return null;
                }
                return (
                  <text x={x} y={y} dy={4} textAnchor="end" fill="#666" fontSize={12}>
                    {payload.value}
                  </text>
                );
              }}
            />
            <Tooltip
              labelFormatter={(value) => formatTime(Number(value))}
              formatter={(value: any, name: string | undefined) => {
                // eventYは非表示
                if (name === 'イベント') {
                  return null;
                }
                return [value, name];
              }}
              content={(props: any) => {
                if (!props.active || !props.payload || props.payload.length === 0) {
                  return null;
                }
                const data = props.payload[0].payload;
                return (
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    padding: '8px 12px',
                    borderRadius: '4px'
                  }}>
                    <p style={{ margin: 0, marginBottom: '4px', fontWeight: 500 }}>
                      {formatTime(data.timestamp)}
                    </p>
                    {selectedVariables.map((varKey) => (
                      <p key={varKey} style={{ margin: 0, fontSize: '14px' }}>
                        <span style={{ color: availableVariables.find(v => v.key === varKey)?.color }}>
                          {varKey}:
                        </span>{' '}
                        {data[varKey]}
                      </p>
                    ))}
                    {data.hasEvent && data.eventData && (
                      <>
                        {Object.entries(data.eventData).map(([key, value]) => (
                          <p key={key} style={{ margin: 0, marginTop: '4px', fontSize: '14px', color: '#ff6b6b', fontWeight: 500 }}>
                            {key}: {String(value)}
                          </p>
                        ))}
                      </>
                    )}
                  </div>
                );
              }}
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
            {selectedEvents.length > 0 && (
              <Scatter
                name="イベント"
                dataKey="eventY"
                fill="#ff6b6b"
                shape={(props: any) => {
                  if (!props.payload.hasEvent) return null;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill="#ff6b6b"
                      stroke="white"
                      strokeWidth={1.5}
                    />
                  );
                }}
                legendType="circle"
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizer;
