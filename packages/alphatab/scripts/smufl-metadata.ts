import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { SmuflMetadata } from '@coderline/alphatab/SmuflMetadata';

const input = process.argv[2];
const output = process.argv[3];

const metadata: SmuflMetadata = JSON.parse(await fs.promises.readFile(input, 'utf-8'));

const outputMetadata:SmuflMetadata = {
    engravingDefaults: metadata.engravingDefaults,
    glyphBBoxes: {},
    glyphsWithAnchors: {}
};

const alphaTabUsedGlyphs = new Set<string>();
for(const [_,name] of Object.entries(MusicFontSymbol).filter(e => typeof e[1] === "string")) {
    alphaTabUsedGlyphs.add(name.toString().toLowerCase());
}

for(const [k,_] of EngravingSettings.smuflNameToGlyphNameMapping) {
    alphaTabUsedGlyphs.add(k.toLowerCase());
}

for(const name of Object.keys(metadata.glyphBBoxes!)) {
    if(alphaTabUsedGlyphs.has(name.toLowerCase())) {
        const alphaTabName = EngravingSettings.smuflNameToGlyphNameMapping.has(name) ? EngravingSettings.smuflNameToGlyphNameMapping.get(name)! : name;
        outputMetadata.glyphBBoxes![alphaTabName] = metadata.glyphBBoxes![name];
    }
}

for(const name of Object.keys(metadata.glyphsWithAnchors)) {
    if(alphaTabUsedGlyphs.has(name.toLowerCase())) {
        const alphaTabName = EngravingSettings.smuflNameToGlyphNameMapping.has(name) ? EngravingSettings.smuflNameToGlyphNameMapping.get(name)! : name;
        outputMetadata.glyphsWithAnchors[alphaTabName] = metadata.glyphsWithAnchors[name];
    }
}

await fs.promises.writeFile(output, 
    JSON.stringify(outputMetadata, null, 4)
);

if(process.argv[4] === 'true') {
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
    const smuflMetricsFile = path.resolve(__dirname, '..', 'src', 'EngravingSettings.ts');
    let source = await fs.promises.readFile(smuflMetricsFile, 'utf-8');
    const beginMarker = 'begin bravura_alphatab_metadata';
    const endMarker = 'end bravura_alphatab_metadata';
    const tsCode = JSON.stringify(outputMetadata, null, 4).replaceAll('"', "");
    source = source.replace(
        new RegExp(`^( +)// ${beginMarker}.+?// ${endMarker}`, 'ms'), 
        (_match, leadingSpace) => 
            `${leadingSpace}// ${beginMarker}\n${leadingSpace}${tsCode}\n${leadingSpace}// ${endMarker}` 
    );
    await fs.promises.writeFile(smuflMetricsFile, source);  
}