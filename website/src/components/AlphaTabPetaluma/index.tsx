import React, { useEffect } from "react";
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi } from '@coderline/alphatab-react';
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';

export interface AlphaTabPetalumaProps {
  children: string | React.ReactElement;
}

function ApplyPetalumaMetadata() {
  const api = useAlphaTabApi();
  useEffect(() => {
    if (!api) { return; }
    const request = new XMLHttpRequest();
    request.open("GET", "/files/petaluma/petaluma_metadata.json", true);
    request.responseType = "json";
    request.onload = () => {
      api.settings.display.resources.engravingSettings.fillFromSmufl(
        request.response
      );
      api.updateSettings();
      if (api.score) {
        api.render();
      }
    };
    request.send();
    return () => {
      request.abort();
    };
  }, [api]);
  return null;
}

export const AlphaTabPetaluma: React.FC<AlphaTabPetalumaProps> = ({
  children,
}) => {
  const tex = typeof children === "string" ? children : undefined;
  const site = useSiteAlphaTabSettings({
    player: true,
    settings: {
      core: {
        // Plain object form is accepted by settings.fillFromJson at runtime;
        // the typed API expects a Map so cast through unknown.
        smuflFontSources: {
          OpenType: "/files/petaluma/Petaluma.otf",
        } as unknown as Map<3, string>,
      },
    },
  });
  return (
    <AlphaTabProvider
      tex={tex}
      configureSettings={site.configureSettings}
      settings={site.settings}
    >
      <ApplyPetalumaMetadata />
      <AlphaTabHost />
    </AlphaTabProvider>
  );
};
