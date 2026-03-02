import { css } from "@emotion/react";
import { colors } from "../styles/tokens";

interface StatusBarProps {
  health: number;
  score: number;
}

const styles = {
  bar: css({
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 24px",
    background: colors.panelBg,
    flexShrink: 0,
  }),
  group: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  }),
  icon: css({ fontSize: "28px", lineHeight: 1 }),
  value: css({
    fontSize: "28px",
    fontWeight: "bold",
    color: colors.textWhite,
    lineHeight: 1,
  }),
  label: css({
    fontSize: "11px",
    fontWeight: "bold",
    color: colors.textWhiteFaint,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),
};

export function StatusBar({ health, score }: StatusBarProps) {
  return (
    <div css={styles.bar}>
      <div css={styles.group}>
        <span css={styles.icon}>♥</span>
        <span css={styles.value}>{health}</span>
        <span css={styles.label}>HP</span>
      </div>
      <div css={styles.group}>
        <span css={styles.icon}>★</span>
        <span css={styles.value}>{score}</span>
        <span css={styles.label}>Score</span>
      </div>
    </div>
  );
}
