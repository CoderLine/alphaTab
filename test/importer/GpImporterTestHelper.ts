import { Gp3To5Importer } from '@src/importer/Gp3To5Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { AccentuationType } from '@src/model/AccentuationType';
import { AutomationType } from '@src/model/Automation';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Duration } from '@src/model/Duration';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { PickStroke } from '@src/model/PickStroke';
import { Score } from '@src/model/Score';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { VibratoType } from '@src/model/VibratoType';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';

export class GpImporterTestHelper {
    public static async prepareImporterWithFile(name: string, settings: Settings | null = null): Promise<Gp3To5Importer> {
        let path: string = 'test-data/';
        const buffer = await TestPlatform.loadFile(path + name);
        return GpImporterTestHelper.prepareImporterWithBytes(buffer, settings);
    }

    public static prepareImporterWithBytes(buffer: Uint8Array, settings: Settings | null = null): Gp3To5Importer {
        let readerBase: Gp3To5Importer = new Gp3To5Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), settings ?? new Settings());
        return readerBase;
    }

    public static checkNotes(score: Score): void {
        // Whole Notes
        let beat: number = 0;
        let durationsInFile: Duration[] = [
            Duration.Whole,
            Duration.Half,
            Duration.Quarter,
            Duration.Eighth,
            Duration.Sixteenth,
            Duration.ThirtySecond,
            Duration.SixtyFourth
        ];
        for (let duration of durationsInFile) {
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).toEqual(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).toEqual(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).toEqual(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).toEqual(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).toEqual(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).toEqual(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).toEqual(3);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).toEqual(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).toEqual(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).toEqual(4);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).toEqual(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).toEqual(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].isRest).toBe(true);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).toEqual(duration);
            beat++;
        }
    }

    public static checkTimeSignatures(score: Score): void {
        expect(score.masterBars[0].timeSignatureNumerator).toEqual(4);
        expect(score.masterBars[0].timeSignatureDenominator).toEqual(4);

        expect(score.masterBars[1].timeSignatureNumerator).toEqual(3);
        expect(score.masterBars[1].timeSignatureDenominator).toEqual(4);

        expect(score.masterBars[2].timeSignatureNumerator).toEqual(2);
        expect(score.masterBars[2].timeSignatureDenominator).toEqual(4);

        expect(score.masterBars[3].timeSignatureNumerator).toEqual(1);
        expect(score.masterBars[3].timeSignatureDenominator).toEqual(4);

        expect(score.masterBars[4].timeSignatureNumerator).toEqual(20);
        expect(score.masterBars[4].timeSignatureDenominator).toEqual(32);
    }

    public static checkDead(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).toEqual(1);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isDead).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).toEqual(2);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isDead).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].string).toEqual(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isDead).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].string).toEqual(4);
    }

    public static checkGrace(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].graceType).toEqual(GraceType.BeforeBeat);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toEqual(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].duration).toEqual(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).toEqual(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].duration).toEqual(Duration.Quarter);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].graceType).toEqual(GraceType.BeforeBeat);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).toEqual(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].duration).toEqual(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].fret).toEqual(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].duration).toEqual(Duration.Quarter);
    }

    public static checkAccentuations(score: Score, includeHeavy: boolean): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isGhost).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].accentuated).toEqual(
            AccentuationType.Normal
        );
        if (includeHeavy) {
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].accentuated).toEqual(
                AccentuationType.Heavy
            );
        }
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isLetRing).toBe(true);
    }

    public static checkHarmonics(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).toEqual(
            HarmonicType.Natural
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).toEqual(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).toEqual(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).toEqual(HarmonicType.Semi);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).toEqual(HarmonicType.Pinch);
        // TODO: Harmonic Values
    }

    public static checkHammer(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isHammerPullOrigin).toEqual(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].isHammerPullOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].isHammerPullOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].isHammerPullOrigin).toBe(true);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].hammerPullOrigin).toBeFalsy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[1].hammerPullOrigin).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[2].hammerPullOrigin).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[3].hammerPullOrigin).toBeTruthy();

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isHammerPullOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].isHammerPullOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].hammerPullOrigin).toBeTruthy();
    }

    public static checkBend(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints.length).toEqual(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints[0].offset).toEqual(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints[0].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints[1].offset).toEqual(15);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints[1].value).toEqual(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints[2].offset).toEqual(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints[2].value).toEqual(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints.length).toEqual(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[0].offset).toEqual(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[0].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[1].offset).toEqual(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[1].value).toEqual(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[2].offset).toEqual(20);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[2].value).toEqual(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[3].offset).toEqual(30);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[3].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[4].offset).toEqual(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[4].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[5].offset).toEqual(50);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[5].value).toEqual(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[6].offset).toEqual(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[6].value).toEqual(4);
    }

    public static checkTremolo(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints.length).toEqual(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[0].offset).toEqual(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[0].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[1].offset).toEqual(30);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[1].value).toEqual(-4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[2].offset).toEqual(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[2].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints.length).toEqual(3);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints[0].offset).toEqual(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints[0].value).toEqual(-4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints[1].offset).toEqual(45);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints[1].value).toEqual(-4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints[2].offset).toEqual(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints[2].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints.length).toEqual(3);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[0].offset).toEqual(0);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[0].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[1].offset).toEqual(45);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[1].value).toEqual(-4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[2].offset).toEqual(60);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[2].value).toEqual(-4);
    }

    public static checkSlides(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(5)!.slideOutType).toEqual(
            SlideOutType.Legato
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].getNoteOnString(2)!.slideOutType).toEqual(
            SlideOutType.Shift
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].getNoteOnString(5)!.slideInType).toEqual(
            SlideInType.IntoFromBelow
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].getNoteOnString(5)!.slideInType).toEqual(
            SlideInType.IntoFromAbove
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].getNoteOnString(5)!.slideOutType).toEqual(
            SlideOutType.OutDown
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].getNoteOnString(5)!.slideOutType).toEqual(
            SlideOutType.OutUp
        );
    }

    public static checkStrings(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).toEqual(6);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(1)!.fret).toEqual(6);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(2)!.fret).toEqual(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(3)!.fret).toEqual(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(4)!.fret).toEqual(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(5)!.fret).toEqual(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(6)!.fret).toEqual(1);
    }

    public static checkVibrato(score: Score, checkNotes: boolean): void {
        if (checkNotes) {
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].vibrato).toEqual(VibratoType.Slight);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].vibrato).toEqual(VibratoType.Slight);
        }
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].vibrato).toEqual(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].vibrato).toEqual(VibratoType.Slight);
    }

    public static checkTrills(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).toEqual(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).toEqual(Duration.Sixteenth);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].isTremolo).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].tremoloSpeed).toEqual(Duration.ThirtySecond);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].isTremolo).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tremoloSpeed).toEqual(Duration.Sixteenth);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].isTremolo).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].tremoloSpeed).toEqual(Duration.Eighth);
    }

    public static checkOtherEffects(score: Score, skipInstrumentCheck: boolean = false): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPalmMute).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isStaccato).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tap).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].slap).toBe(true);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].pop).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].fadeIn).toBe(true);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].hasChord).toBe(true);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].chord!.name).toEqual('C');
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].text).toEqual('Text');

        expect(score.masterBars[4].isDoubleBar).toBe(true);
        expect(score.masterBars[4].tempoAutomation).toBeTruthy();
        expect(score.masterBars[4].tempoAutomation!.value).toEqual(120.0);
        if (!skipInstrumentCheck) {
            expect(
                score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument)
            ).toBeTruthy();
            expect(
                score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument)!.value
            ).toEqual(25);
        }
    }

    public static checkFingering(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isFingering).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger).toEqual(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].leftHandFinger).toEqual(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].leftHandFinger).toEqual(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].leftHandFinger).toEqual(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].leftHandFinger).toEqual(
            Fingers.LittleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].notes[0].rightHandFinger).toEqual(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].notes[0].rightHandFinger).toEqual(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].notes[0].rightHandFinger).toEqual(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[8].notes[0].rightHandFinger).toEqual(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[9].notes[0].rightHandFinger).toEqual(
            Fingers.LittleFinger
        );
    }

    public static checkStroke(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushType).toEqual(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushType).toEqual(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].pickStroke).toEqual(PickStroke.Up);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].pickStroke).toEqual(PickStroke.Down);
    }

    public static checkTuplets(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].tupletNumerator).toEqual(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].tupletNumerator).toEqual(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tupletNumerator).toEqual(3);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].tupletNumerator).toEqual(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].tupletNumerator).toEqual(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].tupletNumerator).toEqual(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].tupletNumerator).toEqual(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].tupletNumerator).toEqual(5);
    }

    public static checkRanges(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPalmMute).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isPalmMute).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isPalmMute).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isPalmMute).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPalmMute).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPalmMute).toBe(true);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].isLetRing).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].isLetRing).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].isLetRing).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].isLetRing).toBe(true);
    }

    public static checkEffects(score: Score): void {
        // just check if reading works
        expect(true).toBe(true);
    }

    public static checkKeySignatures(score: Score): void {
        // major - flats
        expect(score.masterBars[0].keySignature).toEqual(KeySignature.C);
        expect(score.masterBars[0].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[1].keySignature).toEqual(KeySignature.F);
        expect(score.masterBars[1].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[2].keySignature).toEqual(KeySignature.Bb);
        expect(score.masterBars[2].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[3].keySignature).toEqual(KeySignature.Eb);
        expect(score.masterBars[3].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[4].keySignature).toEqual(KeySignature.Ab);
        expect(score.masterBars[4].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[5].keySignature).toEqual(KeySignature.Db);
        expect(score.masterBars[5].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[6].keySignature).toEqual(KeySignature.Gb);
        expect(score.masterBars[6].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[7].keySignature).toEqual(KeySignature.Cb);
        expect(score.masterBars[7].keySignatureType).toEqual(KeySignatureType.Major);

        // major - sharps
        expect(score.masterBars[8].keySignature).toEqual(KeySignature.C);
        expect(score.masterBars[8].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[9].keySignature).toEqual(KeySignature.G);
        expect(score.masterBars[9].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[10].keySignature).toEqual(KeySignature.D);
        expect(score.masterBars[10].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[11].keySignature).toEqual(KeySignature.A);
        expect(score.masterBars[11].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[12].keySignature).toEqual(KeySignature.E);
        expect(score.masterBars[12].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[13].keySignature).toEqual(KeySignature.B);
        expect(score.masterBars[13].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[14].keySignature).toEqual(KeySignature.FSharp);
        expect(score.masterBars[14].keySignatureType).toEqual(KeySignatureType.Major);
        expect(score.masterBars[15].keySignature).toEqual(KeySignature.CSharp);
        expect(score.masterBars[15].keySignatureType).toEqual(KeySignatureType.Major);

        // minor flats
        expect(score.masterBars[16].keySignature).toEqual(KeySignature.C);
        expect(score.masterBars[16].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[17].keySignature).toEqual(KeySignature.F);
        expect(score.masterBars[17].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[18].keySignature).toEqual(KeySignature.Bb);
        expect(score.masterBars[18].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[19].keySignature).toEqual(KeySignature.Eb);
        expect(score.masterBars[19].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[20].keySignature).toEqual(KeySignature.Ab);
        expect(score.masterBars[20].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[21].keySignature).toEqual(KeySignature.Db);
        expect(score.masterBars[21].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[22].keySignature).toEqual(KeySignature.Gb);
        expect(score.masterBars[22].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[23].keySignature).toEqual(KeySignature.Cb);
        expect(score.masterBars[23].keySignatureType).toEqual(KeySignatureType.Minor);

        // minor sharps
        expect(score.masterBars[24].keySignature).toEqual(KeySignature.C);
        expect(score.masterBars[24].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[25].keySignature).toEqual(KeySignature.G);
        expect(score.masterBars[25].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[26].keySignature).toEqual(KeySignature.D);
        expect(score.masterBars[26].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[27].keySignature).toEqual(KeySignature.A);
        expect(score.masterBars[27].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[28].keySignature).toEqual(KeySignature.E);
        expect(score.masterBars[28].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[29].keySignature).toEqual(KeySignature.B);
        expect(score.masterBars[29].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[30].keySignature).toEqual(KeySignature.FSharp);
        expect(score.masterBars[30].keySignatureType).toEqual(KeySignatureType.Minor);
        expect(score.masterBars[31].keySignature).toEqual(KeySignature.CSharp);
        expect(score.masterBars[31].keySignatureType).toEqual(KeySignatureType.Minor);
    }

    public static checkColors(score: Score): void {
        expect(score.tracks[0].name).toEqual('Red');
        expect(score.tracks[0].color.rgba).toEqual('#FF0000');
        expect(score.tracks[1].name).toEqual('Green');
        expect(score.tracks[1].color.rgba).toEqual('#00FF00');
        expect(score.tracks[2].name).toEqual('Yellow');
        expect(score.tracks[2].color.rgba).toEqual('#FFFF00');
        expect(score.tracks[3].name).toEqual('Blue');
        expect(score.tracks[3].color.rgba).toEqual('#0000FF');
    }

    private static createChord(name: string, firstFret: number, strings: number[], barreFrets?: number[]) {
        const chord = new Chord();
        chord.name = name;
        chord.firstFret = firstFret;
        chord.strings = strings;
        if (barreFrets) {
            chord.barreFrets = barreFrets;
        }
        return chord;
    }

    public static checkChords(score: Score): void {
        let track: Track = score.tracks[0];
        let staff: Staff = track.staves[0];
        expect(staff.chords.size).toEqual(8);

        GpImporterTestHelper.checkChord(
            GpImporterTestHelper.createChord('C', 1, [0, 1, 0, 2, 3, -1]),
            track.staves[0].bars[0].voices[0].beats[0].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper.createChord('Cm', 1, [-1, -1, 0, 1, 3, -1]),
            track.staves[0].bars[0].voices[0].beats[1].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper.createChord('C', 1, [3, 5, 5, 5, 3, -1], [3]),
            track.staves[0].bars[0].voices[0].beats[2].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper.createChord('Cm', 1, [3, 4, 5, 5, 3, -1], [3]),
            track.staves[0].bars[0].voices[0].beats[3].chord
        );

        GpImporterTestHelper.checkChord(
            GpImporterTestHelper.createChord('D', 1, [2, 3, 2, 0, -1, -1], [2]),
            track.staves[0].bars[1].voices[0].beats[0].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper.createChord('Dm', 1, [1, 3, 2, 0, -1, -1]),
            track.staves[0].bars[1].voices[0].beats[1].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper.createChord('D', 5, [5, 7, 7, 7, 5, -1], [5]),
            track.staves[0].bars[1].voices[0].beats[2].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper.createChord('Dm', 5, [5, 6, 7, 7, 5, -1], [5]),
            track.staves[0].bars[1].voices[0].beats[3].chord
        );
    }

    public static checkChord(expected: Chord | null, actual: Chord | null): void {
        expect(actual === null).toEqual(expected === null);
        if (expected && actual) {
            expect(actual.name).toEqual(expected.name);
            expect(actual.firstFret).toEqual(expected.firstFret);
            expect(actual.strings.length).toEqual(expected.strings.length);
            expect(actual.strings.join(',')).toEqual(expected.strings.join(','));
            expect(actual.barreFrets.join(',')).toEqual(expected.barreFrets.join(','));
        }
    }
}
