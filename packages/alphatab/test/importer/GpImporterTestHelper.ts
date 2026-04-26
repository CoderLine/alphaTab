import { expect } from 'vitest';
import { Gp3To5Importer } from '@coderline/alphatab/importer/Gp3To5Importer';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { AccentuationType } from '@coderline/alphatab/model/AccentuationType';
import { AutomationType } from '@coderline/alphatab/model/Automation';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import { Chord } from '@coderline/alphatab/model/Chord';
import { Duration } from '@coderline/alphatab/model/Duration';
import { Fingers } from '@coderline/alphatab/model/Fingers';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { PickStroke } from '@coderline/alphatab/model/PickStroke';
import type { Score } from '@coderline/alphatab/model/Score';
import { SlideInType } from '@coderline/alphatab/model/SlideInType';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { Settings } from '@coderline/alphatab/Settings';
import { TestPlatform } from 'test/TestPlatform';
/**
 * @internal
 */
export class GpImporterTestHelper {
    public static async prepareImporterWithFile(
        name: string,
        settings: Settings | null = null
    ): Promise<Gp3To5Importer> {
        const path: string = 'test-data/';
        const buffer = await TestPlatform.loadFile(path + name);
        return GpImporterTestHelper.prepareImporterWithBytes(buffer, settings);
    }

    public static prepareImporterWithBytes(buffer: Uint8Array, settings: Settings | null = null): Gp3To5Importer {
        const readerBase: Gp3To5Importer = new Gp3To5Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), settings ?? new Settings());
        return readerBase;
    }

    public static checkNotes(score: Score): void {
        // Whole Notes
        let beat: number = 0;
        const durationsInFile: Duration[] = [
            Duration.Whole,
            Duration.Half,
            Duration.Quarter,
            Duration.Eighth,
            Duration.Sixteenth,
            Duration.ThirtySecond,
            Duration.SixtyFourth
        ];
        for (const duration of durationsInFile) {
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).toBe(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).toBe(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).toBe(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).toBe(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).toBe(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).toBe(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).toBe(3);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).toBe(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).toBe(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).toBe(4);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).toBe(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).toBe(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].isRest).toBe(true);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).toBe(duration);
            beat++;
        }
    }

    public static checkTimeSignatures(score: Score): void {
        expect(score.masterBars[0].timeSignatureNumerator).toBe(4);
        expect(score.masterBars[0].timeSignatureDenominator).toBe(4);

        expect(score.masterBars[1].timeSignatureNumerator).toBe(3);
        expect(score.masterBars[1].timeSignatureDenominator).toBe(4);

        expect(score.masterBars[2].timeSignatureNumerator).toBe(2);
        expect(score.masterBars[2].timeSignatureDenominator).toBe(4);

        expect(score.masterBars[3].timeSignatureNumerator).toBe(1);
        expect(score.masterBars[3].timeSignatureDenominator).toBe(4);

        expect(score.masterBars[4].timeSignatureNumerator).toBe(20);
        expect(score.masterBars[4].timeSignatureDenominator).toBe(32);
    }

    public static checkDead(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).toBe(1);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isDead).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).toBe(2);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isDead).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].string).toBe(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isDead).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].string).toBe(4);
    }

    public static checkGrace(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].graceType).toBe(GraceType.BeforeBeat);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].duration).toBe(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].duration).toBe(Duration.Quarter);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].graceType).toBe(GraceType.BeforeBeat);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].duration).toBe(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].fret).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].duration).toBe(Duration.Quarter);
    }

    public static checkAccentuations(score: Score, includeHeavy: boolean): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isGhost).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].accentuated).toBe(
            AccentuationType.Normal
        );
        if (includeHeavy) {
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].accentuated).toBe(
                AccentuationType.Heavy
            );
        }
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isLetRing).toBe(true);
    }

    public static checkHarmonics(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).toBe(
            HarmonicType.Natural
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).toBe(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).toBe(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).toBe(HarmonicType.Semi);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).toBe(HarmonicType.Pinch);
        // TODO: Harmonic Values
    }

    public static checkHammer(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isHammerPullOrigin).toBe(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].isHammerPullOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].isHammerPullOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].isHammerPullOrigin).toBe(true);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].hammerPullOrigin).not.toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[1].hammerPullOrigin).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[2].hammerPullOrigin).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[3].hammerPullOrigin).toBeTruthy();

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isHammerPullOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].isHammerPullOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].hammerPullOrigin).toBeTruthy();
    }

    public static checkBend(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints!.length).toBe(2);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![0].offset).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![1].offset).toBe(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![1].value).toBe(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints!.length).toBe(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![0].offset).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![1].offset).toBe(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![1].value).toBe(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![2].offset).toBe(20);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![2].value).toBe(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![3].offset).toBe(30);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![3].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![4].offset).toBe(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![4].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![5].offset).toBe(50);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![5].value).toBe(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![6].offset).toBe(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![6].value).toBe(4);
    }

    public static checkTremolo(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints!.length).toBe(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![0].offset).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![1].offset).toBe(30);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![1].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![2].offset).toBe(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![2].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints!.length).toBe(3);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![0].offset).toBe(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![0].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![1].offset).toBe(45);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![1].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![2].offset).toBe(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![2].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints!.length).toBe(3);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![0].offset).toBe(0);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![1].offset).toBe(45);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![1].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![2].offset).toBe(60);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![2].value).toBe(-4);
    }

    public static checkSlides(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(5)!.slideOutType).toBe(
            SlideOutType.Legato
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].getNoteOnString(2)!.slideOutType).toBe(
            SlideOutType.Shift
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].getNoteOnString(5)!.slideInType).toBe(
            SlideInType.IntoFromBelow
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].getNoteOnString(5)!.slideInType).toBe(
            SlideInType.IntoFromAbove
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].getNoteOnString(5)!.slideOutType).toBe(
            SlideOutType.OutDown
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].getNoteOnString(5)!.slideOutType).toBe(
            SlideOutType.OutUp
        );
    }

    public static checkStrings(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).toBe(6);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(1)!.fret).toBe(6);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(2)!.fret).toBe(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(3)!.fret).toBe(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(4)!.fret).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(5)!.fret).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(6)!.fret).toBe(1);
    }

    public static checkVibrato(score: Score, checkNotes: boolean): void {
        if (checkNotes) {
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].vibrato).toBe(VibratoType.Slight);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].vibrato).toBe(VibratoType.Slight);
        }
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].vibrato).toBe(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].vibrato).toBe(VibratoType.Slight);
    }

    public static checkTrills(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).toBe(Duration.Sixteenth);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].isTremolo).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].tremoloPicking!.marks).toBe(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].isTremolo).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tremoloPicking!.marks).toBe(2);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].isTremolo).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].tremoloPicking!.marks).toBe(1);
    }

    public static checkOtherEffects(score: Score, skipInstrumentCheck: boolean = false): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPalmMute).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isStaccato).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tap).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].slap).toBe(true);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].pop).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].fadeIn).toBe(true);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].hasChord).toBe(true);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].chord!.name).toBe('C');
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].text).toBe('Text');

        expect(score.masterBars[4].isDoubleBar).toBe(true);
        expect(score.masterBars[4].tempoAutomations.length).toBe(1);
        expect(score.masterBars[4].tempoAutomations[0]!.value).toBe(120.0);
        if (!skipInstrumentCheck) {
            expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument)).toBeTruthy();
            expect(
                score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument)!.value
            ).toBe(25);
        }
    }

    public static checkFingering(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isFingering).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger).toBe(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].leftHandFinger).toBe(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].leftHandFinger).toBe(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].leftHandFinger).toBe(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].leftHandFinger).toBe(
            Fingers.LittleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].notes[0].rightHandFinger).toBe(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].notes[0].rightHandFinger).toBe(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].notes[0].rightHandFinger).toBe(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[8].notes[0].rightHandFinger).toBe(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[9].notes[0].rightHandFinger).toBe(
            Fingers.LittleFinger
        );
    }

    public static checkStroke(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushType).toBe(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushType).toBe(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].pickStroke).toBe(PickStroke.Up);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].pickStroke).toBe(PickStroke.Down);
    }

    public static checkTuplets(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].tupletNumerator).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].tupletNumerator).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tupletNumerator).toBe(3);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].tupletNumerator).toBe(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].tupletNumerator).toBe(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].tupletNumerator).toBe(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].tupletNumerator).toBe(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].tupletNumerator).toBe(5);
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

    public static checkEffects(_score: Score): void {
        // just check if reading works
        expect(true).toBe(true);
    }

    public static checkKeySignatures(score: Score): void {
        const bars = score.tracks[0].staves[0].bars;
        // major - flats
        expect(bars[0].keySignature).toBe(KeySignature.C);
        expect(bars[0].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[1].keySignature).toBe(KeySignature.F);
        expect(bars[1].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[2].keySignature).toBe(KeySignature.Bb);
        expect(bars[2].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[3].keySignature).toBe(KeySignature.Eb);
        expect(bars[3].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[4].keySignature).toBe(KeySignature.Ab);
        expect(bars[4].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[5].keySignature).toBe(KeySignature.Db);
        expect(bars[5].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[6].keySignature).toBe(KeySignature.Gb);
        expect(bars[6].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[7].keySignature).toBe(KeySignature.Cb);
        expect(bars[7].keySignatureType).toBe(KeySignatureType.Major);

        // major - sharps
        expect(bars[8].keySignature).toBe(KeySignature.C);
        expect(bars[8].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[9].keySignature).toBe(KeySignature.G);
        expect(bars[9].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[10].keySignature).toBe(KeySignature.D);
        expect(bars[10].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[11].keySignature).toBe(KeySignature.A);
        expect(bars[11].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[12].keySignature).toBe(KeySignature.E);
        expect(bars[12].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[13].keySignature).toBe(KeySignature.B);
        expect(bars[13].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[14].keySignature).toBe(KeySignature.FSharp);
        expect(bars[14].keySignatureType).toBe(KeySignatureType.Major);
        expect(bars[15].keySignature).toBe(KeySignature.CSharp);
        expect(bars[15].keySignatureType).toBe(KeySignatureType.Major);

        // minor flats
        expect(bars[16].keySignature).toBe(KeySignature.C);
        expect(bars[16].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[17].keySignature).toBe(KeySignature.F);
        expect(bars[17].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[18].keySignature).toBe(KeySignature.Bb);
        expect(bars[18].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[19].keySignature).toBe(KeySignature.Eb);
        expect(bars[19].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[20].keySignature).toBe(KeySignature.Ab);
        expect(bars[20].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[21].keySignature).toBe(KeySignature.Db);
        expect(bars[21].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[22].keySignature).toBe(KeySignature.Gb);
        expect(bars[22].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[23].keySignature).toBe(KeySignature.Cb);
        expect(bars[23].keySignatureType).toBe(KeySignatureType.Minor);

        // minor sharps
        expect(bars[24].keySignature).toBe(KeySignature.C);
        expect(bars[24].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[25].keySignature).toBe(KeySignature.G);
        expect(bars[25].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[26].keySignature).toBe(KeySignature.D);
        expect(bars[26].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[27].keySignature).toBe(KeySignature.A);
        expect(bars[27].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[28].keySignature).toBe(KeySignature.E);
        expect(bars[28].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[29].keySignature).toBe(KeySignature.B);
        expect(bars[29].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[30].keySignature).toBe(KeySignature.FSharp);
        expect(bars[30].keySignatureType).toBe(KeySignatureType.Minor);
        expect(bars[31].keySignature).toBe(KeySignature.CSharp);
        expect(bars[31].keySignatureType).toBe(KeySignatureType.Minor);
    }

    public static checkColors(score: Score): void {
        expect(score.tracks[0].name).toBe('Red');
        expect(score.tracks[0].color.rgba).toBe('#FF0000');
        expect(score.tracks[1].name).toBe('Green');
        expect(score.tracks[1].color.rgba).toBe('#00FF00');
        expect(score.tracks[2].name).toBe('Yellow');
        expect(score.tracks[2].color.rgba).toBe('#FFFF00');
        expect(score.tracks[3].name).toBe('Blue');
        expect(score.tracks[3].color.rgba).toBe('#0000FF');
    }

    private static _createChord(name: string, firstFret: number, strings: number[], barreFrets?: number[]) {
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
        const track: Track = score.tracks[0];
        const staff: Staff = track.staves[0];
        expect(staff.chords!.size).toBe(8);

        GpImporterTestHelper.checkChord(
            GpImporterTestHelper._createChord('C', 1, [0, 1, 0, 2, 3, -1]),
            track.staves[0].bars[0].voices[0].beats[0].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper._createChord('Cm', 1, [-1, -1, 0, 1, 3, -1]),
            track.staves[0].bars[0].voices[0].beats[1].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper._createChord('C', 1, [3, 5, 5, 5, 3, -1], [3]),
            track.staves[0].bars[0].voices[0].beats[2].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper._createChord('Cm', 1, [3, 4, 5, 5, 3, -1], [3]),
            track.staves[0].bars[0].voices[0].beats[3].chord
        );

        GpImporterTestHelper.checkChord(
            GpImporterTestHelper._createChord('D', 1, [2, 3, 2, 0, -1, -1], [2]),
            track.staves[0].bars[1].voices[0].beats[0].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper._createChord('Dm', 1, [1, 3, 2, 0, -1, -1]),
            track.staves[0].bars[1].voices[0].beats[1].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper._createChord('D', 5, [5, 7, 7, 7, 5, -1], [5]),
            track.staves[0].bars[1].voices[0].beats[2].chord
        );
        GpImporterTestHelper.checkChord(
            GpImporterTestHelper._createChord('Dm', 5, [5, 6, 7, 7, 5, -1], [5]),
            track.staves[0].bars[1].voices[0].beats[3].chord
        );
    }

    public static checkChord(expected: Chord | null, actual: Chord | null): void {
        expect(actual === null).toBe(expected === null);
        if (expected && actual) {
            expect(actual.name).toBe(expected.name);
            expect(actual.firstFret).toBe(expected.firstFret);
            expect(actual.strings.length).toBe(expected.strings.length);
            expect(actual.strings.join(',')).toBe(expected.strings.join(','));
            expect(actual.barreFrets.join(',')).toBe(expected.barreFrets.join(','));
        }
    }

    public static checkMultiTrackLayoutConfiguration(
        track1: Score,
        track2: Score,
        trackAll: Score,
        track1And3: Score
    ): void {
        expect(track1.tracks[0].isVisibleOnMultiTrack).toBe(true);
        expect(track1.tracks[1].isVisibleOnMultiTrack).toBe(false);
        expect(track1.tracks[2].isVisibleOnMultiTrack).toBe(false);

        expect(track2.tracks[0].isVisibleOnMultiTrack).toBe(false);
        expect(track2.tracks[1].isVisibleOnMultiTrack).toBe(true);
        expect(track2.tracks[2].isVisibleOnMultiTrack).toBe(false);

        expect(trackAll.tracks[0].isVisibleOnMultiTrack).toBe(true);
        expect(trackAll.tracks[1].isVisibleOnMultiTrack).toBe(true);
        expect(trackAll.tracks[2].isVisibleOnMultiTrack).toBe(true);

        expect(track1And3.tracks[0].isVisibleOnMultiTrack).toBe(true);
        expect(track1And3.tracks[1].isVisibleOnMultiTrack).toBe(false);
        expect(track1And3.tracks[2].isVisibleOnMultiTrack).toBe(true);
    }
    public static checkSlash(score: Score): void {
        expect(score.tracks.length).toBe(2);

        expect(score.tracks[0].staves.length).toBe(1);
        expect(score.tracks[0].staves[0].showSlash).toBe(true);
        expect(score.tracks[0].staves[0].showTablature).toBe(true);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);

        expect(score.tracks[1].staves.length).toBe(1);
        expect(score.tracks[1].staves[0].showSlash).toBe(false);
        expect(score.tracks[1].staves[0].showTablature).toBe(true);
        expect(score.tracks[1].staves[0].showStandardNotation).toBe(true);
    }
}
