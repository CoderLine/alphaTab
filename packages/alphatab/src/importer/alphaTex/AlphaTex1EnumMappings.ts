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

export class AlphaTex1EnumMappings {
    private static reverse<TKey, TValue extends number>(map: Map<TKey, TValue>): Map<TValue, TKey> {
        const reversed = new Map<TValue, TKey>();
        for (const [k, v] of map) {
            if (!reversed.has(v)) {
                reversed.set(v, k);
            }
        }
        return reversed;
    }

    public static readonly whammyTypes = new Map<string, WhammyType>([
        ['none', WhammyType.None],
        ['custom', WhammyType.Custom],
        ['dive', WhammyType.Dive],
        ['dip', WhammyType.Dip],
        ['hold', WhammyType.Hold],
        ['predive', WhammyType.Predive],
        ['predivedive', WhammyType.PrediveDive]
    ]);

    public static readonly whammyTypesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.whammyTypes);

    public static readonly bendStyles = new Map<string, BendStyle>([
        ['gradual', BendStyle.Gradual],
        ['fast', BendStyle.Fast],
        ['default', BendStyle.Default]
    ]);

    public static readonly bendStylesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.bendStyles);

    public static readonly graceTypes = new Map<string, GraceType>([
        ['ob', GraceType.OnBeat],
        ['b', GraceType.BendGrace],
        ['bb', GraceType.BeforeBeat]
    ]);

    public static readonly graceTypesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.graceTypes);

    public static readonly fermataTypes = new Map<string, FermataType>([
        ['short', FermataType.Short],
        ['medium', FermataType.Medium],
        ['long', FermataType.Long]
    ]);

    public static readonly fermataTypesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.fermataTypes);

    public static readonly accidentalModes = new Map<string, AlphaTexAccidentalMode>([
        ['auto', AlphaTexAccidentalMode.Auto],
        ['explicit', AlphaTexAccidentalMode.Explicit]
    ]);

    public static readonly accidentalModesReversed = AlphaTex1EnumMappings.reverse(
        AlphaTex1EnumMappings.accidentalModes
    );

    public static readonly barreShapes = new Map<string, BarreShape>([
        ['full', BarreShape.Full],
        ['half', BarreShape.Half]
    ]);
    public static readonly barreShapesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.barreShapes);

    public static readonly ottava = new Map<string, Ottavia>([
        ['15ma', Ottavia._15ma],
        ['8va', Ottavia._8va],
        ['regular', Ottavia.Regular],
        ['8vb', Ottavia._8vb],
        ['15mb', Ottavia._15mb]
    ]);
    public static readonly ottavaReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.ottava);

    public static readonly rasgueadoPatterns = new Map<string, Rasgueado>([
        ['ii', Rasgueado.Ii],
        ['mi', Rasgueado.Mi],
        ['miitriplet', Rasgueado.MiiTriplet],
        ['miianapaest', Rasgueado.MiiAnapaest],
        ['pmptriplet', Rasgueado.PmpTriplet],
        ['pmpanapaest', Rasgueado.PmpAnapaest],
        ['peitriplet', Rasgueado.PeiTriplet],
        ['peianapaest', Rasgueado.PeiAnapaest],
        ['paitriplet', Rasgueado.PaiTriplet],
        ['paianapaest', Rasgueado.PaiAnapaest],
        ['amitriplet', Rasgueado.AmiTriplet],
        ['amianapaest', Rasgueado.AmiAnapaest],
        ['ppp', Rasgueado.Ppp],
        ['amii', Rasgueado.Amii],
        ['amip', Rasgueado.Amip],
        ['eami', Rasgueado.Eami],
        ['eamii', Rasgueado.Eamii],
        ['peami', Rasgueado.Peami]
    ]);
    public static readonly rasgueadoPatternsReversed = AlphaTex1EnumMappings.reverse(
        AlphaTex1EnumMappings.rasgueadoPatterns
    );

    public static dynamics = new Map<string, DynamicValue>([
        ['ppp', DynamicValue.PPP],
        ['pp', DynamicValue.PP],
        ['p', DynamicValue.P],
        ['mp', DynamicValue.MP],
        ['mf', DynamicValue.MF],
        ['f', DynamicValue.F],
        ['ff', DynamicValue.FF],
        ['fff', DynamicValue.FFF],
        ['pppp', DynamicValue.PPPP],
        ['ppppp', DynamicValue.PPPPP],
        ['pppppp', DynamicValue.PPPPPP],
        ['ffff', DynamicValue.FFFF],
        ['fffff', DynamicValue.FFFFF],
        ['ffffff', DynamicValue.FFFFFF],
        ['sf', DynamicValue.SF],
        ['sfp', DynamicValue.SFP],
        ['sfpp', DynamicValue.SFPP],
        ['fp', DynamicValue.FP],
        ['rf', DynamicValue.RF],
        ['rfz', DynamicValue.RFZ],
        ['sfz', DynamicValue.SFZ],
        ['sffz', DynamicValue.SFFZ],
        ['fz', DynamicValue.FZ],
        ['n', DynamicValue.N],
        ['pf', DynamicValue.PF],
        ['sfzp', DynamicValue.SFZP]
    ]);
    public static readonly dynamicsReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.dynamics);

    public static readonly bracketExtendModes = new Map<string, BracketExtendMode>([
        ['nobrackets', BracketExtendMode.NoBrackets],
        ['groupstaves', BracketExtendMode.GroupStaves],
        ['groupsimilarinstruments', BracketExtendMode.GroupSimilarInstruments]
    ]);
    public static readonly bracketExtendModesReversed = AlphaTex1EnumMappings.reverse(
        AlphaTex1EnumMappings.bracketExtendModes
    );

    public static readonly trackNamePolicies = new Map<string, TrackNamePolicy>([
        ['hidden', TrackNamePolicy.Hidden],
        ['firstsystem', TrackNamePolicy.FirstSystem],
        ['allsystems', TrackNamePolicy.AllSystems]
    ]);
    public static readonly trackNamePoliciesReversed = AlphaTex1EnumMappings.reverse(
        AlphaTex1EnumMappings.trackNamePolicies
    );

    public static readonly trackNameOrientations = new Map<string, TrackNameOrientation>([
        ['horizontal', TrackNameOrientation.Horizontal],
        ['vertical', TrackNameOrientation.Vertical]
    ]);
    public static readonly trackNameOrientationsReversed = AlphaTex1EnumMappings.reverse(
        AlphaTex1EnumMappings.trackNameOrientations
    );

    public static readonly trackNameMode = new Map<string, TrackNameMode>([
        ['fullname', TrackNameMode.FullName],
        ['shortname', TrackNameMode.ShortName]
    ]);
    public static readonly trackNameModeReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.trackNameMode);

    public static readonly textAligns = new Map<string, TextAlign>([
        ['left', TextAlign.Left],
        ['center', TextAlign.Center],
        ['right', TextAlign.Right]
    ]);
    public static readonly textAlignsReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.textAligns);

    public static readonly bendTypes = new Map<string, BendType>([
        ['none', BendType.None],
        ['custom', BendType.Custom],
        ['bend', BendType.Bend],
        ['release', BendType.Release],
        ['bendrelease', BendType.BendRelease],
        ['hold', BendType.Hold],
        ['prebend', BendType.Prebend],
        ['prebendbend', BendType.PrebendBend],
        ['prebendrelease', BendType.PrebendRelease]
    ]);
    public static readonly bendTypesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.bendTypes);

    public static readonly keySignatures = new Map<string, KeySignature>([
        ['cb', KeySignature.Cb],
        ['cbmajor', KeySignature.Cb],
        ['abminor', KeySignature.Cb],

        ['gb', KeySignature.Gb],
        ['gbmajor', KeySignature.Gb],
        ['ebminor', KeySignature.Gb],

        ['db', KeySignature.Db],
        ['dbmajor', KeySignature.Db],
        ['bbminor', KeySignature.Db],

        ['ab', KeySignature.Ab],
        ['abmajor', KeySignature.Ab],
        ['fminor', KeySignature.Ab],

        ['eb', KeySignature.Eb],
        ['ebmajor', KeySignature.Eb],
        ['cminor', KeySignature.Eb],

        ['bb', KeySignature.Bb],
        ['bbmajor', KeySignature.Bb],
        ['gminor', KeySignature.Bb],

        ['f', KeySignature.F],
        ['fmajor', KeySignature.F],
        ['dminor', KeySignature.F],

        ['c', KeySignature.C],
        ['cmajor', KeySignature.C],
        ['aminor', KeySignature.C],

        ['g', KeySignature.G],
        ['gmajor', KeySignature.G],
        ['eminor', KeySignature.G],

        ['d', KeySignature.D],
        ['dmajor', KeySignature.D],
        ['bminor', KeySignature.D],

        ['a', KeySignature.A],
        ['amajor', KeySignature.A],
        ['f#minor', KeySignature.A],

        ['e', KeySignature.E],
        ['emajor', KeySignature.E],
        ['c#minor', KeySignature.E],

        ['b', KeySignature.B],
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

    public static readonly clefs = new Map<string, Clef>([
        ['g2', Clef.G2],
        ['treble', Clef.G2],

        ['f4', Clef.F4],
        ['bass', Clef.F4],

        ['c3', Clef.C3],
        ['alto', Clef.C3],

        ['c4', Clef.C4],
        ['tenor', Clef.C4],

        ['n', Clef.Neutral],
        ['neutral', Clef.Neutral]
    ]);
    public static readonly clefsReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.clefs);

    public static readonly tripletFeels = new Map<string, TripletFeel>([
        ['notripletfeel', TripletFeel.NoTripletFeel],
        ['no', TripletFeel.NoTripletFeel],
        ['none', TripletFeel.NoTripletFeel],

        ['triplet16th', TripletFeel.Triplet16th],
        ['t16', TripletFeel.Triplet16th],
        ['triplet-16th', TripletFeel.Triplet16th],

        ['triplet8th', TripletFeel.Triplet8th],
        ['t8', TripletFeel.Triplet8th],
        ['triplet-8th', TripletFeel.Triplet8th],

        ['dotted16th', TripletFeel.Dotted16th],
        ['d16', TripletFeel.Dotted16th],
        ['dotted-16th', TripletFeel.Dotted16th],

        ['dotted8th', TripletFeel.Dotted8th],
        ['d8', TripletFeel.Dotted8th],
        ['dotted-8th', TripletFeel.Dotted8th],

        ['scottish16th', TripletFeel.Scottish16th],
        ['s16', TripletFeel.Scottish16th],
        ['scottish-16th', TripletFeel.Scottish16th],

        ['scottish8th', TripletFeel.Scottish8th],
        ['s8', TripletFeel.Scottish8th],
        ['scottish-8th', TripletFeel.Scottish8th]
    ]);
    public static readonly tripletFeelsReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.tripletFeels);

    public static readonly barLines = new Map<string, BarLineStyle>([
        ['automatic', BarLineStyle.Automatic],
        ['dashed', BarLineStyle.Dashed],
        ['dotted', BarLineStyle.Dotted],
        ['heavy', BarLineStyle.Heavy],
        ['heavyheavy', BarLineStyle.HeavyHeavy],
        ['heavylight', BarLineStyle.HeavyLight],
        ['lightheavy', BarLineStyle.LightHeavy],
        ['lightlight', BarLineStyle.LightLight],
        ['none', BarLineStyle.None],
        ['regular', BarLineStyle.Regular],
        ['short', BarLineStyle.Short],
        ['tick', BarLineStyle.Tick]
    ]);
    public static readonly barLinesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.barLines);

    public static readonly ottavia = new Map<string, Ottavia>([
        ['15ma', Ottavia._15ma],
        ['8va', Ottavia._8va],
        ['regular', Ottavia.Regular],
        ['8vb', Ottavia._8vb],
        ['15mb', Ottavia._15mb]
    ]);
    public static readonly ottaviaReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.ottavia);

    public static readonly simileMarks = new Map<string, SimileMark>([
        ['none', SimileMark.None],
        ['simple', SimileMark.Simple],
        ['firstofdouble', SimileMark.FirstOfDouble],
        ['secondofdouble', SimileMark.SecondOfDouble]
    ]);
    public static readonly simileMarksReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.simileMarks);

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
    public static readonly directionsReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.directions);
}
