import React from "react";
import styles from "./styles.module.scss";

export interface PlayerProgressIndicatorProps {
  percentage: number;
}

export const PlayerProgressIndicator: React.FC<
  PlayerProgressIndicatorProps
> = ({ percentage }) => {
  const v = percentage * 100;

  const radius = 16;
  const stroke = 2;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  return (
    percentage < 0.99 && (
      <div className={styles.progress}>
        <svg width={radius * 2} height={radius * 2}>
          <circle
            stroke="white"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset: circumference - (v / 100) * circumference,
              transformOrigin: `50% 50%`,
              transform: "rotate(-90deg)",
            }}
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        <div className={`${styles["progress-value"]}`}>
          <span className={styles["progress-value-number"]}>{v | 0}</span>
          <sup className="small">%</sup>
        </div>
      </div>
    )
  );
};
