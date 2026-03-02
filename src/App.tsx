import React, { useState, useRef, useEffect } from "react";
import { css, Global } from "@emotion/react";
import { colors } from "./styles/tokens";
import { CardSlot } from "./components/CardSlot";
import { CardView } from "./components/CardView";
import { applyFlee, applyFleeBlocked, applyRoomCard, buildInitialState } from "./gameLogic";
import { GameState } from "./types";

const globalStyles = css({
  "*, *::before, *::after": { boxSizing: "border-box" },
  body: { margin: 0, padding: 0, background: "#1a1a2e" },
});

const styles = {
  app: css`
    position: relative;
    width: 100%;
    max-width: 390px;
    height: 100vh;
    height: 100dvh;
    max-height: 844px;
    margin: 0 auto;
    background: ${colors.appBg};
    display: flex;
    flex-direction: column;
    font-family: sans-serif;
    overflow: hidden;
  `,
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
    background: colors.actionDisabledBg,
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

export default function App() {
  const [game, setGame] = useState<GameState>(() => buildInitialState());
  const [newCardIndices, setNewCardIndices] = useState<number[]>([0, 1, 2, 3]);

  function handleRoomCardClick(index: number) {
    if (game.phase !== "playing" || game.room[index] == null) return;
    const { state, newIndices } = applyRoomCard(game, index);
    setGame(state);
    setNewCardIndices(newIndices);
  }

  function handleDungeonClick() {
    if (game.phase !== "playing") return;
    if (game.canFlee) {
      const { state, newIndices } = applyFlee(game);
      setGame(state);
      setNewCardIndices(newIndices);
    } else {
      setGame(applyFleeBlocked(game));
    }
  }

  function handleRestart() {
    setGame(buildInitialState());
    setNewCardIndices([0, 1, 2, 3]);
  }

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [game.logs]);

  return (
    <>
      <Global styles={globalStyles} />
      <div css={styles.app}>
        {game.phase === "game-over" && (
          <div css={styles.overlay}>
            <div css={styles.overlayContent}>
              <p css={styles.overlayTitle}>ゲームオーバー</p>
              <p css={styles.overlayScore}>スコア: {game.score}</p>
              <button css={styles.overlayButton} onClick={handleRestart}>
                もう一度挑戦
              </button>
            </div>
          </div>
        )}
        {game.phase === "game-clear" && (
          <div css={[styles.overlay, styles.overlayClear]}>
            <div css={styles.overlayContent}>
              <p css={styles.overlayTitle}>ダンジョン踏破！</p>
              <p css={styles.overlayScore}>スコア: {game.score}</p>
              <button css={styles.overlayButton} onClick={handleRestart}>
                もう一度挑戦
              </button>
            </div>
          </div>
        )}

        {/* ステータスバー */}
        <div css={styles.statusBar}>
          <div css={styles.statusGroup}>
            <span css={styles.statusIcon}>♥</span>
            <span css={styles.statusValue}>{game.health}</span>
            <span css={styles.statusLabel}>HP</span>
          </div>
          <div css={styles.statusGroup}>
            <span css={styles.statusIcon}>★</span>
            <span css={styles.statusValue}>{game.score}</span>
            <span css={styles.statusLabel}>Score</span>
          </div>
        </div>

        {/* Room（メイン操作エリア） */}
        <div css={styles.roomArea}>
          <span css={styles.roomLabel}>Room</span>
          <div css={styles.roomSlots}>
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
                  onAnimationEnd={
                    isNew ? () => setNewCardIndices((prev) => prev.filter((idx) => idx !== i)) : undefined
                  }
                />
              );
            })}
          </div>
        </div>

        {/* ログエリア */}
        <div css={styles.logArea} ref={logRef}>
          {game.logs.map((log, i) => (
            <div key={i} css={styles.logEntry}>
              {log}
            </div>
          ))}
        </div>

        {/* 下部エリア */}
        <div css={styles.bottomArea}>
          {/* Dungeon */}
          <div css={styles.dungeonSection}>
            <span css={styles.dungeonCount}>{game.dungeon.length}</span>
            <span css={styles.dungeonLabel}>残り山札</span>
            <button
              css={[styles.fleeButtonBase, game.canFlee ? styles.fleeButtonActive : styles.fleeButtonDisabled]}
              onClick={handleDungeonClick}
            >
              逃走
            </button>
          </div>

          {/* 武器 */}
          <div css={styles.weaponSection}>
            <span css={styles.weaponLabel}>Weapon</span>
            {game.equippedWeapon ? <CardView card={game.equippedWeapon} /> : <CardSlot card={null} />}
            {game.lastSlainValue !== null && (
              <span css={styles.weaponRestriction}>使用制限 ≤ {game.lastSlainValue}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
