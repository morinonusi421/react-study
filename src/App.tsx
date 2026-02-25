import React, { useState } from 'react';
import './game.css';

// =====================
// 型定義
// =====================

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  rank: Rank;
}

interface GameState {
  dungeon: Card[];          // 山札
  room: (Card | null)[];    // 場に出た4枚
  equippedWeapon: Card | null; // 装備中の武器
  monstersSlain: Card[];    // この武器で倒したモンスター
  health: number;           // プレイヤーHP
}

// =====================
// 初期状態
// =====================

const ALL_RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const MONSTER_RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];

function buildDungeon(): Card[] {
  const cards: Card[] = [];
  for (const rank of ALL_RANKS) {
    cards.push({ suit: 'spades', rank });
    cards.push({ suit: 'clubs',  rank });
  }
  for (const rank of MONSTER_RANKS) {
    cards.push({ suit: 'hearts',   rank });
    cards.push({ suit: 'diamonds', rank });
  }
  return cards;
}

const INITIAL_STATE: GameState = {
  dungeon: buildDungeon(),
  room: [
    { suit: 'hearts',   rank: 'A' },
    { suit: 'diamonds', rank: '7' },
    { suit: 'clubs',    rank: 'J' },
    { suit: 'spades',   rank: '9' },
  ],
  equippedWeapon: { suit: 'spades', rank: '6' },
  monstersSlain: [
    { suit: 'clubs',    rank: '3' },
    { suit: 'hearts',   rank: '5' },
    { suit: 'diamonds', rank: '4' },
  ],
  health: 20,
};

// =====================
// サブコンポーネント
// =====================

interface CardViewProps {
  card: Card;
  onClick?: () => void;
}

const SUIT_SYMBOL: Record<Suit, string> = {
  hearts:   '♥',
  diamonds: '♦',
  clubs:    '♣',
  spades:   '♠',
};

function CardView({ card, onClick }: CardViewProps) {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const symbol = SUIT_SYMBOL[card.suit];

  return (
    <div className={`card ${isRed ? 'card--red' : 'card--black'}`} onClick={onClick}>
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

// =====================
// メインコンポーネント
// =====================

export default function App() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);

  // --- ハンドラ（中身は自分で実装） ---

  function handleRoomCardClick(_index: number) {
    // Room のカードをクリックしたときの処理
    // 例: setGame({ ...game, ... })
  }

  function handleDungeonClick() {
    // Null以外のRoomをシャッフルして山札の下に加える
    const nonNullRoom = game.room.filter(card => card !== null);
    const shuffledRoom = [...nonNullRoom].sort(() => Math.random() - 0.5);
    const newDungeon = [...game.dungeon, ...shuffledRoom];

    // ダンジョンから4枚カードをドローして,roomにセットする
    const drawnCards = newDungeon.slice(0, 4);
    const remainingDungeon = newDungeon.slice(4);

    setGame({ ...game, dungeon: remainingDungeon, room: drawnCards });
  }

  // --------------------------------

  return (
    <div className="table">

      {/* Dungeon（山札） */}
      <div className="pile" onClick={handleDungeonClick}>
        <div className="pile__stack">
          {game.dungeon.length > 0 ? (
            <div className="card card--back pile__top-card" />
          ) : (
            <div className="card-slot pile__top-card" />
          )}
        </div>
        <span className="pile__label">Dungeon ({game.dungeon.length})</span>
      </div>

      {/* 中央エリア */}
      <div className="center">

        {/* Room */}
        <div className="room">
          <span className="room__label">Room</span>
          <div className="room__slots">
            {game.room.map((card, i) => (
              <CardSlot
                key={i}
                card={card}
                onClick={() => handleRoomCardClick(i)}
              />
            ))}
          </div>
        </div>

        {/* 装備武器 */}
        <div className="weapon">
          <div className="weapon__stack">
            {game.equippedWeapon ? (
              <div className="weapon__card">
                <CardView card={game.equippedWeapon} />
              </div>
            ) : (
              <div className="card-slot weapon__card" />
            )}
            {game.monstersSlain.map((card, i) => (
              <div key={i} className="weapon__monster">
                <CardView card={card} />
              </div>
            ))}
          </div>
          <div className="weapon__info">
            <span className="weapon__label">Equipped Weapon</span>
            <span className="weapon__sublabel">
              Monsters slain<br />by this Weapon
            </span>
          </div>
        </div>

      </div>


    </div>
  );
}
