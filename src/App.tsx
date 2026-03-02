import React, { useState, useRef, useEffect } from "react";
import { css, injectGlobal } from "@emotion/css";
import { colors } from "./styles/tokens";
import { CardSlot } from "./components/CardSlot";
import { CardView } from "./components/CardView";
import { advanceRoomIfNeeded, buildInitialState, checkGameClear, getRankValue } from "./gameLogic";
import { GameState } from "./types";

injectGlobal({
  "*, *::before, *::after": { boxSizing: "border-box" },
  body: { margin: 0, padding: 0, background: "#1a1a2e" },
});

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

const INITIAL_STATE: GameState = buildInitialState();

export default function App() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [newCardIndices, setNewCardIndices] = useState<number[]>([0, 1, 2, 3]);

  function checkAndSetReplenish(stateBeforeAdvance: GameState) {
    const remaining = stateBeforeAdvance.room.filter((c) => c !== null).length;
    if (remaining === 1) {
      const nullIndices = stateBeforeAdvance.room
        .map((c, i) => (c === null ? i : -1))
        .filter((i) => i !== -1);
      setNewCardIndices(nullIndices);
    }
  }

  function handleRoomCardClick(index: number) {
    if (game.phase !== "playing" || game.room[index] == null) {
      return;
    }

    const card = game.room[index]!;
    const baseState = { ...game, room: game.room.map((c, i) => (i === index ? null : c)), canFlee: false };
    const value = getRankValue(card.rank);

    // クラブかスペードの場合は、モンスターとの戦闘になる
    if (card.suit === "clubs" || card.suit === "spades") {
      const weaponValue = game.equippedWeapon ? getRankValue(game.equippedWeapon.rank) : null;
      const canUseWeapon = weaponValue !== null && (game.lastSlainValue === null || value < game.lastSlainValue);

      let damage: number;
      let newLastSlainValue = game.lastSlainValue;
      let combatLog: string;

      if (canUseWeapon) {
        damage = Math.max(0, value - weaponValue!);
        newLastSlainValue = value;
        combatLog =
          damage > 0
            ? `モンスター（Lv.${value}）を武器で撃退！ ${damage}ダメージ`
            : `モンスター（Lv.${value}）を武器で撃退！ ノーダメージ`;
      } else {
        damage = value;
        const reason = weaponValue !== null ? "（武器使用制限）" : "";
        combatLog = `モンスター（Lv.${value}）と素手で戦った！ ${damage}ダメージ${reason}`;
      }

      const newHealth = Math.max(0, game.health - damage);
      const newLogs = [...game.logs, combatLog];
      const nextState = {
        ...baseState,
        health: newHealth,
        score: game.score + value,
        lastSlainValue: newLastSlainValue,
        logs: newLogs,
      };

      if (newHealth === 0) {
        setGame({ ...nextState, phase: "game-over" as const });
      } else {
        const advanced = advanceRoomIfNeeded(nextState);
        checkAndSetReplenish(nextState);
        setGame(checkGameClear(advanced, card) ?? advanced);
      }
    }

    // ハートの場合は、回復薬を使用する
    else if (card.suit === "hearts") {
      if (game.canUsePotion) {
        const healed = Math.min(game.health + value, 2000) - game.health;
        const nextState = {
          ...baseState,
          health: game.health + healed,
          canUsePotion: false,
          logs: [...game.logs, `回復薬を使った！（HP +${healed}）`],
        };
        const advanced = advanceRoomIfNeeded(nextState);
        checkAndSetReplenish(nextState);
        setGame(checkGameClear(advanced, card) ?? advanced);
      } else {
        const nextState = {
          ...baseState,
          logs: [...game.logs, "回復薬を捨てた（このターンはすでに使用済み）"],
        };
        const advanced = advanceRoomIfNeeded(nextState);
        checkAndSetReplenish(nextState);
        setGame(checkGameClear(advanced, card) ?? advanced);
      }
    }

    // ダイヤモンドの場合は、武器を拾う
    else if (card.suit === "diamonds") {
      const nextState = {
        ...baseState,
        equippedWeapon: card,
        lastSlainValue: null,
        logs: [...game.logs, `武器（Lv.${value}）を装備した！`],
      };
      const advanced = advanceRoomIfNeeded(nextState);
      checkAndSetReplenish(nextState);
      setGame(checkGameClear(advanced, card) ?? advanced);
    }
  }

  function handleDungeonClick() {
    if (game.phase !== "playing") return;
    if (game.canFlee) {
      const nonNullRoom = game.room.filter((card) => card !== null);
      const shuffledRoom = [...nonNullRoom].sort(() => Math.random() - 0.5);
      const newDungeon = [...game.dungeon, ...shuffledRoom];

      const drawnCards = newDungeon.slice(0, 4);
      const remainingDungeon = newDungeon.slice(4);

      setGame({
        ...game,
        dungeon: remainingDungeon,
        room: drawnCards,
        canFlee: false,
        logs: [...game.logs, "部屋から逃げた！"],
      });
      setNewCardIndices([0, 1, 2, 3]);
    } else {
      const isInProgress = game.room.some((c) => c === null);
      const msg = isInProgress ? "攻略中のフロアからは逃げられない！" : "連続して逃げることはできない！";
      setGame({ ...game, logs: [...game.logs, msg] });
    }
  }

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [game.logs]);

  return (
    <div className={styles.app}>
      {game.phase === "game-over" && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <p className={styles.overlayTitle}>ゲームオーバー</p>
            <p className={styles.overlayScore}>スコア: {game.score}</p>
            <button className={styles.overlayButton} onClick={() => { setGame(buildInitialState()); setNewCardIndices([0, 1, 2, 3]); }}>
              もう一度挑戦
            </button>
          </div>
        </div>
      )}
      {game.phase === "game-clear" && (
        <div className={`${styles.overlay} ${styles.overlayClear}`}>
          <div className={styles.overlayContent}>
            <p className={styles.overlayTitle}>ダンジョン踏破！</p>
            <p className={styles.overlayScore}>スコア: {game.score}</p>
            <button className={styles.overlayButton} onClick={() => { setGame(buildInitialState()); setNewCardIndices([0, 1, 2, 3]); }}>
              もう一度挑戦
            </button>
          </div>
        </div>
      )}

      {/* ステータスバー */}
      <div className={styles.statusBar}>
        <div className={styles.statusGroup}>
          <span className={styles.statusIcon}>♥</span>
          <span className={styles.statusValue}>{game.health}</span>
          <span className={styles.statusLabel}>HP</span>
        </div>
        <div className={styles.statusGroup}>
          <span className={styles.statusIcon}>★</span>
          <span className={styles.statusValue}>{game.score}</span>
          <span className={styles.statusLabel}>Score</span>
        </div>
      </div>

      {/* Room（メイン操作エリア） */}
      <div className={styles.roomArea}>
        <span className={styles.roomLabel}>Room</span>
        <div className={styles.roomSlots}>
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
        </div>
      </div>

      {/* ログエリア */}
      <div className={styles.logArea} ref={logRef}>
        {game.logs.map((log, i) => (
          <div key={i} className={styles.logEntry}>
            {log}
          </div>
        ))}
      </div>

      {/* 下部エリア */}
      <div className={styles.bottomArea}>
        {/* Dungeon */}
        <div className={styles.dungeonSection}>
          <span className={styles.dungeonCount}>{game.dungeon.length}</span>
          <span className={styles.dungeonLabel}>残り山札</span>
          <button
            className={`${styles.fleeButtonBase} ${game.canFlee ? styles.fleeButtonActive : styles.fleeButtonDisabled}`}
            onClick={handleDungeonClick}
          >
            逃走
          </button>
        </div>

        {/* 武器 */}
        <div className={styles.weaponSection}>
          <span className={styles.weaponLabel}>Weapon</span>
          {game.equippedWeapon ? <CardView card={game.equippedWeapon} /> : <CardSlot card={null} />}
          {game.lastSlainValue !== null && <span className={styles.weaponRestriction}>使用制限 ≤ {game.lastSlainValue}</span>}
        </div>
      </div>
    </div>
  );
}
