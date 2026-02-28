import { ALL_RANKS, NON_FACE_RANKS } from "./constants";
import { Card, GameState, Rank } from "./types";

export function getRankValue(rank: Rank): number {
  if (rank === "A") return 14;
  if (rank === "K") return 13;
  if (rank === "Q") return 12;
  if (rank === "J") return 11;
  return parseInt(rank);
}

export function buildDungeon(): Card[] {
  const cards: Card[] = [];
  for (const rank of ALL_RANKS) {
    cards.push({ suit: "spades", rank });
    cards.push({ suit: "clubs", rank });
  }
  for (const rank of NON_FACE_RANKS) {
    cards.push({ suit: "hearts", rank });
    cards.push({ suit: "diamonds", rank });
  }
  return cards;
}

export function buildInitialState(): GameState {
  const shuffled = [...buildDungeon()].sort(() => Math.random() - 0.5);
  return {
    dungeon: shuffled.slice(4),
    room: shuffled.slice(0, 4),
    equippedWeapon: null,
    lastSlainValue: null,
    health: 2000,
    canFlee: true,
    canUsePotion: true,
    score: 0,
    logs: ["ダンジョンに挑む！"],
    phase: "playing",
  };
}

// ダンジョン踏破チェック：山札が空でルームも全処理済みならクリア状態を返す
export function checkGameClear(state: GameState, lastCard: Card): GameState | null {
  if (state.dungeon.length > 0) return null;
  if (state.room.some((c) => c !== null)) return null;

  let bonus = state.health;
  let log = `ダンジョン踏破！ HP残量ボーナス +${state.health}`;

  if (lastCard.suit === "hearts") {
    const potionValue = getRankValue(lastCard.rank);
    bonus += potionValue;
    log += `、回復薬ボーナス +${potionValue}`;
  }

  return {
    ...state,
    score: state.score + bonus,
    phase: "game-clear",
    logs: [...state.logs, log],
  };
}

// roomの残りが1枚になったら山札から3枚補充し、ターンフラグをリセットする
export function advanceRoomIfNeeded(state: GameState): GameState {
  const remaining = state.room.filter((c): c is Card => c !== null);
  if (remaining.length !== 1) return state;

  const drawn = state.dungeon.slice(0, 3);
  const newDungeon = state.dungeon.slice(3);

  return {
    ...state,
    room: [...remaining, ...drawn],
    dungeon: newDungeon,
    canFlee: true,
    canUsePotion: true,
  };
}
