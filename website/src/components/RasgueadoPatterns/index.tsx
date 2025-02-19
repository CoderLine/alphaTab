import * as alphaTab from "@coderline/alphatab";
import { useEffect, useRef } from "react";
import styles from "./styles.module.scss";

type RasguadoItemMode = "down" | "up" | "head";
type RasgueadoPatternItem = {
  finger: string;
  mode: RasguadoItemMode;
  tuplet?: 3 | 5;
  bars?: number;
  flag?: alphaTab.model.MusicFontSymbol;
};

const RasgueadoPatternDefinition = new Map<
  alphaTab.model.Rasgueado,
  RasgueadoPatternItem[]
>([
  [
    alphaTab.model.Rasgueado.Ii,
    [
      { finger: "i", mode: "down", bars: 1 },
      { finger: "i", mode: "up" },
    ],
  ],

  [
    alphaTab.model.Rasgueado.Mi,
    [
      { finger: "m", mode: "down", bars: 1 },
      { finger: "i", mode: "down" },
    ],
  ],

  [
    alphaTab.model.Rasgueado.MiiTriplet,
    [
      { finger: "m", mode: "down", bars: 1, tuplet: 3 },
      { finger: "i", mode: "down", bars: 1, tuplet: 3 },
      { finger: "i", mode: "up", tuplet: 3 },
    ],
  ],

  [
    alphaTab.model.Rasgueado.MiiAnapaest,
    [
      { finger: "m", mode: "down", bars: 2 },
      { finger: "i", mode: "down", bars: 1 },
      { finger: "i", mode: "up" },
    ],
  ],

  [
    alphaTab.model.Rasgueado.PmpTriplet,
    [
      { finger: "p", mode: "up", bars: 1, tuplet: 3 },
      { finger: "m", mode: "down", bars: 1, tuplet: 3 },
      { finger: "p", mode: "down", tuplet: 3 },
    ],
  ],

  [
    alphaTab.model.Rasgueado.PmpAnapaest,
    [
      { finger: "p", mode: "up", bars: 2, tuplet: 3 },
      { finger: "m", mode: "down", bars: 1, tuplet: 3 },
      { finger: "p", mode: "down", tuplet: 3 },
    ],
  ],

  [
    alphaTab.model.Rasgueado.PeiTriplet,
    [
      { finger: "p", mode: "up", bars: 1, tuplet: 3 },
      { finger: "e", mode: "down", bars: 1, tuplet: 3 },
      { finger: "i", mode: "down", tuplet: 3 },
    ],
  ],

  [
    alphaTab.model.Rasgueado.PeiAnapaest,
    [
      { finger: "p", mode: "up", bars: 2 },
      { finger: "e", mode: "down", bars: 1 },
      { finger: "i", mode: "down" },
    ],
  ],

  [
    alphaTab.model.Rasgueado.PaiTriplet,
    [
      { finger: "p", mode: "up", bars: 1, tuplet: 3 },
      { finger: "a", mode: "down", bars: 1, tuplet: 3 },
      { finger: "i", mode: "down", tuplet: 3 },
    ],
  ],

  [
    alphaTab.model.Rasgueado.PaiAnapaest,
    [
      { finger: "p", mode: "up", bars: 2 },
      { finger: "a", mode: "down", bars: 1 },
      { finger: "i", mode: "down" },
    ],
  ],

  [
    alphaTab.model.Rasgueado.AmiTriplet,
    [
      { finger: "a", mode: "down", bars: 1, tuplet: 3 },
      { finger: "m", mode: "down", bars: 1, tuplet: 3 },
      { finger: "i", mode: "down", tuplet: 3 },
    ],
  ],

  [
    alphaTab.model.Rasgueado.AmiAnapaest,
    [
      { finger: "a", mode: "down", bars: 2, tuplet: 3 },
      { finger: "m", mode: "down", bars: 1, tuplet: 3 },
      { finger: "i", mode: "down", tuplet: 3 },
    ],
  ],

  [
    alphaTab.model.Rasgueado.Ppp,
    [
      { finger: "p", mode: "head", bars: 2, tuplet: 3 },
      { finger: "p", mode: "down", bars: 1, tuplet: 3 },
      { finger: "p", mode: "up", tuplet: 3 },
    ],
  ],

  [
    alphaTab.model.Rasgueado.Amii,
    [
      { finger: "a", mode: "down", bars: 2, tuplet: 3 },
      { finger: "m", mode: "down", bars: 2, tuplet: 3 },
      { finger: "i", mode: "down", tuplet: 3 },
      {
        finger: "i",
        mode: "up",
        flag: alphaTab.model.MusicFontSymbol.FlagEighthUp,
      },
    ],
  ],

  [
    alphaTab.model.Rasgueado.Amip,
    [
      { finger: "a", mode: "down", bars: 2, tuplet: 3 },
      { finger: "m", mode: "down", bars: 2, tuplet: 3 },
      { finger: "i", mode: "down", bars: 0, tuplet: 3 },
      {
        finger: "p",
        mode: "up",
        flag: alphaTab.model.MusicFontSymbol.FlagEighthUp,
      },
    ],
  ],

  [
    alphaTab.model.Rasgueado.Eami,
    [
      { finger: "e", mode: "down", bars: 2 },
      { finger: "a", mode: "down", bars: 2 },
      { finger: "m", mode: "down", bars: 2 },
      { finger: "i", mode: "down" },
    ],
  ],

  [
    alphaTab.model.Rasgueado.Eamii,
    [
      { finger: "e", mode: "down", bars: 2, tuplet: 5 },
      { finger: "a", mode: "down", bars: 2, tuplet: 5 },
      { finger: "m", mode: "down", bars: 2, tuplet: 5 },
      { finger: "i", mode: "down", bars: 2, tuplet: 5 },
      { finger: "i", mode: "up", tuplet: 5 },
    ],
  ],

  [
    alphaTab.model.Rasgueado.Peami,
    [
      { finger: "p", mode: "down", bars: 2, tuplet: 5 },
      { finger: "e", mode: "down", bars: 2, tuplet: 5 },
      { finger: "a", mode: "down", bars: 2, tuplet: 5 },
      { finger: "m", mode: "down", bars: 2, tuplet: 5 },
      { finger: "i", mode: "up", tuplet: 5 },
    ],
  ],
]);

type RasgueadoPatternProps = {
  rasgueado: alphaTab.model.Rasgueado;
};

const canvas = alphaTab.Environment.renderEngines.get("svg")!.createCanvas();
canvas.settings = new alphaTab.Settings();
canvas.settings.display.scale = 1.5;

export function RasgueadoPattern({ rasgueado }: RasgueadoPatternProps) {
  const pattern = RasgueadoPatternDefinition.get(rasgueado);

  const canvasRef = useRef<HTMLDivElement>(null);

  let name = alphaTab.model.Rasgueado[rasgueado].toLowerCase();
  if (name.endsWith("triplet")) {
    name = name.substring(0, name.length - 7) + " (triplet)";
  } else if (name.endsWith("anapaest")) {
    name = name.substring(0, name.length - 8) + " (anapaest)";
  }

  useEffect(() => {
    const canvasWidth = 64;
    const canvasHeight = 50;
    canvas.beginRender(
      canvasWidth * canvas.settings.display.scale,
      canvasHeight * canvas.settings.display.scale
    );
    const canvasStyle = window.getComputedStyle(canvasRef.current);

    const offset = 13;
    const actualWidth = (pattern.length - 1) * offset;

    const startX = (canvasWidth - actualWidth) / 2;

    // canvas.color = new alphaTab.model.Color(0, 0, 0, 25);
    // canvas.fillRect(0, 0, canvasWidth, canvasHeight);

    // canvas.fillRect(startX, 0, actualWidth, canvasHeight);

    canvas.color = new alphaTab.model.Color(0, 0, 0);

    canvas.font = alphaTab.model.Font.fromJson(canvasStyle.font).withSize(10);
    canvas.font.families = [canvas.font.families[0]];
    canvas.font.weight = 1;
    canvas.font.style = alphaTab.model.FontStyle.Italic;
    canvas.textAlign = alphaTab.platform.TextAlign.Center;
    canvas.textBaseline = alphaTab.platform.TextBaseline.Middle;

    let x = startX - 0.5;

    const hasTuplet = pattern.some((p) => p.tuplet !== undefined);
    let tupletBracketStartX = -1;
    let tupletBracketEndX = -1;
    let tupletNumber = -1;

    const topLineY = 10;
    const bottomLineY = 25;
    const arrowY = bottomLineY + 1;

    const arrowHeadSize = 2.5;
    const arrowLength = 12;

    const fingerY = arrowY + arrowLength + 5;

    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i].bars) {
        if (i < pattern.length - 1) {
          let by = topLineY;
          for (let b = 0; b < pattern[i].bars; b++) {
            canvas.fillRect(x, by, offset, 3);
            by += 5;
          }
        }
      }

      if (pattern[i].flag) {
        canvas.fillMusicFontSymbol(x, topLineY, 0.5, pattern[i].flag, false);
      }

      switch (pattern[i].mode) {
        case "down":
          canvas.moveTo(x, topLineY);
          canvas.lineTo(x, bottomLineY);
          canvas.stroke();
          canvas.moveTo(x, arrowY + arrowHeadSize);
          canvas.lineTo(x, arrowY + arrowLength);
          canvas.stroke();

          canvas.moveTo(x, arrowY);
          canvas.lineTo(x + arrowHeadSize, arrowY + arrowHeadSize * 1.5);
          canvas.lineTo(x - arrowHeadSize, arrowY + arrowHeadSize * 1.5);
          canvas.fill();
          break;

        case "up":
          canvas.moveTo(x, topLineY);
          canvas.lineTo(x, bottomLineY);
          canvas.stroke();

          canvas.moveTo(x, arrowY);
          canvas.lineTo(x, arrowY + arrowLength - arrowHeadSize);
          canvas.stroke();

          canvas.moveTo(x, arrowY + arrowLength);
          canvas.lineTo(
            x + arrowHeadSize,
            arrowY + arrowLength - arrowHeadSize * 1.5
          );
          canvas.lineTo(
            x - arrowHeadSize,
            arrowY + arrowLength - arrowHeadSize * 1.5
          );
          canvas.fill();

          break;
        case "head":
          const noteHeadScale = 0.5;
          let noteHeadHeight = 9 * noteHeadScale;
          let noteHeadWidth = 10 * noteHeadScale;
          const noteHeadY = bottomLineY + noteHeadHeight;
          canvas.moveTo(x, topLineY);
          canvas.lineTo(x, noteHeadY);
          canvas.stroke();

          canvas.lineWidth = 0.5;
          canvas.moveTo(x - noteHeadWidth - 1, noteHeadY - noteHeadHeight / 2);
          canvas.lineTo(x + 2, noteHeadY - noteHeadHeight / 2);
          canvas.stroke();
          canvas.lineWidth = 1;

          canvas.fillMusicFontSymbol(
            x - noteHeadWidth,
            noteHeadY,
            noteHeadScale,
            alphaTab.model.MusicFontSymbol.NoteheadBlack,
            false
          );
          canvas.fillMusicFontSymbol(
            x - noteHeadWidth,
            noteHeadY + noteHeadHeight + 4,
            noteHeadScale,
            alphaTab.model.MusicFontSymbol.StringsDownBow,
            false
          );
          break;
      }

      canvas.fillText(pattern[i].finger, x, fingerY);

      if (pattern[i].tuplet !== undefined) {
        tupletNumber = pattern[i].tuplet;
        if (tupletBracketStartX === -1) {
          tupletBracketStartX = x;
        }
        tupletBracketEndX = x;
      }

      x += offset;
    }

    if (hasTuplet) {
      tupletBracketStartX = (tupletBracketStartX | 0) + 0.5;
      tupletBracketEndX = (tupletBracketEndX | 0) - 0.5;
      const tupletWidth = tupletBracketEndX - tupletBracketStartX;
      const numberSpace = 10;
      const bracketY = 4.5;
      canvas.moveTo(tupletBracketStartX, bracketY + 3);
      canvas.lineTo(tupletBracketStartX, bracketY);
      canvas.lineTo(
        tupletBracketStartX + tupletWidth / 2 - numberSpace / 2,
        bracketY
      );
      canvas.moveTo(
        tupletBracketStartX + tupletWidth / 2 + numberSpace / 2,
        bracketY
      );
      canvas.lineTo(tupletBracketEndX, bracketY);
      canvas.lineTo(tupletBracketEndX, bracketY + 3);
      canvas.stroke();

      canvas.fillText(
        `${tupletNumber}`,
        tupletBracketStartX + tupletWidth / 2,
        bracketY
      );
    }

    canvasRef.current.innerHTML = canvas.endRender() as string;
  }, []);

  return (
    <div className={styles.rasgueado}>
      <div ref={canvasRef}></div>
      {name}
      <code>{alphaTab.model.Rasgueado[rasgueado]}</code>
    </div>
  );
}

export function RasgueadoPatterns() {
  const patterns = Object.values(alphaTab.model.Rasgueado).filter(
    (t) =>
      typeof t === "number" &&
      (t as alphaTab.model.Rasgueado) !== alphaTab.model.Rasgueado.None
  ) as alphaTab.model.Rasgueado[];
  return (
    <div className={styles.wrapper}>
      {patterns.map((p) => (
        <RasgueadoPattern rasgueado={p} />
      ))}
    </div>
  );
}
