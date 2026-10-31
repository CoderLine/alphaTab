import React, { useEffect } from "react";
import type * as alphaTab from "@coderline/alphatab";
import { PlayerProvider, PlayerHost } from '@coderline/alphatab-ui';
import { useAlphaTabApi } from '@coderline/alphatab-react';
import { useAlphaTabModule, type AlphaTabModule } from '@site/src/alphatab-react';
import CodeBlock from "@theme/CodeBlock";

const tex = `
    \\title "Song Title"
    \\subtitle Subtitle
    \\artist Artist
    .
    `;

function adjustStyle(module: AlphaTabModule, score: alphaTab.model.Score) {
  // ensure we have a score style
  if (!score.style) {
    score.style = new module.model.ScoreStyle();
  }

  // set a new style for the title
  score.style.headerAndFooter.set(
    module.model.ScoreSubElement.Title,
    new module.model.HeaderFooterStyle(
      "%TITLE% - %SUBTITLE%", // text template
      true, // visible?
      module.platform.TextAlign.Left,
    ),
  );
  score.style.colors.set(
    module.model.ScoreSubElement.Title,
    module.model.Color.fromJson("#FF0000")!,
  );

  // hide the subtitle
  score.style.headerAndFooter.set(
    module.model.ScoreSubElement.SubTitle,
    new module.model.HeaderFooterStyle(
      "", // text template
      false, // visible?
      module.platform.TextAlign.Left,
    ),
  );
}

const FormattingTemplateInner: React.FC = () => {
  const api = useAlphaTabApi();
  const module = useAlphaTabModule();

  useEffect(() => {
    if (!api || !module) { return; }
    const score = module.importer.ScoreLoader.loadScoreFromBytes(
      new TextEncoder().encode(tex),
    );
    adjustStyle(module, score);
    api.renderScore(score, [0]);
  }, [api, module]);

  return null;
};

export const FormattingTemplateSample: React.FC = () => {
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

  return (
    <div>
      <PlayerProvider player={true}>
        <FormattingTemplateInner />
        <PlayerHost />
      </PlayerProvider>
      <CodeBlock language="js">{trimmed}</CodeBlock>
    </div>
  );
};
