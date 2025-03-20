import React from "react";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { SinceBadge } from "../SinceBadge";
import { PropertyDescription } from "../PropertyDescription";

export const SettingsHeader: React.FC = () => {
  const doc = useDoc();
  const since = doc.frontMatter.sidebar_custom_props?.since;
  return (
    <>
      {since && <SinceBadge since={since as string} />}
      <PropertyDescription showJson={true} />
    </>
  );
};
