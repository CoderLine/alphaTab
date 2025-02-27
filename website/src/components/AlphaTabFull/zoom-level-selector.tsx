import * as alphaTab from "@coderline/alphatab";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";

export interface ZoomLevelSelectorProps {
  api: alphaTab.AlphaTabApi;
}

export const ZoomLevelSelector: React.FC<ZoomLevelSelectorProps> = ({
  api,
}) => {
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (api) {
      api.settings.display.scale = zoom / 100.0;
      api.updateSettings();
      api.render();
    }
  }, [zoom]);

  const zoomLevels = [25, 50, 75, 90, 100, 110, 125, 150, 200];

  return (
    <div className="dropdown dropdown--hoverable">
      <span title="Zoom Level">
        <FontAwesomeIcon icon={solid.faSearch}></FontAwesomeIcon>
        {zoom}%
      </span>
      <ul className="dropdown__menu">
        {zoomLevels.map((z) => (
          <li key={z}>
            <a
              className="dropdown__link"
              href="#"
              onClick={(e) => {
                e.preventDefault;
                setZoom(z);
              }}
            >
              {z}%
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
