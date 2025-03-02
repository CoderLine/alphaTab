import React from "react";
import styles from "./styles.module.scss";

export type SinceBadgeProps = {
  since?: string;
  inline?: boolean;
};
export const SinceBadge: React.FC<SinceBadgeProps> = ({ since, inline }) => {
  if (since) {
    return (
      <span
        className={`badge badge--info ${styles.since} ${
          inline ? styles.sinceInline : ""
        }`}
      >
        since {since}
      </span>
    );
  } else {
    return <></>;
  }
};
