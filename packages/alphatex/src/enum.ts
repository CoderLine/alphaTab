/** biome-ignore-all lint/style/useNamingConvention: Quite many mappings in here */
import type { ParameterValueDefinition } from '@coderline/alphatab-alphatex/types';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import { AlphaTexAccidentalMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { BarLineStyle } from '@coderline/alphatab/model/Bar';
import { BarreShape } from '@coderline/alphatab/model/BarreShape';
import { BendStyle } from '@coderline/alphatab/model/BendStyle';
import { BendType } from '@coderline/alphatab/model/BendType';
import { Clef } from '@coderline/alphatab/model/Clef';
import { Direction } from '@coderline/alphatab/model/Direction';
import { DynamicValue } from '@coderline/alphatab/model/DynamicValue';
import { FermataType } from '@coderline/alphatab/model/Fermata';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { Rasgueado } from '@coderline/alphatab/model/Rasgueado';
import {
    BracketExtendMode,
    TrackNameMode,
    TrackNameOrientation,
    TrackNamePolicy
} from '@coderline/alphatab/model/RenderStylesheet';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import { TripletFeel } from '@coderline/alphatab/model/TripletFeel';
import { WhammyType } from '@coderline/alphatab/model/WhammyType';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';

export const alphaTexMappedEnumLookup = {
    WhammyType,
    BendStyle,
    GraceType,
    FermataType,
    AlphaTexAccidentalMode,
    NoteAccidentalMode,
    BarreShape,
    Ottavia,
    Rasgueado,
    DynamicValue,
    BracketExtendMode,
    TrackNamePolicy,
    TrackNameOrientation,
    TrackNameMode,
    TextAlign,
    BendType,
    KeySignature,
    KeySignatureType,
    Clef,
    TripletFeel,
    BarLineStyle,
    SimileMark,
    Direction
};
export type AlphaTexMappedEnumName = keyof typeof alphaTexMappedEnumLookup;

export type AlphaTexMappedEnumMappingEntry =
    | (Pick<ParameterValueDefinition, 'shortDescription' | 'longDescription' | 'snippet'> &
          Partial<ParameterValueDefinition> & {
              aliases?: string[];
          })
    | null;

export const alphaTexMappedEnumMapping: {
    [K in AlphaTexMappedEnumName]: Record<keyof (typeof alphaTexMappedEnumLookup)[K], AlphaTexMappedEnumMappingEntry>;
} = {
    WhammyType: {
        None: null,
        Custom: { snippet: 'custom', shortDescription: 'Non standard custom whammys with multiple points' },
        Dive: { snippet: 'dive', shortDescription: 'A gradual change between two points' },
        Dip: { snippet: 'dip', shortDescription: 'A A->B->A whammy pattern.' },
        Hold: { snippet: 'hold', shortDescription: 'Holding whammys (on tied notes).' },
        Predive: { snippet: 'predive', shortDescription: 'Press/pull before playing the note and then kept' },
        PrediveDive: {
            snippet: 'prediveDive',
            shortDescription: 'Whammy bar is pressed/pulled before playing the note and then further pressed/released'
        }
    },
    BendStyle: {
        Default: {
            snippet: 'default',
            shortDescription: '',
            longDescription: 'No additional text is shown, the offsets and values are respected as specified.'
        },
        Gradual: {
            snippet: 'gradual',
            shortDescription: '',
            longDescription:
                'Will show an additional "grad." on the line. The audio is generated according to the type spread evenly across the play duration.'
        },
        Fast: {
            snippet: 'fast',
            shortDescription: '',
            longDescription:
                'No additional text is shown. The audio is generated according to the type spread evenly across the fixed duration set via settings.player.songBookBendDuration.'
        }
    },
    GraceType: {
        None: null,
        OnBeat: {
            snippet: 'onBeat',
            shortDescription: 'On-Beat',
            longDescription:
                'An On-Beat grace note where this beat will start at the play time of the next beat and steal its play time from the next beat.',
            aliases: ['ob']
        },
        BeforeBeat: {
            snippet: 'beforeBeat',
            shortDescription: 'Before-Beat',
            longDescription:
                'A Before-Beat grace note where this beat will start before the next beat and steal its play time from the previous beat.',

            aliases: ['bb']
        },
        BendGrace: {
            snippet: 'bendGrace',
            shortDescription: 'Bend',
            longDescription:
                "A bend grace note, a mechanism used in alphaTab for the 'songbook style' bends notes. You will likely not apply this type manually.",
            aliases: ['b']
        }
    },
    FermataType: {
        Short: { snippet: 'short', shortDescription: '' },
        Medium: { snippet: 'medium', shortDescription: '' },
        Long: { snippet: 'long', shortDescription: '' }
    },
    AlphaTexAccidentalMode: {
        Auto: { snippet: 'auto', shortDescription: 'Automatic (Based on Pitch)' },
        Explicit: { snippet: 'explicit', shortDescription: 'Explicit (as Written)' }
    },
    NoteAccidentalMode: {
        Default: { snippet: 'default', shortDescription: 'Auto-detect the accidentals', aliases: ['d'] },
        ForceNone: { snippet: 'forceNone', shortDescription: 'Force no accidentals', aliases: ['-'] },
        ForceNatural: { snippet: 'forceNatural', shortDescription: 'Force a naturalize accidental', aliases: ['n'] },
        ForceSharp: { snippet: 'forceSharp', shortDescription: 'Force a sharp accidental', aliases: ['#'] },
        ForceDoubleSharp: {
            snippet: 'forceDoubleSharp',
            shortDescription: 'Force a double-sharp accidental',
            aliases: ['##', 'x']
        },
        ForceFlat: { snippet: 'forceFlat', shortDescription: 'Force a flat accidental', aliases: ['b'] },
        ForceDoubleFlat: {
            snippet: 'forceDoubleFlat',
            shortDescription: 'Force a double flat accidental',
            aliases: ['bb']
        }
    },
    BarreShape: {
        None: null,
        Full: { snippet: 'full', shortDescription: '' },
        Half: { snippet: 'half', shortDescription: '' }
    },
    Ottavia: {
        _15ma: { snippet: '15ma', shortDescription: 'Quindicesima (+2 octaves)', aliases: ['15ma'] },
        _8va: { snippet: '8va', shortDescription: 'Ottava (+1 octave)', aliases: ['8va'] },
        Regular: { snippet: 'regular', shortDescription: 'Regular' },
        _8vb: { snippet: '8vb', shortDescription: 'Ottava Bassa (-1 octave)', aliases: ['8vb'] },
        _15mb: { snippet: '15mb', shortDescription: 'Quindicesima bassa (-2 octaves)', aliases: ['15mb'] }
    },
    Rasgueado: {
        None: null,
        Ii: { snippet: 'ii', shortDescription: 'ii' },
        Mi: { snippet: 'mi', shortDescription: 'mi' },
        MiiTriplet: { snippet: 'miiTriplet', shortDescription: 'mii (triplet)' },
        MiiAnapaest: { snippet: 'miiAnapaest', shortDescription: 'mii (anapaest)' },
        PmpTriplet: { snippet: 'pmpTriplet', shortDescription: 'pmp (triplet)' },
        PmpAnapaest: { snippet: 'pmpAnapaest', shortDescription: 'pmp (anapaest)' },
        PeiTriplet: { snippet: 'peiTriplet', shortDescription: 'pei (triplet)' },
        PeiAnapaest: { snippet: 'peiAnapaest', shortDescription: 'pei (anapaest)' },
        PaiTriplet: { snippet: 'paiTriplet', shortDescription: 'pai (triplet)' },
        PaiAnapaest: { snippet: 'paiAnapaest', shortDescription: 'pai (anapaest)' },
        AmiTriplet: { snippet: 'amiTriplet', shortDescription: 'ami (triplet)' },
        AmiAnapaest: { snippet: 'amiAnapaest', shortDescription: 'ami (anapaest)' },
        Ppp: { snippet: 'ppp', shortDescription: 'ppp' },
        Amii: { snippet: 'amii', shortDescription: 'amii' },
        Amip: { snippet: 'amip', shortDescription: 'amip' },
        Eami: { snippet: 'eami', shortDescription: 'eami' },
        Eamii: { snippet: 'eamii', shortDescription: 'eamii' },
        Peami: { snippet: 'peami', shortDescription: 'peami' }
    },
    DynamicValue: {
        PPP: { snippet: 'ppp', shortDescription: '' },
        PP: { snippet: 'pp', shortDescription: '' },
        P: { snippet: 'p', shortDescription: '' },
        MP: { snippet: 'mp', shortDescription: '' },
        MF: { snippet: 'mf', shortDescription: '' },
        F: { snippet: 'f', shortDescription: '' },
        FF: { snippet: 'ff', shortDescription: '' },
        FFF: { snippet: 'fff', shortDescription: '' },
        PPPP: { snippet: 'pppp', shortDescription: '' },
        PPPPP: { snippet: 'ppppp', shortDescription: '' },
        PPPPPP: { snippet: 'pppppp', shortDescription: '' },
        FFFF: { snippet: 'ffff', shortDescription: '' },
        FFFFF: { snippet: 'fffff', shortDescription: '' },
        FFFFFF: { snippet: 'ffffff', shortDescription: '' },
        SF: { snippet: 'sf', shortDescription: '' },
        SFP: { snippet: 'sfp', shortDescription: '' },
        SFPP: { snippet: 'sfpp', shortDescription: '' },
        FP: { snippet: 'fp', shortDescription: '' },
        RF: { snippet: 'rf', shortDescription: '' },
        RFZ: { snippet: 'rfz', shortDescription: '' },
        SFZ: { snippet: 'sfz', shortDescription: '' },
        SFFZ: { snippet: 'sffz', shortDescription: '' },
        FZ: { snippet: 'fz', shortDescription: '' },
        N: { snippet: 'n', shortDescription: '' },
        PF: { snippet: 'pf', shortDescription: '' },
        SFZP: { snippet: 'sfzp', shortDescription: '' }
    },
    BracketExtendMode: {
        NoBrackets: {
            snippet: 'noBrackets',
            shortDescription: 'No brackets',
            longDescription: 'No brackets will be draw at all.'
        },
        GroupStaves: {
            snippet: 'groupStaves',
            shortDescription: 'Group staves of same track',
            longDescription:
                'The staves of the same track will be grouped together. If there are multiple "standard notation" staves a brace will be drawn, otherwise a bracket.'
        },
        GroupSimilarInstruments: {
            snippet: 'groupSimilarInstruments',
            shortDescription: 'Group similar instruments',
            longDescription:
                'Multiple tracks of the same instrument will be grouped together. No grouping happens if the staves of an instrument require a brace.'
        }
    },
    TrackNamePolicy: {
        Hidden: { snippet: 'hidden', shortDescription: 'Track names are hidden everywhere.' },
        FirstSystem: { snippet: 'firstSystem', shortDescription: 'Track names are displayed on the first system.' },
        AllSystems: { snippet: 'allSystems', shortDescription: 'Track names are displayed on all systems.' }
    },
    TrackNameOrientation: {
        Horizontal: { snippet: 'horizontal', shortDescription: 'Text is shown horizontally (left-to-right).' },
        Vertical: { snippet: 'vertical', shortDescription: 'Vertically rotated (bottom-to-top).' }
    },
    TrackNameMode: {
        FullName: { snippet: 'fullName', shortDescription: 'Short track names (abbreviations) are displayed.' },
        ShortName: { snippet: 'shortName', shortDescription: 'Full track names are displayed.' }
    },
    TextAlign: {
        Left: {
            snippet: 'left',
            shortDescription: 'Left-align the text'
        },
        Center: {
            snippet: 'center',
            shortDescription: 'Center-align the text'
        },
        Right: {
            snippet: 'right',
            shortDescription: 'Right-align the text'
        }
    },
    BendType: {
        None: null,
        Custom: { snippet: 'custom', shortDescription: 'A non-standard custom bends with multiple points' },
        Bend: { snippet: 'bend', shortDescription: 'A simple bend up to a higher note' },
        Release: { snippet: 'release', shortDescription: 'A release of bends down to a lower note' },
        BendRelease: { snippet: 'bendRelease', shortDescription: 'A bend directly followed by a release' },
        Hold: { snippet: 'hold', shortDescription: 'A bend which is held from the previous note' },
        Prebend: { snippet: 'prebend', shortDescription: 'A bend applied before the note is played' },
        PrebendBend: { snippet: 'prebendBend', shortDescription: 'A pre-bend followed by a bend' },
        PrebendRelease: { snippet: 'prebendRelease', shortDescription: 'A pre-bend followed by a release' }
    },
    KeySignature: {
        Cb: { snippet: 'cb', shortDescription: '', aliases: ['cbmajor', 'abminor'] },
        Gb: { snippet: 'gb', shortDescription: '', aliases: ['gbmajor', 'ebminor'] },
        Db: { snippet: 'db', shortDescription: '', aliases: ['dbmajor', 'bbminor'] },
        Ab: { snippet: 'ab', shortDescription: '', aliases: ['abmajor', 'fminor'] },
        Eb: { snippet: 'eb', shortDescription: '', aliases: ['ebmajor', 'cminor'] },
        Bb: { snippet: 'bb', shortDescription: '', aliases: ['bbmajor', 'gminor'] },
        F: { snippet: 'f', shortDescription: '', aliases: ['fmajor', 'dminor'] },
        C: { snippet: 'c', shortDescription: '', aliases: ['cmajor', 'aminor'] },
        G: { snippet: 'g', shortDescription: '', aliases: ['gmajor', 'eminor'] },
        D: { snippet: 'd', shortDescription: '', aliases: ['dmajor', 'bminor'] },
        A: { snippet: 'a', shortDescription: '', aliases: ['amajor', 'f#minor'] },
        E: { snippet: 'e', shortDescription: '', aliases: ['emajor', 'c#minor'] },
        B: { snippet: 'b', shortDescription: '', aliases: ['bmajor', 'g#minor'] },
        FSharp: { snippet: 'f#', shortDescription: '', aliases: ['f#major', 'd#minor', 'f#'] },
        CSharp: { snippet: 'c#', shortDescription: '', aliases: ['c#major', 'a#minor', 'c#'] }
    },
    KeySignatureType: {
        Major: {
            snippet: 'major',
            shortDescription: '',
            aliases: [
                'cb',
                'cbmajor',

                'gb',
                'gbmajor',

                'db',
                'dbmajor',

                'ab',
                'abmajor',

                'eb',
                'ebmajor',

                'bb',
                'bbmajor',

                'f',
                'fmajor',

                'c',
                'cmajor',

                'g',
                'gmajor',

                'd',
                'dmajor',

                'a',
                'amajor',

                'e',
                'emajor',

                'b',
                'bmajor',

                'f#',
                'f#major',

                'c#',
                'c#major'
            ]
        },
        Minor: {
            snippet: 'minor',
            shortDescription: '',
            aliases: [
                'abminor',
                'ebminor',
                'bbminor',
                'fminor',
                'cminor',
                'gminor',
                'dminor',
                'aminor',
                'eminor',
                'bminor',
                'f#minor',
                'c#minor',
                'g#minor',
                'd#minor',
                'a#minor'
            ]
        }
    },
    Clef: {
        Neutral: { snippet: 'neutral', shortDescription: '', aliases: ['n'] },
        C3: { snippet: 'c3', shortDescription: '', aliases: ['alto'] },
        C4: { snippet: 'c4', shortDescription: '', aliases: ['tenor'] },
        F4: { snippet: 'f4', shortDescription: '', aliases: ['bass'] },
        G2: { snippet: 'g2', shortDescription: '', aliases: ['treble'] }
    },
    TripletFeel: {
        NoTripletFeel: {
            snippet: 'none',
            shortDescription: 'No triplet feel',
            aliases: ['none', 'no']
        },
        Triplet16th: {
            snippet: 'triplet16th',
            shortDescription: 'Triplet 16th',
            aliases: ['t16', 'triplet-16th']
        },
        Triplet8th: {
            snippet: 'triplet8th',
            shortDescription: 'Triplet 8th',
            aliases: ['t8', 'triplet-8th']
        },
        Dotted16th: {
            snippet: 'dotted16th',
            shortDescription: 'Dotted 16th',
            aliases: ['d16', 'dotted-16th']
        },
        Dotted8th: {
            snippet: 'dotted8th',
            shortDescription: 'Dotted 8th',
            aliases: ['d8', 'dotted-8th']
        },
        Scottish16th: {
            snippet: 'scottish16th',
            shortDescription: 'Scottish 16th',
            aliases: ['s16', 'scottish-16th']
        },
        Scottish8th: {
            snippet: 'scottish8th',
            shortDescription: 'Scottish 8th',
            aliases: ['s8', 'scottish-8th']
        }
    },
    BarLineStyle: {
        Automatic: { snippet: 'automatic', shortDescription: 'Auto detect line to show' },
        Dashed: { snippet: 'dashed', shortDescription: '' },
        Dotted: { snippet: 'dotted', shortDescription: '' },
        Heavy: { snippet: 'heavy', shortDescription: '' },
        HeavyHeavy: { snippet: 'heavyHeavy', shortDescription: '' },
        HeavyLight: { snippet: 'heavyLight', shortDescription: '' },
        LightHeavy: { snippet: 'lightHeavy', shortDescription: '' },
        LightLight: { snippet: 'lightLight', shortDescription: '' },
        None: { snippet: 'none', shortDescription: '' },
        Regular: { snippet: 'regular', shortDescription: '' },
        Short: { snippet: 'short', shortDescription: '' },
        Tick: { snippet: 'tick', shortDescription: '' }
    },
    SimileMark: {
        None: {
            snippet: 'none',
            shortDescription: 'No simile mark is applied',
            deprecated: 'Do not apply a `\\simile` if there is none.'
        },
        Simple: { snippet: 'simple', shortDescription: 'A simple simile mark. The previous bar is repeated.' },
        FirstOfDouble: {
            snippet: 'firstOfDouble',
            shortDescription: 'A double simile mark. This value is assigned to the first bar of the 2 repeat bars.'
        },
        SecondOfDouble: {
            snippet: 'secondOfDouble',
            shortDescription: 'A double simile mark. This value is assigned to the second bar of the 2 repeat bars.'
        }
    },
    Direction: {
        TargetFine: { snippet: 'fine', shortDescription: 'Fine (Target)' },
        TargetSegno: { snippet: 'segno', shortDescription: 'Segno (Target)' },
        TargetSegnoSegno: { snippet: 'segnoSegno', shortDescription: 'SegnoSegno (Target)' },
        TargetCoda: { snippet: 'coda', shortDescription: 'Coda (Target)' },
        TargetDoubleCoda: { snippet: 'doubleCoda', shortDescription: 'DoubleCoda (Target)' },
        JumpDaCapo: { snippet: 'daCapo', shortDescription: 'DaCapo (Jump)' },
        JumpDaCapoAlCoda: { snippet: 'daCapoAlCoda', shortDescription: 'DaCapoAlCoda (Jump)' },
        JumpDaCapoAlDoubleCoda: { snippet: 'daCapoAlDoubleCoda', shortDescription: 'DaCapoAlDoubleCoda (Jump)' },
        JumpDaCapoAlFine: { snippet: 'daCapoAlFine', shortDescription: 'DaCapoAlFine (Jump)' },
        JumpDalSegno: { snippet: 'dalSegno', shortDescription: 'DalSegno (Jump)' },
        JumpDalSegnoAlCoda: { snippet: 'dalSegnoAlCoda', shortDescription: 'DalSegnoAlCoda (Jump)' },
        JumpDalSegnoAlDoubleCoda: { snippet: 'dalSegnoAlDoubleCoda', shortDescription: 'DalSegnoAlDoubleCoda (Jump)' },
        JumpDalSegnoAlFine: { snippet: 'dalSegnoAlFine', shortDescription: 'DalSegnoAlFine (Jump)' },
        JumpDalSegnoSegno: { snippet: 'dalSegnoSegno', shortDescription: 'DalSegnoSegno (Jump)' },
        JumpDalSegnoSegnoAlCoda: { snippet: 'dalSegnoSegnoAlCoda', shortDescription: 'DalSegnoSegnoAlCoda (Jump)' },
        JumpDalSegnoSegnoAlDoubleCoda: {
            snippet: 'dalSegnoSegnoAlDoubleCoda',
            shortDescription: 'DalSegnoSegnoAlDoubleCoda (Jump)'
        },
        JumpDalSegnoSegnoAlFine: { snippet: 'dalSegnoSegnoAlFine', shortDescription: 'DalSegnoSegnoAlFine (Jump)' },
        JumpDaCoda: { snippet: 'daCoda', shortDescription: 'DaCoda (Jump)' },
        JumpDaDoubleCoda: { snippet: 'daDoubleCoda', shortDescription: 'DaDoubleCoda (Jump)' }
    }
};

export function enumParameter<TType extends AlphaTexMappedEnumName>(type: TType) {
    const mapping = alphaTexMappedEnumMapping[type] as Record<string, AlphaTexMappedEnumMappingEntry>;
    return {
        type: AlphaTexNodeType.Ident,
        allowAllStringTypes: true,
        values: Object.values(mapping)
            .map(val =>
                val === null
                    ? null
                    : ({
                          name: val.snippet,
                          snippet: val.snippet,
                          shortDescription: val.shortDescription,
                          deprecated: val.deprecated,
                          longDescription: val.longDescription,
                          skip: val.skip
                      } satisfies ParameterValueDefinition)
            )
            .filter(f => f !== null)
    };
}
