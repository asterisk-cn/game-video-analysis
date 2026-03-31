# Unity データ収集アセット

ゲームプレイ中のパラメータを定期的に記録し、JSON形式で圧縮出力するUnityアセット

## インストール

1. `Scripts/` フォルダ内のすべての `.cs` ファイルをUnityプロジェクトの `Assets/` 以下にコピー
2. 空のGameObjectを作成し、`DataRecorder` コンポーネントを追加

## 基本的な使用方法

### 1. GameDataRecorderの設定

```csharp
using System.Collections.Generic;
using GameDataAnalysis;
using UnityEngine;

public class RecorderManager : MonoBehaviour
{
    public string gameTitle = "MyGame;
    public string sessionId = System.Guid.NewGuid().ToString();
    public int age = 25;
    public string skillLevel = "intermediate";
    public string difficulty = "normal";
    public bool soundEnabled = true;

    DataRecorder dataRecorder;

    void Start()
    {
        dataRecorder = DataRecorder.Instance;
        if (dataRecorder == null)
        {
            Debug.LogError("DataRecorder not found");
            return;
        }

        // value取得メソッドを登録
        dataRecorder.GetValue = () => new Dictionary<string, object>
        {
            { "score", ScoreManager.score },
            { "level", LevelManager.level },
        };

        // sessionInfoに任意のセクションを追加
        dataRecorder.SetSessionInfo("generalInfo", "gameTitle", gameTitle);
        dataRecorder.SetSessionInfo("generalInfo", "sessionId", sessionId);

        dataRecorder.SetSessionInfo("playerAttributes", "age", age);
        dataRecorder.SetSessionInfo("playerAttributes", "skillLevel", skillLevel);

        dataRecorder.SetSessionInfo("gameSettings", "difficulty", difficulty);
        dataRecorder.SetSessionInfo("gameSettings", "soundEnabled", soundEnabled);
    }
}

```

### 2. イベントの記録

```csharp
// RecorderManager.cs
void OnItemCollected(string itemName)
{
    dataRecorder.RecordEvent("itemCollected", itemName);
}
```

### 3. 動的なパラメータの追加

```csharp
// RecorderManager.cs
void Update()
{
    // 基本パラメータはGetValueで取得されるが、
    // 追加のパラメータを後から追加することも可能
    if (hasPowerUp)
    {
        dataRecorder.AddValueParameter("powerUpActive", true);
        dataRecorder.AddValueParameter("powerUpType", currentPowerUp);
    }
}
```

### 4. 手動での記録停止・保存

```csharp
// RecorderManager.cs
void OnGameEnd()
{
    dataRecorder.StopRecording();
    // autoSaveがtrueの場合、自動的に保存される
}

// 手動で保存する場合
void Save()
{
    string savedPath = dataRecorder.SaveData();
    Debug.Log($"Data saved to: {savedPath}");
}
```

## Inspector設定

### Settings

- **Record Interval**: データ記録間隔（秒）、デフォルト: 0.1秒
- **Auto Save**: アプリケーション終了時の自動保存
- **Output Directory**: 出力ディレクトリ名

### Unity Recorder

- **Enable Unity Movie Recorder**: 動画録画を有効化
- **Unity Movie Frame Rate**: 動画のフレームレート
- **Unity Movie Width**: 動画の幅
- **Unity Movie Height**: 動画の高さ
- **Unity Movie Capture Audio**: 動画にゲーム音声を含める

## 出力ファイル

データはプロジェクトのディレクトリに保存されます：

- `{GameTitle}_{SessionID}_{Timestamp}.json` - 非圧縮JSON
- `{GameTitle}_{SessionID}_{Timestamp}.json.gz` - GZIP圧縮JSON

## データ形式

```json
{
  "sessionInfo": {
    "generalInfo": {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "gameTitle": "MyGame",
      "startTime": "2025-01-15T10:30:00.000Z",
      "endTime": "2025-01-15T10:45:00.000Z"
    },
    "playerAttributes": {
      "age": 25,
      "skillLevel": "intermediate"
    },
    "gameSettings": {
      "difficulty": "normal",
      "soundEnabled": true
    }
  },
  "dataPoints": [
    {
      "timestamp": 0.0,
      "value": {
        "score": 0,
        "health": 100.0,
        "position": {"x": 0.0, "y": 0.0, "z": 0.0}
      },
      "event": {
        "gameStart": "level1"
      }
    },
    {
      "timestamp": 1.0,
      "value": {
        "score": 10,
        "health": 100.0
      },
      "event": null
    },
    {
      "timestamp": 5.0,
      "value": {
        "score": 100,
        "health": 80.0
      },
      "event": {
        "itemCollected": "item1"
      }
    }
  ]
}
```

### 構造の詳細

- **sessionInfo**: セッションのメタデータ（セクションごとにグループ化）
- **dataPoints**: タイムスタンプごとのデータポイント配列
  - **timestamp**: 秒単位の経過時間
  - **value**: 数値パラメータを含むオブジェクト（score, health, positionなど）
  - **event**: イベント情報（オブジェクト形式、またはnull）
    - キーと値のペアでイベントを記録
    - 例: `{"itemCollected": "item1"}`, `{"enemyDefeated": "boss1"}`

## 動画録画との連携

Unity Recorderアセットなどを使用して動画を録画する場合、セッションIDをファイル名に含めることで、データと動画の紐付けが容易になります。

```csharp
// Unity Recorder との連携例
void StartRecordingWithVideo()
{
    string sessionId = dataRecorder.sessionData.sessionInfo.sessionId;
    // Unity Recorderのファイル名にsessionIdを設定
    recorderController.Settings.OutputFile = $"Video_{sessionId}";
}
```

## 拡張性

- `value` オブジェクトに任意の数値パラメータを追加可能
- `event` オブジェクトでゲーム内イベントを柔軟に記録
- `GetValue` デリゲートを通じて任意のデータソースと連携可能
- `sessionInfo` に任意の階層構造を追加可能（セクション名やキーは完全に自由）
- ゲームタイトルごとに異なるパラメータセットに対応

### カスタムセクションの追加

`sessionInfo`には任意のセクションを追加できます：

```csharp
// 個別の値を設定
dataRecorder.SetSessionInfo("customSection", "key1", "value1");
dataRecorder.SetSessionInfo("customSection", "key2", 123);

// セクション全体を設定
var mySection = new Dictionary<string, object>
{
    { "param1", "value1" },
    { "param2", 42 }
};
dataRecorder.SetSessionInfoSection("myCustomSection", mySection);
```

### DataRecorderの呼び出し

DataRecorderはSingletonであるため、`DataRecorder.Instance`から呼び出すことができます。

```csharp
DataRecorder.Instance.RecordEvent("eventKey", "eventValue");
```
