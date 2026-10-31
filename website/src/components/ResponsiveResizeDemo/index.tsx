import React, { useEffect, useRef, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
} from "@site/src/alphatab-react";

export interface ResponsiveResizeDemoProps {
  showCode?: boolean;
  file?: string;
  minWidth?: number;
}

function TrackContainerWidth({
  containerRef,
  onWidthChange,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onWidthChange: (n: number) => void;
}) {
  // alphaTab attaches its own ResizeObserver to the mount element and reflows
  // automatically when the outer frame changes size. This observer only feeds
  // the width readout above the score.
  const api = useAlphaTabApi();
  useEffect(() => {
    const node = containerRef.current;
    if (!node) { return; }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onWidthChange(Math.round(entry.contentRect.width));
      }
      // Some browsers debounce the internal observer more aggressively; give
      // alphaTab a nudge via its low-level resize hook when we know a change
      // has happened.
      api?.renderer.resizeRender();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef, api, onWidthChange]);
  return null;
}

export const ResponsiveResizeDemo: React.FC<ResponsiveResizeDemoProps> = ({
  showCode = true,
  file = "/files/features/Chords.gp5",
  minWidth = 400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [displayWidth, setDisplayWidth] = useState(0);

  useEffect(() => {
    if (!dragging) { return; }
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) { return; }
      const rect = containerRef.current.getBoundingClientRect();
      const next = Math.max(minWidth, e.clientX - rect.left);
      setWidth(next);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, minWidth]);

  const code = `import * as alphaTab from '@coderline/alphatab';

const container = getAlphaTabContainer();
const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp' },
});

// alphaTab attaches a ResizeObserver on Web — resize the container
// programmatically and the score reflows automatically.
api.resize.on((args) => {
  args.settings.display.scale =
    args.newWidth > 1300 ? 1.5 : args.newWidth > 800 ? 1.2 : 1.0;
});`;

  return (
    <div>
      <div
        style={{
          marginBottom: "0.5rem",
          fontSize: "0.85rem",
          color: "var(--ifm-color-emphasis-700)",
        }}
      >
        Drag the right edge to resize. Container width:{" "}
        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
          {displayWidth}px
        </span>
      </div>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: width !== null ? `${width}px` : "100%",
          maxWidth: "100%",
          border: "1px solid var(--ifm-color-emphasis-300)",
          borderRadius: "6px",
          overflow: "hidden",
          userSelect: dragging ? "none" : "auto",
        }}
      >
        <AlphaTabPlayer file={file} player={true}>
          <TrackContainerWidth
            containerRef={containerRef}
            onWidthChange={setDisplayWidth}
          />
          <AlphaTabCanvas />
        </AlphaTabPlayer>
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          title="Drag to resize"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "12px",
            height: "100%",
            cursor: "ew-resize",
            background:
              "linear-gradient(90deg, transparent 0, var(--ifm-color-emphasis-300) 50%, transparent 100%)",
            zIndex: 5,
          }}
        />
      </div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
