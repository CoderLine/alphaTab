import { AlphaTexAccidentalMode } from '@src/importer/alphaTex/AlphaTexShared';
import { BarLineStyle } from '@src/model/Bar';
import { BarreShape } from '@src/model/BarreShape';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { Clef } from '@src/model/Clef';
import { Direction } from '@src/model/Direction';
import { DynamicValue } from '@src/model/DynamicValue';
import { FermataType } from '@src/model/Fermata';
import { GraceType } from '@src/model/GraceType';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { Ottavia } from '@src/model/Ottavia';
import { Rasgueado } from '@src/model/Rasgueado';
import { BracketExtendMode, TrackNameMode, TrackNameOrientation, TrackNamePolicy } from '@src/model/RenderStylesheet';
import { SimileMark } from '@src/model/SimileMark';
import { TripletFeel } from '@src/model/TripletFeel';
import { WhammyType } from '@src/model/WhammyType';
import { TextAlign } from '@src/platform/ICanvas';

/**
 * @internal
 * @partial
 */
export class AlphaTex1EnumMappings {
    /**
     * @target web
     * @partial
     */
    private static _toEnum<T>(type: object, value:number,) {
        return value as T;
    }

    private static *_basicMappingIterator<T extends number>(type: object) {
        for (const [name, value] of Object.entries(type).filter(e => typeof e[1] === 'number')) {
            const txt = name.startsWith('_') ? name.substring(1) : name;
            yield [txt.toLowerCase(), AlphaTex1EnumMappings._toEnum<T>(type, value as number)] as [string, T];
        }
    }

    private static _basic<T extends number>(type: object, additionals?: [string, T][]): Map<string, T> {
        const mapping = new Map<string, T>(AlphaTex1EnumMappings._basicMappingIterator<T>(type));
        if (additionals) {
            for (const i of additionals) {
                mapping.set(i[0], i[1]);
            }
        }
        return mapping;
    }

    private static _reverse<TKey, TValue extends number>(map: Map<TKey, TValue>): Map<TValue, TKey> {
        const reversed = new Map<TValue, TKey>();
        for (const [k, v] of map) {
            if (!reversed.has(v)) {
                reversed.set(v, k);
            }
        }
        return reversed;
    }

    public static readonly whammyTypes = AlphaTex1EnumMappings._basic<WhammyType>(WhammyType);
    public static readonly whammyTypesReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.whammyTypes);

    public static readonly bendStyles = AlphaTex1EnumMappings._basic<BendStyle>(BendStyle);
    public static readonly bendStylesReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.bendStyles);

    public static readonly graceTypes = new Map<string, GraceType>([
        ['ob', GraceType.OnBeat],
        ['b', GraceType.BendGrace],
        ['bb', GraceType.BeforeBeat]
    ]);
    public static readonly graceTypesReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.graceTypes);

    public static readonly fermataTypes = AlphaTex1EnumMappings._basic<FermataType>(FermataType);
    public static readonly fermataTypesReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.fermataTypes);

    public static readonly accidentalModes =
        AlphaTex1EnumMappings._basic<AlphaTexAccidentalMode>(AlphaTexAccidentalMode);
    public static readonly accidentalModesReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.accidentalModes
    );

    public static readonly barreShapes = AlphaTex1EnumMappings._basic<BarreShape>(BarreShape);
    public static readonly barreShapesReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.barreShapes);

    public static readonly ottava = AlphaTex1EnumMappings._basic<Ottavia>(Ottavia);
    public static readonly ottavaReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.ottava);

    public static readonly rasgueadoPatterns = AlphaTex1EnumMappings._basic<Rasgueado>(Rasgueado);
    public static readonly rasgueadoPatternsReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.rasgueadoPatterns
    );

    public static readonly dynamics = AlphaTex1EnumMappings._basic<DynamicValue>(DynamicValue);

    public static readonly dynamicsReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.dynamics);

    public static readonly bracketExtendModes = AlphaTex1EnumMappings._basic<BracketExtendMode>(BracketExtendMode);
    public static readonly bracketExtendModesReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.bracketExtendModes
    );

    public static readonly trackNamePolicies = AlphaTex1EnumMappings._basic<TrackNamePolicy>(TrackNamePolicy);

    public static readonly trackNamePoliciesReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.trackNamePolicies
    );

    public static readonly trackNameOrientations =
        AlphaTex1EnumMappings._basic<TrackNameOrientation>(TrackNameOrientation);

    public static readonly trackNameOrientationsReversed = AlphaTex1EnumMappings._reverse(
        AlphaTex1EnumMappings.trackNameOrientations
    );

    public static readonly trackNameMode = AlphaTex1EnumMappings._basic<TrackNameMode>(TrackNameMode);
    public static readonly trackNameModeReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.trackNameMode);

    public static readonly textAligns = AlphaTex1EnumMappings._basic<TextAlign>(TextAlign);

    public static readonly textAlignsReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.textAligns);

    public static readonly bendTypes = AlphaTex1EnumMappings._basic<BendType>(BendType);
    public static readonly bendTypesReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.bendTypes);

    public static readonly keySignatures = AlphaTex1EnumMappings._basic<KeySignature>(KeySignature, [
        ['cbmajor', KeySignature.Cb],
        ['abminor', KeySignature.Cb],

        ['gbmajor', KeySignature.Gb],
        ['ebminor', KeySignature.Gb],

        ['dbmajor', KeySignature.Db],
        ['bbminor', KeySignature.Db],

        ['abmajor', KeySignature.Ab],
        ['fminor', KeySignature.Ab],

        ['ebmajor', KeySignature.Eb],
        ['cminor', KeySignature.Eb],

        ['bbmajor', KeySignature.Bb],
        ['gminor', KeySignature.Bb],

        ['fmajor', KeySignature.F],
        ['dminor', KeySignature.F],

        ['cmajor', KeySignature.C],
        ['aminor', KeySignature.C],

        ['gmajor', KeySignature.G],
        ['eminor', KeySignature.G],

        ['dmajor', KeySignature.D],
        ['bminor', KeySignature.D],

        ['amajor', KeySignature.A],
        ['f#minor', KeySignature.A],

        ['emajor', KeySignature.E],
        ['c#minor', KeySignature.E],

        ['bmajor', KeySignature.B],
        ['g#minor', KeySignature.B],

        ['f#', KeySignature.FSharp],
        ['f#major', KeySignature.FSharp],
        ['d#minor', KeySignature.FSharp],

        ['c#', KeySignature.CSharp],
        ['c#major', KeySignature.CSharp],
        ['a#minor', KeySignature.CSharp]
    ]);

    public static readonly keySignaturesMajorReversed = new Map<KeySignature, string>([
        [KeySignature.Cb, 'cb'],
        [KeySignature.Gb, 'gb'],
        [KeySignature.Db, 'db'],
        [KeySignature.Ab, 'ab'],
        [KeySignature.Eb, 'eb'],
        [KeySignature.Bb, 'bb'],
        [KeySignature.F, 'f'],
        [KeySignature.C, 'c'],
        [KeySignature.G, 'g'],
        [KeySignature.D, 'd'],
        [KeySignature.A, 'a'],
        [KeySignature.E, 'e'],
        [KeySignature.B, 'b'],
        [KeySignature.FSharp, 'f#'],
        [KeySignature.CSharp, 'c#']
    ]);

    public static readonly keySignaturesMinorReversed = new Map<KeySignature, string>([
        [KeySignature.Cb, 'abminor'],
        [KeySignature.Gb, 'ebminor'],
        [KeySignature.Db, 'bbminor'],
        [KeySignature.Ab, 'fminor'],
        [KeySignature.Eb, 'cminor'],
        [KeySignature.Bb, 'gminor'],
        [KeySignature.F, 'dminor'],
        [KeySignature.C, 'aminor'],
        [KeySignature.G, 'eminor'],
        [KeySignature.D, 'bminor'],
        [KeySignature.A, 'f#minor'],
        [KeySignature.E, 'c#minor'],
        [KeySignature.B, 'g#minor'],
        [KeySignature.FSharp, 'd#minor'],
        [KeySignature.CSharp, 'a#minor']
    ]);

    public static readonly keySignatureTypes = new Map<string, KeySignatureType>([
        ['cb', KeySignatureType.Major],
        ['cbmajor', KeySignatureType.Major],
        ['abminor', KeySignatureType.Minor],

        ['gb', KeySignatureType.Major],
        ['gbmajor', KeySignatureType.Major],
        ['ebminor', KeySignatureType.Minor],

        ['db', KeySignatureType.Major],
        ['dbmajor', KeySignatureType.Major],
        ['bbminor', KeySignatureType.Minor],

        ['ab', KeySignatureType.Major],
        ['abmajor', KeySignatureType.Major],
        ['fminor', KeySignatureType.Minor],

        ['eb', KeySignatureType.Major],
        ['ebmajor', KeySignatureType.Major],
        ['cminor', KeySignatureType.Minor],

        ['bb', KeySignatureType.Major],
        ['bbmajor', KeySignatureType.Major],
        ['gminor', KeySignatureType.Minor],

        ['f', KeySignatureType.Major],
        ['fmajor', KeySignatureType.Major],
        ['dminor', KeySignatureType.Minor],

        ['c', KeySignatureType.Major],
        ['cmajor', KeySignatureType.Major],
        ['aminor', KeySignatureType.Minor],

        ['g', KeySignatureType.Major],
        ['gmajor', KeySignatureType.Major],
        ['eminor', KeySignatureType.Minor],

        ['d', KeySignatureType.Major],
        ['dmajor', KeySignatureType.Major],
        ['bminor', KeySignatureType.Minor],

        ['a', KeySignatureType.Major],
        ['amajor', KeySignatureType.Major],
        ['f#minor', KeySignatureType.Minor],

        ['e', KeySignatureType.Major],
        ['emajor', KeySignatureType.Major],
        ['c#minor', KeySignatureType.Minor],

        ['b', KeySignatureType.Major],
        ['bmajor', KeySignatureType.Major],
        ['g#minor', KeySignatureType.Minor],

        ['f#', KeySignatureType.Major],
        ['f#major', KeySignatureType.Major],
        ['d#minor', KeySignatureType.Minor],

        ['c#', KeySignatureType.Major],
        ['c#major', KeySignatureType.Major],
        ['a#minor', KeySignatureType.Minor]
    ]);

    public static readonly clefs = AlphaTex1EnumMappings._basic<Clef>(Clef, [
        ['treble', Clef.G2],
        ['bass', Clef.F4],
        ['alto', Clef.C3],
        ['tenor', Clef.C4],
        ['n', Clef.Neutral]
    ]);
    public static readonly clefsReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.clefs);

    public static readonly tripletFeels = AlphaTex1EnumMappings._basic<TripletFeel>(TripletFeel, [
        ['no', TripletFeel.NoTripletFeel],
        ['none', TripletFeel.NoTripletFeel],

        ['t16', TripletFeel.Triplet16th],
        ['triplet-16th', TripletFeel.Triplet16th],

        ['t8', TripletFeel.Triplet8th],
        ['triplet-8th', TripletFeel.Triplet8th],

        ['d16', TripletFeel.Dotted16th],
        ['dotted-16th', TripletFeel.Dotted16th],

        ['d8', TripletFeel.Dotted8th],
        ['dotted-8th', TripletFeel.Dotted8th],

        ['s16', TripletFeel.Scottish16th],
        ['scottish-16th', TripletFeel.Scottish16th],

        ['s8', TripletFeel.Scottish8th],
        ['scottish-8th', TripletFeel.Scottish8th]
    ]);
    public static readonly tripletFeelsReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.tripletFeels);

    public static readonly barLines = AlphaTex1EnumMappings._basic<BarLineStyle>(BarLineStyle);
    public static readonly barLinesReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.barLines);

    public static readonly ottavia = AlphaTex1EnumMappings._basic<Ottavia>(Ottavia);
    public static readonly ottaviaReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.ottavia);

    public static readonly simileMarks = AlphaTex1EnumMappings._basic<SimileMark>(SimileMark);
    public static readonly simileMarksReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.simileMarks);

    public static readonly directions = new Map<string, Direction>([
        ['fine', Direction.TargetFine],
        ['segno', Direction.TargetSegno],
        ['segnosegno', Direction.TargetSegnoSegno],
        ['coda', Direction.TargetCoda],
        ['doublecoda', Direction.TargetDoubleCoda],

        ['dacapo', Direction.JumpDaCapo],
        ['dacapoalcoda', Direction.JumpDaCapoAlCoda],
        ['dacapoaldoublecoda', Direction.JumpDaCapoAlDoubleCoda],
        ['dacapoalfine', Direction.JumpDaCapoAlFine],

        ['dalsegno', Direction.JumpDalSegno],
        ['dalsegnoalcoda', Direction.JumpDalSegnoAlCoda],
        ['dalsegnoaldoublecoda', Direction.JumpDalSegnoAlDoubleCoda],
        ['dalsegnoalfine', Direction.JumpDalSegnoAlFine],

        ['dalsegnosegno', Direction.JumpDalSegnoSegno],
        ['dalsegnosegnoalcoda', Direction.JumpDalSegnoSegnoAlCoda],
        ['dalsegnosegnoaldoublecoda', Direction.JumpDalSegnoSegnoAlDoubleCoda],
        ['dalsegnosegnoalfine', Direction.JumpDalSegnoSegnoAlFine],

        ['dacoda', Direction.JumpDaCoda],
        ['dadoublecoda', Direction.JumpDaDoubleCoda]
    ]);
    public static readonly directionsReversed = AlphaTex1EnumMappings._reverse(AlphaTex1EnumMappings.directions);
}
