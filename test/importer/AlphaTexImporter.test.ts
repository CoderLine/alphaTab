import { StaveProfile } from '@src/StaveProfile';
import { AlphaTexError, AlphaTexImporter, AlphaTexSymbols } from '@src/importer/AlphaTexImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { type Beat, BeatBeamingMode } from '@src/model/Beat';
import { BrushType } from '@src/model/BrushType';
import { Clef } from '@src/model/Clef';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { type Score, ScoreSubElement } from '@src/model/Score';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import type { Staff } from '@src/model/Staff';
import type { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { Tuning } from '@src/model/Tuning';
import { HarmonicsEffectInfo } from '@src/rendering/effects/HarmonicsEffectInfo';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { Settings } from '@src/Settings';
import { assert, expect } from 'chai';
import { ModelUtils } from '@src/model/ModelUtils';
import { GolpeType } from '@src/model/GolpeType';
import { FadeType } from '@src/model/FadeType';
import { BarreShape } from '@src/model/BarreShape';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { Rasgueado } from '@src/model/Rasgueado';
import { Direction } from '@src/model/Direction';
import { BracketExtendMode, TrackNameMode, TrackNameOrientation, TrackNamePolicy } from '@src/model/RenderStylesheet';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { AutomationType } from '@src/model/Automation';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { FermataType } from '@src/model/Fermata';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { Ottavia } from '@src/model/Ottavia';
import { SimileMark } from '@src/model/SimileMark';
import { VibratoType } from '@src/model/VibratoType';
import { WhammyType } from '@src/model/WhammyType';
import { TextAlign } from '@src/platform/ICanvas';

describe('AlphaTexImporterTest', () => {
    function parseTex(tex: string): Score {
        const importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        return importer.readScore();
    }

    it('ensure-metadata-parsing-issue73', () => {
        const tex = `\\title Test
        \\words test
        \\music alphaTab
        \\copyright test
        \\tempo 200
        \\instrument 30
        \\capo 2
        \\tuning G3 D2 G2 B2 D3 A4
        .
        0.5.2 1.5.4 3.4.4 | 5.3.8 5.3.8 5.3.8 5.3.8 r.2`;

        const score: Score = parseTex(tex);
        expect(score.title).to.equal('Test');
        expect(score.words).to.equal('test');
        expect(score.music).to.equal('alphaTab');
        expect(score.copyright).to.equal('test');
        expect(score.tempo).to.equal(200);
        expect(score.tracks.length).to.equal(1);
        expect(score.tracks[0].playbackInfo.program).to.equal(30);
        expect(score.tracks[0].staves[0].capo).to.equal(2);
        expect(score.tracks[0].staves[0].tuning.join(',')).to.equal('55,38,43,47,50,69');
        expect(score.masterBars.length).to.equal(2);

        // bars[0]
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].duration).to.equal(Duration.Half);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].duration).to.equal(Duration.Quarter);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].duration).to.equal(Duration.Quarter);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].string).to.equal(3);

        // bars[1]
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].duration).to.equal(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].fret).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].string).to.equal(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].duration).to.equal(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].fret).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].string).to.equal(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].duration).to.equal(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].fret).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].string).to.equal(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].duration).to.equal(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].fret).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].string).to.equal(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].notes.length).to.equal(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].duration).to.equal(Duration.Half);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].isRest).to.equal(true);
    });

    it('tuning', () => {
        const tex = `\\tuning E4 B3 G3 D3 A2 E2
        .
        0.5.1`;

        const score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].tuning.join(',')).to.equal(Tuning.getDefaultTuningFor(6)!.tunings.join(','));
    });

    it('dead-notes1-issue79', () => {
        const tex: string = ':4 x.3';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).to.equal(true);
    });

    it('dead-notes2-issue79', () => {
        const tex: string = ':4 3.3{x}';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).to.equal(true);
    });

    it('trill-issue79', () => {
        const tex: string = ':4 3.3{tr 5 16}';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isTrill).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).to.equal(Duration.Sixteenth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).to.equal(5);
    });

    it('tremolo-issue79', () => {
        const tex: string = ':4 3.3{tr 5 16}';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isTrill).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).to.equal(Duration.Sixteenth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).to.equal(5);
    });

    it('tremolo-picking-issue79', () => {
        const tex: string = ':4 3.3{tp 16}';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isTremolo).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].tremoloSpeed).to.equal(Duration.Sixteenth);
    });

    it('brushes-arpeggio', () => {
        const tex: string = `
            (1.1 2.2 3.3 4.4).4{bd 60} (1.1 2.2 3.3 4.4).8{bu 60} (1.1 2.2 3.3 4.4).2{ad 60} (1.1 2.2 3.3 4.4).16{au 60} r |
            (1.1 2.2 3.3 4.4).4{bd 120} (1.1 2.2 3.3 4.4).8{bu 120} (1.1 2.2 3.3 4.4).2{ad 120} (1.1 2.2 3.3 4.4).16{au 120} r |
            (1.1 2.2 3.3 4.4).4{bd} (1.1 2.2 3.3 4.4).8{bu} (1.1 2.2 3.3 4.4).2{ad} (1.1 2.2 3.3 4.4).16{au} r
        `;
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushType).to.equal(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].playbackDuration).to.equal(960);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushType).to.equal(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].playbackDuration).to.equal(480);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].brushType).to.equal(BrushType.ArpeggioDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].playbackDuration).to.equal(1920);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].brushType).to.equal(BrushType.ArpeggioUp);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].playbackDuration).to.equal(240);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].isRest).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].brushType).to.equal(BrushType.None);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].playbackDuration).to.equal(240);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].brushDuration).to.equal(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].brushType).to.equal(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].brushDuration).to.equal(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].brushType).to.equal(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].brushDuration).to.equal(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].brushType).to.equal(BrushType.ArpeggioDown);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].brushDuration).to.equal(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].brushType).to.equal(BrushType.ArpeggioUp);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].brushDuration).to.equal(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].isRest).to.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].brushType).to.equal(BrushType.None);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].brushDuration).to.equal(0);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].brushType).to.equal(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].brushType).to.equal(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].brushDuration).to.equal(30);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].brushType).to.equal(BrushType.ArpeggioDown);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].brushDuration).to.equal(480);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].brushType).to.equal(BrushType.ArpeggioUp);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[4].isRest).to.equal(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[4].brushType).to.equal(BrushType.None);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[4].brushDuration).to.equal(0);
    });

    it('hamonics-issue79', () => {
        const tex: string = ':8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).to.equal(
            HarmonicType.Natural
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).to.equal(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).to.equal(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).to.equal(HarmonicType.Pinch);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).to.equal(HarmonicType.Semi);
    });

    it('hamonics-rendering-text-issue79', () => {
        const tex: string = ':8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}';
        const score: Score = parseTex(tex);
        const settings: Settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;
        settings.display.staveProfile = StaveProfile.ScoreTab;
        const renderer: ScoreRenderer = new ScoreRenderer(settings);
        renderer.width = 970;
        let svg: string = '';
        renderer.partialRenderFinished.on(r => {
            svg += r.renderResult;
        });
        renderer.renderScore(score, [0]);
        const regexTemplate: string = '<text[^>]+>\\s*{0}\\s*</text>';
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Natural))).exec(
                svg
            )
        ).to.be.ok;
        expect(
            new RegExp(
                regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Artificial))
            ).exec(svg)
        ).to.be.ok;
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Tap))).exec(svg)
        ).to.be.ok;
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Pinch))).exec(svg)
        ).to.be.ok;
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Semi))).exec(svg)
        ).to.be.ok;
    });

    it('grace-issue79', () => {
        const tex: string = ':8 3.3{gr} 3.3{gr ob}';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].graceType).to.equal(GraceType.BeforeBeat);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].graceType).to.equal(GraceType.OnBeat);
    });

    it('left-hand-finger-single-note', () => {
        const tex: string = ':8 3.3{lf 1} 3.3{lf 2} 3.3{lf 3} 3.3{lf 4} 3.3{lf 5}';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(5);
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
    });

    it('right-hand-finger-single-note', () => {
        const tex: string = ':8 3.3{rf 1} 3.3{rf 2} 3.3{rf 3} 3.3{rf 4} 3.3{rf 5}';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].rightHandFinger).to.equal(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].rightHandFinger).to.equal(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].rightHandFinger).to.equal(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].rightHandFinger).to.equal(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].rightHandFinger).to.equal(
            Fingers.LittleFinger
        );
    });

    it('left-hand-finger-chord', () => {
        const tex: string = ':8 (3.1{lf 1} 3.2{lf 2} 3.3{lf 3} 3.4{lf 4} 3.5{lf 5})';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger).to.equal(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].leftHandFinger).to.equal(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].leftHandFinger).to.equal(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].leftHandFinger).to.equal(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[4].leftHandFinger).to.equal(
            Fingers.LittleFinger
        );
    });

    it('right-hand-finger-chord', () => {
        const tex: string = ':8 (3.1{rf 1} 3.2{rf 2} 3.3{rf 3} 3.4{rf 4} 3.5{rf 5})';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].rightHandFinger).to.equal(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].rightHandFinger).to.equal(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].rightHandFinger).to.equal(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].rightHandFinger).to.equal(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[4].rightHandFinger).to.equal(
            Fingers.LittleFinger
        );
    });

    it('unstringed', () => {
        const tex: string = '\\tuning piano . c4 c#4 d4 d#4 | c4 db4 d4 eb4';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].realValue).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].realValue).to.equal(61);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].realValue).to.equal(62);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].realValue).to.equal(63);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).to.equal(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].realValue).to.equal(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].realValue).to.equal(61);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].realValue).to.equal(62);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].realValue).to.equal(63);
    });

    it('multi-staff-default-settings', () => {
        const tex: string = '1.1 | 1.1 | \\staff 2.1 | 2.1';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(2);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[0].staves[1].showTablature).to.be.equal(true); // default settings used

        expect(score.tracks[0].staves[1].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[1].bars.length).to.equal(2);
    });

    it('multi-staff-default-settings-braces', () => {
        const tex: string = '1.1 | 1.1 | \\staff{} 2.1 | 2.1';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(2);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[0].staves[1].showTablature).to.be.equal(true); // default settings used

        expect(score.tracks[0].staves[1].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[1].bars.length).to.equal(2);
    });

    it('single-staff-with-setting', () => {
        const tex: string = '\\staff{score} 1.1 | 1.1';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(1);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(false);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
    });

    it('single-staff-with-slash', () => {
        const tex: string = '\\staff{slash} 1.1 | 1.1';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(1);
        expect(score.tracks[0].staves[0].showSlash).to.be.equal(true);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(false);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(false);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
    });

    it('single-staff-with-score-and-slash', () => {
        const tex: string = '\\staff{score slash} 1.1 | 1.1';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(1);
        expect(score.tracks[0].staves[0].showSlash).to.be.equal(true);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(false);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
    });

    it('multi-staff-with-settings', () => {
        const tex = `\\staff{score} 1.1 | 1.1 |
        \\staff{tabs} \\capo 2 2.1 | 2.1 |
        \\staff{score tabs} \\tuning A1 D2 A2 D3 G3 B3 E4 3.1 | 3.1`;
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(3);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(false);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[0].staves[1].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[1].showStandardNotation).to.be.equal(false);
        expect(score.tracks[0].staves[1].bars.length).to.equal(2);
        expect(score.tracks[0].staves[1].capo).to.equal(2);
        expect(score.tracks[0].staves[2].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[2].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[2].bars.length).to.equal(2);
        expect(score.tracks[0].staves[2].tuning.length).to.equal(7);
    });

    it('multi-track', () => {
        const tex: string = '\\track "First" 1.1 | 1.1 | \\track "Second" 2.2 | 2.2';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(2);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(1);
        expect(score.tracks[0].name).to.equal('First');
        expect(score.tracks[0].playbackInfo.primaryChannel).to.equal(0);
        expect(score.tracks[0].playbackInfo.secondaryChannel).to.equal(1);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[1].staves.length).to.equal(1);
        expect(score.tracks[1].name).to.equal('Second');
        expect(score.tracks[1].playbackInfo.primaryChannel).to.equal(2);
        expect(score.tracks[1].playbackInfo.secondaryChannel).to.equal(3);
        expect(score.tracks[1].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[1].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[1].staves[0].bars.length).to.equal(2);
    });

    it('multi-track-names', () => {
        const tex: string =
            '\\track 1.1 | 1.1 | \\track "Only Long Name" 2.2 | 2.2 | \\track "Very Long Name" "shrt" 3.3 | 3.3 ';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(3);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(1);
        expect(score.tracks[0].name).to.equal('');
        expect(score.tracks[0].shortName).to.equal('');
        expect(score.tracks[0].playbackInfo.primaryChannel).to.equal(0);
        expect(score.tracks[0].playbackInfo.secondaryChannel).to.equal(1);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[1].staves.length).to.equal(1);
        expect(score.tracks[1].name).to.equal('Only Long Name');
        expect(score.tracks[1].shortName).to.equal('Only Long ');
        expect(score.tracks[1].playbackInfo.primaryChannel).to.equal(2);
        expect(score.tracks[1].playbackInfo.secondaryChannel).to.equal(3);
        expect(score.tracks[1].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[1].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[1].staves[0].bars.length).to.equal(2);
        expect(score.tracks[2].staves.length).to.equal(1);
        expect(score.tracks[2].name).to.equal('Very Long Name');
        expect(score.tracks[2].shortName).to.equal('shrt');
        expect(score.tracks[2].playbackInfo.primaryChannel).to.equal(4);
        expect(score.tracks[2].playbackInfo.secondaryChannel).to.equal(5);
        expect(score.tracks[2].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[2].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[2].staves[0].bars.length).to.equal(2);
    });

    it('multi-track-multi-staff', () => {
        const tex = `\\track "Piano"
            \\staff{score} \\tuning piano \\instrument acousticgrandpiano
            c4 d4 e4 f4 |

            \\staff{score} \\tuning piano \\clef F4
            c2 c2 c2 c2 |

            \\track "Guitar"
                \\staff{tabs}
                1.2 3.2 0.1 1.1 |

            \\track "Second Guitar"
                1.2 3.2 0.1 1.1
        `;
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(3);
        expect(score.masterBars.length).to.equal(1);
        {
            const track1: Track = score.tracks[0];
            expect(track1.name).to.equal('Piano');
            expect(track1.staves.length).to.equal(2);
            expect(track1.playbackInfo.program).to.equal(0);
            expect(track1.playbackInfo.primaryChannel).to.equal(0);
            expect(track1.playbackInfo.secondaryChannel).to.equal(1);
            {
                const staff1: Staff = track1.staves[0];
                expect(staff1.showTablature).to.be.equal(false);
                expect(staff1.showStandardNotation).to.be.equal(true);
                expect(staff1.tuning.length).to.equal(0);
                expect(staff1.bars.length).to.equal(1);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
            {
                const staff2: Staff = track1.staves[1];
                expect(staff2.showTablature).to.be.equal(false);
                expect(staff2.showStandardNotation).to.be.equal(true);
                expect(staff2.tuning.length).to.equal(0);
                expect(staff2.bars.length).to.equal(1);
                expect(staff2.bars[0].clef).to.equal(Clef.F4);
            }
        }
        {
            const track2: Track = score.tracks[1];
            expect(track2.name).to.equal('Guitar');
            expect(track2.staves.length).to.equal(1);
            expect(track2.playbackInfo.program).to.equal(25);
            expect(track2.playbackInfo.primaryChannel).to.equal(2);
            expect(track2.playbackInfo.secondaryChannel).to.equal(3);
            {
                const staff1: Staff = track2.staves[0];
                expect(staff1.showTablature).to.be.equal(true);
                expect(staff1.showStandardNotation).to.be.equal(false);
                expect(staff1.tuning.length).to.equal(6);
                expect(staff1.bars.length).to.equal(1);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
        }
        {
            const track3: Track = score.tracks[2];
            expect(track3.name).to.equal('Second Guitar');
            expect(track3.staves.length).to.equal(1);
            expect(track3.playbackInfo.program).to.equal(25);
            expect(track3.playbackInfo.primaryChannel).to.equal(4);
            expect(track3.playbackInfo.secondaryChannel).to.equal(5);
            {
                const staff1: Staff = track3.staves[0];
                expect(staff1.showTablature).to.be.equal(true);
                expect(staff1.showStandardNotation).to.be.equal(true);
                expect(staff1.tuning.length).to.equal(6);
                expect(staff1.bars.length).to.equal(1);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
        }
    });

    it('multi-track-multi-staff-inconsistent-bars', () => {
        const tex: string = `
         \\track "Piano"
            \\staff{score} \\tuning piano \\instrument acousticgrandpiano
            c4 d4 e4 f4 |

            \\staff{score} \\tuning piano \\clef F4
            c2 c2 c2 c2 | c2 c2 c2 c2 | c2 c2 c2 c2 |

          \\track "Guitar"
            \\staff{tabs}
            1.2 3.2 0.1 1.1 | 1.2 3.2 0.1 1.1 |

          \\track "Second Guitar"
            1.2 3.2 0.1 1.1
        `;
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(3);
        expect(score.masterBars.length).to.equal(3);
        {
            const track1: Track = score.tracks[0];
            expect(track1.name).to.equal('Piano');
            expect(track1.staves.length).to.equal(2);
            expect(track1.playbackInfo.program).to.equal(0);
            expect(track1.playbackInfo.primaryChannel).to.equal(0);
            expect(track1.playbackInfo.secondaryChannel).to.equal(1);
            {
                const staff1: Staff = track1.staves[0];
                expect(staff1.showTablature).to.be.equal(false);
                expect(staff1.showStandardNotation).to.be.equal(true);
                expect(staff1.tuning.length).to.equal(0);
                expect(staff1.bars.length).to.equal(3);
                expect(staff1.bars[0].isEmpty).to.be.equal(false);
                expect(staff1.bars[1].isEmpty).to.be.equal(true);
                expect(staff1.bars[2].isEmpty).to.be.equal(true);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
            {
                const staff2: Staff = track1.staves[1];
                expect(staff2.showTablature).to.be.equal(false);
                expect(staff2.showStandardNotation).to.be.equal(true);
                expect(staff2.tuning.length).to.equal(0);
                expect(staff2.bars.length).to.equal(3);
                expect(staff2.bars[0].isEmpty).to.be.equal(false);
                expect(staff2.bars[1].isEmpty).to.be.equal(false);
                expect(staff2.bars[2].isEmpty).to.be.equal(false);
                expect(staff2.bars[0].clef).to.equal(Clef.F4);
            }
        }
        {
            const track2: Track = score.tracks[1];
            expect(track2.name).to.equal('Guitar');
            expect(track2.staves.length).to.equal(1);
            expect(track2.playbackInfo.program).to.equal(25);
            expect(track2.playbackInfo.primaryChannel).to.equal(2);
            expect(track2.playbackInfo.secondaryChannel).to.equal(3);
            {
                const staff1: Staff = track2.staves[0];
                expect(staff1.showTablature).to.be.equal(true);
                expect(staff1.showStandardNotation).to.be.equal(false);
                expect(staff1.tuning.length).to.equal(6);
                expect(staff1.bars.length).to.equal(3);
                expect(staff1.bars[0].isEmpty).to.be.equal(false);
                expect(staff1.bars[1].isEmpty).to.be.equal(false);
                expect(staff1.bars[2].isEmpty).to.be.equal(true);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
        }
        {
            const track3: Track = score.tracks[2];
            expect(track3.name).to.equal('Second Guitar');
            expect(track3.staves.length).to.equal(1);
            expect(track3.playbackInfo.program).to.equal(25);
            expect(track3.playbackInfo.primaryChannel).to.equal(4);
            expect(track3.playbackInfo.secondaryChannel).to.equal(5);
            {
                const staff1: Staff = track3.staves[0];
                expect(staff1.showTablature).to.be.equal(true);
                expect(staff1.showStandardNotation).to.be.equal(true);
                expect(staff1.tuning.length).to.equal(6);
                expect(staff1.bars.length).to.equal(3);
                expect(staff1.bars[0].isEmpty).to.be.equal(false);
                expect(staff1.bars[1].isEmpty).to.be.equal(true);
                expect(staff1.bars[2].isEmpty).to.be.equal(true);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
        }
    });

    it('slides', () => {
        const tex: string = '3.3{sl} 4.3 | 3.3{ss} 4.3 | 3.3{sib} 3.3{sia} 3.3{sou} 3.3{sod} | 3.3{psd} 3.3{psu}';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideOutType).to.equal(
            SlideOutType.Legato
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideTarget!.id).to.equal(
            score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].id
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideOutType).to.equal(SlideOutType.Shift);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideTarget!.id).to.equal(
            score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].id
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].slideInType).to.equal(
            SlideInType.IntoFromBelow
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0].slideInType).to.equal(
            SlideInType.IntoFromAbove
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].notes[0].slideOutType).to.equal(SlideOutType.OutUp);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].slideOutType).to.equal(
            SlideOutType.OutDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideUp
        );
    });

    it('section', () => {
        const tex: string = '\\section Intro 1.1 | 1.1 | \\section "Chorus 01" 1.1 | \\section S Solo';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(4);
        expect(score.masterBars[0].isSectionStart).to.be.equal(true);
        expect(score.masterBars[0].section!.text).to.equal('Intro');
        expect(score.masterBars[0].section!.marker).to.equal('');
        expect(score.masterBars[1].isSectionStart).to.be.equal(false);
        expect(score.masterBars[2].isSectionStart).to.be.equal(true);
        expect(score.masterBars[2].section!.text).to.equal('Chorus 01');
        expect(score.masterBars[2].section!.marker).to.equal('');
        expect(score.masterBars[3].isSectionStart).to.be.equal(true);
        expect(score.masterBars[3].section!.text).to.equal('Solo');
        expect(score.masterBars[3].section!.marker).to.equal('S');
    });

    it('key-signature', () => {
        const tex: string = `:1 3.3 | \\ks C 3.3 | \\ks Cmajor 3.3 | \\ks Aminor 3.3 |
        \\ks F 3.3 | \\ks bbmajor 3.3 | \\ks CMINOR 3.3 | \\ks aB 3.3 | \\ks db 3.3 | \\ks Ebminor 3.3 |
        \\ks g 3.3 | \\ks Dmajor 3.3 | \\ks f#minor 3.3 | \\ks E 3.3 | \\ks Bmajor 3.3 | \\ks d#minor 3.3`;
        const score: Score = parseTex(tex);

        const bars = score.tracks[0].staves[0].bars;
        const expected: [KeySignature, KeySignatureType][] = [
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Minor],
            [KeySignature.F, KeySignatureType.Major],
            [KeySignature.Bb, KeySignatureType.Major],
            [KeySignature.Eb, KeySignatureType.Minor],
            [KeySignature.Ab, KeySignatureType.Major],
            [KeySignature.Db, KeySignatureType.Major],
            [KeySignature.Gb, KeySignatureType.Minor],
            [KeySignature.G, KeySignatureType.Major],
            [KeySignature.D, KeySignatureType.Major],
            [KeySignature.A, KeySignatureType.Minor],
            [KeySignature.E, KeySignatureType.Major],
            [KeySignature.B, KeySignatureType.Major],
            [KeySignature.FSharp, KeySignatureType.Minor]
        ];

        for (let i = 0; i < expected.length; i++) {
            expect(bars[i].keySignature).to.equal(expected[i][0]);
            expect(bars[i].keySignatureType).to.equal(expected[i][1]);
        }
    });

    it('key-signature-multi-staff', () => {
        const tex: string = `
        \\track T1
            \\staff 
                :1 3.3 | \\ks C 3.3 | \\ks Cmajor 3.3 | \\ks Aminor 3.3 |
                \\ks F 3.3 | \\ks bbmajor 3.3 | \\ks CMINOR 3.3 | \\ks aB 3.3 | \\ks db 3.3 | \\ks Ebminor 3.3 |
                \\ks g 3.3 | \\ks Dmajor 3.3 | \\ks f#minor 3.3 | \\ks E 3.3 | \\ks Bmajor 3.3 | \\ks d#minor 3.3
            \\staff
                \\ks d#minor :1 3.3 | \\ks Bmajor 3.3 | \\ks E 3.3 |
                \\ks f#minor 3.3 | \\ks Dmajor 3.3 | \\ks g 3.3 | \\ks Ebminor 3.3 | \\ks db 3.3 | \\ks aB 3.3 |
                \\ks CMINOR 3.3 | \\ks bbmajor 3.3 | \\ks F 3.3 | \\ks Aminor 3.3 | \\ks Cmajor 3.3 | \\ks C 3.3 | \\ks C 3.3  
        `;
        const score: Score = parseTex(tex);

        let bars = score.tracks[0].staves[0].bars;
        const expected: [KeySignature, KeySignatureType][] = [
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Minor],
            [KeySignature.F, KeySignatureType.Major],
            [KeySignature.Bb, KeySignatureType.Major],
            [KeySignature.Eb, KeySignatureType.Minor],
            [KeySignature.Ab, KeySignatureType.Major],
            [KeySignature.Db, KeySignatureType.Major],
            [KeySignature.Gb, KeySignatureType.Minor],
            [KeySignature.G, KeySignatureType.Major],
            [KeySignature.D, KeySignatureType.Major],
            [KeySignature.A, KeySignatureType.Minor],
            [KeySignature.E, KeySignatureType.Major],
            [KeySignature.B, KeySignatureType.Major],
            [KeySignature.FSharp, KeySignatureType.Minor]
        ];

        for (let i = 0; i < expected.length; i++) {
            expect(bars[i].keySignature).to.equal(expected[i][0]);
            expect(bars[i].keySignatureType).to.equal(expected[i][1]);
        }

        bars = score.tracks[0].staves[1].bars;
        expected.reverse();
        for (let i = 0; i < expected.length; i++) {
            expect(bars[i].keySignature).to.equal(expected[i][0], `at ${i}`);
            expect(bars[i].keySignatureType).to.equal(expected[i][1], `at ${i}`);
        }
    });

    it('pop-slap-tap', () => {
        const tex: string = '3.3{p} 3.3{s} 3.3{tt} r';
        const score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].pop).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].slap).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tap).to.be.equal(true);
    });

    it('triplet-feel-numeric', () => {
        const tex: string = '\\tf 0 | \\tf 1 | \\tf 2 | \\tf 3 | \\tf 4 | \\tf 5 | \\tf 6';
        const score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).to.equal(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).to.equal(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).to.equal(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).to.equal(TripletFeel.Scottish8th);
    });

    it('triplet-feel-long-names', () => {
        const tex: string =
            '\\tf none | \\tf triplet-16th | \\tf triplet-8th | \\tf dotted-16th | \\tf dotted-8th | \\tf scottish-16th | \\tf scottish-8th';
        const score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).to.equal(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).to.equal(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).to.equal(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).to.equal(TripletFeel.Scottish8th);
    });

    it('triplet-feel-short-names', () => {
        const tex: string = '\\tf no | \\tf t16 | \\tf t8 | \\tf d16 | \\tf d8 | \\tf s16 | \\tf s8';
        const score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).to.equal(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).to.equal(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).to.equal(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).to.equal(TripletFeel.Scottish8th);
    });

    it('triplet-feel-multi-bar', () => {
        const tex: string = '\\tf t16 C4 | C4  | C4  | \\tf t8 C4 | C4 | C4 | \\tf no | C4  | C4 ';
        const score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[1].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[3].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[4].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[5].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[6].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
        expect(score.masterBars[7].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
        expect(score.masterBars[8].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
    });

    it('tuplet-repeat', () => {
        const tex: string = ':8 5.3{tu 3}*3';
        const score: Score = parseTex(tex);
        const durations: Duration[] = [Duration.Eighth, Duration.Eighth, Duration.Eighth];
        const tuplets = [3, 3, 3];
        let i: number = 0;
        let b: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b) {
            expect(b.duration).to.equal(durations[i], `Duration on beat ${i} was wrong`);
            if (tuplets[i] === 1) {
                expect(b.hasTuplet).to.be.equal(false);
            } else {
                expect(b.tupletNumerator).to.equal(tuplets[i], `Tuplet on beat ${i} was wrong`);
            }
            b = b.nextBeat;
            i++;
        }
        expect(i).to.equal(durations.length);
    });

    it('tuplet-custom', () => {
        const tex: string = ':8 5.3{tu 5 2}*5';
        const score: Score = parseTex(tex);
        const tupletNumerators = [5, 5, 5, 5, 5];
        const tupletDenominators = [2, 2, 2, 2, 2];

        let i: number = 0;
        let b: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b) {
            expect(b.tupletNumerator).to.equal(tupletNumerators[i], `Tuplet on beat ${i} was wrong`);
            expect(b.tupletDenominator).to.equal(tupletDenominators[i], `Tuplet on beat ${i} was wrong`);
            b = b.nextBeat;
            i++;
        }
    });

    it('simple-anacrusis', () => {
        const tex: string = '\\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        const score: Score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[0].calculateDuration()).to.equal(1920);
        expect(score.masterBars[1].calculateDuration()).to.equal(3840);
    });

    it('multi-bar-anacrusis', () => {
        const tex: string = '\\ac 3.3 3.3 | \\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        const score: Score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[1].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[0].calculateDuration()).to.equal(1920);
        expect(score.masterBars[1].calculateDuration()).to.equal(1920);
        expect(score.masterBars[2].calculateDuration()).to.equal(3840);
    });

    it('random-anacrusis', () => {
        const tex: string = '\\ac 3.3 3.3 | 1.1 2.1 3.1 4.1 | \\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        const score: Score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[1].isAnacrusis).to.be.equal(false);
        expect(score.masterBars[2].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[3].isAnacrusis).to.be.equal(false);
        expect(score.masterBars[0].calculateDuration()).to.equal(1920);
        expect(score.masterBars[1].calculateDuration()).to.equal(3840);
        expect(score.masterBars[2].calculateDuration()).to.equal(1920);
        expect(score.masterBars[3].calculateDuration()).to.equal(3840);
    });

    it('repeat', () => {
        const tex: string =
            '\\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 | \\ro \\rc 3 1.3 2.3 3.3 4.3 |';
        const score: Score = parseTex(tex);
        expect(score.masterBars[0].isRepeatStart).to.be.equal(true);
        expect(score.masterBars[1].isRepeatStart).to.be.equal(false);
        expect(score.masterBars[2].isRepeatStart).to.be.equal(false);
        expect(score.masterBars[3].isRepeatStart).to.be.equal(true);
        expect(score.masterBars[0].repeatCount).to.equal(0);
        expect(score.masterBars[1].repeatCount).to.equal(0);
        expect(score.masterBars[2].repeatCount).to.equal(2);
        expect(score.masterBars[3].repeatCount).to.equal(3);
    });

    it('alternate-endings', () => {
        const tex: string = '\\ro 4.3*4 | \\ae (1 2 3) 6.3*4 | \\ae 4 \\rc 4 6.3 6.3 6.3 5.3 |';
        const score: Score = parseTex(tex);
        expect(score.masterBars[0].isRepeatStart).to.be.equal(true);
        expect(score.masterBars[1].isRepeatStart).to.be.equal(false);
        expect(score.masterBars[2].isRepeatStart).to.be.equal(false);
        expect(score.masterBars[0].repeatCount).to.equal(0);
        expect(score.masterBars[1].repeatCount).to.equal(0);
        expect(score.masterBars[2].repeatCount).to.equal(4);
        expect(score.masterBars[0].alternateEndings).to.equal(0b0000);
        expect(score.masterBars[1].alternateEndings).to.equal(0b0111);
        expect(score.masterBars[2].alternateEndings).to.equal(0b1000);
    });

    it('random-alternate-endings', () => {
        const tex: string = `
            \\ro \\ae 1 1.1.1 | \\ae 2 2.1 | \\ae 3 3.1 |
            4.3.4*4 |
            \\ae 1 1.1.1 | \\ae 2 2.1 | \\ae 3 3.1 |
            4.3.4*4 |
            \\ae (1 3) 1.1.1 | \\ae 2 \\rc 3 2.1 |
        `;
        const score: Score = parseTex(tex);
        expect(score.masterBars[0].isRepeatStart).to.be.equal(true);
        for (let i = 1; i <= 9; i++) {
            expect(score.masterBars[i].isRepeatStart).to.be.equal(false);
        }
        for (let i = 0; i <= 8; i++) {
            expect(score.masterBars[i].repeatCount).to.equal(0);
        }
        expect(score.masterBars[9].repeatCount).to.equal(3);
        expect(score.masterBars[0].alternateEndings).to.equal(0b001);
        expect(score.masterBars[1].alternateEndings).to.equal(0b010);
        expect(score.masterBars[2].alternateEndings).to.equal(0b100);
        expect(score.masterBars[3].alternateEndings).to.equal(0b000);
        expect(score.masterBars[4].alternateEndings).to.equal(0b001);
        expect(score.masterBars[5].alternateEndings).to.equal(0b010);
        expect(score.masterBars[6].alternateEndings).to.equal(0b100);
        expect(score.masterBars[7].alternateEndings).to.equal(0b000);
        expect(score.masterBars[8].alternateEndings).to.equal(0b101);
        expect(score.masterBars[9].alternateEndings).to.equal(0b010);
    });

    it('default-transposition-on-instruments', () => {
        const tex: string = `
            \\track "Piano with Grand Staff" "pno."
                \\staff{score} \\tuning piano \\instrument acousticgrandpiano
                c4 d4 e4 f4 |
                \\staff{score} \\tuning piano \\clef F4
                c2 c2 c2 c2 |
            \\track Guitar
                \\staff{tabs} \\instrument acousticguitarsteel \\capo 5
                1.2 3.2 0.1 1.1
        `;
        const score: Score = parseTex(tex);

        expect(score.tracks[0].staves[0].transpositionPitch).to.equal(0);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(0);
        expect(score.tracks[0].staves[1].transpositionPitch).to.equal(0);
        expect(score.tracks[0].staves[1].displayTranspositionPitch).to.equal(0);
        expect(score.tracks[1].staves[0].transpositionPitch).to.equal(0);
        expect(score.tracks[1].staves[0].displayTranspositionPitch).to.equal(-12);
    });

    it('dynamics', () => {
        const tex: string = '1.1.8{dy ppp} 1.1{dy pp} 1.1{dy p} 1.1{dy mp} 1.1{dy mf} 1.1{dy f} 1.1{dy ff} 1.1{dy fff}';
        const score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).to.equal(DynamicValue.PP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].dynamics).to.equal(DynamicValue.P);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].dynamics).to.equal(DynamicValue.MP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].dynamics).to.equal(DynamicValue.MF);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].dynamics).to.equal(DynamicValue.F);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].dynamics).to.equal(DynamicValue.FF);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].dynamics).to.equal(DynamicValue.FFF);
    });

    it('dynamics-auto', () => {
        const tex: string = '1.1.4{dy ppp} 1.1 1.1{dy mp} 1.1';
        const score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].dynamics).to.equal(DynamicValue.MP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].dynamics).to.equal(DynamicValue.MP);
    });

    it('dynamics-auto-reset-on-track', () => {
        const tex: string = '1.1.4{dy ppp} 1.1 \\track "Second" 1.1.4';
        const score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[1].staves[0].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.F);
    });

    it('dynamics-auto-reset-on-staff', () => {
        const tex: string = '1.1.4{dy ppp} 1.1 \\staff 1.1.4';
        const score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[1].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.F);
    });

    it('crescendo', () => {
        const tex: string = '1.1.4{dec} 1.1{dec} 1.1{cre} 1.1{cre}';
        const score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].crescendo).to.equal(CrescendoType.Decrescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].crescendo).to.equal(CrescendoType.Decrescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].crescendo).to.equal(CrescendoType.Crescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].crescendo).to.equal(CrescendoType.Crescendo);
    });

    it('left-hand-tapping', () => {
        const tex: string = ':4 1.1{lht} 1.1 1.1{lht} 1.1';
        const score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isLeftHandTapped).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isLeftHandTapped).to.equal(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isLeftHandTapped).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isLeftHandTapped).to.equal(false);
    });

    it('expect-invalid-format-xml', () => {
        expect(() => parseTex('<xml>')).to.throw(UnsupportedFormatError);
    });

    it('expect-invalid-format-other-text', () => {
        expect(() => parseTex('This is not an alphaTex file')).to.throw(UnsupportedFormatError);
    });

    it('auto-detect-tuning-from-instrument', () => {
        let score = parseTex('\\instrument acousticguitarsteel . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).to.equal(6);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(-12);

        score = parseTex('\\instrument acousticbass . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).to.equal(4);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(-12);

        score = parseTex('\\instrument violin . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).to.equal(4);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(0);

        score = parseTex('\\instrument acousticpiano . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).to.equal(0);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(0);
    });

    it('multibyte-encoding', () => {
        const multiByteChars = '爱你ÖÄÜ🎸🎵🎶';
        const score = parseTex(`\\title "${multiByteChars}"
        .
        \\track "🎸"
        \\lyrics "Test Lyrics 🤘"
        (1.2 1.1).4 x.2.8 0.1 1.1 | 1.2 3.2 0.1 1.1`);

        expect(score.title).to.equal(multiByteChars);
        expect(score.tracks[0].name).to.equal('🎸');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics![0]).to.equal('🤘');
    });

    it('does-not-hang-on-backslash', () => {
        expect(() => parseTex('\\title Test . 3.3 \\')).to.throw(UnsupportedFormatError);
    });

    it('disallows-unclosed-string', () => {
        expect(() => parseTex('\\title "Test . 3.3')).to.throw(UnsupportedFormatError);
    });

    function runSectionNoteSymbolTest(noteSymbol: string) {
        const score = parseTex(`1.3.4 * 4 | \\section Verse ${noteSymbol}.1 | 2.3.4*4`);

        expect(score.masterBars.length).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(4);
        expect(score.masterBars[1].section!.text).to.equal('Verse');
        expect(score.masterBars[1].section!.marker).to.equal('');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).to.equal(1);
    }

    it('does-not-interpret-note-symbols-on-section', () => {
        runSectionNoteSymbolTest('r');
        runSectionNoteSymbolTest('-');
        runSectionNoteSymbolTest('x');
    });

    it('loads-score-twice-without-hickups', () => {
        const tex = `\\title Test
        \\words test
        \\music alphaTab
        \\copyright test
        \\tempo 200
        \\instrument 30
        \\capo 2
        \\tuning G3 D2 G2 B2 D3 A4
        .
        0.5.2 1.5.4 3.4.4 | 5.3.8 5.3.8 5.3.8 5.3.8 r.2`;
        const importer: AlphaTexImporter = new AlphaTexImporter();
        for (const _i of [1, 2]) {
            importer.initFromString(tex, new Settings());
            const score = importer.readScore();
            expect(score.title).to.equal('Test');
            expect(score.words).to.equal('test');
            expect(score.music).to.equal('alphaTab');
            expect(score.copyright).to.equal('test');
            expect(score.tempo).to.equal(200);
            expect(score.tracks.length).to.equal(1);
            expect(score.tracks[0].playbackInfo.program).to.equal(30);
            expect(score.tracks[0].staves[0].capo).to.equal(2);
            expect(score.tracks[0].staves[0].tuning.join(',')).to.equal('55,38,43,47,50,69');
            expect(score.masterBars.length).to.equal(2);

            // bars[0]
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(3);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].duration).to.equal(Duration.Half);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(0);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).to.equal(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].duration).to.equal(Duration.Quarter);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).to.equal(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].duration).to.equal(Duration.Quarter);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).to.equal(3);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].string).to.equal(3);

            // bars[1]
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).to.equal(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].duration).to.equal(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].fret).to.equal(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].string).to.equal(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].duration).to.equal(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].fret).to.equal(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].string).to.equal(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].duration).to.equal(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].fret).to.equal(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].string).to.equal(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].duration).to.equal(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].fret).to.equal(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].string).to.equal(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].notes.length).to.equal(0);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].duration).to.equal(Duration.Half);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].isRest).to.equal(true);
        }
    });

    it('error-shows-symbol-data', () => {
        const tex = '3.3.ABC';
        expect(() => parseTex(tex)).to.throw(UnsupportedFormatError);
        try {
            parseTex(tex);
        } catch (e) {
            if (!(e instanceof UnsupportedFormatError)) {
                assert.fail('Did not throw correct error');
                return;
            }
            if (!(e.cause instanceof AlphaTexError)) {
                assert.fail('Did not contain an AlphaTexError');
                return;
            }
            const i = e.cause as AlphaTexError;
            expect(i.expected).to.equal(AlphaTexSymbols.Number);
            expect(i.message?.includes('Number')).to.be.true;
            expect(i.symbol).to.equal(AlphaTexSymbols.String);
            expect(i.message?.includes('String')).to.be.true;
            expect(i.symbolData).to.equal('ABC');
            expect(i.message?.includes('ABC')).to.be.true;
        }
    });

    it('tempo-as-float', () => {
        const score = parseTex('\\tempo 112.5 .');
        expect(score.tempo).to.equal(112.5);
    });

    it('tempo-as-float-in-bar', () => {
        const score = parseTex('\\tempo 112 . 3.3.1 | \\tempo 333.3 3.3');
        expect(score.tempo).to.equal(112);
        expect(score.tracks[0].staves[0].bars[1].masterBar.tempoAutomations[0]?.value).to.equal(333.3);
    });

    it('percussion-numbers', () => {
        const score = parseTex(`
            \\instrument "percussion"
            .
            30 31 33 34
        `);
        expect(score.tracks[0].playbackInfo.primaryChannel).to.equal(9);
        expect(score.tracks[0].staves[0].isPercussion).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].percussionArticulation).to.equal(0);
        expect(score.tracks[0].percussionArticulations[0].outputMidiNumber).to.equal(49);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].percussionArticulation).to.equal(1);
        expect(score.tracks[0].percussionArticulations[1].outputMidiNumber).to.equal(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].percussionArticulation).to.equal(2);
        expect(score.tracks[0].percussionArticulations[2].outputMidiNumber).to.equal(37);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].percussionArticulation).to.equal(3);
        expect(score.tracks[0].percussionArticulations[3].outputMidiNumber).to.equal(38);
    });

    it('percussion-custom-articulation', () => {
        const score = parseTex(`
            \\instrument "percussion"
            \\articulation A 30
            \\articulation B 31
            \\articulation C 33
            \\articulation D 34
            .
            A B C D
        `);
        expect(score.tracks[0].playbackInfo.primaryChannel).to.equal(9);
        expect(score.tracks[0].staves[0].isPercussion).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].percussionArticulation).to.equal(0);
        expect(score.tracks[0].percussionArticulations[0].outputMidiNumber).to.equal(49);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].percussionArticulation).to.equal(1);
        expect(score.tracks[0].percussionArticulations[1].outputMidiNumber).to.equal(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].percussionArticulation).to.equal(2);
        expect(score.tracks[0].percussionArticulations[2].outputMidiNumber).to.equal(37);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].percussionArticulation).to.equal(3);
        expect(score.tracks[0].percussionArticulations[3].outputMidiNumber).to.equal(38);
    });

    it('percussion-default-articulations', () => {
        const score = parseTex(`
            \\instrument "percussion"
            \\articulation defaults
            .
            "Cymbal (hit)" "Snare (side stick)" "Snare (side stick) 2" "Snare (hit)"
        `);
        expect(score.tracks[0].playbackInfo.primaryChannel).to.equal(9);
        expect(score.tracks[0].staves[0].isPercussion).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].percussionArticulation).to.equal(0);
        expect(score.tracks[0].percussionArticulations[0].outputMidiNumber).to.equal(49);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].percussionArticulation).to.equal(1);
        expect(score.tracks[0].percussionArticulations[1].outputMidiNumber).to.equal(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].percussionArticulation).to.equal(2);
        expect(score.tracks[0].percussionArticulations[2].outputMidiNumber).to.equal(37);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].percussionArticulation).to.equal(3);
        expect(score.tracks[0].percussionArticulations[3].outputMidiNumber).to.equal(38);
    });

    it('percussion-default-articulations-short', () => {
        const score = parseTex(`
            \\instrument "percussion"
            \\articulation defaults
            .
            CymbalHit SnareSideStick SnareSideStick2 SnareHit
        `);
        expect(score.tracks[0].playbackInfo.primaryChannel).to.equal(9);
        expect(score.tracks[0].staves[0].isPercussion).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].percussionArticulation).to.equal(0);
        expect(score.tracks[0].percussionArticulations[0].outputMidiNumber).to.equal(49);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].percussionArticulation).to.equal(1);
        expect(score.tracks[0].percussionArticulations[1].outputMidiNumber).to.equal(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].percussionArticulation).to.equal(2);
        expect(score.tracks[0].percussionArticulations[2].outputMidiNumber).to.equal(37);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].percussionArticulation).to.equal(3);
        expect(score.tracks[0].percussionArticulations[3].outputMidiNumber).to.equal(38);
    });

    it('beat-tempo-change', () => {
        const score = parseTex(`
            . \\tempo 120 1.1.4 1.1 1.1{tempo 60} 1.1 | 1.1.4{tempo 100} 1.1 1.1{tempo 120} 1.1  
        `);
        expect(score.masterBars[0].tempoAutomations).to.have.length(2);
        expect(score.masterBars[0].tempoAutomations[0].value).to.equal(120);
        expect(score.masterBars[0].tempoAutomations[0].ratioPosition).to.equal(0);
        expect(score.masterBars[0].tempoAutomations[1].value).to.equal(60);
        expect(score.masterBars[0].tempoAutomations[1].ratioPosition).to.equal(0.5);
    });

    it('note-accidentals', () => {
        let tex = '. \n';
        const expectedAccidentalModes: NoteAccidentalMode[] = [];
        for (const [k, v] of ModelUtils.accidentalModeMapping) {
            tex += `3.3 { acc ${k} } \n`;
            expectedAccidentalModes.push(v);
        }

        const score = parseTex(tex);

        const actualAccidentalModes: NoteAccidentalMode[] = [];

        let b: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b != null) {
            actualAccidentalModes.push(b.notes[0].accidentalMode);
            b = b.nextBeat;
        }

        expect(actualAccidentalModes.join(',')).to.equal(expectedAccidentalModes.join(','));
    });

    it('accidental-mode', () => {
        // song level
        let score = parseTex('\\accidentals auto . F##4');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].accidentalMode).to.equal(
            NoteAccidentalMode.Default
        );

        // track level
        score = parseTex('\\track "T1" F##4 | \\track "T2" \\accidentals auto F##4');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].accidentalMode).to.equal(
            NoteAccidentalMode.ForceDoubleSharp
        );
        expect(score.tracks[1].staves[0].bars[0].voices[0].beats[0].notes[0].accidentalMode).to.equal(
            NoteAccidentalMode.Default
        );

        // staff level
        score = parseTex('\\track "T1" \\staff F##4 \\staff \\accidentals auto F##4');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].accidentalMode).to.equal(
            NoteAccidentalMode.ForceDoubleSharp
        );
        expect(score.tracks[0].staves[1].bars[0].voices[0].beats[0].notes[0].accidentalMode).to.equal(
            NoteAccidentalMode.Default
        );

        // bar level
        score = parseTex('F##4 | \\accidentals auto F##4');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].accidentalMode).to.equal(
            NoteAccidentalMode.ForceDoubleSharp
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].accidentalMode).to.equal(
            NoteAccidentalMode.Default
        );
    });

    it('dead-slap', () => {
        const score = parseTex('r { ds }');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isRest).to.be.false;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].deadSlapped).to.be.true;
    });

    it('golpe', () => {
        const score = parseTex('3.3 { glpf } 3.3 { glpt }');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].golpe).to.equal(GolpeType.Finger);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].golpe).to.equal(GolpeType.Thumb);
    });

    it('fade', () => {
        const score = parseTex('3.3 { f } 3.3 { fo } 3.3 { vs } ');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].fade).to.equal(FadeType.FadeIn);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].fade).to.equal(FadeType.FadeOut);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].fade).to.equal(FadeType.VolumeSwell);
    });

    it('barre', () => {
        const score = parseTex('3.3 { barre 5 } 3.3 { barre 14 half }');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].barreFret).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].barreShape).to.equal(BarreShape.Full);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].barreFret).to.equal(14);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].barreShape).to.equal(BarreShape.Half);
    });

    it('ornaments', () => {
        const score = parseTex('3.3 { turn } 3.3 { iturn } 3.3 { umordent } 3.3 { lmordent }');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].ornament).to.equal(NoteOrnament.Turn);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].ornament).to.equal(
            NoteOrnament.InvertedTurn
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].ornament).to.equal(
            NoteOrnament.UpperMordent
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].ornament).to.equal(
            NoteOrnament.LowerMordent
        );
    });

    it('rasgueado', () => {
        const score = parseTex('3.3 { rasg mi } 3.3 { rasg pmptriplet } 3.3 { rasg amianapaest }');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].rasgueado).to.equal(Rasgueado.Mi);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].hasRasgueado).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].rasgueado).to.equal(Rasgueado.PmpTriplet);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].hasRasgueado).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].rasgueado).to.equal(Rasgueado.AmiAnapaest);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].hasRasgueado).to.be.true;
    });

    it('directions', () => {
        const score = parseTex('. \\jump Segno | | \\jump DaCapoAlCoda \\jump Coda \\jump SegnoSegno ');
        expect(score.masterBars[0].directions).to.be.ok;
        expect(score.masterBars[0].directions).to.contain(Direction.TargetSegno);

        expect(score.masterBars[1].directions).to.not.be.ok;

        expect(score.masterBars[2].directions).to.be.ok;
        expect(score.masterBars[2].directions).to.contain(Direction.JumpDaCapoAlCoda);
        expect(score.masterBars[2].directions).to.contain(Direction.TargetCoda);
        expect(score.masterBars[2].directions).to.contain(Direction.TargetSegnoSegno);
    });

    it('multi-voice-full', () => {
        const score = parseTex(`
            \\track "Piano"
                \\staff{score} \\tuning piano \\instrument acousticgrandpiano
                    \\voice 
                        c4 d4 e4 f4 | c4 d4 e4 f4
                    \\voice 
                        c3 d3 e3 f3 | c3 d3 e3 f3
        `);

        expect(score.masterBars).to.have.length(2);

        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[1].voices.length).to.equal(2);
    });

    it('multi-voice-simple-all-voices', () => {
        const score = parseTex(`
            \\voice 
                c4 d4 e4 f4 | c4 d4 e4 f4
            \\voice 
                c3 d3 e3 f3 | c3 d3 e3 f3
        `);

        expect(score.masterBars).to.have.length(2);

        expect(score.tracks[0].staves[0].bars).to.have.length(2);
        expect(score.tracks[0].staves[0].bars[0].voices).to.have.length(2);
        expect(score.tracks[0].staves[0].bars[1].voices).to.have.length(2);
    });

    it('multi-voice-simple-skip-initial', () => {
        const score = parseTex(`
            c4 d4 e4 f4 | c4 d4 e4 f4
            \\voice 
            c3 d3 e3 f3 | c3 d3 e3 f3
        `);

        expect(score.masterBars).to.have.length(2);

        expect(score.tracks[0].staves[0].bars).to.have.length(2);
        expect(score.tracks[0].staves[0].bars[0].voices).to.have.length(2);
        expect(score.tracks[0].staves[0].bars[1].voices).to.have.length(2);
    });

    it('standard-notation-line-count', () => {
        const score = parseTex(`
            \\staff { score 3 }
        `);
        expect(score.tracks[0].staves[0].standardNotationLineCount).to.equal(3);
    });

    it('song-metadata', () => {
        const score = parseTex(`
            \\title "Title\\tTitle"
            \\instructions "Line1\nLine2"
            .
        `);
        expect(score.title).to.equal('Title\tTitle');
        expect(score.instructions).to.equal('Line1\nLine2');
    });

    it('tempo-label', () => {
        const score = parseTex(`
            \\tempo 80 "Label"
            .
        `);
        expect(score.tempo).to.equal(80);
        expect(score.tempoLabel).to.equal('Label');
    });

    it('transpose', () => {
        const score = parseTex(`
            \\staff 
            \\displaytranspose 12
            \\transpose 6
            .
        `);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(-12);
        expect(score.tracks[0].staves[0].transpositionPitch).to.equal(-6);
    });

    it('beat-vibrato', () => {
        const score = parseTex(`
            3.3.4{v} 3.3.4{vw}
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].vibrato).to.equal(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].vibrato).to.equal(VibratoType.Wide);
    });

    it('whammy', () => {
        const score = parseTex(`
            3.3.4{ tb dive (0 -12.5) } |
            3.3.4{ tb dive gradual (0 -12.5) } |
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarType).to.equal(WhammyType.Dive);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints).to.have.length(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![0].value).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![1].value).to.equal(-12.5);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarType).to.equal(WhammyType.Dive);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyStyle).to.equal(BendStyle.Gradual);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints).to.have.length(2);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![0].value).to.equal(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![1].value).to.equal(-12.5);
    });

    it('beat-ottava', () => {
        const score = parseTex(`
            3.3.4{ ot 15ma } 3.3.4{ ot 8vb } 
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].ottava).to.equal(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].ottava).to.equal(Ottavia._8vb);
    });

    it('beat-text', () => {
        const score = parseTex(`
            3.3.4{ txt "Hello World" } 3.3.4{ txt Hello }
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].text).to.equal('Hello World');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].text).to.equal('Hello');
    });

    it('legato-origin', () => {
        const score = parseTex(`
            3.3.4{ legatoOrigin } 4.3.4
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isLegatoOrigin).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].isLegatoDestination).to.be.true;
    });

    it('instrument-change', () => {
        const score = parseTex(`
            \\instrument acousticgrandpiano
            G4 G4 G4 { instrument brightacousticpiano }
        `);
        expect(score.tracks[0].playbackInfo.program).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations).to.have.length(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations[0].type).to.equal(
            AutomationType.Instrument
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations[0].value).to.equal(1);
    });

    it('beat-fermata', () => {
        const score = parseTex(`
            G4 G4 G4 { fermata medium 4 }
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].fermata).to.be.ok;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].fermata!.type).to.equal(FermataType.Medium);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].fermata!.length).to.equal(4);
    });

    it('bend-type', () => {
        const score = parseTex(`
            3.3{ b bend gradual (0 4)}
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendType).to.equal(BendType.Bend);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendStyle).to.equal(BendStyle.Gradual);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints).to.have.length(2);
    });

    it('harmonic-values', () => {
        const score = parseTex(`
        2.3{nh} 2.3{ah} 2.3{ah 7} 2.3{th} 2.3{th 7} 2.3{ph} 2.3{ph 7} 2.3{sh} 2.3{sh 7} 2.3{fh} 2.3{fh 7}
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).to.equal(
            HarmonicType.Natural
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicValue).to.equal(2.4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).to.equal(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicValue).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).to.equal(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicValue).to.equal(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).to.equal(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicValue).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).to.equal(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicValue).to.equal(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].notes[0].harmonicType).to.equal(HarmonicType.Pinch);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].notes[0].harmonicValue).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].notes[0].harmonicType).to.equal(HarmonicType.Pinch);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].notes[0].harmonicValue).to.equal(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].notes[0].harmonicType).to.equal(HarmonicType.Semi);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].notes[0].harmonicValue).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[8].notes[0].harmonicType).to.equal(HarmonicType.Semi);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[8].notes[0].harmonicValue).to.equal(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[9].notes[0].harmonicType).to.equal(
            HarmonicType.Feedback
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[9].notes[0].harmonicValue).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[10].notes[0].harmonicType).to.equal(
            HarmonicType.Feedback
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[10].notes[0].harmonicValue).to.equal(7);
    });

    it('time-signature-commons', () => {
        const score = parseTex(`
        \\ts common
        `);
        expect(score.masterBars[0].timeSignatureNumerator).to.equal(4);
        expect(score.masterBars[0].timeSignatureDenominator).to.equal(4);
        expect(score.masterBars[0].timeSignatureCommon).to.be.true;
    });

    it('clef-ottava', () => {
        const score = parseTex(`
        \\ottava 15ma
        `);
        expect(score.tracks[0].staves[0].bars[0].clefOttava).to.equal(Ottavia._15ma);
    });

    it('simile-mark', () => {
        const score = parseTex(`
        \\simile simple
        `);
        expect(score.tracks[0].staves[0].bars[0].simileMark).to.equal(SimileMark.Simple);
    });

    it('tempo-automation-text', () => {
        const score = parseTex(`
        \\tempo 100 T1
        .
        3.3.4 * 4 | \\tempo 80 T2 4.3.4*4
        `);
        expect(score.tempo).to.equal(100);
        expect(score.tempoLabel).to.equal('T1');

        expect(score.masterBars[1].tempoAutomations).to.have.length(1);
        expect(score.masterBars[1].tempoAutomations[0].value).to.equal(80);
        expect(score.masterBars[1].tempoAutomations[0].text).to.equal('T2');
    });

    it('double-bar', () => {
        const tex: string = '3.3 3.3 3.3 3.3 | \\db 1.1 2.1 3.1 4.1';
        const score: Score = parseTex(tex);
        expect(score.masterBars[1].isDoubleBar).to.be.equal(true);
    });

    it('score-options', () => {
        const score = parseTex(`
            \\defaultSystemsLayout 5
            \\systemsLayout 3 2 3
            \\hideDynamics
            \\bracketExtendMode nobrackets
            \\useSystemSignSeparator
            \\singleTrackTrackNamePolicy allsystems
            \\multiTrackTrackNamePolicy Hidden
            \\firstSystemTrackNameMode fullname
            \\otherSystemsTrackNameMode fullname
            \\firstSystemTrackNameOrientation horizontal
            \\otherSystemsTrackNameOrientation horizontal
            .
        `);

        expect(score.defaultSystemsLayout).to.equal(5);
        expect(score.systemsLayout).to.have.length(3);
        expect(score.systemsLayout[0]).to.equal(3);
        expect(score.systemsLayout[1]).to.equal(2);
        expect(score.systemsLayout[2]).to.equal(3);
        expect(score.stylesheet.hideDynamics).to.be.true;
        expect(score.stylesheet.bracketExtendMode).to.equal(BracketExtendMode.NoBrackets);
        expect(score.stylesheet.useSystemSignSeparator).to.be.true;
        expect(score.stylesheet.singleTrackTrackNamePolicy).to.equal(TrackNamePolicy.AllSystems);
        expect(score.stylesheet.multiTrackTrackNamePolicy).to.equal(TrackNamePolicy.Hidden);
        expect(score.stylesheet.firstSystemTrackNameMode).to.equal(TrackNameMode.FullName);
        expect(score.stylesheet.otherSystemsTrackNameMode).to.equal(TrackNameMode.FullName);
        expect(score.stylesheet.firstSystemTrackNameOrientation).to.equal(TrackNameOrientation.Horizontal);
        expect(score.stylesheet.otherSystemsTrackNameOrientation).to.equal(TrackNameOrientation.Horizontal);
    });

    it('bar-sizing', () => {
        const score = parseTex(`
            3.3.4 | \\scale 0.5 3.3.4 | \\width 300 3.3.4
        `);

        expect(score.masterBars[1].displayScale).to.equal(0.5);
        expect(score.masterBars[2].displayWidth).to.equal(300);
    });

    it('track-properties', () => {
        const score = parseTex(`
            \\track "First" { 
                color "#FF0000" 
                defaultSystemsLayout 6
                systemsLayout 3 2 3
                volume 7
                balance 3
                mute 
                solo
            }
        `);

        expect(score.tracks[0].color.rgba).to.equal('#FF0000');
        expect(score.tracks[0].defaultSystemsLayout).to.equal(6);
        expect(score.tracks[0].systemsLayout).to.have.length(3);
        expect(score.tracks[0].systemsLayout[0]).to.equal(3);
        expect(score.tracks[0].systemsLayout[1]).to.equal(2);
        expect(score.tracks[0].systemsLayout[0]).to.equal(3);
        expect(score.tracks[0].playbackInfo.volume).to.equal(7);
        expect(score.tracks[0].playbackInfo.balance).to.equal(3);
        expect(score.tracks[0].playbackInfo.isMute).to.be.true;
        expect(score.tracks[0].playbackInfo.isSolo).to.be.true;
    });

    it('beat-beam', () => {
        const score = parseTex(`
            :8 3.3{ beam invert } 3.3 |
            3.3{ beam up } 3.3 |
            3.3{ beam down } 3.3 |
            3.3{ beam auto } 3.3 |
            3.3{ beam split } 3.3 |
            3.3{ beam merge } 3.3 |
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].invertBeamDirection).to.be.true;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].preferredBeamDirection).to.equal(BeamDirection.Up);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].preferredBeamDirection).to.equal(
            BeamDirection.Down
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].beamingMode).to.equal(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].beamingMode).to.equal(
            BeatBeamingMode.ForceMergeWithNext
        );
    });

    it('note-show-string', () => {
        const score = parseTex(`
            :8 3.3{ string } 
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].showStringNumber).to.be.true;
    });

    it('note-hide', () => {
        const score = parseTex(`
            :8 3.3{ hide } 
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isVisible).to.be.false;
    });

    it('note-slur', () => {
        const score = parseTex(`
            :8 (3.3{ slur s1 } 3.4 3.5)  (10.3 {slur s1} 17.4 15.5)
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isSlurOrigin).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isSlurDestination).to.be.true;
    });

    it('hide-tuning', () => {
        const score = parseTex(`
            \\track "Track 1"
            \\track "Track 2"
            \\staff {tabs}
            \\tuning A1 D2 A2 D3 G3 B3 E4 hide
            4.1 3.1 2.1 1.1`);

        expect(score.tracks[1].staves[0].stringTuning.tunings[0]).to.equal(33);
        expect(score.stylesheet.perTrackDisplayTuning).to.be.ok;
        expect(score.stylesheet.perTrackDisplayTuning!.has(1)).to.be.true;
        expect(score.stylesheet.perTrackDisplayTuning!.get(1)).to.be.false;
    });

    it('clefs', () => {
        const score = parseTex(`
        \\clef C4 \\ottava 15ma C4 | C4
        `);
        expect(score.tracks[0].staves[0].bars[0].clef).to.equal(Clef.C4);
        expect(score.tracks[0].staves[0].bars[0].clefOttava).to.equal(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[1].clef).to.equal(Clef.C4);
        expect(score.tracks[0].staves[0].bars[1].clefOttava).to.equal(Ottavia._15ma);
    });

    it('multibar-rest', () => {
        const score = parseTex(`
        \\multiBarRest
        .
        \\track A { multiBarRest }
        3.3
        \\track B
        3.3
        
        `);
        expect(score.stylesheet.multiTrackMultiBarRest).to.be.true;
        expect(score.stylesheet.perTrackMultiBarRest).to.be.ok;
        expect(score.stylesheet.perTrackMultiBarRest!.has(0)).to.be.true;
        expect(score.stylesheet.perTrackMultiBarRest!.has(1)).to.be.false;
    });

    it('header-footer', async () => {
        const score = parseTex(`
            \\title "Title" "Title: %TITLE%" left
            \\subtitle "Subtitle" "Subtitle: %SUBTITLE%" center
            \\artist "Artist" "Artist: %ARTIST%" right
            \\album "Album" "Album: %ALBUM%" left
            \\words "Words" "Words: %WORDS%" center
            \\music "Music" "Music: %MUSIC%" right
            \\wordsAndMusic "Words & Music: %MUSIC%" left
            \\tab "Tab" "Transcriber: %TABBER%" center
            \\copyright "Copyright" "Copyright: %COPYRIGHT%" right
            \\copyright2 "Copyright2" right
            .
            `);

        expect(score.style).to.be.ok;

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Title)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.template).to.equal('Title: %TITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.textAlign).to.equal(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.SubTitle)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.template).to.equal('Subtitle: %SUBTITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Artist)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.template).to.equal('Artist: %ARTIST%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.textAlign).to.equal(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Album)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.template).to.equal('Album: %ALBUM%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.textAlign).to.equal(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Words)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.template).to.equal('Words: %WORDS%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Music)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.template).to.equal('Music: %MUSIC%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.textAlign).to.equal(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.WordsAndMusic)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.template).to.equal(
            'Words & Music: %MUSIC%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.textAlign).to.equal(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Transcriber)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.template).to.equal(
            'Transcriber: %TABBER%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Copyright)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.template).to.equal(
            'Copyright: %COPYRIGHT%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.textAlign).to.equal(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.CopyrightSecondLine)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.template).to.equal('Copyright2');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.textAlign).to.equal(
            TextAlign.Right
        );
    });

    it('barlines', () => {
        const score = parseTex(`
            \\instrument piano
            .
            \\track "T1"
                \\staff 
                    \\barlineleft dashed 
                    \\barlineright dotted 
                    | 
                    \\barlineleft heavyheavy
                    \\barlineright heavyheavy
                    
                \\staff 
                    \\barlineleft lightlight 
                    \\barlineright lightheavy 
                    | 
                    \\barlineleft heavylight
                    \\barlineright dashed
            `);
        expect(score).toMatchSnapshot();
    });

    it('sync', () => {
        const score = parseTex(`
            \\tempo 90
            .
            3.4.4*4 | 3.4.4*4 |
            \\ro 3.4.4*4 | 3.4.4*4 | \\rc 2 3.4.4*4 |
            3.4.4*4 | 3.4.4*4
            .
            \\sync 0 0 0 
            \\sync 0 0 1000 0.5
            \\sync 1 0 2000
            \\sync 3 0 3000
            \\sync 3 1 4000
            \\sync 6 1 5000
            `);

        // simplify snapshot
        score.tracks = [];

        expect(score).toMatchSnapshot();
    });

    it('sync-expect-dot', () => {
        const score = parseTex(`
            \\title "Prelude in D Minor"
            \\artist "J.S. Bach (1685-1750)"
            \\copyright "Public Domain"
            \\tempo 80
            .
            \\ts 3 4
            0.4.16 (3.2 -.4) (1.1 -.4) (5.1 -.4) 1.1 3.2 1.1 3.2 2.3.8 (3.2 3.4) |
            (3.2 0.4).16 (3.2 -.4) (1.1 -.4) (5.1 -.4) 1.1 3.2 1.1 3.2 2.3.8 (3.2 3.4) | 
            (3.2 0.4).16 (3.2 -.4) (3.1 -.4) (6.1 -.4) 3.1 3.2 3.1 3.2 3.3.8 (3.2 0.3) | 
            (3.2 0.4).16 (3.2 -.4) (3.1 -.4) (6.1 -.4) 3.1 3.2 3.1 3.2 3.3.8 (3.2 0.3) |
            .
            \\sync 0 0 0
            \\sync 0 0 1500 0.666
            \\sync 1 0 4075 0.666
            \\sync 2 0 6475 0.333
            \\sync 3 0 10223 1
        `);

        // simplify snapshot
        score.tracks = [];

        expect(score).toMatchSnapshot();
    });
});
