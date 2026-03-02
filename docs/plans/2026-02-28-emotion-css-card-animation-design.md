# Design: @emotion/css 導入 + カードフェードインアニメーション

## 概要

- `game.css` を廃止し、`@emotion/css` へ完全移行する
- ゲーム開始時・room補充時に新しく配られたカードにフェードインアニメーションを追加する

## ファイル構成

```
src/
├── styles/
│   └── tokens.ts        # 共有の色・サイズ値
├── components/
│   ├── CardView.tsx      # カードスタイル + フェードインアニメーション定義
│   └── CardSlot.tsx      # isNew prop を受け取る
└── App.tsx               # レイアウト系スタイル + injectGlobal
```

## アニメーション設計

### 追跡方法

`newCardIndices: number[]` を `App` の UI ステートとして管理（`GameState` には含めない）。

| タイミング | 新しいインデックス |
|---|---|
| ゲーム開始時 | `[0, 1, 2, 3]` |
| 補充時（残り1枚→4枚） | `[1, 2, 3]` |
| アニメーション完了後 | `[]` |

### コンポーネント変更

- `CardSlot` に `isNew?: boolean` プロップを追加
- `isNew === true` のとき `CardView` にフェードインクラスを適用

### フェードイン仕様

- `opacity: 0 → 1`
- duration: `400ms`
- stagger: `50ms` ずつ時差（index × 50ms の `animation-delay`）
- アニメーション完了後（`onAnimationEnd`）に `newCardIndices` から該当 index を除去
