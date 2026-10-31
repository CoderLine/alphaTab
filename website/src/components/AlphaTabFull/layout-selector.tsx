import * as alphaTab from "@coderline/alphatab";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as regular from "@fortawesome/free-regular-svg-icons";
import * as solid from "@fortawesome/free-solid-svg-icons";

export interface LayoutSelectorProps {
  onLayoutChange?: (
    layoutMode: alphaTab.LayoutMode | undefined,
    scrollMode: alphaTab.ScrollMode | undefined
  ) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  onLayoutChange,
}) => {
  const layouts = [
    {
      icon: solid.faWandSparkles,
      name: "Automatic",
      layoutMode: undefined,
      scrollMode: undefined,
    },
    {
      icon: regular.faCaretSquareRight,
      name: "Horizontal Layout (Off-Screen)",
      layoutMode: alphaTab.LayoutMode.Horizontal,
      scrollMode: alphaTab.ScrollMode.OffScreen,
    },
    {
      icon: solid.faCaretSquareRight,
      name: "Horizontal Layout (Bar-Wise)",
      layoutMode: alphaTab.LayoutMode.Horizontal,
      scrollMode: alphaTab.ScrollMode.Continuous,
    },
    {
      icon: regular.faCaretSquareDown,
      name: "Vertical Layout (Off-Screen)",
      layoutMode: alphaTab.LayoutMode.Page,
      scrollMode: alphaTab.ScrollMode.OffScreen,
    },
    {
      icon: solid.faCaretSquareDown,
      name: "Vertical Layout (System-Wise)",
      layoutMode: alphaTab.LayoutMode.Page,
      scrollMode: alphaTab.ScrollMode.Continuous,
    },
  ];

  return (
    <div className="dropdown dropdown--hoverable">
      <span>Layout</span>
      <ul className="dropdown__menu">
        {layouts.map((l) => (
          <li key={l.name}>
            <a
              className="dropdown__link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onLayoutChange?.(l.layoutMode, l.scrollMode);
              }}
            >
              <FontAwesomeIcon icon={l.icon}></FontAwesomeIcon>
              {l.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
