import React from "react";
import { AlphaTab } from "../AlphaTab";

export const InitDemo: React.FC = () => {
  return (
    <div style={{ border: "1px solid #E5E6E7" }}>
      <AlphaTab tex={true}>{`
      \\title "Hello alphaTab" . :4 0.6 1.6 3.6 0.5 2.5 3.5 0.4 2.4 | 3.4 0.3 2.3
      0.2 1.2 3.2 0.1 1.1 | 3.1.1
    `}</AlphaTab>
    </div>
  );
};
