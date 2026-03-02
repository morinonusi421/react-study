// src/components/CardView.tsx
import React from "react";
import { css, keyframes } from "@emotion/css";
import { SUIT_SYMBOL } from "../constants";
import { card as cardToken, colors } from "../styles/tokens";
import { CardViewProps } from "../types";

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const fadeInAnimation = (delayMs: number) =>
  css({
    animation: `${fadeIn} 400ms ease-out ${delayMs}ms both`,
  });

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
