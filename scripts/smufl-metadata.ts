import fs from 'node:fs';
import url from 'node:url';
import { MusicFontSymbol } from '../src/model/MusicFontSymbol';

const input = process.argv[2];
const output = process.argv[3];

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const metadata = JSON.parse(await fs.promises.readFile(input, 'utf-8'));

const outputMetadata = {
    engravingDefaults: metadata.engravingDefaults,
    glyphBBoxes: {},
    glyphsWithAnchors: {}
};

const alphaTabUsedGlyphs = new Set<string>();
for(const [_,name] of Object.entries(MusicFontSymbol).filter(e => typeof e[1] === "string")) {
    alphaTabUsedGlyphs.add(name.toString().toLowerCase());
}

for(const name of Object.keys(metadata.glyphBBoxes)) {
    if(alphaTabUsedGlyphs.has(name.toLowerCase())) {
        outputMetadata.glyphBBoxes[name] = metadata.glyphBBoxes[name];
    }
}

for(const name of Object.keys(metadata.glyphsWithAnchors)) {
    if(alphaTabUsedGlyphs.has(name.toLowerCase())) {
        outputMetadata.glyphsWithAnchors[name] = metadata.glyphsWithAnchors[name];
    }
}

await fs.promises.writeFile(output, 
    JSON.stringify(outputMetadata, null, 4)
);
