import { ALL_RANKS, MAX_HEALTH, NON_FACE_RANKS } from "./constants";
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
    health: MAX_HEALTH,
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

// roomの残りが1枚になったら山札から3枚補充し、null スロットをその場で埋める。
// 補充が起きた場合、新たに埋まったスロットのインデックスを newIndices に返す。
export function advanceRoomIfNeeded(state: GameState): { state: GameState; newIndices: number[] } {
  const remaining = state.room.filter((c): c is Card => c !== null);
  if (remaining.length !== 1) return { state, newIndices: [] };

  const drawn = state.dungeon.slice(0, 3);
  const newDungeon = state.dungeon.slice(3);

  let drawIndex = 0;
  const newIndices: number[] = [];
  const newRoom = state.room.map((c, i) => {
    if (c !== null) return c;
    newIndices.push(i);
    return drawn[drawIndex++] ?? null;
  });

  return {
    state: { ...state, room: newRoom, dungeon: newDungeon, canFlee: true, canUsePotion: true },
    newIndices,
  };
}

// カードを1枚使用したときのゲーム状態遷移。App.tsx はこの関数を呼ぶだけでよい。
export function applyRoomCard(state: GameState, cardIndex: number): { state: GameState; newIndices: number[] } {
  const card = state.room[cardIndex]!;
  const value = getRankValue(card.rank);
  const baseState: GameState = {
    ...state,
    room: state.room.map((c, i) => (i === cardIndex ? null : c)),
    canFlee: false,
  };

  let nextState: GameState;

  if (card.suit === "clubs" || card.suit === "spades") {
    const weaponValue = state.equippedWeapon ? getRankValue(state.equippedWeapon.rank) : null;
    const canUseWeapon =
      weaponValue !== null && (state.lastSlainValue === null || value < state.lastSlainValue);

    let damage: number;
    let newLastSlainValue = state.lastSlainValue;
    let combatLog: string;

    if (canUseWeapon) {
      damage = Math.max(0, value - weaponValue!);
      newLastSlainValue = value;
      combatLog =
        damage > 0
          ? `モンスター（Lv.${value}）を武器で撃退！ ${damage}ダメージ`
          : `モンスター（Lv.${value}）を武器で撃退！ ノーダメージ`;
    } else {
      damage = value;
      const reason = weaponValue !== null ? "（武器使用制限）" : "";
      combatLog = `モンスター（Lv.${value}）と素手で戦った！ ${damage}ダメージ${reason}`;
    }

    const newHealth = Math.max(0, state.health - damage);
    nextState = {
      ...baseState,
      health: newHealth,
      score: state.score + value,
      lastSlainValue: newLastSlainValue,
      logs: [...state.logs, combatLog],
    };

    if (newHealth === 0) {
      return { state: { ...nextState, phase: "game-over" }, newIndices: [] };
    }
  } else if (card.suit === "hearts") {
    if (state.canUsePotion) {
      const healed = Math.min(state.health + value, MAX_HEALTH) - state.health;
      nextState = {
        ...baseState,
        health: state.health + healed,
        canUsePotion: false,
        logs: [...state.logs, `回復薬を使った！（HP +${healed}）`],
      };
    } else {
      nextState = {
        ...baseState,
        logs: [...state.logs, "回復薬を捨てた（このターンはすでに使用済み）"],
      };
    }
  } else {
    // diamonds: 武器を装備
    nextState = {
      ...baseState,
      equippedWeapon: card,
      lastSlainValue: null,
      logs: [...state.logs, `武器（Lv.${value}）を装備した！`],
    };
  }

  const { state: advanced, newIndices } = advanceRoomIfNeeded(nextState);
  const cleared = checkGameClear(advanced, card);
  return { state: cleared ?? advanced, newIndices };
}

// 逃走できない場合のゲーム状態遷移（ログにメッセージを追加）
export function applyFleeBlocked(state: GameState): GameState {
  const isInProgress = state.room.some((c) => c === null);
  const msg = isInProgress ? "攻略中のフロアからは逃げられない！" : "連続して逃げることはできない！";
  return { ...state, logs: [...state.logs, msg] };
}

// 逃走したときのゲーム状態遷移
export function applyFlee(state: GameState): { state: GameState; newIndices: number[] } {
  const nonNullRoom = state.room.filter((c): c is Card => c !== null);
  const shuffledRoom = [...nonNullRoom].sort(() => Math.random() - 0.5);
  const newDungeon = [...state.dungeon, ...shuffledRoom];

  const drawnCards = newDungeon.slice(0, 4);
  const remainingDungeon = newDungeon.slice(4);

  return {
    state: {
      ...state,
      dungeon: remainingDungeon,
      room: drawnCards,
      canFlee: false,
      logs: [...state.logs, "部屋から逃げた！"],
    },
    newIndices: drawnCards.map((_, i) => i),
  };
}
