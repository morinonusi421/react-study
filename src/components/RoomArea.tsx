import { css } from "@emotion/react";
import { colors } from "../styles/tokens";
import { Card } from "../types";
import { CardSlot } from "./CardSlot";

interface RoomAreaProps {
  room: (Card | null)[];
  newCardIndices: number[];
  onCardClick: (index: number) => void;
  onAnimationEnd: (index: number) => void;
}

const styles = {
  area: css({
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
    padding: "20px 16px 16px",
  }),
  label: css({
    color: colors.textWhiteMuted,
    fontSize: "13px",
    fontWeight: "bold",
    letterSpacing: "1px",
    textTransform: "uppercase",
  }),
  slots: css({ display: "flex", gap: "10px" }),
};

export function RoomArea({ room, newCardIndices, onCardClick, onAnimationEnd }: RoomAreaProps) {
  return (
    <div css={styles.area}>
      <span css={styles.label}>Room</span>
      <div css={styles.slots}>
        {room.map((card, i) => {
          const newIndex = newCardIndices.indexOf(i);
          const isNew = newIndex >= 0;
          return (
            <CardSlot
              key={i}
              card={card}
              onClick={() => onCardClick(i)}
              isNew={isNew}
              animationDelay={isNew ? newIndex * 50 : 0}
              onAnimationEnd={isNew ? () => onAnimationEnd(i) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
