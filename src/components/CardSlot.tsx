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
