import React, { useState } from "react";
import { css, Global } from "@emotion/react";
import { colors } from "./styles/tokens";
import { BottomArea } from "./components/BottomArea";
import { GameOverlay } from "./components/GameOverlay";
import { LogArea } from "./components/LogArea";
import { RoomArea } from "./components/RoomArea";
import { StatusBar } from "./components/StatusBar";
import { applyFlee, applyFleeBlocked, applyRoomCard, buildInitialState } from "./gameLogic";
import { GameState } from "./types";

const globalStyles = css({
  "*, *::before, *::after": { boxSizing: "border-box" },
  body: { margin: 0, padding: 0, background: "#1a1a2e" },
});

const appStyle = css`
  position: relative;
  width: 100%;
  max-width: 390px;
  height: 100vh;
  height: 100dvh;
  max-height: 844px;
  margin: 0 auto;
  background: ${colors.appBg};
  display: flex;
  flex-direction: column;
  font-family: sans-serif;
  overflow: hidden;
`;

export default function App() {
  const [game, setGame] = useState<GameState>(() => buildInitialState());
  const [newCardIndices, setNewCardIndices] = useState<number[]>([0, 1, 2, 3]);

  function handleRoomCardClick(index: number) {
    if (game.phase !== "playing" || game.room[index] == null) return;
    const { state, newIndices } = applyRoomCard(game, index);
    setGame(state);
    setNewCardIndices(newIndices);
  }

  function handleDungeonClick() {
    if (game.phase !== "playing") return;
    if (game.canFlee) {
      const { state, newIndices } = applyFlee(game);
      setGame(state);
      setNewCardIndices(newIndices);
    } else {
      setGame(applyFleeBlocked(game));
    }
  }

  function handleRestart() {
    setGame(buildInitialState());
    setNewCardIndices([0, 1, 2, 3]);
  }

  return (
    <>
      <Global styles={globalStyles} />
      <div css={appStyle}>
        <GameOverlay phase={game.phase} score={game.score} onRestart={handleRestart} />
        <StatusBar health={game.health} score={game.score} />
        <RoomArea
          room={game.room}
          newCardIndices={newCardIndices}
          onCardClick={handleRoomCardClick}
          onAnimationEnd={(i) => setNewCardIndices((prev) => prev.filter((idx) => idx !== i))}
        />
        <LogArea logs={game.logs} />
        <BottomArea
          dungeonCount={game.dungeon.length}
          equippedWeapon={game.equippedWeapon}
          lastSlainValue={game.lastSlainValue}
          canFlee={game.canFlee}
          onFlee={handleDungeonClick}
        />
      </div>
    </>
  );
}
