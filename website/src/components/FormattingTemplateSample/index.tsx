import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import react, { useEffect } from "react";
import * as alphaTab from "@coderline/alphatab";
import CodeBlock from "@theme/CodeBlock";

export const FormattingTemplateSample: react.FC = () => {
  const tex = `
    \\title "Song Title"
    \\subtitle Subtitle
    \\artist Artist
    .
    `;
  const [api, element] = useAlphaTab((s) => {});

  function adjustStyle(score:alphaTab.model.Score) {
    // ensure we have a score style 
    if(!score.style) {
        score.style = new alphaTab.model.ScoreStyle();
    }

    // set a new style for the title
    score.style.headerAndFooter.set(
        alphaTab.model.ScoreSubElement.Title,
        new alphaTab.model.HeaderFooterStyle(
            "%TITLE% - %SUBTITLE%", // text template
            true, // visible? 
            alphaTab.platform.TextAlign.Left
        )
    );
    score.style.colors.set(
        alphaTab.model.ScoreSubElement.Title,
        alphaTab.model.Color.fromJson("#FF0000")
    );

    // hide the subtitle
    score.style.headerAndFooter.set(
        alphaTab.model.ScoreSubElement.SubTitle,
        new alphaTab.model.HeaderFooterStyle(
            "", // text template
            false, // visible? 
            alphaTab.platform.TextAlign.Left
        )
    );    
  }

  const codeLines = `
  function adjustStyle(score: alphaTab.model.Score) {
      // ensure we have a score style 
      if(!score.style) {
          score.style = new alphaTab.model.ScoreStyle();
      }

      // set a new style for the title
      score.style.headerAndFooter.set(
          alphaTab.model.ScoreSubElement.Title,
          new alphaTab.model.HeaderFooterStyle(
              "%TITLE% - %SUBTITLE%", // text template
              true, // visible? 
              alphaTab.platform.TextAlign.Left
          )
      );
      score.style.colors.set(
          alphaTab.model.ScoreSubElement.Title,
          alphaTab.model.Color.fromJson("#FF0000")
      );

      // hide the subtitle
      score.style.headerAndFooter.set(
          alphaTab.model.ScoreSubElement.SubTitle,
          new alphaTab.model.HeaderFooterStyle(
              "", // text template
              false, // visible? 
              alphaTab.platform.TextAlign.Left
          )
      );    
  }

  // Variant A: Adjust when the song is loaded manually
  const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(loadFileFromSomewhere());
  adjustStyle(score);
  alphaTabApi.renderScore(score, [0]);

  // Variant B: Adjust the style later at any point
  adjustStyle(api.score);
  alphaTabApi.renderScore(score, [0]);

  // Variant C: Listen for any new score loaded and adjust it
  alphaTabApi.scoreLoaded.on(score => {
      adjustStyle(score);
  });
  `.split("\n");

  const indent =
    codeLines.find((l) => l.length > 0)?.match(/^([ ]+).*/)?.[1]?.length ?? 0;

  const trimmed = codeLines
    .map((l) => l.substring(indent))
    .join("\n")
    .trim();

  useEffect(() => {
    if (api) {
      const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
        new TextEncoder().encode(tex)
      );
      adjustStyle(score);
      api.renderScore(score, [0]);
    }
  }, [api]);

  return (
    <div>
      <div ref={element}></div>
      <CodeBlock language="js">{trimmed}</CodeBlock>
    </div>
  );
};
