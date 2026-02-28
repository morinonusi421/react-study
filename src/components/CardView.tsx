import React from "react";
import { SUIT_SYMBOL } from "../constants";
import { CardViewProps } from "../types";

export function CardView({ card, onClick }: CardViewProps) {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const symbol = SUIT_SYMBOL[card.suit];

  return (
    <div className={`card ${isRed ? "card--red" : "card--black"}`} onClick={onClick}>
      {/* 左上 */}
      <div className="card__corner card__corner--top">
        <span className="card__rank">{card.rank}</span>
        <span className="card__suit">{symbol}</span>
      </div>
      {/* 中央 */}
      <div className="card__center">
        <span className="card__suit card__suit--large">{symbol}</span>
      </div>
      {/* 右下（180度回転） */}
      <div className="card__corner card__corner--bottom">
        <span className="card__rank">{card.rank}</span>
        <span className="card__suit">{symbol}</span>
      </div>
    </div>
  );
}
