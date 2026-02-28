import React, { useState, useRef, useEffect } from "react";
import "./game.css";
import { CardSlot } from "./components/CardSlot";
import { CardView } from "./components/CardView";
import { advanceRoomIfNeeded, buildInitialState, checkGameClear, getRankValue } from "./gameLogic";
import { GameState } from "./types";

const INITIAL_STATE: GameState = buildInitialState();

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
      const canUseWeapon = weaponValue !== null && (game.lastSlainValue === null || value < game.lastSlainValue);

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
      // Null以外のRoomをシャッフルして山札の下に加える
      const nonNullRoom = game.room.filter((card) => card !== null);
      const shuffledRoom = [...nonNullRoom].sort(() => Math.random() - 0.5);
      const newDungeon = [...game.dungeon, ...shuffledRoom];

      // ダンジョンから4枚カードをドローして、roomにセットする
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
