# ゲームプレイデータ分析システム

Unityゲームのプレイデータと動画を統合して分析・可視化するシステム

## 概要

本システムは、Unityで開発されたゲームから出力されるプレイデータを研究利用可能な形式に編集・変換し、動画と同期して可視化するためのツールセットです。

### 主な機能

- **Unityアセット**: ゲームプレイ中のパラメータを定期的に記録し、JSON形式で圧縮出力
- **Webアプリケーション**: 動画とデータを同期再生し、パラメータの時系列変化を可視化

## システム構成

```
game-video-analysis/
├── unity-asset/          # Unityデータ収集アセット
├── web-app/             # Webベース可視化アプリ
└── sample-data/         # サンプルデータ
```

## 使用方法

### 1. Unityアセットの導入

`unity-asset/Scripts/` 内のC#スクリプトをUnityプロジェクトにインポートし、GameDataRecorderコンポーネントをシーンに追加します。

詳細は [unity-asset/README.md](unity-asset/README.md) を参照してください。

### 2. データ収集

ゲームプレイ中、設定した間隔でパラメータが自動記録され、セッション終了時にJSON形式で出力されます。

### 3. Webアプリでの分析

#### セットアップ

```bash
cd web-app
pnpm install
pnpm dev
```

ブラウザで `http://localhost:5173` にアクセスします。

詳細は [web-app/README.md](web-app/README.md) を参照してください。

#### 使用手順

1. 動画ファイルをアップロード
2. データファイル (.json または .json.gz) をアップロード
3. 動画再生と同期してパラメータの遷移を確認

### 4. サンプルデータでのテスト

`sample-data/sample-session.json` を使用して、動画なしでもデータの可視化をテストできます。
