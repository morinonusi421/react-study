import { Rank, Suit } from "./types";

export const MAX_HEALTH = 2000;

export const ALL_RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const NON_FACE_RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10"];

export const SUIT_SYMBOL: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};
