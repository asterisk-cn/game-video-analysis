import { useState } from 'react';

interface SessionInfoPanelProps {
  sessionInfo: any;
  totalDataPoints: number;
}

// 値を表示用にフォーマット
const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

// オブジェクトをフラット化してキーと値のペアを抽出（1レベルのみ）
const flattenObject = (obj: any): Array<{ key: string; value: any }> => {
  const result: Array<{ key: string; value: any }> = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // ネストされたオブジェクトを再帰的に処理
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        result.push({ key: nestedKey, value: nestedValue });
      }
    } else {
      // プリミティブ値または配列
      result.push({ key, value });
    }
  }

  return result;
};

// セクションごとにグループ化
const groupBySection = (obj: any): Array<{ title: string; items: Array<{ key: string; value: any }> }> => {
  const sections: Array<{ title: string; items: Array<{ key: string; value: any }> }> = [];

  for (const [sectionKey, sectionValue] of Object.entries(obj)) {
    if (sectionValue && typeof sectionValue === 'object' && !Array.isArray(sectionValue)) {
      // オブジェクトの場合はセクションとして扱う
      const items = flattenObject({ [sectionKey]: sectionValue });
      sections.push({ title: sectionKey, items });
    } else {
      // プリミティブ値の場合は単独のアイテムとして扱う
      sections.push({ title: sectionKey, items: [{ key: sectionKey, value: sectionValue }] });
    }
  }

  return sections;
};

const SessionInfoPanel = ({ sessionInfo, totalDataPoints }: SessionInfoPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const sections = groupBySection(sessionInfo);

  return (
    <div className="session-info-panel">
      <div className="session-info-header" onClick={() => setIsOpen(!isOpen)}>
        <button className={`toggle-button ${isOpen ? 'open' : ''}`}>
          <span className="arrow-icon"></span>
        </button>
        <h2>セッション情報</h2>
      </div>

      {isOpen && (
        <>
          {sections.map((section) => (
            <div key={section.title} className="info-section">
              <h3>{section.title}</h3>
              <div className="info-grid">
                {section.items.map(({ key, value }) => (
                  <div key={key} className="info-item">
                    <span className="info-label">{key}:</span>
                    <span className="info-value">{formatValue(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="info-section">
            <h3>データ統計</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">データポイント数:</span>
                <span className="info-value">{totalDataPoints.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SessionInfoPanel;
