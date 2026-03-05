import pako from 'pako';
import type { SessionData } from '../types/SessionData';

/**
 * JSONファイルを読み込む
 */
export const loadJsonFile = async (file: File): Promise<SessionData> => {
  const text = await file.text();
  return JSON.parse(text);
};

/**
 * GZIP圧縮されたJSONファイルを読み込む
 */
export const loadGzipFile = async (file: File): Promise<SessionData> => {
  const arrayBuffer = await file.arrayBuffer();
  const compressed = new Uint8Array(arrayBuffer);
  const decompressed = pako.ungzip(compressed);
  const text = new TextDecoder('utf-8').decode(decompressed);
  return JSON.parse(text);
};

/**
 * ファイルの拡張子に応じて適切なローダーを選択
 */
export const loadDataFile = async (file: File): Promise<SessionData> => {
  if (file.name.endsWith('.gz')) {
    return loadGzipFile(file);
  } else if (file.name.endsWith('.json')) {
    return loadJsonFile(file);
  } else {
    throw new Error('サポートされていないファイル形式です。.json または .json.gz ファイルを選択してください。');
  }
};

/**
 * 動画ファイルをBlobURLとして読み込む
 */
export const loadVideoFile = (file: File): string => {
  return URL.createObjectURL(file);
};
