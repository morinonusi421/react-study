import React, { useState, useRef, useEffect } from "react";
import "./game.css";

// =====================
// 型定義
// =====================

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  suit: Suit;
  rank: Rank;
}

interface GameState {
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

// =====================
// 初期状態
// =====================

const ALL_RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const NON_FACE_RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10"];

function buildDungeon(): Card[] {
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

function buildInitialState(): GameState {
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

const INITIAL_STATE: GameState = buildInitialState();

// =====================
// サブコンポーネント
// =====================

interface CardViewProps {
  card: Card;
  onClick?: () => void;
}

const SUIT_SYMBOL: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

function CardView({ card, onClick }: CardViewProps) {
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

function CardSlot({ card, onClick }: { card: Card | null; onClick?: () => void }) {
  if (card) {
    return <CardView card={card} onClick={onClick} />;
  }
  return <div className="card-slot" />;
}

// ランクをnumberに変換する関数
function getRankValue(rank: Rank): number {
  if (rank === "A") return 14;
  if (rank === "K") return 13;
  if (rank === "Q") return 12;
  if (rank === "J") return 11;
  return parseInt(rank);
}

// ダンジョン踏破チェック：山札が空でルームも全処理済みならクリア状態を返す
function checkGameClear(state: GameState, lastCard: Card): GameState | null {
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
function advanceRoomIfNeeded(state: GameState): GameState {
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

// =====================
// メインコンポーネント
// =====================

export default function App() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);

  function handleRoomCardClick(index: number) {
    if (game.phase !== "playing" || game.room[index] == null) {
      return;
    }

    const card = game.room[index]!;
    const baseState = { ...game, room: game.room.map((c, i) => (i === index ? null : c)), canFlee: false };
    const value = getRankValue(card.rank);

    // クラブかスペードの場合は、モンスターとの戦闘になる
    if (card.suit === "clubs" || card.suit === "spades") {
      const weaponValue = game.equippedWeapon ? getRankValue(game.equippedWeapon.rank) : null;
      const canUseWeapon = weaponValue !== null && (game.lastSlainValue === null || value <= game.lastSlainValue);

      let damage: number;
      let newLastSlainValue = game.lastSlainValue;
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

      const newHealth = Math.max(0, game.health - damage);
      const newLogs = [...game.logs, combatLog];
      const nextState = {
        ...baseState,
        health: newHealth,
        score: game.score + value,
        lastSlainValue: newLastSlainValue,
        logs: newLogs,
      };

      if (newHealth === 0) {
        setGame({ ...nextState, phase: "game-over" as const });
      } else {
        const advanced = advanceRoomIfNeeded(nextState);
        setGame(checkGameClear(advanced, card) ?? advanced);
      }
    }

    // ハートの場合は、回復薬を使用する
    else if (card.suit === "hearts") {
      if (game.canUsePotion) {
        const healed = Math.min(game.health + value, 2000) - game.health;
        const advanced = advanceRoomIfNeeded({
          ...baseState,
          health: game.health + healed,
          canUsePotion: false,
          logs: [...game.logs, `回復薬を使った！（HP +${healed}）`],
        });
        setGame(checkGameClear(advanced, card) ?? advanced);
      } else {
        const advanced = advanceRoomIfNeeded({
          ...baseState,
          logs: [...game.logs, "回復薬を捨てた（このターンはすでに使用済み）"],
        });
        setGame(checkGameClear(advanced, card) ?? advanced);
      }
    }

    // ダイヤモンドの場合は、武器を拾う
    else if (card.suit === "diamonds") {
      const advanced = advanceRoomIfNeeded({
        ...baseState,
        equippedWeapon: card,
        lastSlainValue: null,
        logs: [...game.logs, `武器（Lv.${value}）を装備した！`],
      });
      setGame(checkGameClear(advanced, card) ?? advanced);
    }
  }

  function handleDungeonClick() {
    if (game.phase !== "playing") return;
    if (game.canFlee) {
      // Null以外のRoomをシャッフルして山s札の下に加える
      const nonNullRoom = game.room.filter((card) => card !== null);
      const shuffledRoom = [...nonNullRoom].sort(() => Math.random() - 0.5);
      const newDungeon = [...game.dungeon, ...shuffledRoom];

      // ダンジョンから4枚カードをドローして,roomにセットする
      const drawnCards = newDungeon.slice(0, 4);
      const remainingDungeon = newDungeon.slice(4);

      setGame({
        ...game,
        dungeon: remainingDungeon,
        room: drawnCards,
        canFlee: false,
        logs: [...game.logs, "部屋から逃げた！"],
      });
    } else {
      const isInProgress = game.room.some((c) => c === null);
      const msg = isInProgress ? "攻略中のフロアからは逃げられない！" : "連続して逃げることはできない！";
      setGame({ ...game, logs: [...game.logs, msg] });
    }
  }

  // --------------------------------

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [game.logs]);

  return (
    <div className="app">
      {game.phase === "game-over" && (
        <div className="overlay">
          <div className="overlay__content">
            <p className="overlay__title">ゲームオーバー</p>
            <p className="overlay__score">スコア: {game.score}</p>
            <button className="overlay__button" onClick={() => setGame(buildInitialState())}>
              もう一度挑戦
            </button>
          </div>
        </div>
      )}
      {game.phase === "game-clear" && (
        <div className="overlay overlay--clear">
          <div className="overlay__content">
            <p className="overlay__title">ダンジョン踏破！</p>
            <p className="overlay__score">スコア: {game.score}</p>
            <button className="overlay__button" onClick={() => setGame(buildInitialState())}>
              もう一度挑戦
            </button>
          </div>
        </div>
      )}
      {/* ステータスバー */}
      <div className="status-bar">
        <div className="status-group">
          <span className="status-icon">♥</span>
          <span className="status-value">{game.health}</span>
          <span className="status-label">HP</span>
        </div>
        <div className="status-group">
          <span className="status-icon">★</span>
          <span className="status-value">{game.score}</span>
          <span className="status-label">Score</span>
        </div>
      </div>

      {/* Room（メイン操作エリア） */}
      <div className="room-area">
        <span className="room-label">Room</span>
        <div className="room-slots">
          {game.room.map((card, i) => (
            <CardSlot key={i} card={card} onClick={() => handleRoomCardClick(i)} />
          ))}
        </div>
      </div>

      {/* ログエリア */}
      <div className="log-area" ref={logRef}>
        {game.logs.map((log, i) => (
          <div key={i} className="log-entry">
            {log}
          </div>
        ))}
      </div>

      {/* 下部エリア */}
      <div className="bottom-area">
        {/* Dungeon */}
        <div className="dungeon-section">
          <span className="dungeon-count">{game.dungeon.length}</span>
          <span className="dungeon-label">残り山札</span>
          <button
            className={`flee-button ${game.canFlee ? "flee-button--active" : "flee-button--disabled"}`}
            onClick={handleDungeonClick}
          >
            逃走
          </button>
        </div>

        {/* 武器 */}
        <div className="weapon-section">
          <span className="weapon-label">Weapon</span>
          {game.equippedWeapon ? <CardView card={game.equippedWeapon} /> : <div className="card-slot" />}
          {game.lastSlainValue !== null && <span className="weapon-restriction">使用制限 ≤ {game.lastSlainValue}</span>}
        </div>
      </div>
    </div>
  );
}
