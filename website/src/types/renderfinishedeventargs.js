import React from "react";
import {ParameterTable, ParameterRow} from '../parameter-table';

export function RenderFinishedEventArgs() {
  return (
    <ParameterTable>
      <ParameterRow platform="all" name="id" type="string">
        The unique id of the chunk to request rendering through [`renderResult`](/docs/reference/scorerenderer/renderresult)
        Since <span class="badge badge--info">1.3.0-alpha.139</span>
      </ParameterRow>
      <ParameterRow platform="all" name="x" type="int">
        The absolute x-position of the chunk within the overall music sheet.
        Since <span class="badge badge--info">1.3.0-alpha.139</span>
      </ParameterRow>
      <ParameterRow platform="all" name="y" type="int">
        The absolute y-position of the chunk within the overall music sheet.
        Since <span class="badge badge--info">1.3.0-alpha.139</span>
      </ParameterRow>
      <ParameterRow platform="all" name="width" type="int">
        The width of the current rendering result.
      </ParameterRow>
      <ParameterRow platform="all" name="height" type="int">
        The height of the current rendering result.
      </ParameterRow>
      <ParameterRow platform="all" name="totalWidth" type="int">
        The currently known total width of the final music sheet.
      </ParameterRow>
      <ParameterRow platform="all" name="totalHeight" type="int">
        The currently known total height of the final music sheet.
      </ParameterRow>
      <ParameterRow platform="all" name="firstMasterBarIndex" type="int">
        The index of the first masterbar that was rendered in this result.
      </ParameterRow>
      <ParameterRow platform="all" name="lastMasterBarIndex" type="int">
        The last masterbar that was rendered in this result.
      </ParameterRow>
      <ParameterRow platform="all" name="renderResult" type="object">
        The render engine specific result object which contains the rendered
        music sheet: 
        - For `svg` it will contain the raw SVG string, 
        - For `html5` it will contain a HTML5 canvas DOM element 
        - For `skia` it will contain a `SkImage` 
        - For `gdi` it will contain a `Bitmap`
      </ParameterRow>
    </ParameterTable>
  );
}
