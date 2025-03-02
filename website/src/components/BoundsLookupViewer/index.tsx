import React, { useEffect, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import styles from "./styles.module.scss";
import environment from "@site/src/environment";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";

enum GuideType {
  VisualBounds = 0,
  RealBounds = 1,
}

enum GuideElements {
  StaffSystems = 0,
  MasterBars = 1,
  Bars = 2,
  Beats = 3,
  Notes = 4,
  BeatTime = 5,
}

export interface BoundsLookupViewerProps {
  children: string | React.ReactElement;
}

export interface BoundsLookupViewersState {
  selectedType: GuideType;
  selectedElements: GuideElements;
}

export const BoundsLookupViewer: React.FC<BoundsLookupViewerProps> = ({
  children,
}) => {
  const [api, element] = useAlphaTab((s)=>{
    s.core.tex = true;
    s.core.tracks = "all";
    s.core.includeNoteBounds = true;
  });

  useAlphaTabEvent(api, "postRenderFinished", () => {
    updateVisualGuides();
  });

  const [selectedType, setSelectedType] = useState(GuideType.VisualBounds);
  const [selectedElements, setSelectedElements] = useState(
    GuideElements.StaffSystems
  );

  const updateVisualGuides = () => {
    if(!api) {
      return;
    }

    const container = element.current;
    let guidesWrapper = container!.querySelector<HTMLDivElement>(".at-guides");
    if (!guidesWrapper) {
      container!.style.position = "relative";
      guidesWrapper = document.createElement("div");
      guidesWrapper.classList.add("at-guides");
      guidesWrapper.style.position = "absolute";
      guidesWrapper.style.zIndex = "1000";
      guidesWrapper.style.display = "inline";
      guidesWrapper.style.pointerEvents = "none";
      guidesWrapper.style.top = "0";
      guidesWrapper.style.left = "0";
      guidesWrapper.style.right = "0";
      guidesWrapper.style.bottom = "0";
      container!.insertBefore(guidesWrapper, container!.firstChild);
    } else {
      guidesWrapper.innerHTML = "";
    }

    if (api.renderer.boundsLookup) {
      createStaveGroupGuides(guidesWrapper, api!.renderer.boundsLookup);
    }
  };

  useEffect(() => {
    updateVisualGuides();
  }, [selectedType, selectedElements]);

  const createStaveGroupGuides = (
    wrapper: HTMLDivElement,
    lookup: alphaTab.rendering.BoundsLookup
  ) => {
    for (const staveGroup of lookup.staffSystems) {
      if (selectedElements === GuideElements.StaffSystems) {
        createGuide(wrapper, staveGroup, "#1976d2");
      } else {
        createMasterBarGuides(wrapper, staveGroup);
      }
    }
  };

  const createMasterBarGuides = (
    wrapper: HTMLDivElement,
    staveGroup: alphaTab.rendering.StaffSystemBounds
  ) => {
    for (const masterBar of staveGroup.bars) {
      if (selectedElements === GuideElements.MasterBars) {
        createGuide(wrapper, masterBar, "#388e3c");
      } else {
        createBarGuides(wrapper, masterBar);
      }
    }
  };

  const createBarGuides = (
    wrapper: HTMLDivElement,
    masterBar: alphaTab.rendering.MasterBarBounds
  ) => {
    for (const bar of masterBar.bars) {
      if (selectedElements === GuideElements.Bars) {
        createGuide(wrapper, bar, "#fdd835");
      } else {
        createBeatGuides(wrapper, bar);
      }
    }
  };

  const createBeatGuides = (
    wrapper: HTMLDivElement,
    bar: alphaTab.rendering.BarBounds
  ) => {
    for (const beat of bar.beats) {
      if(selectedElements === GuideElements.BeatTime) {
        const bounds = new alphaTab.rendering.Bounds();
        bounds.x = beat.onNotesX;
        bounds.y = beat.realBounds.y;
        bounds.w = 2;
        bounds.h = beat.realBounds.h;
        createGuide(wrapper, bounds, "#e64a19");
      } else if (selectedElements === GuideElements.Beats) {
        createGuide(wrapper, beat, "#e64a19");
      } else {
        createNoteGuides(wrapper, beat);
      }
    }
  };

  const createNoteGuides = (
    wrapper: HTMLDivElement,
    beat: alphaTab.rendering.BeatBounds
  ) => {
    if (beat.notes) {
      for (const note of beat.notes) {
        createGuide(wrapper, note.noteHeadBounds, "#512da8");
      }
    }
  };

  const createGuide = (
    wrapper: HTMLDivElement,
    bounds:
      | alphaTab.rendering.Bounds
      | {
          visualBounds: alphaTab.rendering.Bounds;
          realBounds: alphaTab.rendering.Bounds;
        },
    color: string
  ) => {
    const guide = document.createElement("div");
    guide.style.position = "absolute";
    const rect =
      "x" in bounds
        ? bounds
        : selectedType === GuideType.VisualBounds
        ? bounds.visualBounds
        : bounds.realBounds;
    guide.style.left = rect.x + "px";
    guide.style.top = rect.y + "px";
    guide.style.width = rect.w + "px";
    guide.style.height = rect.h + "px";
    guide.style.border = `1px solid ${color}`;
    guide.style.background = hexToRgba(color, 0.5);
    wrapper.appendChild(guide);
  };

  const hexToRgba = (hex: string, alpha: number) => {
    let c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    const n = parseInt(c.join(""), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255},${alpha})`;
  };

  const typeClass = (ownType: GuideType) => {
    return ownType === selectedType ? " pills__item--active" : "";
  };

  const elementClass = (ownElements: GuideElements) => {
    return ownElements === selectedElements ? " pills__item--active" : "";
  };

  return (
    <>
      <div className={styles.toolbar}>
        <ul className="pills">
          <li
            className={`pills__item ${typeClass(GuideType.VisualBounds)}`}
            onClick={() => setSelectedType(GuideType.VisualBounds)}
          >
            Visual Bounds
          </li>
          <li
            className={`pills__item ${typeClass(GuideType.RealBounds)}`}
            onClick={() => setSelectedType(GuideType.RealBounds)}
          >
            Real Bounds
          </li>
        </ul>
        <span>|</span>
        <ul className="pills">
          <li
            className={`pills__item ${elementClass(
              GuideElements.StaffSystems
            )}`}
            onClick={() => setSelectedElements(GuideElements.StaffSystems)}
          >
            Staff System
          </li>
          <li
            className={`pills__item ${elementClass(GuideElements.MasterBars)}`}
            onClick={() => setSelectedElements(GuideElements.MasterBars)}
          >
            Master Bars
          </li>
          <li
            className={`pills__item ${elementClass(GuideElements.Bars)}`}
            onClick={() => setSelectedElements(GuideElements.Bars)}
          >
            Bars
          </li>
          <li
            className={`pills__item ${elementClass(GuideElements.Beats)}`}
            onClick={() => setSelectedElements(GuideElements.Beats)}
          >
            Beats
          </li>
          <li
            className={`pills__item ${elementClass(GuideElements.BeatTime)}`}
            onClick={() => setSelectedElements(GuideElements.BeatTime)}
          >
            Beat Time
          </li>          
          <li
            className={`pills__item ${elementClass(GuideElements.Notes)}`}
            onClick={() => setSelectedElements(GuideElements.Notes)}
          >
            Notes
          </li>
        </ul>
      </div>
      <div ref={element}>{children}</div>
    </>
  );
};
