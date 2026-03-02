import { css } from "@emotion/react";
import { colors } from "../styles/tokens";
import { Card } from "../types";
import { CardSlot } from "./CardSlot";
import { CardView } from "./CardView";

interface BottomAreaProps {
  dungeonCount: number;
  equippedWeapon: Card | null;
  lastSlainValue: number | null;
  canFlee: boolean;
  onFlee: () => void;
}

const styles = {
  area: css({
    display: "flex",
    justifyContent: "space-around",
    alignItems: "flex-start",
    padding: "16px 24px",
    paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
    background: colors.panelBgLight,
    flexShrink: 0,
  }),
  dungeonSection: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  }),
  dungeonCount: css({
    fontSize: "48px",
    fontWeight: "bold",
    color: colors.textWhite,
    lineHeight: 1,
  }),
  dungeonLabel: css({
    fontSize: "12px",
    fontWeight: "bold",
    color: colors.textWhiteFaint,
    letterSpacing: "0.5px",
  }),
  fleeButtonBase: css({
    marginTop: "4px",
    padding: "6px 20px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  }),
  fleeButtonActive: css({ background: colors.orange, color: colors.textWhite }),
  fleeButtonDisabled: css({
    background: colors.actionDisabledBg,
    color: colors.textWhiteVeryFaint,
    cursor: "default",
  }),
  weaponSection: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  }),
  weaponLabel: css({
    color: colors.textWhiteMuted,
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),
  weaponRestriction: css({
    color: colors.gold,
    fontSize: "13px",
    fontWeight: "bold",
  }),
};

export function BottomArea({ dungeonCount, equippedWeapon, lastSlainValue, canFlee, onFlee }: BottomAreaProps) {
  return (
    <div css={styles.area}>
      <div css={styles.dungeonSection}>
        <span css={styles.dungeonCount}>{dungeonCount}</span>
        <span css={styles.dungeonLabel}>残り山札</span>
        <button
          css={[styles.fleeButtonBase, canFlee ? styles.fleeButtonActive : styles.fleeButtonDisabled]}
          onClick={onFlee}
        >
          逃走
        </button>
      </div>

      <div css={styles.weaponSection}>
        <span css={styles.weaponLabel}>Weapon</span>
        {equippedWeapon ? <CardView card={equippedWeapon} /> : <CardSlot card={null} />}
        {lastSlainValue !== null && (
          <span css={styles.weaponRestriction}>使用制限 &lt; {lastSlainValue}</span>
        )}
      </div>
    </div>
  );
}
