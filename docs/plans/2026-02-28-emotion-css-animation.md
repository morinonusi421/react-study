# @emotion/css 導入 + カードフェードインアニメーション 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** game.css を @emotion/css へ完全移行し、ゲーム開始時・room補充時に新しいカードがフェードインするアニメーションを追加する

**Architecture:** emotion/css の `css()` / `keyframes()` / `injectGlobal()` で全スタイルをコンポーネントに共置する。新カードの追跡は `newCardIndices: number[]` を App の UI ステートとして管理し、`CardSlot` に `isNew` + `animationDelay` + `onAnimationEnd` を渡す。

**Tech Stack:** @emotion/css, React 19, TypeScript

---

### Task 1: @emotion/css をインストールする

**Files:**
- Modify: `package.json`

**Step 1: パッケージをインストール**

```bash
npm install @emotion/css
```

**Step 2: 型定義が含まれているか確認（@emotion/css は型定義込み）**

```bash
ls node_modules/@emotion/css/dist/emotion-css.cjs.d.ts
```

Expected: ファイルが存在する

**Step 3: 開発サーバーを起動してエラーがないか確認**

```bash
npm start
```

Expected: コンパイルエラーなし、ゲームが動作する

---

### Task 2: 共有トークンファイルを作成する

**Files:**
- Create: `src/styles/tokens.ts`

**Step 1: `src/styles/` ディレクトリを作成し、tokens.ts を作成**

```typescript
// src/styles/tokens.ts

export const colors = {
  // 背景
  appBg: "#4a7a2a",
  overlayDark: "rgba(0, 0, 0, 0.75)",
  overlayClear: "rgba(0, 80, 0, 0.8)",
  panelBg: "rgba(0, 0, 0, 0.25)",
  panelBgLight: "rgba(0, 0, 0, 0.2)",
  panelBgDark: "rgba(0, 0, 0, 0.3)",

  // カード
  cardBg: "#fff",
  cardBorder: "#222",
  cardRed: "#cc0000",
  cardBlack: "#111",
  cardSlotBg: "rgba(255, 255, 255, 0.1)",
  cardSlotBorder: "rgba(255, 255, 255, 0.4)",

  // テキスト
  textWhite: "#fff",
  textWhiteMuted: "rgba(255, 255, 255, 0.8)",
  textWhiteFaint: "rgba(255, 255, 255, 0.7)",
  textWhiteVeryFaint: "rgba(255, 255, 255, 0.35)",
  textLogEntry: "rgba(255, 255, 255, 0.85)",
  textLogBullet: "rgba(255, 255, 255, 0.4)",

  // アクション
  orange: "#e05c2a",
  gold: "#ffd700",
  fleeBtnDisabledBg: "rgba(255, 255, 255, 0.15)",
};

export const card = {
  width: "80px",
  height: "115px",
  borderRadius: "6px",
};
```

**Step 2: 開発サーバーが起動したままなら、保存してエラーがないことを確認**

---

### Task 3: CardView を emotion/css へ移行する

**Files:**
- Modify: `src/components/CardView.tsx`

**Step 1: CardView.tsx を emotion/css スタイルに書き換える**

```tsx
// src/components/CardView.tsx
import React from "react";
import { css } from "@emotion/css";
import { SUIT_SYMBOL } from "../constants";
import { card as cardToken, colors } from "../styles/tokens";
import { CardViewProps } from "../types";

const styles = {
  card: css({
    position: "relative",
    width: cardToken.width,
    height: cardToken.height,
    background: colors.cardBg,
    border: `2px solid ${colors.cardBorder}`,
    borderRadius: cardToken.borderRadius,
    flexShrink: 0,
    cursor: "pointer",
    userSelect: "none",
  }),
  cardRed: css({ color: colors.cardRed }),
  cardBlack: css({ color: colors.cardBlack }),
  corner: css({
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    lineHeight: 1.1,
  }),
  cornerTop: css({ top: "4px", left: "6px" }),
  cornerBottom: css({ bottom: "4px", right: "6px", transform: "rotate(180deg)" }),
  rank: css({ fontSize: "13px", fontWeight: "bold" }),
  suit: css({ fontSize: "11px" }),
  center: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  }),
  suitLarge: css({ fontSize: "30px" }),
};

export function CardView({ card, onClick }: CardViewProps) {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const symbol = SUIT_SYMBOL[card.suit];
  const colorClass = isRed ? styles.cardRed : styles.cardBlack;

  return (
    <div className={`${styles.card} ${colorClass}`} onClick={onClick}>
      <div className={`${styles.corner} ${styles.cornerTop}`}>
        <span className={styles.rank}>{card.rank}</span>
        <span className={styles.suit}>{symbol}</span>
      </div>
      <div className={styles.center}>
        <span className={`${styles.suit} ${styles.suitLarge}`}>{symbol}</span>
      </div>
      <div className={`${styles.corner} ${styles.cornerBottom}`}>
        <span className={styles.rank}>{card.rank}</span>
        <span className={styles.suit}>{symbol}</span>
      </div>
    </div>
  );
}
```

**Step 2: ブラウザでカードの見た目が変わっていないことを確認**

---

### Task 4: CardSlot を emotion/css へ移行する

**Files:**
- Modify: `src/components/CardSlot.tsx`

**Step 1: CardSlot.tsx を書き換える**

```tsx
// src/components/CardSlot.tsx
import React from "react";
import { css } from "@emotion/css";
import { card as cardToken, colors } from "../styles/tokens";
import { Card } from "../types";
import { CardView } from "./CardView";

const slotStyle = css({
  width: cardToken.width,
  height: cardToken.height,
  background: colors.cardSlotBg,
  border: `2px dashed ${colors.cardSlotBorder}`,
  borderRadius: cardToken.borderRadius,
  flexShrink: 0,
});

interface CardSlotProps {
  card: Card | null;
  onClick?: () => void;
}

export function CardSlot({ card, onClick }: CardSlotProps) {
  if (card) {
    return <CardView card={card} onClick={onClick} />;
  }
  return <div className={slotStyle} />;
}
```

**Step 2: ブラウザで空スロットの見た目が変わっていないことを確認**

---

### Task 5: App.tsx を emotion/css へ移行し game.css を削除する

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/game.css`

**Step 1: App.tsx の import から `./game.css` を削除し、emotion/css スタイルを追加する**

ファイル冒頭の import を以下に変更:

```tsx
import React, { useState, useRef, useEffect } from "react";
import { css, injectGlobal } from "@emotion/css";
import { colors } from "./styles/tokens";
import { CardSlot } from "./components/CardSlot";
import { CardView } from "./components/CardView";
import { advanceRoomIfNeeded, buildInitialState, checkGameClear, getRankValue } from "./gameLogic";
import { GameState } from "./types";
```

**Step 2: `injectGlobal` でグローバルスタイルを定義（コンポーネントの外、import直後に記述）**

```typescript
injectGlobal({
  "*, *::before, *::after": { boxSizing: "border-box" },
  body: { margin: 0, padding: 0, background: "#1a1a2e" },
});
```

**Step 3: コンポーネントの外にスタイルオブジェクトを定義**

```typescript
const styles = {
  app: css({
    position: "relative",
    width: "100%",
    maxWidth: "390px",
    height: "100vh",
    // @ts-ignore
    height: "100dvh",
    maxHeight: "844px",
    margin: "0 auto",
    background: colors.appBg,
    display: "flex",
    flexDirection: "column",
    fontFamily: "sans-serif",
    overflow: "hidden",
  }),
  overlay: css({
    position: "absolute",
    inset: 0,
    background: colors.overlayDark,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  }),
  overlayClear: css({ background: colors.overlayClear }),
  overlayContent: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  }),
  overlayTitle: css({
    margin: 0,
    fontSize: "36px",
    fontWeight: "bold",
    color: colors.textWhite,
  }),
  overlayScore: css({
    margin: 0,
    fontSize: "20px",
    color: colors.textWhiteMuted,
  }),
  overlayButton: css({
    padding: "12px 32px",
    background: colors.orange,
    color: colors.textWhite,
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  }),
  statusBar: css({
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 24px",
    background: colors.panelBg,
    flexShrink: 0,
  }),
  statusGroup: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  }),
  statusIcon: css({ fontSize: "28px", lineHeight: 1 }),
  statusValue: css({
    fontSize: "28px",
    fontWeight: "bold",
    color: colors.textWhite,
    lineHeight: 1,
  }),
  statusLabel: css({
    fontSize: "11px",
    fontWeight: "bold",
    color: colors.textWhiteFaint,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),
  roomArea: css({
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
    padding: "20px 16px 16px",
  }),
  roomLabel: css({
    color: colors.textWhiteMuted,
    fontSize: "13px",
    fontWeight: "bold",
    letterSpacing: "1px",
    textTransform: "uppercase",
  }),
  roomSlots: css({ display: "flex", gap: "10px" }),
  logArea: css({
    flex: 1,
    overflowY: "auto",
    margin: "0 16px 12px",
    padding: "10px 12px",
    background: colors.panelBgDark,
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minHeight: "60px",
  }),
  logEntry: css({
    color: colors.textLogEntry,
    fontSize: "13px",
    lineHeight: 1.5,
    "::before": { content: '"▸ "', color: colors.textLogBullet },
  }),
  bottomArea: css({
    display: "flex",
    justifyContent: "space-around",
    alignItems: "flex-start",
    padding: "16px 24px",
    paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
    background: colors.panelBgLight,
    flexShrink: 0,
  }),
  dungeonSection: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  }),
  dungeonCount: css({
    fontSize: "48px",
    fontWeight: "bold",
    color: colors.textWhite,
    lineHeight: 1,
  }),
  dungeonLabel: css({
    fontSize: "12px",
    fontWeight: "bold",
    color: colors.textWhiteFaint,
    letterSpacing: "0.5px",
  }),
  fleeButtonBase: css({
    marginTop: "4px",
    padding: "6px 20px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  }),
  fleeButtonActive: css({ background: colors.orange, color: colors.textWhite }),
  fleeButtonDisabled: css({
    background: colors.fleeBtnDisabledBg,
    color: colors.textWhiteVeryFaint,
    cursor: "default",
  }),
  weaponSection: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  }),
  weaponLabel: css({
    color: colors.textWhiteMuted,
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),
  weaponRestriction: css({
    color: colors.gold,
    fontSize: "13px",
    fontWeight: "bold",
  }),
};
```

**Step 4: JSX 内のクラス名を `className={styles.xxx}` に置き換える（全体を書き換え）**

JSX の変更例（主要部分）:

```tsx
// overlay の結合クラス
<div className={`${styles.overlay} ${styles.overlayClear}`}>

// flee button の結合クラス
<button
  className={`${styles.fleeButtonBase} ${game.canFlee ? styles.fleeButtonActive : styles.fleeButtonDisabled}`}
  onClick={handleDungeonClick}
>
```

**Step 5: `game.css` ファイルを削除する**

```bash
rm src/game.css
```

**Step 6: ブラウザで全体の見た目が変わっていないことを確認**

---

### Task 6: newCardIndices ステートと補充検知を App.tsx に追加する

**Files:**
- Modify: `src/App.tsx`

**Step 1: `newCardIndices` ステートを追加する**

`useState<GameState>` の直下に追加:

```typescript
const [newCardIndices, setNewCardIndices] = useState<number[]>([0, 1, 2, 3]);
```

**Step 2: ゲームリセット時に `newCardIndices` もリセットする**

オーバーレイの「もう一度挑戦」ボタンの onClick を変更:

```tsx
onClick={() => {
  setGame(buildInitialState());
  setNewCardIndices([0, 1, 2, 3]);
}}
```

（2箇所あるので両方）

**Step 3: 補充検知ロジックを `handleRoomCardClick` に追加する**

各スーツのハンドラで `advanceRoomIfNeeded` を呼ぶ直前に補充チェックを追加:

```typescript
// advanceRoomIfNeeded を呼ぶ前にチェック
function checkAndSetReplenish(stateBeforeAdvance: GameState) {
  const remaining = stateBeforeAdvance.room.filter((c) => c !== null).length;
  if (remaining === 1) {
    setNewCardIndices([1, 2, 3]);
  }
}
```

この関数をコンポーネント内に定義し、各 `advanceRoomIfNeeded` 呼び出し直前に `checkAndSetReplenish(nextState)` を呼ぶ。

clubs/spades の例:
```typescript
const advanced = advanceRoomIfNeeded(nextState);
checkAndSetReplenish(nextState); // ← 追加
setGame(checkGameClear(advanced, card) ?? advanced);
```

hearts・diamonds も同様。

**Step 4: 逃走時も補充が起きるので、handleDungeonClick でリセット**

逃走後は常に4枚新しいカードが来る:

```typescript
setGame({ ...game, dungeon: remainingDungeon, room: drawnCards, canFlee: false, logs: [...game.logs, "部屋から逃げた！"] });
setNewCardIndices([0, 1, 2, 3]); // ← 追加
```

**Step 5: ブラウザで動作確認（アニメーションはまだなし、ステートの変化を確認）**

---

### Task 7: フェードインアニメーションを CardView・CardSlot に追加する

**Files:**
- Modify: `src/components/CardView.tsx`
- Modify: `src/components/CardSlot.tsx`
- Modify: `src/App.tsx`

**Step 1: CardView に `isNew` と `animationDelay` プロップとフェードインスタイルを追加する**

`CardViewProps` を更新（types.ts）:
```typescript
export interface CardViewProps {
  card: Card;
  onClick?: () => void;
  isNew?: boolean;
  animationDelay?: number;
  onAnimationEnd?: () => void;
}
```

CardView.tsx にフェードインキーフレームとアニメーションクラスを追加:

```typescript
import { css, keyframes } from "@emotion/css";

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const fadeInAnimation = (delayMs: number) =>
  css({
    animation: `${fadeIn} 400ms ease-out ${delayMs}ms both`,
  });
```

CardView の JSX で適用:

```tsx
export function CardView({ card, onClick, isNew, animationDelay = 0, onAnimationEnd }: CardViewProps) {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const symbol = SUIT_SYMBOL[card.suit];
  const colorClass = isRed ? styles.cardRed : styles.cardBlack;
  const animClass = isNew ? fadeInAnimation(animationDelay) : "";

  return (
    <div
      className={`${styles.card} ${colorClass} ${animClass}`}
      onClick={onClick}
      onAnimationEnd={isNew ? onAnimationEnd : undefined}
    >
      {/* 内部は変更なし */}
    </div>
  );
}
```

**Step 2: CardSlot に `isNew`・`animationDelay`・`onAnimationEnd` を追加して CardView に渡す**

```tsx
interface CardSlotProps {
  card: Card | null;
  onClick?: () => void;
  isNew?: boolean;
  animationDelay?: number;
  onAnimationEnd?: () => void;
}

export function CardSlot({ card, onClick, isNew, animationDelay, onAnimationEnd }: CardSlotProps) {
  if (card) {
    return (
      <CardView
        card={card}
        onClick={onClick}
        isNew={isNew}
        animationDelay={animationDelay}
        onAnimationEnd={onAnimationEnd}
      />
    );
  }
  return <div className={slotStyle} />;
}
```

**Step 3: App.tsx の CardSlot に `isNew` / `animationDelay` / `onAnimationEnd` を渡す**

Room の CardSlot レンダリング部分を更新:

```tsx
{game.room.map((card, i) => {
  const newIndex = newCardIndices.indexOf(i);
  const isNew = newIndex >= 0;
  return (
    <CardSlot
      key={i}
      card={card}
      onClick={() => handleRoomCardClick(i)}
      isNew={isNew}
      animationDelay={isNew ? newIndex * 50 : 0}
      onAnimationEnd={isNew ? () => setNewCardIndices((prev) => prev.filter((idx) => idx !== i)) : undefined}
    />
  );
})}
```

**Step 4: ブラウザで動作確認**

- ゲーム開始時、4枚のカードが時差でフェードインする
- room が 1枚になってカードを使用すると、新しく配られた3枚がフェードインする
- 逃走後も4枚がフェードインする
- アニメーション完了後、`newCardIndices` が空になる（React DevTools で確認可）
