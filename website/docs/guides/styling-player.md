---
title: Styling Player
---

AlphaTab has some player related elements which can be adjusted with CSS. Description of the elements and the corresponding CSS classes can be found on this page. 
A full example with all styles activated can be found at [the full demo page](/docs/showcase/full)

## Selection (at-selection)

If enabled, users can select a playback range of alphaTab with the mouse. AlphaTab will generate a div element with the CSS class `at-selection` attached. 
Within this divs the individual parts of the selection are created. Usually some transparent background color is attached to the divs to visually indicate a selection 
without hiding any content.

```css
.at-selection div {
    background: rgba(64, 64, 255, 0.1);
}
```

![Selection](/img/guides/styling/at-selection.png)

## Bar Cursor (at-cursor-bar)

During playback alphaTab will place a div element at the area of the currently played bars. This div element gets the CSS class `at-cursor-bar` assigned. 
Usually some transparent background color is attached to the divs to visually indicate the played bar without hiding any content.

```css
.at-cursor-bar {
    background: rgba(255, 242, 0, 0.25);
}
```

![Bar Cursor](/img/guides/styling/at-cursor-bar.png)
      
## Beat Cursor (at-cursor-beat)

During playback alphaTab will place a div element at the area of the currently played beat and will animate it accordingly to indicate the ongoing playback. This div element gets the CSS class `at-cursor-beat` assigned. The width of the cursor also should be specified otherwise it might not be visible. 

```css
.at-cursor-beat {
    background: rgba(64, 64, 255, 0.75);
    width: 3px;
}
```

![Beat Cursor](/img/guides/styling/at-cursor-beat.png)
      
## Currently played elements (at-highlight)

This feature is only available when alphaTab is rendered as SVG in the browser. During playback alphaTab alphaTab will attach to all SVG groups that are related to a played beat 
the CSS class `at-highlight`. The CSS rules are SVG related in this case and usually both `fill` and `stroke` should be specified to ensure
all elements are colored. Depending on the SVG elements (lines, paths etc.) they might have a fill or stroke. 

```css
.at-highlight * {
    fill: #0078ff;
    stroke: #0078ff;
}
```

![Played Elements](/img/guides/styling/at-highlight.png)