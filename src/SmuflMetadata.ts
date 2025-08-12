/**
 * https://w3c.github.io/smufl/latest/specification/engravingdefaults.html
 * @record
 */
export interface SmuflEngravingDefaults {
    arrowShaftThickness: number;
    barlineSeparation: number;
    beamSpacing: number;
    beamThickness: number;
    bracketThickness: number;
    dashedBarlineDashLength: number;
    dashedBarlineGapLength: number;
    dashedBarlineThickness: number;
    hairpinThickness: number;
    legerLineExtension: number;
    legerLineThickness: number;
    lyricLineThickness: number;
    octaveLineThickness: number;
    pedalLineThickness: number;
    repeatBarlineDotSeparation: number;
    repeatEndingLineThickness: number;
    slurEndpointThickness: number;
    slurMidpointThickness: number;
    staffLineThickness: number;
    stemThickness: number;
    subBracketThickness: number;
    textEnclosureThickness: number;
    thickBarlineThickness: number;
    thinBarlineThickness: number;
    thinThickBarlineSeparation?: number;
    tieEndpointThickness: number;
    tieMidpointThickness: number;
    tupletBracketThickness: number;
}

/**
 * https://w3c.github.io/smufl/latest/specification/glyphbboxes.html
 * @record
 */
export interface SmuflGlyphBoundingBox {
    bBoxNE: [number, number];
    bBoxSW: [number, number];
}

/**
 * https://w3c.github.io/smufl/latest/specification/glyphswithanchors.html#glyphswithanchors
 * @record
 */
export interface SmuflGlyphWithAnchor {
    splitStemUpSE?: [number, number];
    splitStemUpSW?: [number, number];
    splitStemDownNE?: [number, number];
    splitStemDownNW?: [number, number];
    stemUpSE?: [number, number];
    stemDownNW?: [number, number];
    stemUpNW?: [number, number];
    stemDownSW?: [number, number];
    nominalWidth?: [number, number];
    numeralTop?: [number, number];
    numeralBottom?: [number, number];
    cutOutNE?: [number, number];
    cutOutSE?: [number, number];
    cutOutSW?: [number, number];
    cutOutNW?: [number, number];
    graceNoteSlashSW?: [number, number];
    graceNoteSlashNE?: [number, number];
    graceNoteSlashNW?: [number, number];
    graceNoteSlashSE?: [number, number];
    repeatOffset?: [number, number];
    noteheadOrigin?: [number, number];
    opticalCenter?: [number, number];
}

/**
 * The SmuFL Metadata object describing the structure needed by alphaTab.
 * https://w3c.github.io/smufl/latest/specification/font-specific-metadata.html
 * @record
 */
export interface SmuflMetadata {
    engravingDefaults: SmuflEngravingDefaults;
    glyphBBoxes?: Record<string, SmuflGlyphBoundingBox>;
    glyphsWithAnchors: Record<string, SmuflGlyphWithAnchor>;
}