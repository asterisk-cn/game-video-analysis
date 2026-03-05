# ゲームプレイデータ可視化Webアプリ

Unityゲームのプレイデータと動画を同期して可視化するReact + TypeScriptアプリケーション

## 機能

- **動画再生**: ゲームプレイ動画の再生
- **データ同期**: 動画の再生時刻に応じたパラメータ表示
- **リアルタイム可視化**: スコア、体力、位置情報のグラフ表示
- **インタラクティブ操作**: グラフをクリックして該当時刻にジャンプ
- **GZIP対応**: 圧縮データファイルの自動解凍

## 技術スタック

- **React 18** - UIフレームワーク
- **TypeScript** - 型安全な開発
- **Vite** - 高速ビルドツール
- **Recharts** - グラフ描画ライブラリ
- **pako** - GZIP圧縮・解凍ライブラリ

## セットアップ

### 1. 依存パッケージのインストール

```bash
pnpm install
```

### 2. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで `http://localhost:5173` にアクセスします。

### 3. ビルド

```bash
pnpm build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

### 4. プレビュー

```bash
pnpm preview
```

## 使用方法

1. **動画ファイルを選択**
   - 対応形式: MP4, WebM, OGG など（ブラウザがサポートする動画形式）

2. **データファイルを選択**
   - 対応形式: `.json` または `.json.gz`
   - Unityアセットから出力されたセッションデータ

3. **再生と分析**
   - 動画を再生すると、現在時刻のパラメータが自動更新されます
   - グラフをクリックすると、その時刻に動画がジャンプします
   - 赤い縦線が現在の再生位置を示します

## データ形式

アプリケーションは以下の形式のJSONデータを期待します：

```json
{
  "sessionInfo": {
    "sessionId": "uuid",
    "gameTitle": "ゲーム名",
    "startTime": "ISO8601形式",
    "endTime": "ISO8601形式",
    "playerAttributes": {},
    "gameSettings": {}
  },
  "dataPoints": [
    {
      "timestamp": 0.0,
      "score": 0,
      "health": 100.0,
      "position": {"x": 0.0, "y": 0.0, "z": 0.0},
      "customParameters": {}
    }
  ]
}
```

## プロジェクト構成

```
web-app/
├── src/
│   ├── components/
│   │   ├── FileUploader.tsx          # ファイルアップロードUI
│   │   ├── SessionInfoPanel.tsx      # セッション情報表示
│   │   ├── VideoPlayer.tsx           # 動画プレイヤー
│   │   └── DataVisualizer.tsx        # データ可視化（グラフ）
│   ├── types/
│   │   └── SessionData.ts            # データ型定義
│   ├── utils/
│   │   ├── dataLoader.ts             # データ読み込み
│   │   └── formatters.ts             # フォーマット関数
│   ├── App.tsx                       # メインアプリケーション
│   ├── App.css                       # スタイル
│   ├── main.tsx                      # エントリーポイント
│   └── index.css                     # グローバルスタイル
├── public/
├── index.html
├── package.json
└── tsconfig.json
```

## カスタマイズ

### グラフの追加

`DataVisualizer.tsx` を編集して、カスタムパラメータのグラフを追加できます：

```tsx
<Line
  type="monotone"
  dataKey="customParameters.yourParameter"
  stroke="#ff0000"
  name="カスタムパラメータ"
/>
```

### スタイルのカスタマイズ

`App.css` を編集して、アプリケーションの外観を変更できます。

## デプロイ

### 静的ホスティング

```bash
pnpm build
```

`dist/` ディレクトリの内容を静的ホスティングサービス（Netlify, Vercel, GitHub Pages など）にデプロイします。

### Dockerでのデプロイ

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## トラブルシューティング

### データが読み込まれない

- ファイル形式が正しいか確認してください（.json または .json.gz）
- JSONの構造が正しいか確認してください
- ブラウザのコンソールでエラーメッセージを確認してください

### 動画が再生されない

- ブラウザがサポートする動画形式か確認してください
- ファイルサイズが大きすぎないか確認してください

### グラフが表示されない

- データポイントが存在するか確認してください
- タイムスタンプが正しい形式（数値）か確認してください

## ライセンス

研究・学術目的での利用を想定しています。
