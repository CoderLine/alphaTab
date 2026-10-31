import React, { useEffect } from "react";
import * as alphaTab from "@coderline/alphatab";
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi } from '@coderline/alphatab-react';
import CodeBlock from "@theme/CodeBlock";
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';

const tex = `
    \\title "Song Title"
    \\subtitle Subtitle
    \\artist Artist
    .
    `;

function adjustStyle(score: alphaTab.model.Score) {
  // ensure we have a score style
  if (!score.style) {
    score.style = new alphaTab.model.ScoreStyle();
  }

  // set a new style for the title
  score.style.headerAndFooter.set(
    alphaTab.model.ScoreSubElement.Title,
    new alphaTab.model.HeaderFooterStyle(
      "%TITLE% - %SUBTITLE%", // text template
      true, // visible?
      alphaTab.platform.TextAlign.Left,
    ),
  );
  score.style.colors.set(
    alphaTab.model.ScoreSubElement.Title,
    alphaTab.model.Color.fromJson("#FF0000")!,
  );

  // hide the subtitle
  score.style.headerAndFooter.set(
    alphaTab.model.ScoreSubElement.SubTitle,
    new alphaTab.model.HeaderFooterStyle(
      "", // text template
      false, // visible?
      alphaTab.platform.TextAlign.Left,
    ),
  );
}

const FormattingTemplateInner: React.FC = () => {
  const api = useAlphaTabApi();

  useEffect(() => {
    if (!api) { return; }
    const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
      new TextEncoder().encode(tex),
    );
    adjustStyle(score);
    api.renderScore(score, [0]);
  }, [api]);

  return null;
};

export const FormattingTemplateSample: React.FC = () => {
  const site = useSiteAlphaTabSettings();

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
      <AlphaTabProvider
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <FormattingTemplateInner />
        <AlphaTabHost />
      </AlphaTabProvider>
      <CodeBlock language="js">{trimmed}</CodeBlock>
    </div>
  );
};
