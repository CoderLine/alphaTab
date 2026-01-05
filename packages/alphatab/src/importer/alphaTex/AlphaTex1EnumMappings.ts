import type { AlphaTexAccidentalMode, AlphaTexVoiceMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import type { BarLineStyle } from '@coderline/alphatab/model/Bar';
import type { BarreShape } from '@coderline/alphatab/model/BarreShape';
import type { BendStyle } from '@coderline/alphatab/model/BendStyle';
import type { BendType } from '@coderline/alphatab/model/BendType';
import type { Clef } from '@coderline/alphatab/model/Clef';
import type { Direction } from '@coderline/alphatab/model/Direction';
import type { DynamicValue } from '@coderline/alphatab/model/DynamicValue';
import type { FermataType } from '@coderline/alphatab/model/Fermata';
import type { GraceType } from '@coderline/alphatab/model/GraceType';
import type { KeySignature } from '@coderline/alphatab/model/KeySignature';
import type { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import type { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import type { Ottavia } from '@coderline/alphatab/model/Ottavia';
import type { Rasgueado } from '@coderline/alphatab/model/Rasgueado';
import type {
    BracketExtendMode,
    TrackNameMode,
    TrackNameOrientation,
    TrackNamePolicy
} from '@coderline/alphatab/model/RenderStylesheet';
import type { SimileMark } from '@coderline/alphatab/model/SimileMark';
import type { TremoloPickingStyle } from '@coderline/alphatab/model/TremoloPickingEffect';
import type { TripletFeel } from '@coderline/alphatab/model/TripletFeel';
import type { WhammyType } from '@coderline/alphatab/model/WhammyType';
import type { TextAlign } from '@coderline/alphatab/platform/ICanvas';
/**
 * @internal
 * @partial
 */
export class AlphaTex1EnumMappings {
    private static _reverse<TKey, TValue extends number>(map: Map<TKey, TValue>): Map<TValue, TKey> {
        const reversed = new Map<TValue, TKey>();
        for (const [k, v] of map) {
            if (!reversed.has(v)) {
                reversed.set(v, k);
            }
        }
        return reversed;
    }
    public static readonly whammyType = new Map<string, WhammyType>([
        ['custom', 1],
        ['dive', 2],
        ['dip', 3],
        ['hold', 4],
        ['predive', 5],
        ['predivedive', 6]
    ]);
    public static readonly whammyTypeReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.whammyType);
    public static readonly bendStyle = new Map<string, BendStyle>([
        ['default', 0],
        ['gradual', 1],
        ['fast', 2]
    ]);
    public static readonly bendStyleReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.bendStyle);
    public static readonly graceType = new Map<string, GraceType>([
        ['onbeat', 1],
        ['beforebeat', 2],
        ['bendgrace', 3],
        ['ob', 1],
        ['bb', 2],
        ['b', 3]
    ]);
    public static readonly graceTypeReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.graceType);
    public static readonly fermataType = new Map<string, FermataType>([
        ['short', 0],
        ['medium', 1],
        ['long', 2]
    ]);
    public static readonly fermataTypeReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.fermataType);
    public static readonly alphaTexAccidentalMode = new Map<string, AlphaTexAccidentalMode>([
        ['auto', 0],
        ['explicit', 1]
    ]);
    public static readonly alphaTexAccidentalModeReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.alphaTexAccidentalMode
    );
    public static readonly alphaTexVoiceMode = new Map<string, AlphaTexVoiceMode>([
        ['staffwise', 0],
        ['barwise', 1]
    ]);
    public static readonly alphaTexVoiceModeReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.alphaTexVoiceMode
    );
    public static readonly noteAccidentalMode = new Map<string, NoteAccidentalMode>([
        ['default', 0],
        ['forcenone', 1],
        ['forcenatural', 2],
        ['forcesharp', 3],
        ['forcedoublesharp', 4],
        ['forceflat', 5],
        ['forcedoubleflat', 6],
        ['d', 0],
        ['-', 1],
        ['n', 2],
        ['#', 3],
        ['##', 4],
        ['x', 4],
        ['b', 5],
        ['bb', 6]
    ]);
    public static readonly noteAccidentalModeReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.noteAccidentalMode
    );
    public static readonly barreShape = new Map<string, BarreShape>([
        ['full', 1],
        ['half', 2]
    ]);
    public static readonly barreShapeReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.barreShape);
    public static readonly ottavia = new Map<string, Ottavia>([
        ['15ma', 0],
        ['8va', 1],
        ['regular', 2],
        ['8vb', 3],
        ['15mb', 4],
        ['15ma', 0],
        ['8va', 1],
        ['8vb', 3],
        ['15mb', 4]
    ]);
    public static readonly ottaviaReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.ottavia);
    public static readonly rasgueado = new Map<string, Rasgueado>([
        ['ii', 1],
        ['mi', 2],
        ['miitriplet', 3],
        ['miianapaest', 4],
        ['pmptriplet', 5],
        ['pmpanapaest', 6],
        ['peitriplet', 7],
        ['peianapaest', 8],
        ['paitriplet', 9],
        ['paianapaest', 10],
        ['amitriplet', 11],
        ['amianapaest', 12],
        ['ppp', 13],
        ['amii', 14],
        ['amip', 15],
        ['eami', 16],
        ['eamii', 17],
        ['peami', 18]
    ]);
    public static readonly rasgueadoReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.rasgueado);
    public static readonly dynamicValue = new Map<string, DynamicValue>([
        ['ppp', 0],
        ['pp', 1],
        ['p', 2],
        ['mp', 3],
        ['mf', 4],
        ['f', 5],
        ['ff', 6],
        ['fff', 7],
        ['pppp', 8],
        ['ppppp', 9],
        ['pppppp', 10],
        ['ffff', 11],
        ['fffff', 12],
        ['ffffff', 13],
        ['sf', 14],
        ['sfp', 15],
        ['sfpp', 16],
        ['fp', 17],
        ['rf', 18],
        ['rfz', 19],
        ['sfz', 20],
        ['sffz', 21],
        ['fz', 22],
        ['n', 23],
        ['pf', 24],
        ['sfzp', 25]
    ]);
    public static readonly dynamicValueReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.dynamicValue);
    public static readonly bracketExtendMode = new Map<string, BracketExtendMode>([
        ['nobrackets', 0],
        ['groupstaves', 1],
        ['groupsimilarinstruments', 2]
    ]);
    public static readonly bracketExtendModeReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.bracketExtendMode
    );
    public static readonly trackNamePolicy = new Map<string, TrackNamePolicy>([
        ['hidden', 0],
        ['firstsystem', 1],
        ['allsystems', 2]
    ]);
    public static readonly trackNamePolicyReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.trackNamePolicy
    );
    public static readonly trackNameOrientation = new Map<string, TrackNameOrientation>([
        ['horizontal', 0],
        ['vertical', 1]
    ]);
    public static readonly trackNameOrientationReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.trackNameOrientation
    );
    public static readonly trackNameMode = new Map<string, TrackNameMode>([
        ['fullname', 0],
        ['shortname', 1]
    ]);
    public static readonly trackNameModeReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.trackNameMode);
    public static readonly textAlign = new Map<string, TextAlign>([
        ['left', 0],
        ['center', 1],
        ['right', 2]
    ]);
    public static readonly textAlignReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.textAlign);
    public static readonly bendType = new Map<string, BendType>([
        ['custom', 1],
        ['bend', 2],
        ['release', 3],
        ['bendrelease', 4],
        ['hold', 5],
        ['prebend', 6],
        ['prebendbend', 7],
        ['prebendrelease', 8]
    ]);
    public static readonly bendTypeReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.bendType);
    public static readonly keySignature = new Map<string, KeySignature>([
        ['cb', -7],
        ['gb', -6],
        ['db', -5],
        ['ab', -4],
        ['eb', -3],
        ['bb', -2],
        ['f', -1],
        ['c', 0],
        ['g', 1],
        ['d', 2],
        ['a', 3],
        ['e', 4],
        ['b', 5],
        ['f#', 6],
        ['c#', 7],
        ['cbmajor', -7],
        ['abminor', -7],
        ['gbmajor', -6],
        ['ebminor', -6],
        ['dbmajor', -5],
        ['bbminor', -5],
        ['abmajor', -4],
        ['fminor', -4],
        ['ebmajor', -3],
        ['cminor', -3],
        ['bbmajor', -2],
        ['gminor', -2],
        ['fmajor', -1],
        ['dminor', -1],
        ['cmajor', 0],
        ['aminor', 0],
        ['gmajor', 1],
        ['eminor', 1],
        ['dmajor', 2],
        ['bminor', 2],
        ['amajor', 3],
        ['f#minor', 3],
        ['emajor', 4],
        ['c#minor', 4],
        ['bmajor', 5],
        ['g#minor', 5],
        ['f#major', 6],
        ['d#minor', 6],
        ['f#', 6],
        ['c#major', 7],
        ['a#minor', 7],
        ['c#', 7]
    ]);
    public static readonly keySignatureReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.keySignature);
    public static readonly keySignatureType = new Map<string, KeySignatureType>([
        ['major', 0],
        ['minor', 1],
        ['cb', 0],
        ['cbmajor', 0],
        ['gb', 0],
        ['gbmajor', 0],
        ['db', 0],
        ['dbmajor', 0],
        ['ab', 0],
        ['abmajor', 0],
        ['eb', 0],
        ['ebmajor', 0],
        ['bb', 0],
        ['bbmajor', 0],
        ['f', 0],
        ['fmajor', 0],
        ['c', 0],
        ['cmajor', 0],
        ['g', 0],
        ['gmajor', 0],
        ['d', 0],
        ['dmajor', 0],
        ['a', 0],
        ['amajor', 0],
        ['e', 0],
        ['emajor', 0],
        ['b', 0],
        ['bmajor', 0],
        ['f#', 0],
        ['f#major', 0],
        ['c#', 0],
        ['c#major', 0],
        ['abminor', 1],
        ['ebminor', 1],
        ['bbminor', 1],
        ['fminor', 1],
        ['cminor', 1],
        ['gminor', 1],
        ['dminor', 1],
        ['aminor', 1],
        ['eminor', 1],
        ['bminor', 1],
        ['f#minor', 1],
        ['c#minor', 1],
        ['g#minor', 1],
        ['d#minor', 1],
        ['a#minor', 1]
    ]);
    public static readonly keySignatureTypeReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.keySignatureType
    );
    public static readonly clef = new Map<string, Clef>([
        ['neutral', 0],
        ['c3', 1],
        ['c4', 2],
        ['f4', 3],
        ['g2', 4],
        ['n', 0],
        ['alto', 1],
        ['tenor', 2],
        ['bass', 3],
        ['treble', 4]
    ]);
    public static readonly clefReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.clef);
    public static readonly tripletFeel = new Map<string, TripletFeel>([
        ['none', 0],
        ['triplet16th', 1],
        ['triplet8th', 2],
        ['dotted16th', 3],
        ['dotted8th', 4],
        ['scottish16th', 5],
        ['scottish8th', 6],
        ['none', 0],
        ['no', 0],
        ['notripletfeel', 0],
        ['t16', 1],
        ['triplet-16th', 1],
        ['t8', 2],
        ['triplet-8th', 2],
        ['d16', 3],
        ['dotted-16th', 3],
        ['d8', 4],
        ['dotted-8th', 4],
        ['s16', 5],
        ['scottish-16th', 5],
        ['s8', 6],
        ['scottish-8th', 6]
    ]);
    public static readonly tripletFeelReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.tripletFeel);
    public static readonly barLineStyle = new Map<string, BarLineStyle>([
        ['automatic', 0],
        ['dashed', 1],
        ['dotted', 2],
        ['heavy', 3],
        ['heavyheavy', 4],
        ['heavylight', 5],
        ['lightheavy', 6],
        ['lightlight', 7],
        ['none', 8],
        ['regular', 9],
        ['short', 10],
        ['tick', 11]
    ]);
    public static readonly barLineStyleReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.barLineStyle);
    public static readonly simileMark = new Map<string, SimileMark>([
        ['none', 0],
        ['simple', 1],
        ['firstofdouble', 2],
        ['secondofdouble', 3]
    ]);
    public static readonly simileMarkReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.simileMark);
    public static readonly direction = new Map<string, Direction>([
        ['fine', 0],
        ['segno', 1],
        ['segnosegno', 2],
        ['coda', 3],
        ['doublecoda', 4],
        ['dacapo', 5],
        ['dacapoalcoda', 6],
        ['dacapoaldoublecoda', 7],
        ['dacapoalfine', 8],
        ['dalsegno', 9],
        ['dalsegnoalcoda', 10],
        ['dalsegnoaldoublecoda', 11],
        ['dalsegnoalfine', 12],
        ['dalsegnosegno', 13],
        ['dalsegnosegnoalcoda', 14],
        ['dalsegnosegnoaldoublecoda', 15],
        ['dalsegnosegnoalfine', 16],
        ['dacoda', 17],
        ['dadoublecoda', 18]
    ]);
    public static readonly directionReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.direction);
    public static readonly tremoloPickingStyle = new Map<string, TremoloPickingStyle>([
        ['default', 0],
        ['buzzroll', 1]
    ]);
    public static readonly tremoloPickingStyleReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.tremoloPickingStyle
    );
    public static readonly keySignaturesMinorReversed = new Map<KeySignature, string>([
        [-7, 'abminor'],
        [-6, 'ebminor'],
        [-5, 'bbminor'],
        [-4, 'fminor'],
        [-3, 'cminor'],
        [-2, 'gminor'],
        [-1, 'dminor'],
        [0, 'aminor'],
        [1, 'eminor'],
        [2, 'bminor'],
        [3, 'f#minor'],
        [4, 'c#minor'],
        [5, 'g#minor'],
        [6, 'd#minor'],
        [7, 'a#minor']
    ]);
    public static readonly keySignaturesMajorReversed = new Map<KeySignature, string>([
        [-7, 'cb'],
        [-6, 'gb'],
        [-5, 'db'],
        [-4, 'ab'],
        [-3, 'eb'],
        [-2, 'bb'],
        [-1, 'f'],
        [0, 'c'],
        [1, 'g'],
        [2, 'd'],
        [3, 'a'],
        [4, 'e'],
        [5, 'b'],
        [6, 'f#'],
        [7, 'c#']
    ]);
}
