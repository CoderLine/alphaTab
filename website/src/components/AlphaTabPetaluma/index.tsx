import React, { useEffect } from "react";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabControls,
} from "@site/src/alphatab-react";

export interface AlphaTabPetalumaProps {
  children: string | React.ReactElement;
}

function ApplyPetalumaMetadata() {
  const api = useAlphaTabApi();
  const controls = useAlphaTabControls();
  useEffect(() => {
    if (!api || !controls) return;
    const request = new XMLHttpRequest();
    request.open("GET", "/files/petaluma/petaluma_metadata.json", true);
    request.responseType = "json";
    request.onload = () => {
      api.settings.display.resources.engravingSettings.fillFromSmufl(
        request.response
      );
      controls.updateSettings();
    };
    request.send();
    return () => {
      request.abort();
    };
  }, [api, controls]);
  return null;
}

export const AlphaTabPetaluma: React.FC<AlphaTabPetalumaProps> = ({
  children,
}) => {
  const tex = typeof children === "string" ? children : undefined;
  return (
    <AlphaTabPlayer
      tex={tex}
      player={true}
      settings={{
        core: {
          // Plain object form is accepted by settings.fillFromJson at runtime;
          // the typed API expects a Map so cast through unknown.
          smuflFontSources: {
            OpenType: "/files/petaluma/Petaluma.otf",
          } as unknown as Map<3, string>,
        },
      }}
    >
      <ApplyPetalumaMetadata />
      <AlphaTabCanvas />
    </AlphaTabPlayer>
  );
};
