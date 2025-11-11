import type { MetadataDoc } from '../../types';

export const voice: MetadataDoc = {
    tag: '\\voice',
    syntax: ['\\voice'],
    snippet: '\\voice $0',
    shortDescription: 'Start a new voice',
    longDescription: `Marks the start of a new voice.

    Unlike the structure in the data model, alphaTex expects you to define all bars of a voice, then all the bars of the next voice.

    It structure is: \`\\voice /* Voice 1 Bar 1*/ | /* Voice 1 Bar 2*/ \voice /* Voice 2 Bar 1*/ | /* Voice21 Bar 2*/\` Once a new voice starts, you again can define the notes starting from the first bar. alphaTab will try to consolidate inconsistencies in the number of bars across voices.
    `,
    values: [],
    examples: `
        \\track "Piano"
          \\staff{score} \\tuning piano \\instrument acousticgrandpiano
              \\voice 
                  c4 d4 e4 f4 | c4 d4 e4 f4
              \\voice 
                  c3 d3 e3 f3 | c3 d3 e3 f3
        
        \\track "Piano2"
          \\staff{score} \\tuning piano \\instrument acousticgrandpiano
              \\voice 
                  c4 d4 e4 f4 | c4 d4 e4 f4
              \\voice 
                  c3 d3 e3 f3
        `
};
