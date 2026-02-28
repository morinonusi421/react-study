import React from "react";
import { Card } from "../types";
import { CardView } from "./CardView";

interface CardSlotProps {
  card: Card | null;
  onClick?: () => void;
}

export function CardSlot({ card, onClick }: CardSlotProps) {
  if (card) {
    return <CardView card={card} onClick={onClick} />;
  }
  return <div className="card-slot" />;
}
