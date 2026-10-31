import React from "react";
import styles from "./styles.module.scss";

export interface BoundedScoreFrameProps {
  children: React.ReactNode;
  maxHeight?: number | string;
  overflow?: "auto" | "x" | "y";
}

export const BoundedScoreFrame: React.FC<BoundedScoreFrameProps> = ({
  children,
  maxHeight = 420,
  overflow = "auto",
}) => {
  const overflowStyle: React.CSSProperties =
    overflow === "x"
      ? { overflowX: "auto", overflowY: "hidden" }
      : overflow === "y"
        ? { overflowY: "auto", overflowX: "hidden" }
        : { overflow: "auto" };

  return (
    <div
      className={styles.frame}
      style={{
        maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
        ...overflowStyle,
      }}
    >
      {children}
    </div>
  );
};
