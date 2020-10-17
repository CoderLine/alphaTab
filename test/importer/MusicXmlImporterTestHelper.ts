import { LayoutMode } from '@src/DisplaySettings';
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
        try {
            let importer: MusicXmlImporter = MusicXmlImporterTestHelper.prepareImporterWithBytes(fileData);
            let score: Score = importer.readScore();
            return score;
        } catch (e) {
            if (e instanceof UnsupportedFormatError) {
                fail(`Failed to load file ${file}: ${e}`);
            }
            throw e;
        }
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
        expect(actual.album).toEqual(expected.album, 'Mismatch on Album');
        expect(actual.artist).toEqual(expected.artist, 'Mismatch on Artist');
        expect(actual.copyright).toEqual(expected.copyright, 'Mismatch on Copyright');
        expect(actual.instructions).toEqual(expected.instructions, 'Mismatch on Instructions');
        expect(actual.music).toEqual(expected.music, 'Mismatch on Music');
        expect(actual.notices).toEqual(expected.notices, 'Mismatch on Notices');
        expect(actual.subTitle).toEqual(expected.subTitle, 'Mismatch on SubTitle');
        expect(actual.title).toEqual(expected.title, 'Mismatch on Title');
        expect(actual.words).toEqual(expected.words, 'Mismatch on Words');
        expect(actual.tab).toEqual(expected.tab, 'Mismatch on Tab');
        expect(actual.tempo).toEqual(expected.tempo, 'Mismatch on Tempo');
        expect(actual.tempoLabel).toEqual(expected.tempoLabel, 'Mismatch on TempoLabel');
        expect(actual.masterBars.length).toEqual(expected.masterBars.length, 'Mismatch on MasterBars.Count');
        for (let i: number = 0; i < expected.masterBars.length; i++) {
            this.expectMasterBarEqual(expected.masterBars[i], actual.masterBars[i]);
        }
        expect(actual.tracks.length).toEqual(expected.tracks.length, 'Mismatch on Tracks.Count');
        for (let i: number = 0; i < expected.tracks.length; i++) {
            this.expectTrackEqual(expected.tracks[i], actual.tracks[i]);
        }
    }

    protected expectTrackEqual(expected: Track, actual: Track): void {
        expect(actual.index).toEqual(expected.index, 'Mismatch on Index');
        expect(actual.name).toEqual(expected.name, 'Mismatch on Name');
        this.expectPlaybackInformationEqual(expected.playbackInfo, actual.playbackInfo);
        expect(actual.staves.length).toEqual(expected.staves.length, 'Mismatch on Staves.Count');
        for (let i: number = 0; i < expected.staves.length; i++) {
            this.expectStaffEqual(expected.staves[i], actual.staves[i]);
        }
    }

    protected expectStaffEqual(expected: Staff, actual: Staff): void {
        expect(actual.capo).toEqual(expected.capo, 'Mismatch on Capo');
        expect(actual.isPercussion).toEqual(expected.isPercussion, 'Mismatch on IsPercussion');
        expect(actual.showStandardNotation).toEqual(expected.showStandardNotation, 'Mismatch on ShowStandardNotation');
        expect(actual.showTablature).toEqual(expected.showTablature, 'Mismatch on ShowTablature');
        expect(actual.tuning.join(',')).toEqual(expected.tuning.join(','));
        expect(actual.tuning.length).toEqual(expected.tuning.length, 'Mismatch on Tuning.Length');
        expect(actual.index).toEqual(expected.index, 'Mismatch on Index');
        expect(actual.bars.length).toEqual(expected.bars.length, 'Mismatch on Bars.Count');
        for (let i: number = 0; i < expected.bars.length; i++) {
            this.expectBarEqual(expected.bars[i], actual.bars[i]);
        }
    }

    protected expectBarEqual(expected: Bar, actual: Bar): void {
        expect(actual.index).toEqual(expected.index, 'Mismatch on Index');
        expect(actual.clef).toEqual(expected.clef, 'Mismatch on Clef');
        expect(actual.clefOttava).toEqual(expected.clefOttava, 'Mismatch on ClefOttavia');
        // Assert.AreEqual(expected.Voices.Count, actual.Voices.Count, "Mismatch on Voices.Count");
        for (let i: number = 0; i < Math.min(expected.voices.length, actual.voices.length); i++) {
            this.expectVoiceEqual(expected.voices[i], actual.voices[i]);
        }
    }

    protected expectVoiceEqual(expected: Voice, actual: Voice): void {
        expect(actual.index).toEqual(expected.index, 'Mismatch on Index');
        expect(actual.beats.length).toEqual(expected.beats.length, 'Mismatch on Beats.Count');
        for (let i: number = 0; i < expected.beats.length; i++) {
            this.expectBeatEqual(expected.beats[i], actual.beats[i]);
        }
    }

    protected expectBeatEqual(expected: Beat, actual: Beat): void {
        expect(actual.index).toEqual(expected.index, 'Mismatch on Index');
        expect(actual.isEmpty).toEqual(expected.isEmpty, 'Mismatch on IsEmpty');
        expect(actual.isRest).toEqual(expected.isRest, 'Mismatch on IsRest');
        expect(actual.dots).toEqual(expected.dots, 'Mismatch on Dots');
        expect(actual.fadeIn).toEqual(expected.fadeIn, 'Mismatch on FadeIn');
        expect(actual.isLegatoOrigin).toEqual(expected.isLegatoOrigin, 'Mismatch on IsLegatoOrigin');
        if (!expected.lyrics) {
            expect(actual.lyrics).toBeFalsy();
        } else {
            expect(actual.lyrics!.join(',')).toEqual(expected.lyrics.join(','));
        }
        expect(actual.pop).toEqual(expected.pop, 'Mismatch on Pop');
        expect(actual.hasChord).toEqual(expected.hasChord, 'Mismatch on HasChord');
        expect(actual.hasRasgueado).toEqual(expected.hasRasgueado, 'Mismatch on HasRasgueado');
        expect(actual.tap).toEqual(expected.tap);
        expect(actual.slap).toEqual(expected.slap);
        expect(actual.text).toEqual(expected.text, 'Mismatch on Text');
        expect(actual.brushType).toEqual(expected.brushType, 'Mismatch on BrushType');
        expect(actual.brushDuration).toEqual(expected.brushDuration, 'Mismatch on BrushDuration');
        expect(actual.tupletDenominator).toEqual(expected.tupletDenominator, 'Mismatch on TupletDenominator');
        expect(actual.tupletNumerator).toEqual(expected.tupletNumerator, 'Mismatch on TupletNumerator');
        this.expectBendPointsEqual(expected.whammyBarPoints, actual.whammyBarPoints);
        expect(actual.vibrato).toEqual(expected.vibrato, 'Mismatch on Vibrato');
        if (expected.hasChord) {
            this.expectChordEqual(expected.chord!, actual.chord!);
        }
        expect(actual.graceType).toEqual(expected.graceType, 'Mismatch on GraceType');
        expect(actual.pickStroke).toEqual(expected.pickStroke, 'Mismatch on PickStroke');
        expect(actual.tremoloSpeed).toEqual(expected.tremoloSpeed, 'Mismatch on TremoloSpeed');
        expect(actual.crescendo).toEqual(expected.crescendo, 'Mismatch on Crescendo');
        expect(actual.playbackStart).toEqual(expected.playbackStart, 'Mismatch on Start');
        expect(actual.displayStart).toEqual(expected.displayStart, 'Mismatch on Start');
        // Assert.AreEqual(expected.Dynamic, actual.Dynamic, "Mismatch on Dynamic");
        expect(actual.invertBeamDirection).toEqual(expected.invertBeamDirection, 'Mismatch on InvertBeamDirection');
        expect(actual.notes.length).toEqual(expected.notes.length, 'Mismatch on Notes.Count');
        for (let i: number = 0; i < expected.notes.length; i++) {
            this.expectNoteEqual(expected.notes[i], actual.notes[i]);
        }
    }

    protected expectNoteEqual(expected: Note, actual: Note): void {
        expect(actual.index).toEqual(expected.index, 'Mismatch on Index');
        expect(actual.accentuated).toEqual(expected.accentuated, 'Mismatch on Accentuated');
        this.expectBendPointsEqual(expected.bendPoints, actual.bendPoints);
        expect(actual.isStringed).toEqual(expected.isStringed, 'Mismatch on IsStringed');
        if (actual.isStringed) {
            expect(actual.fret).toEqual(expected.fret, 'Mismatch on Fret');
            expect(actual.string).toEqual(expected.string, 'Mismatch on String');
        }
        expect(actual.isPiano).toEqual(expected.isPiano, 'Mismatch on IsPiano');
        if (actual.isPiano) {
            expect(actual.octave).toEqual(expected.octave, 'Mismatch on Octave');
            expect(actual.tone).toEqual(expected.tone, 'Mismatch on Tone');
        }
        expect(actual.percussionArticulation).toEqual(expected.percussionArticulation, 'Mismatch on percussionArticulation');
        expect(actual.isHammerPullOrigin).toEqual(expected.isHammerPullOrigin, 'Mismatch on IsHammerPullOrigin');
        expect(actual.harmonicType).toEqual(expected.harmonicType, 'Mismatch on HarmonicType');
        expect(actual.harmonicValue).toEqual(expected.harmonicValue, 'Mismatch on HarmonicValue');
        expect(actual.isGhost).toEqual(expected.isGhost, 'Mismatch on IsGhost');
        expect(actual.isLetRing).toEqual(expected.isLetRing, 'Mismatch on IsLetRing');
        expect(actual.isPalmMute).toEqual(expected.isPalmMute, 'Mismatch on IsPalmMute');
        expect(actual.isDead).toEqual(expected.isDead, 'Mismatch on IsDead');
        expect(actual.isStaccato).toEqual(expected.isStaccato, 'Mismatch on IsStaccato');
        expect(actual.slideInType).toEqual(expected.slideInType, 'Mismatch on SlideInType');
        expect(actual.slideOutType).toEqual(expected.slideOutType, 'Mismatch on SlideOutType');
        expect(actual.vibrato).toEqual(expected.vibrato, 'Mismatch on Vibrato');
        expect(actual.isTieDestination).toEqual(expected.isTieDestination, 'Mismatch on IsTieDestination');
        expect(actual.isTieOrigin).toEqual(expected.isTieOrigin, 'Mismatch on IsTieOrigin');
        expect(actual.leftHandFinger).toEqual(expected.leftHandFinger, 'Mismatch on LeftHandFinger');
        expect(actual.isFingering).toEqual(expected.isFingering, 'Mismatch on IsFingering');
        expect(actual.trillValue).toEqual(expected.trillValue, 'Mismatch on TrillValue');
        expect(actual.trillSpeed).toEqual(expected.trillSpeed, 'Mismatch on TrillSpeed');
        expect(actual.durationPercent).toEqual(expected.durationPercent, 'Mismatch on DurationPercent');
        expect(actual.dynamics).toEqual(expected.dynamics, 'Mismatch on Dynamic');
        expect(actual.realValue).toEqual(expected.realValue, 'Mismatch on RealValue');
    }

    protected expectChordEqual(expected: Chord | null, actual: Chord): void {
        expect(!expected).toEqual(!actual);
        if (expected) {
            // expect(actual.name).toEqual(expected.name, 'Mismatch on Name');
        }
    }

    protected expectBendPointsEqual(expected: BendPoint[], actual: BendPoint[]): void {
        expect(actual.length).toEqual(expected.length, 'Mismatch on Count');
        for (let i: number = 0; i < expected.length; i++) {
            expect(actual[i].value).toEqual(actual[i].value);
            expect(actual[i].offset).toEqual(actual[i].offset);
        }
    }

    protected expectPlaybackInformationEqual(expected: PlaybackInformation, actual: PlaybackInformation): void {
        expect(actual.volume).toEqual(expected.volume, 'Mismatch on Volume');
        expect(actual.balance).toEqual(expected.balance, 'Mismatch on Balance');
        // expect(actual.port).toEqual(expected.port, "Mismatch on Port");
        expect(actual.program).toEqual(expected.program, 'Mismatch on Program');
        // expect(actual.primaryChannel).toEqual(expected.primaryChannel, "Mismatch on PrimaryChannel");
        // expect(actual.secondaryChannel).toEqual(expected.secondaryChannel, "Mismatch on SecondaryChannel");
        expect(actual.isMute).toEqual(expected.isMute, 'Mismatch on IsMute');
        expect(actual.isSolo).toEqual(expected.isSolo, 'Mismatch on IsSolo');
    }

    protected expectMasterBarEqual(expected: MasterBar, actual: MasterBar): void {
        expect(actual.alternateEndings).toEqual(expected.alternateEndings, 'Mismatch on AlternateEndings');
        expect(actual.index).toEqual(expected.index, 'Mismatch on Index');
        expect(actual.keySignature).toEqual(expected.keySignature, 'Mismatch on KeySignature');
        expect(actual.keySignatureType).toEqual(expected.keySignatureType, 'Mismatch on KeySignatureType');
        expect(actual.isDoubleBar).toEqual(expected.isDoubleBar, 'Mismatch on IsDoubleBar');
        expect(actual.isRepeatStart).toEqual(expected.isRepeatStart, 'Mismatch on IsRepeatStart');
        expect(actual.repeatCount).toEqual(expected.repeatCount, 'Mismatch on RepeatCount');
        expect(actual.timeSignatureNumerator).toEqual(
            expected.timeSignatureNumerator,
            'Mismatch on TimeSignatureNumerator'
        );
        expect(actual.timeSignatureDenominator).toEqual(
            expected.timeSignatureDenominator,
            'Mismatch on TimeSignatureDenominator'
        );
        expect(actual.tripletFeel).toEqual(expected.tripletFeel, 'Mismatch on TripletFeel');
        this.expectSectionEqual(expected.section!, actual.section);
        expect(actual.start).toEqual(expected.start, 'Mismatch on Start');
    }

    protected expectSectionEqual(expected: Section | null, actual: Section | null): void {
        expect(!actual).toEqual(!expected);
        if (expected && actual) {
            expect(actual.text).toEqual(expected.text, 'Mismatch on Text');
            expect(actual.marker).toEqual(expected.marker, 'Mismatch on Marker');
        }
    }
}
