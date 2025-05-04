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
import type { Score } from '@src/model/Score';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import type { Staff } from '@src/model/Staff';
import type { Track } from '@src/model/Track';
import { VibratoType } from '@src/model/VibratoType';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { expect } from 'chai';

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
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).to.equal(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).to.equal(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).to.equal(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).to.equal(3);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).to.equal(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].fret).to.equal(4);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].notes[0].string).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).to.equal(duration);
            beat++;

            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].isRest).to.be.equal(true);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[beat].duration).to.equal(duration);
            beat++;
        }
    }

    public static checkTimeSignatures(score: Score): void {
        expect(score.masterBars[0].timeSignatureNumerator).to.equal(4);
        expect(score.masterBars[0].timeSignatureDenominator).to.equal(4);

        expect(score.masterBars[1].timeSignatureNumerator).to.equal(3);
        expect(score.masterBars[1].timeSignatureDenominator).to.equal(4);

        expect(score.masterBars[2].timeSignatureNumerator).to.equal(2);
        expect(score.masterBars[2].timeSignatureDenominator).to.equal(4);

        expect(score.masterBars[3].timeSignatureNumerator).to.equal(1);
        expect(score.masterBars[3].timeSignatureDenominator).to.equal(4);

        expect(score.masterBars[4].timeSignatureNumerator).to.equal(20);
        expect(score.masterBars[4].timeSignatureDenominator).to.equal(32);
    }

    public static checkDead(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).to.equal(1);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isDead).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).to.equal(2);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isDead).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].string).to.equal(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isDead).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].string).to.equal(4);
    }

    public static checkGrace(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].graceType).to.equal(GraceType.BeforeBeat);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].duration).to.equal(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].duration).to.equal(Duration.Quarter);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].graceType).to.equal(GraceType.BeforeBeat);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].duration).to.equal(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].fret).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].duration).to.equal(Duration.Quarter);
    }

    public static checkAccentuations(score: Score, includeHeavy: boolean): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isGhost).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].accentuated).to.equal(
            AccentuationType.Normal
        );
        if (includeHeavy) {
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].accentuated).to.equal(
                AccentuationType.Heavy
            );
        }
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isLetRing).to.be.equal(true);
    }

    public static checkHarmonics(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).to.equal(
            HarmonicType.Natural
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).to.equal(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).to.equal(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).to.equal(HarmonicType.Semi);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).to.equal(HarmonicType.Pinch);
        // TODO: Harmonic Values
    }

    public static checkHammer(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isHammerPullOrigin).to.equal(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].isHammerPullOrigin).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].isHammerPullOrigin).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].isHammerPullOrigin).to.be.equal(true);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].hammerPullOrigin).to.not.be.ok;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[1].hammerPullOrigin).to.be.ok;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[2].hammerPullOrigin).to.be.ok;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[3].hammerPullOrigin).to.be.ok;

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isHammerPullOrigin).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].isHammerPullOrigin).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].hammerPullOrigin).to.be.ok;
    }

    public static checkBend(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints!.length).to.equal(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![0].offset).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![0].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![1].offset).to.equal(15);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![1].value).to.equal(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![2].offset).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![2].value).to.equal(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints!.length).to.equal(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![0].offset).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![0].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![1].offset).to.equal(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![1].value).to.equal(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![2].offset).to.equal(20);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![2].value).to.equal(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![3].offset).to.equal(30);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![3].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![4].offset).to.equal(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![4].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![5].offset).to.equal(50);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![5].value).to.equal(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![6].offset).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![6].value).to.equal(4);
    }

    public static checkTremolo(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints!.length).to.equal(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![0].offset).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![0].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![1].offset).to.equal(30);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![1].value).to.equal(-4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![2].offset).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![2].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints!.length).to.equal(3);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![0].offset).to.equal(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![0].value).to.equal(-4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![1].offset).to.equal(45);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![1].value).to.equal(-4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![2].offset).to.equal(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![2].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints!.length).to.equal(3);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![0].offset).to.equal(0);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![0].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![1].offset).to.equal(45);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![1].value).to.equal(-4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![2].offset).to.equal(60);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![2].value).to.equal(-4);
    }

    public static checkSlides(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(5)!.slideOutType).to.equal(
            SlideOutType.Legato
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].getNoteOnString(2)!.slideOutType).to.equal(
            SlideOutType.Shift
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].getNoteOnString(5)!.slideInType).to.equal(
            SlideInType.IntoFromBelow
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].getNoteOnString(5)!.slideInType).to.equal(
            SlideInType.IntoFromAbove
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].getNoteOnString(5)!.slideOutType).to.equal(
            SlideOutType.OutDown
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].getNoteOnString(5)!.slideOutType).to.equal(
            SlideOutType.OutUp
        );
    }

    public static checkStrings(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(6);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(1)!.fret).to.equal(6);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(2)!.fret).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(3)!.fret).to.equal(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(4)!.fret).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(5)!.fret).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(6)!.fret).to.equal(1);
    }

    public static checkVibrato(score: Score, checkNotes: boolean): void {
        if (checkNotes) {
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].vibrato).to.equal(VibratoType.Slight);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].vibrato).to.equal(VibratoType.Slight);
        }
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].vibrato).to.equal(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].vibrato).to.equal(VibratoType.Slight);
    }

    public static checkTrills(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).to.equal(Duration.Sixteenth);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].isTremolo).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].tremoloSpeed).to.equal(Duration.ThirtySecond);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].isTremolo).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tremoloSpeed).to.equal(Duration.Sixteenth);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].isTremolo).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].tremoloSpeed).to.equal(Duration.Eighth);
    }

    public static checkOtherEffects(score: Score, skipInstrumentCheck: boolean = false): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPalmMute).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isStaccato).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tap).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].slap).to.be.equal(true);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].pop).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].fadeIn).to.be.equal(true);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].hasChord).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].chord!.name).to.equal('C');
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].text).to.equal('Text');

        expect(score.masterBars[4].isDoubleBar).to.be.equal(true);
        expect(score.masterBars[4].tempoAutomations).to.have.length(1);
        expect(score.masterBars[4].tempoAutomations[0]!.value).to.equal(120.0);
        if (!skipInstrumentCheck) {
            expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument)).to.be
                .ok;
            expect(
                score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument)!.value
            ).to.equal(25);
        }
    }

    public static checkFingering(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isFingering).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger).to.equal(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].leftHandFinger).to.equal(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].leftHandFinger).to.equal(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].leftHandFinger).to.equal(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].leftHandFinger).to.equal(
            Fingers.LittleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].notes[0].rightHandFinger).to.equal(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].notes[0].rightHandFinger).to.equal(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].notes[0].rightHandFinger).to.equal(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[8].notes[0].rightHandFinger).to.equal(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[9].notes[0].rightHandFinger).to.equal(
            Fingers.LittleFinger
        );
    }

    public static checkStroke(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushType).to.equal(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushType).to.equal(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].pickStroke).to.equal(PickStroke.Up);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].pickStroke).to.equal(PickStroke.Down);
    }

    public static checkTuplets(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].tupletNumerator).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].tupletNumerator).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tupletNumerator).to.equal(3);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].tupletNumerator).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].tupletNumerator).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].tupletNumerator).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].tupletNumerator).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].tupletNumerator).to.equal(5);
    }

    public static checkRanges(score: Score): void {
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPalmMute).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isPalmMute).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isPalmMute).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isPalmMute).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPalmMute).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPalmMute).to.be.equal(true);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].isLetRing).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].isLetRing).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].isLetRing).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].isLetRing).to.be.equal(true);
    }

    public static checkEffects(score: Score): void {
        // just check if reading works
        expect(true).to.be.equal(true);
    }

    public static checkKeySignatures(score: Score): void {
        const bars = score.tracks[0].staves[0].bars;
        // major - flats
        expect(bars[0].keySignature).to.equal(KeySignature.C);
        expect(bars[0].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[1].keySignature).to.equal(KeySignature.F);
        expect(bars[1].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[2].keySignature).to.equal(KeySignature.Bb);
        expect(bars[2].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[3].keySignature).to.equal(KeySignature.Eb);
        expect(bars[3].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[4].keySignature).to.equal(KeySignature.Ab);
        expect(bars[4].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[5].keySignature).to.equal(KeySignature.Db);
        expect(bars[5].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[6].keySignature).to.equal(KeySignature.Gb);
        expect(bars[6].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[7].keySignature).to.equal(KeySignature.Cb);
        expect(bars[7].keySignatureType).to.equal(KeySignatureType.Major);

        // major - sharps
        expect(bars[8].keySignature).to.equal(KeySignature.C);
        expect(bars[8].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[9].keySignature).to.equal(KeySignature.G);
        expect(bars[9].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[10].keySignature).to.equal(KeySignature.D);
        expect(bars[10].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[11].keySignature).to.equal(KeySignature.A);
        expect(bars[11].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[12].keySignature).to.equal(KeySignature.E);
        expect(bars[12].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[13].keySignature).to.equal(KeySignature.B);
        expect(bars[13].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[14].keySignature).to.equal(KeySignature.FSharp);
        expect(bars[14].keySignatureType).to.equal(KeySignatureType.Major);
        expect(bars[15].keySignature).to.equal(KeySignature.CSharp);
        expect(bars[15].keySignatureType).to.equal(KeySignatureType.Major);

        // minor flats
        expect(bars[16].keySignature).to.equal(KeySignature.C);
        expect(bars[16].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[17].keySignature).to.equal(KeySignature.F);
        expect(bars[17].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[18].keySignature).to.equal(KeySignature.Bb);
        expect(bars[18].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[19].keySignature).to.equal(KeySignature.Eb);
        expect(bars[19].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[20].keySignature).to.equal(KeySignature.Ab);
        expect(bars[20].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[21].keySignature).to.equal(KeySignature.Db);
        expect(bars[21].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[22].keySignature).to.equal(KeySignature.Gb);
        expect(bars[22].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[23].keySignature).to.equal(KeySignature.Cb);
        expect(bars[23].keySignatureType).to.equal(KeySignatureType.Minor);

        // minor sharps
        expect(bars[24].keySignature).to.equal(KeySignature.C);
        expect(bars[24].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[25].keySignature).to.equal(KeySignature.G);
        expect(bars[25].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[26].keySignature).to.equal(KeySignature.D);
        expect(bars[26].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[27].keySignature).to.equal(KeySignature.A);
        expect(bars[27].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[28].keySignature).to.equal(KeySignature.E);
        expect(bars[28].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[29].keySignature).to.equal(KeySignature.B);
        expect(bars[29].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[30].keySignature).to.equal(KeySignature.FSharp);
        expect(bars[30].keySignatureType).to.equal(KeySignatureType.Minor);
        expect(bars[31].keySignature).to.equal(KeySignature.CSharp);
        expect(bars[31].keySignatureType).to.equal(KeySignatureType.Minor);
    }

    public static checkColors(score: Score): void {
        expect(score.tracks[0].name).to.equal('Red');
        expect(score.tracks[0].color.rgba).to.equal('#FF0000');
        expect(score.tracks[1].name).to.equal('Green');
        expect(score.tracks[1].color.rgba).to.equal('#00FF00');
        expect(score.tracks[2].name).to.equal('Yellow');
        expect(score.tracks[2].color.rgba).to.equal('#FFFF00');
        expect(score.tracks[3].name).to.equal('Blue');
        expect(score.tracks[3].color.rgba).to.equal('#0000FF');
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
        const track: Track = score.tracks[0];
        const staff: Staff = track.staves[0];
        expect(staff.chords!.size).to.equal(8);

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
        expect(actual === null).to.equal(expected === null);
        if (expected && actual) {
            expect(actual.name).to.equal(expected.name);
            expect(actual.firstFret).to.equal(expected.firstFret);
            expect(actual.strings.length).to.equal(expected.strings.length);
            expect(actual.strings.join(',')).to.equal(expected.strings.join(','));
            expect(actual.barreFrets.join(',')).to.equal(expected.barreFrets.join(','));
        }
    }

    public static checkMultiTrackLayoutConfiguration(
        track1: Score,
        track2: Score,
        trackAll: Score,
        track1And3: Score
    ): void {
        expect(track1.tracks[0].isVisibleOnMultiTrack).to.be.true;
        expect(track1.tracks[1].isVisibleOnMultiTrack).to.be.false;
        expect(track1.tracks[2].isVisibleOnMultiTrack).to.be.false;

        expect(track2.tracks[0].isVisibleOnMultiTrack).to.be.false;
        expect(track2.tracks[1].isVisibleOnMultiTrack).to.be.true;
        expect(track2.tracks[2].isVisibleOnMultiTrack).to.be.false;

        expect(trackAll.tracks[0].isVisibleOnMultiTrack).to.be.true;
        expect(trackAll.tracks[1].isVisibleOnMultiTrack).to.be.true;
        expect(trackAll.tracks[2].isVisibleOnMultiTrack).to.be.true;

        expect(track1And3.tracks[0].isVisibleOnMultiTrack).to.be.true;
        expect(track1And3.tracks[1].isVisibleOnMultiTrack).to.be.false;
        expect(track1And3.tracks[2].isVisibleOnMultiTrack).to.be.true;
    }
    public static checkSlash(score: Score): void {
        expect(score.tracks.length).to.equal(2);

        expect(score.tracks[0].staves.length).to.equal(1);
        expect(score.tracks[0].staves[0].showSlash).to.equal(true);
        expect(score.tracks[0].staves[0].showTablature).to.equal(true);
        expect(score.tracks[0].staves[0].showStandardNotation).to.equal(true);

        expect(score.tracks[1].staves.length).to.equal(1);
        expect(score.tracks[1].staves[0].showSlash).to.equal(false);
        expect(score.tracks[1].staves[0].showTablature).to.equal(true);
        expect(score.tracks[1].staves[0].showStandardNotation).to.equal(true);
    }
}
