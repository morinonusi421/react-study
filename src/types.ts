export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface GameState {
  dungeon: Card[]; // 山札
  room: (Card | null)[]; // 場に出た4枚
  equippedWeapon: Card | null; // 装備中の武器
  lastSlainValue: number | null; // 武器で最後に倒したモンスターの数値（使用制限チェック用）
  health: number; // プレイヤーHP
  canFlee: boolean; // 逃げることができるかどうか
  canUsePotion: boolean; // 回復薬を使用できるかどうか
  score: number; // スコア
  logs: string[]; // ゲームログ
  phase: "playing" | "game-over" | "game-clear"; // ゲームフェーズ
}

