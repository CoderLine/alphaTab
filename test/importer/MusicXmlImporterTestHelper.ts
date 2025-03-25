import { LayoutMode } from '@src/LayoutMode';
import { MusicXmlImporter } from '@src/importer/MusicXmlImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { Chord } from '@src/model/Chord';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { PlaybackInformation } from '@src/model/PlaybackInformation';
import { Score } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { Voice } from '@src/model/Voice';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { JsonConverter } from '@src/model/JsonConverter';
import { ComparisonHelpers } from '@test/model/ComparisonHelpers';
import { assert, expect } from 'chai';

export class MusicXmlImporterTestHelper {
    public static prepareImporterWithBytes(buffer: Uint8Array): MusicXmlImporter {
        let readerBase: MusicXmlImporter = new MusicXmlImporter();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        return readerBase;
    }

    public static async testReferenceFile(
        file: string,
        renderLayout: LayoutMode = LayoutMode.Page,
        renderAllTracks: boolean = false
    ): Promise<Score> {
        const fileData = await TestPlatform.loadFile(file);
        let score: Score;
        try {
            let importer: MusicXmlImporter = MusicXmlImporterTestHelper.prepareImporterWithBytes(fileData);
            score = importer.readScore();
        } catch (e) {
            if (e instanceof UnsupportedFormatError) {
                assert.fail(`Failed to load file ${file}: ${e}`);
            }
            throw e;
        }

        // send it to serializer once and check equality
        try {
            const expectedJson = JsonConverter.scoreToJsObject(score);

            const deserialized = JsonConverter.jsObjectToScore(expectedJson);
            const actualJson = JsonConverter.scoreToJsObject(deserialized);
 
            ComparisonHelpers.expectJsonEqual(expectedJson, actualJson, '<' + file + '>', null);
        } catch(e) {
            assert.fail((e as Error).message + (e as Error).stack);
        }

        return score;
    }

    protected static getHierarchy(node: unknown): string {
        let note: Note | null = node instanceof Note ? node : null;
        if (note) {
            return `${MusicXmlImporterTestHelper.getHierarchy(note.beat)}Note[${note.index}]`;
        }
        let beat: Beat | null = node instanceof Beat ? node : null;
        if (beat) {
            return `${MusicXmlImporterTestHelper.getHierarchy(beat.voice)}Beat[${beat.index}]`;
        }
        let voice: Voice | null = node instanceof Voice ? node : null;
        if (voice) {
            return `${MusicXmlImporterTestHelper.getHierarchy(voice.bar)}Voice[${voice.index}]`;
        }
        let bar: Bar | null = node instanceof Bar ? node : null;
        if (bar) {
            return `${MusicXmlImporterTestHelper.getHierarchy(bar.staff)}Bar[${bar.index}]`;
        }
        let staff: Staff | null = node instanceof Staff ? node : null;
        if (staff) {
            return `${MusicXmlImporterTestHelper.getHierarchy(staff.track)}Staff[${staff.index}]`;
        }
        let track: Track | null = node instanceof Track ? node : null;
        if (track) {
            return `Track[${track.index}]`;
        }
        let mb: MasterBar | null = node instanceof MasterBar ? node : null;
        if (mb) {
            return `MasterBar[${mb.index}]`;
        }
        return 'unknown';
    }

    protected expectScoreEqual(expected: Score, actual: Score): void {
        expect(actual.album).to.equal(expected.album, 'Mismatch on Album');
        expect(actual.artist).to.equal(expected.artist, 'Mismatch on Artist');
        expect(actual.copyright).to.equal(expected.copyright, 'Mismatch on Copyright');
        expect(actual.instructions).to.equal(expected.instructions, 'Mismatch on Instructions');
        expect(actual.music).to.equal(expected.music, 'Mismatch on Music');
        expect(actual.notices).to.equal(expected.notices, 'Mismatch on Notices');
        expect(actual.subTitle).to.equal(expected.subTitle, 'Mismatch on SubTitle');
        expect(actual.title).to.equal(expected.title, 'Mismatch on Title');
        expect(actual.words).to.equal(expected.words, 'Mismatch on Words');
        expect(actual.tab).to.equal(expected.tab, 'Mismatch on Tab');
        expect(actual.tempo).to.equal(expected.tempo, 'Mismatch on Tempo');
        expect(actual.tempoLabel).to.equal(expected.tempoLabel, 'Mismatch on TempoLabel');
        expect(actual.masterBars.length).to.equal(expected.masterBars.length, 'Mismatch on MasterBars.Count');
        for (let i: number = 0; i < expected.masterBars.length; i++) {
            this.expectMasterBarEqual(expected.masterBars[i], actual.masterBars[i]);
        }
        expect(actual.tracks.length).to.equal(expected.tracks.length, 'Mismatch on Tracks.Count');
        for (let i: number = 0; i < expected.tracks.length; i++) {
            this.expectTrackEqual(expected.tracks[i], actual.tracks[i]);
        }
    }

    protected expectTrackEqual(expected: Track, actual: Track): void {
        expect(actual.index).to.equal(expected.index, 'Mismatch on Index');
        expect(actual.name).to.equal(expected.name, 'Mismatch on Name');
        this.expectPlaybackInformationEqual(expected.playbackInfo, actual.playbackInfo);
        expect(actual.staves.length).to.equal(expected.staves.length, 'Mismatch on Staves.Count');
        for (let i: number = 0; i < expected.staves.length; i++) {
            this.expectStaffEqual(expected.staves[i], actual.staves[i]);
        }
    }

    protected expectStaffEqual(expected: Staff, actual: Staff): void {
        expect(actual.capo).to.equal(expected.capo, 'Mismatch on Capo');
        expect(actual.isPercussion).to.equal(expected.isPercussion, 'Mismatch on IsPercussion');
        expect(actual.showStandardNotation).to.equal(expected.showStandardNotation, 'Mismatch on ShowStandardNotation');
        expect(actual.showTablature).to.equal(expected.showTablature, 'Mismatch on ShowTablature');
        expect(actual.tuning.join(',')).to.equal(expected.tuning.join(','));
        expect(actual.tuning.length).to.equal(expected.tuning.length, 'Mismatch on Tuning.Length');
        expect(actual.index).to.equal(expected.index, 'Mismatch on Index');
        expect(actual.bars.length).to.equal(expected.bars.length, 'Mismatch on Bars.Count');
        for (let i: number = 0; i < expected.bars.length; i++) {
            this.expectBarEqual(expected.bars[i], actual.bars[i]);
        }
    }

    protected expectBarEqual(expected: Bar, actual: Bar): void {
        expect(actual.index).to.equal(expected.index, 'Mismatch on Index');
        expect(actual.clef).to.equal(expected.clef, 'Mismatch on Clef');
        expect(actual.clefOttava).to.equal(expected.clefOttava, 'Mismatch on ClefOttavia');
        // Assert.AreEqual(expected.Voices.Count, actual.Voices.Count, "Mismatch on Voices.Count");
        for (let i: number = 0; i < Math.min(expected.voices.length, actual.voices.length); i++) {
            this.expectVoiceEqual(expected.voices[i], actual.voices[i]);
        }
    }

    protected expectVoiceEqual(expected: Voice, actual: Voice): void {
        expect(actual.index).to.equal(expected.index, 'Mismatch on Index');
        expect(actual.beats.length).to.equal(expected.beats.length, 'Mismatch on Beats.Count');
        for (let i: number = 0; i < expected.beats.length; i++) {
            this.expectBeatEqual(expected.beats[i], actual.beats[i]);
        }
    }

    protected expectBeatEqual(expected: Beat, actual: Beat): void {
        expect(actual.index).to.equal(expected.index, 'Mismatch on Index');
        expect(actual.isEmpty).to.equal(expected.isEmpty, 'Mismatch on IsEmpty');
        expect(actual.isRest).to.equal(expected.isRest, 'Mismatch on IsRest');
        expect(actual.dots).to.equal(expected.dots, 'Mismatch on Dots');
        expect(actual.fadeIn).to.equal(expected.fadeIn, 'Mismatch on FadeIn');
        expect(actual.isLegatoOrigin).to.equal(expected.isLegatoOrigin, 'Mismatch on IsLegatoOrigin');
        if (!expected.lyrics) {
            expect(actual.lyrics).to.not.be.ok;
        } else {
            expect(actual.lyrics!.join(',')).to.equal(expected.lyrics.join(','));
        }
        expect(actual.pop).to.equal(expected.pop, 'Mismatch on Pop');
        expect(actual.hasChord).to.equal(expected.hasChord, 'Mismatch on HasChord');
        expect(actual.hasRasgueado).to.equal(expected.hasRasgueado, 'Mismatch on HasRasgueado');
        expect(actual.tap).to.equal(expected.tap);
        expect(actual.slap).to.equal(expected.slap);
        expect(actual.text).to.equal(expected.text, 'Mismatch on Text');
        expect(actual.brushType).to.equal(expected.brushType, 'Mismatch on BrushType');
        expect(actual.brushDuration).to.equal(expected.brushDuration, 'Mismatch on BrushDuration');
        expect(actual.tupletDenominator).to.equal(expected.tupletDenominator, 'Mismatch on TupletDenominator');
        expect(actual.tupletNumerator).to.equal(expected.tupletNumerator, 'Mismatch on TupletNumerator');
        this.expectBendPointsEqual(expected.whammyBarPoints, actual.whammyBarPoints);
        expect(actual.vibrato).to.equal(expected.vibrato, 'Mismatch on Vibrato');
        if (expected.hasChord) {
            this.expectChordEqual(expected.chord!, actual.chord!);
        }
        expect(actual.graceType).to.equal(expected.graceType, 'Mismatch on GraceType');
        expect(actual.pickStroke).to.equal(expected.pickStroke, 'Mismatch on PickStroke');
        expect(actual.tremoloSpeed).to.equal(expected.tremoloSpeed, 'Mismatch on TremoloSpeed');
        expect(actual.crescendo).to.equal(expected.crescendo, 'Mismatch on Crescendo');
        expect(actual.playbackStart).to.equal(expected.playbackStart, 'Mismatch on Start');
        expect(actual.displayStart).to.equal(expected.displayStart, 'Mismatch on Start');
        // Assert.AreEqual(expected.Dynamic, actual.Dynamic, "Mismatch on Dynamic");
        expect(actual.invertBeamDirection).to.equal(expected.invertBeamDirection, 'Mismatch on InvertBeamDirection');
        expect(actual.notes.length).to.equal(expected.notes.length, 'Mismatch on Notes.Count');
        for (let i: number = 0; i < expected.notes.length; i++) {
            this.expectNoteEqual(expected.notes[i], actual.notes[i]);
        }
    }

    protected expectNoteEqual(expected: Note, actual: Note): void {
        expect(actual.index).to.equal(expected.index, 'Mismatch on Index');
        expect(actual.accentuated).to.equal(expected.accentuated, 'Mismatch on Accentuated');
        this.expectBendPointsEqual(expected.bendPoints, actual.bendPoints);
        expect(actual.isStringed).to.equal(expected.isStringed, 'Mismatch on IsStringed');
        if (actual.isStringed) {
            expect(actual.fret).to.equal(expected.fret, 'Mismatch on Fret');
            expect(actual.string).to.equal(expected.string, 'Mismatch on String');
        }
        expect(actual.isPiano).to.equal(expected.isPiano, 'Mismatch on IsPiano');
        if (actual.isPiano) {
            expect(actual.octave).to.equal(expected.octave, 'Mismatch on Octave');
            expect(actual.tone).to.equal(expected.tone, 'Mismatch on Tone');
        }
        expect(actual.percussionArticulation).to.equal(expected.percussionArticulation, 'Mismatch on percussionArticulation');
        expect(actual.isHammerPullOrigin).to.equal(expected.isHammerPullOrigin, 'Mismatch on IsHammerPullOrigin');
        expect(actual.harmonicType).to.equal(expected.harmonicType, 'Mismatch on HarmonicType');
        expect(actual.harmonicValue).to.equal(expected.harmonicValue, 'Mismatch on HarmonicValue');
        expect(actual.isGhost).to.equal(expected.isGhost, 'Mismatch on IsGhost');
        expect(actual.isLetRing).to.equal(expected.isLetRing, 'Mismatch on IsLetRing');
        expect(actual.isPalmMute).to.equal(expected.isPalmMute, 'Mismatch on IsPalmMute');
        expect(actual.isDead).to.equal(expected.isDead, 'Mismatch on IsDead');
        expect(actual.isStaccato).to.equal(expected.isStaccato, 'Mismatch on IsStaccato');
        expect(actual.slideInType).to.equal(expected.slideInType, 'Mismatch on SlideInType');
        expect(actual.slideOutType).to.equal(expected.slideOutType, 'Mismatch on SlideOutType');
        expect(actual.vibrato).to.equal(expected.vibrato, 'Mismatch on Vibrato');
        expect(actual.isTieDestination).to.equal(expected.isTieDestination, 'Mismatch on IsTieDestination');
        expect(actual.isTieOrigin).to.equal(expected.isTieOrigin, 'Mismatch on IsTieOrigin');
        expect(actual.leftHandFinger).to.equal(expected.leftHandFinger, 'Mismatch on LeftHandFinger');
        expect(actual.isFingering).to.equal(expected.isFingering, 'Mismatch on IsFingering');
        expect(actual.trillValue).to.equal(expected.trillValue, 'Mismatch on TrillValue');
        expect(actual.trillSpeed).to.equal(expected.trillSpeed, 'Mismatch on TrillSpeed');
        expect(actual.durationPercent).to.equal(expected.durationPercent, 'Mismatch on DurationPercent');
        expect(actual.dynamics).to.equal(expected.dynamics, 'Mismatch on Dynamic');
        expect(actual.realValue).to.equal(expected.realValue, 'Mismatch on RealValue');
    }

    protected expectChordEqual(expected: Chord | null, actual: Chord): void {
        expect(!expected).to.equal(!actual);
        if (expected) {
            // expect(actual.name).to.equal(expected.name, 'Mismatch on Name');
        }
    }

    protected expectBendPointsEqual(expected: BendPoint[] | null, actual: BendPoint[] | null): void {
        if(expected == null || actual == null) {
            expect(actual).to.equal(expected)
            return;
        }
        expect(actual.length).to.equal(expected.length, 'Mismatch on Count');
        for (let i: number = 0; i < expected.length; i++) {
            expect(actual[i].value).to.equal(actual[i].value);
            expect(actual[i].offset).to.equal(actual[i].offset);
        }
    }

    protected expectPlaybackInformationEqual(expected: PlaybackInformation, actual: PlaybackInformation): void {
        expect(actual.volume).to.equal(expected.volume, 'Mismatch on Volume');
        expect(actual.balance).to.equal(expected.balance, 'Mismatch on Balance');
        // expect(actual.port).to.equal(expected.port, "Mismatch on Port");
        expect(actual.program).to.equal(expected.program, 'Mismatch on Program');
        // expect(actual.primaryChannel).to.equal(expected.primaryChannel, "Mismatch on PrimaryChannel");
        // expect(actual.secondaryChannel).to.equal(expected.secondaryChannel, "Mismatch on SecondaryChannel");
        expect(actual.isMute).to.equal(expected.isMute, 'Mismatch on IsMute');
        expect(actual.isSolo).to.equal(expected.isSolo, 'Mismatch on IsSolo');
    }

    protected expectMasterBarEqual(expected: MasterBar, actual: MasterBar): void {
        expect(actual.alternateEndings).to.equal(expected.alternateEndings, 'Mismatch on AlternateEndings');
        expect(actual.index).to.equal(expected.index, 'Mismatch on Index');
        expect(actual.keySignature).to.equal(expected.keySignature, 'Mismatch on KeySignature');
        expect(actual.keySignatureType).to.equal(expected.keySignatureType, 'Mismatch on KeySignatureType');
        expect(actual.isDoubleBar).to.equal(expected.isDoubleBar, 'Mismatch on IsDoubleBar');
        expect(actual.isRepeatStart).to.equal(expected.isRepeatStart, 'Mismatch on IsRepeatStart');
        expect(actual.repeatCount).to.equal(expected.repeatCount, 'Mismatch on RepeatCount');
        expect(actual.timeSignatureNumerator).to.equal(
            expected.timeSignatureNumerator,
            'Mismatch on TimeSignatureNumerator'
        );
        expect(actual.timeSignatureDenominator).to.equal(
            expected.timeSignatureDenominator,
            'Mismatch on TimeSignatureDenominator'
        );
        expect(actual.tripletFeel).to.equal(expected.tripletFeel, 'Mismatch on TripletFeel');
        this.expectSectionEqual(expected.section!, actual.section);
        expect(actual.start).to.equal(expected.start, 'Mismatch on Start');
    }

    protected expectSectionEqual(expected: Section | null, actual: Section | null): void {
        expect(!actual).to.equal(!expected);
        if (expected && actual) {
            expect(actual.text).to.equal(expected.text, 'Mismatch on Text');
            expect(actual.marker).to.equal(expected.marker, 'Mismatch on Marker');
        }
    }
}
