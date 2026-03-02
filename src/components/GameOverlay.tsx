import { css } from "@emotion/react";
import { colors } from "../styles/tokens";
import { GameState } from "../types";

interface GameOverlayProps {
  phase: GameState["phase"];
  score: number;
  onRestart: () => void;
}

const styles = {
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
  content: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  }),
  title: css({
    margin: 0,
    fontSize: "36px",
    fontWeight: "bold",
    color: colors.textWhite,
  }),
  score: css({
    margin: 0,
    fontSize: "20px",
    color: colors.textWhiteMuted,
  }),
  button: css({
    padding: "12px 32px",
    background: colors.orange,
    color: colors.textWhite,
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  }),
};

export function GameOverlay({ phase, score, onRestart }: GameOverlayProps) {
  if (phase === "playing") return null;

  const isClear = phase === "game-clear";

  return (
    <div css={[styles.overlay, isClear && styles.overlayClear]}>
      <div css={styles.content}>
        <p css={styles.title}>{isClear ? "ダンジョン踏破！" : "ゲームオーバー"}</p>
        <p css={styles.score}>スコア: {score}</p>
        <button css={styles.button} onClick={onRestart}>
          もう一度挑戦
        </button>
      </div>
    </div>
  );
}
