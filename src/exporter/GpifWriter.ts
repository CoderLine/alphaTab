import { MidiUtils } from '@src/midi/MidiUtils';
import { AccentuationType } from '@src/model/AccentuationType';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { BrushType } from '@src/model/BrushType';
import { Clef } from '@src/model/Clef';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { Fermata, FermataType } from '@src/model/Fermata';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { Lyrics } from '@src/model/Lyrics';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { Ottavia } from '@src/model/Ottavia';
import { Score } from '@src/model/Score';
import { SimileMark } from '@src/model/SimileMark';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { XmlDocument } from '@src/xml/XmlDocument';
import { XmlNode } from '@src/xml/XmlNode';

/**
 * This class can write a score.gpif XML from a given score model.
 */
export class GpifWriter {
    private _rhythmIdLookup: Map<string, string> = new Map<string, string>();

    public writeXml(score: Score): string {
        const xmlDocument = new XmlDocument();

        this._rhythmIdLookup = new Map<string, string>()

        this.writeDom(xmlDocument, score);

        return xmlDocument.toString('  ', true);
    }

    private writeDom(parent: XmlNode, score: Score) {
        const gpif = parent.addElement('GPIF');

        // just some values at the time this was implemented, 
        gpif.addElement('GPVersion').innerText = '7';
        const gpRevision = gpif.addElement('GPRevision');
        gpRevision.innerText = '7';
        gpRevision.attributes.set('required', '12021');
        gpRevision.attributes.set('recommended', '12023');
        gpRevision.innerText = '12025';
        gpif.addElement('Encoding').addElement('EncodingDescription').innerText = 'GP7';

        this.writeScoreNode(gpif, score);
        this.writeMasterTrackNode(gpif, score);
        this.writeAudioTracksNode(gpif, score);
        this.writeTracksNode(gpif, score);
        this.writeMasterBarsNode(gpif, score);

        const bars = gpif.addElement('Bars');
        const voices = gpif.addElement('Voices');
        const beats = gpif.addElement('Beats');
        const notes = gpif.addElement('Notes');
        const rhythms = gpif.addElement('Rhythms');

        for (const tracks of score.tracks) {

            for (const staff of tracks.staves) {

                for (const bar of staff.bars) {

                    this.writeBarNode(bars, bar);

                    for (const voice of bar.voices) {
                        this.writeVoiceNode(voices, voice);

                        for (const beat of voice.beats) {
                            this.writeBeatNode(beats, beat, rhythms);

                            for (const note of beat.notes) {
                                this.writeNoteNode(notes, note);
                            }
                        }
                    }
                }
            }
        }
    }

    private writeNoteNode(parent: XmlNode, note: Note) {
        const noteNode = parent.addElement('Note');
        noteNode.attributes.set('id', note.id.toString());

        this.writeNoteProperties(noteNode, note);

        if (note.isGhost) {
            noteNode.addElement('AntiAccent').innerText = 'normal';
        }

        if (note.isLetRing) {
            noteNode.addElement('LetRing');
        }

        if (note.isTrill) {
            noteNode.addElement('Trill').innerText = note.trillValue!.toString();
        }

        let accentFlags = 0;
        if (note.isStaccato) {
            accentFlags |= 1;
        }
        switch (note.accentuated) {
            case AccentuationType.Normal:
                accentFlags |= 0x04;
                break;
            case AccentuationType.Heavy:
                accentFlags |= 0x08;
                break;
        }

        if (accentFlags > 0) {
            noteNode.addElement('Accent').innerText = accentFlags.toString();
        }

        if (note.isTieOrigin || note.isTieDestination) {
            const tie = noteNode.addElement('Tie');
            tie.attributes.set('origin', note.isTieOrigin ? 'true' : 'false');
            tie.attributes.set('destination', note.isTieOrigin ? 'true' : 'false');
        }

        switch (note.vibrato) {
            case VibratoType.Slight:
                noteNode.addElement('Vibrato').innerText = 'Slight';
                break;
            case VibratoType.Wide:
                noteNode.addElement('Vibrato').innerText = 'Wide';
                break;
        }

        if (note.isFingering) {
            switch (note.leftHandFinger) {
                case Fingers.Thumb:
                    noteNode.addElement('LeftFingering').innerText = 'P';
                    break;
                case Fingers.IndexFinger:
                    noteNode.addElement('LeftFingering').innerText = 'I';
                    break;
                case Fingers.MiddleFinger:
                    noteNode.addElement('LeftFingering').innerText = 'M';
                    break;
                case Fingers.AnnularFinger:
                    noteNode.addElement('LeftFingering').innerText = 'A';
                    break;
                case Fingers.LittleFinger:
                    noteNode.addElement('LeftFingering').innerText = 'C';
                    break;
            }
            switch (note.rightHandFinger) {
                case Fingers.Thumb:
                    noteNode.addElement('RightFingering').innerText = 'P';
                    break;
                case Fingers.IndexFinger:
                    noteNode.addElement('RightFingering').innerText = 'I';
                    break;
                case Fingers.MiddleFinger:
                    noteNode.addElement('RightFingering').innerText = 'M';
                    break;
                case Fingers.AnnularFinger:
                    noteNode.addElement('RightFingering').innerText = 'A';
                    break;
                case Fingers.LittleFinger:
                    noteNode.addElement('RightFingering').innerText = 'C';
                    break;
            }
        }

        if (note.percussionArticulation >= 0) {
            noteNode.addElement('InstrumentArticulation').innerText = note.percussionArticulation.toString();
        } else {
            noteNode.addElement('InstrumentArticulation').innerText = '0';

        }
    }

    private writeNoteProperties(parent: XmlNode, note: Note) {
        const properties = parent.addElement('Properties');

        this.writeConcertPitch(properties, note);
        this.writeTransposedPitch(properties, note);


        if (note.isStringed) {
            this.writeSimplePropertyNode(properties, 'String', 'String', (note.string - 1).toString());
            this.writeSimplePropertyNode(properties, 'Fret', 'Fret', note.fret.toString());
        }

        if (note.isPiano) {
            this.writeSimplePropertyNode(properties, 'Octave', 'Number', note.octave.toString());
            this.writeSimplePropertyNode(properties, 'Tone', 'Step', note.tone.toString());
        }

        if (note.beat.tap) {
            this.writeSimplePropertyNode(properties, 'Tapped', 'Enable', null);
        }

        if (note.harmonicType !== HarmonicType.None) {
            switch (note.harmonicType) {
                case HarmonicType.Natural:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Natural');
                    break;
                case HarmonicType.Artificial:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Artificial');
                    break;
                case HarmonicType.Pinch:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Pinch');
                    break;
                case HarmonicType.Tap:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Tap');
                    break;
                case HarmonicType.Semi:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Semi');
                    break;
                case HarmonicType.Feedback:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Feedback');
                    break;
            }

            if (note.harmonicValue !== 0) {
                this.writeSimplePropertyNode(properties, 'HarmonicFret', 'HFret', note.harmonicValue.toString())
            }
        }


        if (note.isDead) {
            this.writeSimplePropertyNode(properties, 'Muted', 'Enable', null);
        }

        if (note.isPalmMute) {
            this.writeSimplePropertyNode(properties, 'PalmMuted', 'Enable', null);
        }

        if (note.hasBend) {
            this.writeBend(properties, note);
        }

        if (note.isHammerPullOrigin) {
            this.writeSimplePropertyNode(properties, 'HopoOrigin', 'Enable', null);
        }

        if (note.isHammerPullDestination) {
            this.writeSimplePropertyNode(properties, 'HopoDestination', 'Enable', null);
        }

        if (note.isLeftHandTapped) {
            this.writeSimplePropertyNode(properties, 'LeftHandTapped', 'Enable', null);
        }


        let slideFlags = 0;
        switch (note.slideInType) {
            case SlideInType.IntoFromAbove:
                slideFlags |= 16;
                break;
            case SlideInType.IntoFromBelow:
                slideFlags |= 32;
                break;
        }
        switch (note.slideOutType) {
            case SlideOutType.Shift:
                slideFlags |= 1;
                break;
            case SlideOutType.Legato:
                slideFlags |= 2;
                break;
            case SlideOutType.OutDown:
                slideFlags |= 4;
                break;
            case SlideOutType.OutUp:
                slideFlags |= 8;
                break;
            case SlideOutType.PickSlideDown:
                slideFlags |= 64;
                break;
            case SlideOutType.PickSlideUp:
                slideFlags |= 128;
                break;
        }

        if (slideFlags > 0) {
            this.writeSimplePropertyNode(properties, 'Slide', 'Flags', slideFlags.toString());
        }
    }

    private writeTransposedPitch(properties: XmlNode, note: Note) {
    }

    private writeConcertPitch(properties: XmlNode, note: Note) {
        // TODO: handle accidentals
        // let parts = Tuning.getTextPartsForTuning(note.realValue);
        // this.writePitch(properties, parts[0])
        // throw new Error('Method not implemented.');
    }

    private writeBend(properties: XmlNode, note: Note) {
        // TODO: write bend
    }

    private writeBeatNode(parent: XmlNode, beat: Beat, rhythms: XmlNode) {
        const beatNode = parent.addElement('Beat');
        beatNode.attributes.set('id', beat.id.toString());

        beatNode.addElement('Dynamic').innerText = DynamicValue[beat.dynamics];
        if (beat.fadeIn) {
            beatNode.addElement('Fadding').innerText = 'FadeIn';
        }
        if (beat.isTremolo) {
            switch (beat.tremoloSpeed) {
                case Duration.Eighth:
                    beatNode.addElement('Tremolo').innerText = '1/2';
                    break;
                case Duration.Sixteenth:
                    beatNode.addElement('Tremolo').innerText = '1/4';
                    break;
                case Duration.ThirtySecond:
                    beatNode.addElement('Tremolo').innerText = '1/8';
                    break;
            }
        }
        if (beat.hasChord) {
            beatNode.addElement('Chord').innerText = beat.chordId!;
        }
        if (beat.crescendo !== CrescendoType.None) {
            beatNode.addElement('Hairpin').innerText = CrescendoType[beat.crescendo];
        }
        switch (beat.brushType) {
            case BrushType.ArpeggioUp:
                beatNode.addElement('Arpeggio').innerText = 'Up';
                break;
            case BrushType.ArpeggioDown:
                beatNode.addElement('Arpeggio').innerText = 'Down';
                break;
        }
        if (beat.text) {
            beatNode.addElement('FreeText').setCData(beat.text);
        }
        switch (beat.graceType) {
            case GraceType.OnBeat:
            case GraceType.BeforeBeat:
                beatNode.addElement('GraceNotes').innerText = GraceType[beat.graceType];
                break;
        }
        if (beat.ottava !== Ottavia.Regular) {
            beatNode.addElement('Ottavia').innerText = Ottavia[beat.ottava].substr(1);
        }
        if (beat.hasWhammyBar) {
            this.writeWhammyNode(beatNode, beat);
        }

        if (beat.isLegatoOrigin || beat.isLegatoDestination) {
            const legato = beatNode.addElement('Legato');
            legato.attributes.set('origin', beat.isLegatoOrigin ? 'true' : 'false');
            legato.attributes.set('destination', beat.isLegatoDestination ? 'true' : 'false');
        }

        this.writeRhythm(beatNode, beat, rhythms);

        if (beat.preferredBeamDirection !== null) {
            switch (beat.preferredBeamDirection) {
                case BeamDirection.Up:
                    beatNode.addElement('TransposedPitchStemOrientation').innerText = 'Upward';
                    break;
                case BeamDirection.Down:
                    beatNode.addElement('TransposedPitchStemOrientation').innerText = 'Downward';
                    break;
            }
        }

        beatNode.addElement('ConcertPitchStemOrientation').innerText = 'Undefined';
        if(!beat.isRest) {
            beatNode.addElement('Notes').innerText = beat.notes.map(n => n.id).join(' ');
        }

        beatNode.addElement('Properties');
    }

    private writeRhythm(parent: XmlNode, beat: Beat, rhythms: XmlNode) {

        const rhythmId = `${beat.duration}_${beat.dots}_${beat.tupletNumerator}_${beat.tupletDenominator}';`

        let rhythm: string;
        if (!this._rhythmIdLookup.has(rhythmId)) {

            rhythm = this._rhythmIdLookup.size.toString();
            this._rhythmIdLookup.set(rhythmId, rhythm);

            const rhythmNode = rhythms.addElement('Rhythm');
            rhythmNode.attributes.set('id', rhythm);

            if (beat.hasTuplet) {
                const tupletNode = rhythmNode.addElement('PrimaryTuplet');
                tupletNode.attributes.set('num', beat.tupletNumerator.toString());
                tupletNode.attributes.set('den', beat.tupletDenominator.toString());
            }
            if (beat.dots > 0) {
                rhythmNode.addElement('AugmentationDot').attributes.set('count', beat.dots.toString());
            }

            let noteValue = 'Quarter';
            switch (beat.duration) {
                case Duration.QuadrupleWhole:
                    noteValue = 'Long';
                    break;
                case Duration.DoubleWhole:
                    noteValue = 'DoubleWhole';
                    break;
                case Duration.Whole:
                    noteValue = 'Whole';
                    break;
                case Duration.Half:
                    noteValue = 'Half';
                    break;
                case Duration.Quarter:
                    noteValue = 'Quarter';
                    break;
                case Duration.Eighth:
                    noteValue = 'Eighth';
                    break;
                case Duration.Sixteenth:
                    noteValue = '16th';
                    break;
                case Duration.ThirtySecond:
                    noteValue = '32nd';
                    break;
                case Duration.SixtyFourth:
                    noteValue = '64th';
                    break;
                case Duration.OneHundredTwentyEighth:
                    noteValue = '128th';
                    break;
                case Duration.TwoHundredFiftySixth:
                    noteValue = '256th';
                    break;
            }
            rhythmNode.addElement('NoteValue').innerText = noteValue
        } else {
            rhythm = this._rhythmIdLookup.get(rhythmId)!;
        }

        parent.addElement('Rhythm').attributes.set('ref', rhythm);
    }

    private writeWhammyNode(_parent: XmlNode, _beat: Beat) {
        // TODO: whammy
    }

    private writeScoreNode(parent: XmlNode, score: Score) {
        const scoreNode = parent.addElement('Score');

        scoreNode.addElement('Title').setCData(score.title);
        scoreNode.addElement('SubTitle').setCData(score.subTitle);
        scoreNode.addElement('Artist').setCData(score.artist);
        scoreNode.addElement('Album').setCData(score.album);
        scoreNode.addElement('Words').setCData(score.words);
        scoreNode.addElement('Music').setCData(score.music);
        scoreNode.addElement('WordsAndMusic').setCData(score.words === score.music ? score.words : '');
        scoreNode.addElement('Copyright').setCData(score.copyright);
        scoreNode.addElement('Tabber').setCData(score.tab);
        scoreNode.addElement('Instructions').setCData(score.instructions);
        scoreNode.addElement('Notices').setCData(score.notices);
        scoreNode.addElement('FirstPageHeader').setCData('');
        scoreNode.addElement('FirstPageFooter').setCData('');
        scoreNode.addElement('PageHeader').setCData('');
        scoreNode.addElement('PageFooter').setCData('');

        // TODO: find out right avlues
        scoreNode.addElement('ScoreSystemsDefaultLayout').setCData('4');
        scoreNode.addElement('ScoreSystemsLayout').setCData('4');

        scoreNode.addElement('ScoreZoomPolicy').setCData('Value');
        scoreNode.addElement('ScoreZoom').setCData('1');
        // not fully clear at this point so we rather activate it
        scoreNode.addElement('MultiVoice').setCData('1>');
    }

    private writeMasterTrackNode(parent: XmlNode, score: Score) {
        const masterTrackNode = parent.addElement('MasterTrack');

        masterTrackNode.addElement('Tracks').innerText = score.tracks.map(t => t.index).join(' ');

        const automations = masterTrackNode.addElement('Automations');

        if (score.masterBars.length > 0 && score.masterBars[0].isAnacrusis) {
            masterTrackNode.addElement('Anacrusis');
        }

        const initialTempoAutomation = automations.addElement('Automation');
        initialTempoAutomation.addElement('Type').innerText = 'Tempo';
        initialTempoAutomation.addElement('Linear').innerText = 'true';
        initialTempoAutomation.addElement('Bar').innerText = "0";
        initialTempoAutomation.addElement('Position').innerText = "0";
        initialTempoAutomation.addElement('Visible').innerText = 'true';
        initialTempoAutomation.addElement('Value').innerText = `${score.tempo} 2`;

        for (const mb of score.masterBars) {
            if (mb.index > 0 && mb.tempoAutomation) {
                const tempoAutomation = automations.addElement('Automation');
                tempoAutomation.addElement('Type').innerText = 'Tempo';
                tempoAutomation.addElement('Linear').innerText = 'true';
                tempoAutomation.addElement('Bar').innerText = mb.index.toString();
                tempoAutomation.addElement('Position').innerText = mb.tempoAutomation.ratioPosition.toString();
                tempoAutomation.addElement('Visible').innerText = 'true';
                tempoAutomation.addElement('Value').innerText = `${mb.tempoAutomation.value} 2`;
            }
        }
    }

    private writeAudioTracksNode(parent: XmlNode, score: Score) {
        parent.addElement('AudioTracks');
    }

    private writeTracksNode(parent: XmlNode, score: Score) {
        const tracksNode = parent.addElement('Tracks');

        for (const track of score.tracks) {
            this.writeTrackNode(tracksNode, track);
        }
    }

    private writeTrackNode(parent: XmlNode, track: Track) {
        const trackNode = parent.addElement('Track');
        trackNode.attributes.set('id', track.index.toString());

        trackNode.addElement('Name').setCData(track.name);
        trackNode.addElement('ShortName').setCData(track.shortName);
        trackNode.addElement('Color').innerText = `${track.color.r} ${track.color.g} ${track.color.b}`;

        // TODO right value
        trackNode.addElement('SystemsDefautLayout').innerText = "3";
        trackNode.addElement('SystemsLayout').innerText = "2";

        trackNode.addElement('AutoBrush');
        trackNode.addElement('PalmMute').innerText = '0';

        // TODO: StringedPick for guitars
        trackNode.addElement('PlayingStyle').innerText = 'Default';
        trackNode.addElement('UseOneChannelPerString');

        // TODO right values
        trackNode.addElement('IconId').innerText = '8';

        this.writeInstrumentSetNode(trackNode, track);
        // TODO write notationpatch
        this.writeTransposeNode(trackNode, track);

        this.writeRseNode(trackNode, track);

        // TODO right values
        trackNode.addElement('ForcedSound').innerText = '-1';

        this.writeSoundsNode(trackNode, track);
        this.writeMidiConnectionNode(trackNode, track);

        if (track.playbackInfo.isSolo) {
            trackNode.addElement('PlaybackState').innerText = 'Solo';
        } else if (track.playbackInfo.isMute) {
            trackNode.addElement('PlaybackState').innerText = 'Mute';
        } else {
            trackNode.addElement('PlaybackState').innerText = 'Default';
        }

        trackNode.addElement('AudioEngineState').innerText = 'MIDI';

        this.writeLyricsNode(trackNode, track);

        this.writeStavesNode(trackNode, track);

        this.writeAutomations(trackNode, track);
    }

    private writeAutomations(trackNode: XmlNode, _track: Track) {
        trackNode.addElement('Automations');
        // TODO: instrument automations
    }

    private writeMidiConnectionNode(trackNode: XmlNode, track: Track) {
        const midiConnection = trackNode.addElement('MidiConnection');
        midiConnection.addElement('Port').innerText = track.playbackInfo.port.toString();
        midiConnection.addElement('PrimaryChannel').innerText = track.playbackInfo.primaryChannel.toString();
        midiConnection.addElement('SecondaryChannel').innerText = track.playbackInfo.secondaryChannel.toString();
        midiConnection.addElement('ForeOneChannelPerString').innerText = 'false';
    }

    private writeRseNode(trackNode: XmlNode, track: Track) {
        const rse = trackNode.addElement('RSE');

        const channelStrip = rse.addElement('ChannelStrip');
        channelStrip.attributes.set('version', 'E56');

        const channelStripParameters = rse.addElement('Parameters');
        channelStripParameters.innerText = `0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 1 0.5 ${track.playbackInfo.balance / 16} ${track.playbackInfo.volume / 16} 0.5 0.5 0.5`;
    }

    private writeStavesNode(trackNode: XmlNode, track: Track) {
        const staves = trackNode.addElement('Staves');
        for (const staff of track.staves) {
            this.writeStaffNode(staves, staff);
        }
    }

    private writeStaffNode(parent: XmlNode, staff: Staff) {
        const staffNode = parent.addElement('Staff');
        const properties = staffNode.addElement('Properties');

        this.writeSimplePropertyNode(properties, 'CapoFret', 'Fret', staff.capo.toString());

        const tuningProperty = this.writeSimplePropertyNode(properties, 'Tuning', 'Pitches', staff.tuning.slice().reverse().join(' '));
        tuningProperty.addElement('Flat');
        // TODO: right values
        tuningProperty.addElement('Instrument').innerText = 'Guitar';
        tuningProperty.addElement('Label').setCData('');
        tuningProperty.addElement('LabelVisible').innerText = 'true';

        this.writeSimplePropertyNode(properties, 'PartialCapoFret', 'Fret', "0");
        this.writeSimplePropertyNode(properties, 'PartialCapoStringFlags', 'Bitset', staff.tuning.map(_ => '0').join(''));

        this.writeDiagramCollection(properties, staff);
    }

    private writeDiagramCollection(properties: XmlNode, staff: Staff) {
        const diagramCollectionProperty = properties.addElement('Property');
        diagramCollectionProperty.attributes.set('name', 'DiagramCollection');
        const diagramCollectionItems = diagramCollectionProperty.addElement('Items');

        staff.chords.forEach((chord, id) => {

            const diagramCollectionItem = diagramCollectionItems.addElement('Item');
            diagramCollectionItem.attributes.set('id', id);
            diagramCollectionItem.attributes.set('name', chord.name);

            const diagram = diagramCollectionItem.addElement('Diagram');
            diagram.attributes.set('stringCount', chord.strings.length.toString());
            diagram.attributes.set('fretCount', '5');
            diagram.attributes.set('baseFret', (chord.firstFret - 1).toString());
            diagram.attributes.set('barStates', chord.strings.map(_ => '1').join(' '));

            for (let i = 0; i < chord.strings.length; i++) {
                const fret = diagram.addElement('Fret');
                fret.attributes.set('string', (chord.strings.length - 1 - i).toString());
                fret.attributes.set('fret', chord.strings[i].toString());
            }

            // TODO fingering

            const showName = diagram.addElement('Property');
            showName.attributes.set('name', 'ShowName');
            showName.attributes.set('type', 'bool');
            showName.attributes.set('value', chord.showName ? "true" : "false");

            const showDiagram = diagram.addElement('Property');
            showDiagram.attributes.set('name', 'ShowDiagram');
            showDiagram.attributes.set('type', 'bool');
            showDiagram.attributes.set('value', chord.showDiagram ? "true" : "false");

            const showFingering = diagram.addElement('Property');
            showFingering.attributes.set('name', 'ShowFingering');
            showFingering.attributes.set('type', 'bool');
            showFingering.attributes.set('value', chord.showFingering ? "true" : "false");


            // TOOD Chord details
        });
    }

    private writeSimplePropertyNode(parent: XmlNode, propertyName: string, propertyValueTag: string, propertyValue: string | null) {
        const prop = parent.addElement('Property');
        prop.attributes.set('name', propertyName);
        if (propertyValue !== null) {
            prop.addElement(propertyValueTag).innerText = propertyValue;
        }
        return prop;
    }

    private writeLyricsNode(trackNode: XmlNode, track: Track) {
        const lyrics = trackNode.addElement('Lyrics');
        lyrics.attributes.set('dispatched', 'true');

        let lines: Lyrics[] = [];

        for (const bar of track.staves[0].bars) {
            for (const voice of bar.voices) {
                if (!voice.isEmpty) {
                    for (const beat of voice.beats) {
                        if (beat.lyrics) {
                            for (let l = 0; l < beat.lyrics.length; l++) {
                                if (l >= beat.lyrics.length) {
                                    const newLyrics = new Lyrics();
                                    newLyrics.startBar = bar.index;
                                    lines.push(newLyrics);
                                }

                                const line = lines[l];
                                if (line.text.length > 0) {
                                    line.text += ' ';
                                }

                                line.text += beat.lyrics[l];
                            }
                        }
                    }
                }
            }
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lyrics.addElement('Line');
            line.addElement('Text').setCData(lines[i].text);
            line.addElement('Offset').innerText = lines[i].startBar.toString();
        }
    }

    private writeSoundsNode(trackNode: XmlNode, track: Track) {
        const sounds = trackNode.addElement('Sounds');
        const sound = sounds.addElement('Sound');

        // TODO: right values
        sound.addElement('Name').setCData(`Track_${track.index}_Initial`);
        sound.addElement('Label').setCData('');
        sound.addElement('Path').setCData('');
        sound.addElement('Role').setCData('');

        const midi = sound.addElement('MIDI');
        midi.addElement('LSB').innerText = '0';
        midi.addElement('MSB').innerText = '0';
        midi.addElement('Program').innerText = track.playbackInfo.program.toString();

        // TODO: check if RSE is mandatory

        // TODO: generate sounds for all Program Changes. 
        // they need an item here with a name and then we refer to it on the automations
    }

    private writeTransposeNode(trackNode: XmlNode, track: Track) {
        const transpose = trackNode.addElement('Transpose');

        const octaveTranspose = Math.floor(track.staves[0].displayTranspositionPitch / 12);
        const chromaticTranspose = track.staves[0].displayTranspositionPitch - (octaveTranspose * 12);

        transpose.addElement('Chromatic').innerText = octaveTranspose.toString();
        transpose.addElement('Octave').innerText = chromaticTranspose.toString();
    }

    private writeInstrumentSetNode(trackNode: XmlNode, track: Track) {
        const instrumentSet = trackNode.addElement('InstrumentSet');
        // TODO: create mapping of midi instruments to type
        instrumentSet.addElement('Name').innerText = 'Steel Guitar';
        instrumentSet.addElement('Type').innerText = 'steelGuitar';

        instrumentSet.addElement('LineCount').innerText = track.staves[0].standardNotationLineCount.toString();

        // TODO: percussionArticulations
        const elements = instrumentSet.addElement('Elements');
        const element = elements.addElement('Element');

        element.addElement('Pitched').innerText = 'Pitched';
        element.addElement('Type').innerText = 'pitched';
        element.addElement('SoundbankName').innerText = '';

        const articulations = element.addElement('Articulations');
        const articulation = articulations.addElement('Articulation');

        articulation.addElement('Name').innerText = '';
        articulation.addElement('StaffLine').innerText = '0';
        articulation.addElement('Noteheads').innerText = 'noteheadBlack noteheadHalf noteheadWhole';
        articulation.addElement('TechniquePlacement').innerText = 'outside';
        articulation.addElement('TechniqueSymbol').innerText = '';
        articulation.addElement('InputMidiNumbers').innerText = '';
        articulation.addElement('OutputRSESound').innerText = '';
        articulation.addElement('OutputMidiNumber').innerText = '0';
    }

    private writeMasterBarsNode(parent: XmlNode, score: Score) {
        const masterBars = parent.addElement('MasterBars');
        for (const masterBar of score.masterBars) {
            this.writeMasterBarNode(masterBars, masterBar);
        }
    }

    private writeMasterBarNode(parent: XmlNode, masterBar: MasterBar) {
        const masterBarNode = parent.addElement('MasterBar');

        const key = masterBarNode.addElement('Key');
        key.addElement('AccidentalCount').innerText = (masterBar.keySignature as number).toString();
        key.addElement('Mode').innerText = KeySignatureType[masterBar.keySignatureType];
        key.addElement('Sharps').innerText = 'Sharps';

        masterBarNode.addElement('Time').innerText = `${masterBar.timeSignatureNumerator}/${masterBar.timeSignatureDenominator}`;

        let bars: string[] = [];
        for (const tracks of masterBar.score.tracks) {
            for (const staves of tracks.staves) {
                bars.push(staves.bars[masterBar.index].id.toString());
            }
        }

        masterBarNode.addElement('Bars').innerText = bars.join(' ');

        if (masterBar.isDoubleBar) {
            masterBarNode.addElement('DoubleBar');
        }
        if (masterBar.isSectionStart) {
            const section = masterBarNode.addElement('Section');
            section.addElement('Letter').innerText = masterBar.section!.marker;
            section.addElement('Text').innerText = masterBar.section!.text;
        }

        if (masterBar.isRepeatStart || masterBar.isRepeatEnd) {
            const repeat = masterBarNode.addElement('Repeat');
            repeat.attributes.set('start', masterBar.isRepeatStart ? "true" : "false");
            repeat.attributes.set('end', masterBar.isRepeatEnd ? "true" : "false");
            if (masterBar.isRepeatEnd) {
                repeat.attributes.set('count', masterBar.repeatCount.toString());
            }
        }

        if (masterBar.alternateEndings > 0) {
            let remainingBits = masterBar.alternateEndings;

            const alternateEndings: number[] = [];
            let bit = 0;
            while (remainingBits > 0) {

                if ((remainingBits >> bit)) {
                    alternateEndings.push(bit + 1);
                    // clear bit
                    remainingBits &= ~(1 << bit);
                }
                bit++;
            }

            masterBarNode.addElement('AlternateEndings').innerText = alternateEndings.join(' ');;
        }

        if (masterBar.tripletFeel !== TripletFeel.NoTripletFeel) {
            masterBarNode.addElement('TripletFeel').innerText = TripletFeel[masterBar.tripletFeel];
        }

        this.writeFermatas(masterBarNode, masterBar);
    }

    private writeFermatas(parent: XmlNode, masterBar: MasterBar) {
        if (masterBar.fermata.size === 0) {
            return;
        }

        // TODO: Fermata
        if (masterBar.fermata.size > 0) {
            const fermatas = parent.addElement('Fermatas');
            masterBar.fermata.forEach((fermata, offset) => {
                this.writeFermata(fermatas, offset, fermata);
            });
        }

    }
    private writeFermata(parent: XmlNode, offset: number, fermata: Fermata) {

        let numerator = 0;
        let denominator = 1;
        while (denominator < 10) {
            // Offset = (numerator / denominator) * QuarterTime
            // (Offset / QuarterTime) * denominator = numerator

            numerator = (offset / MidiUtils.QuarterTime) * denominator;

            // found a full digit match
            if (numerator === Math.floor(numerator)) {
                break;
            }

            numerator = 0;
            denominator++;
        }

        if (numerator === 0) {
            // No split found
            return;
        }

        const fermataNode = parent.addElement('Fermata');

        fermataNode.addElement('Type').innerText = FermataType[fermata.type];
        fermataNode.addElement('Length').innerText = fermata.length.toString();
        fermataNode.addElement('Offset').innerText = `${numerator}/${denominator}`;
    }

    private writeBarNode(parent: XmlNode, bar: Bar) {
        const barNode = parent.addElement('Bar');
        barNode.attributes.set('id', bar.id.toString());

        barNode.addElement('Voices').innerText = bar.voices.map(v => v.id).join(' ');
        barNode.addElement('Clef').innerText = Clef[bar.clef];
        barNode.addElement('Ottavia').innerText = Clef[bar.clef].substr(1);
        if (bar.simileMark !== SimileMark.None) {
            barNode.addElement('SimileMark').innerText = SimileMark[bar.simileMark];
        }
    }

    private writeVoiceNode(parent: XmlNode, voice: Voice) {
        const voiceNode = parent.addElement('Voice');
        voiceNode.attributes.set('id', voice.id.toString());
        voiceNode.addElement('Beats').innerText = voice.beats.map(v => v.id).join(' ');
    }
}
