import { useRef, useEffect } from "react";
import { css } from "@emotion/react";
import { colors } from "../styles/tokens";

interface LogAreaProps {
  logs: string[];
}

const styles = {
  area: css({
    flex: 1,
    overflowY: "auto",
    margin: "0 16px 12px",
    padding: "10px 12px",
    background: colors.panelBgDark,
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minHeight: "60px",
  }),
  entry: css({
    color: colors.textLogEntry,
    fontSize: "13px",
    lineHeight: 1.5,
    "::before": { content: '"▸ "', color: colors.textLogBullet },
  }),
};

export function LogArea({ logs }: LogAreaProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div css={styles.area} ref={ref}>
      {logs.map((log, i) => (
        <div key={i} css={styles.entry}>
          {log}
        </div>
      ))}
    </div>
  );
}
