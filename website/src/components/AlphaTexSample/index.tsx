import React from "react";
import CodeBlock from "@theme/CodeBlock";
import { AlphaTab } from "../AlphaTab";
import * as alphaTab from "@coderline/alphatab";
import {useDoc} from '@docusaurus/plugin-content-docs/client';

export interface AlphaTexSampleProps {
  tracks?: number[] | "all";
  children: string | React.ReactElement;
  player: boolean;
  settings?: alphaTab.json.SettingsJson;
}

export const AlphaTexSample: React.FC<AlphaTexSampleProps> = ({
  tracks,
  children,
  player,
  settings,
}) => {
  return (
    <>
      <AlphaTab tex={true} player={player} tracks={tracks} settings={settings}>
        {children}
      </AlphaTab>
      <CodeBlock>
        {typeof children === "string" ? children.trim() : children}
      </CodeBlock>
    </>
  );
};
