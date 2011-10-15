/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.file.guitarpro;
import alphatab.file.FileFormatException;
import alphatab.model.effects.BendEffect;
import alphatab.model.effects.BendPoint;
import alphatab.model.effects.GraceEffect;
import alphatab.model.effects.GraceEffectTransition;
import alphatab.model.effects.HarmonicEffect;
import alphatab.model.effects.HarmonicType;
import alphatab.model.effects.TremoloPickingEffect;
import alphatab.model.effects.TrillEffect;
import alphatab.model.Beat;
import alphatab.model.BeatEffect;
import alphatab.model.BeatStrokeDirection;
import alphatab.model.BeatText;
import alphatab.model.Chord;
import alphatab.model.Color;
import alphatab.model.Duration;
import alphatab.model.GuitarString;
import alphatab.model.HeaderFooterElements;
import alphatab.model.LyricLine;
import alphatab.model.Lyrics;
import alphatab.model.Marker;
import alphatab.model.Measure;
import alphatab.model.MeasureHeader;
import alphatab.model.MidiChannel;
import alphatab.model.MixTableChange;
import alphatab.model.Note;
import alphatab.model.NoteEffect;
import alphatab.model.PageSetup;
import alphatab.model.SlideType;
import alphatab.model.Song;
import alphatab.model.SongFactory;
import alphatab.model.Tempo;
import alphatab.model.TimeSignature;
import alphatab.model.Track;
import alphatab.model.Tuplet;
import alphatab.model.TripletFeel;
import alphatab.model.Velocities;
import alphatab.model.Voice;
import alphatab.model.Point;
import alphatab.model.Rectangle;

/**
 * A reader for GuitarPro 3 files. 
 */
class Gp3Reader extends GpReaderBase
{
    private var _tripletFeel:Int;

    public function new() 
    {
        super();
        initVersions(["FICHIER GUITAR PRO v3.00"]);
    }
    
    /**
     * Reads the song
     * @return The song readen from the given stream using the specified factory
     */
    public override function readSong() : Song
    {
        if (!readVersion())
        {
            throw new FileFormatException("Unsupported Version");
        }
        
        var song:Song = factory.newSong();
        
        readInfo(song);
        
        _tripletFeel = data.readBool() ? TripletFeel.Eighth : TripletFeel.None;
        
        readLyrics(song);
        
        readPageSetup(song);
        
        song.tempoName = "";
        song.tempo = data.readInt();
        song.hideTempo = false;
       
        song.key = data.readInt();
        song.octave = 0;
        
        var channels:Array<MidiChannel> = readMidiChannels();
        
        var measureCount = data.readInt();
        var trackCount = data.readInt();
        
        readMeasureHeaders(song, measureCount);
        readTracks(song, trackCount, channels);
        readMeasures(song);
        
        return song;
    }
    
    private function readMeasures(song:Song) : Void
    {
        var tempo:Tempo = factory.newTempo();
        tempo.value = song.tempo;
        var start = Duration.QUARTER_TIME;
        for (h in 0 ... song.measureHeaders.length) {
            var header:MeasureHeader = song.measureHeaders[h];
            header.start = start;
            for(t in 0 ... song.tracks.length) {
                var track = song.tracks[t];
                var measure = factory.newMeasure(header);
                header.tempo.copy(tempo);
                track.addMeasure(measure);
                readMeasure(measure, track);
            }
            tempo.copy(header.tempo);
            start += header.length();
        }
    }
    
    private function readMeasure(measure:Measure, track:Track): Void
    {
        var start = measure.start();
        var beats = data.readInt();
        for (beat in 0 ... beats) { 
            start += readBeat(start, measure, track, 0);
        }
    }
    
    private function readBeat(start:Int, measure:Measure, track:Track, voiceIndex:Int) : Int
    {
        var flags:Int = data.readByte();
        
        var beat:Beat = getBeat(measure, start);
        var voice:Voice = beat.voices[voiceIndex];
        
        if ((flags & 0x40) != 0) {
            var beatType:Int = data.readByte();
            voice.isEmpty = ((beatType & 0x02) == 0);
        }
        
        var duration:Duration = readDuration(flags);
        var effect:NoteEffect = factory.newNoteEffect();
        if ((flags & 0x02) != 0) {
            readChord(track.stringCount(), beat);
        }
        if ((flags & 0x04) != 0) {
            readText(beat);
        }
        if ((flags & 0x08) != 0) {
            readBeatEffects(beat, effect);
        }
        if ((flags & 0x10) != 0) {
            var mixTableChange:MixTableChange = readMixTableChange(measure);
            beat.effect.mixTableChange = mixTableChange;
        }
        var stringFlags:Int = data.readByte();
        for (j in 0 ... 7)
        {
            var i:Int = 6 - j;
            if ((stringFlags & (1 << i)) != 0 && (6 - i) < track.stringCount()) {
                var guitarString = track.strings[6 - i].clone(factory);
                var note = readNote(guitarString, track, effect.clone(factory));
                voice.addNote(note);
            }
            duration.copy(voice.duration);
        }
        
        
        return (!voice.isEmpty) ? duration.time() : 0;
    }
    
    private function readNote(guitarString:GuitarString, track:Track, effect:NoteEffect) : Note
    {
        var flags:Int = data.readByte();
        var note:Note = factory.newNote();
        note.string = (guitarString.number);
        note.effect = (effect);
        note.effect.accentuatedNote = (((flags & 0x40) != 0));
        note.effect.heavyAccentuatedNote = (((flags & 0x02) != 0));
        note.effect.ghostNote = (((flags & 0x04) != 0));
        if ((flags & 0x20) != 0) {
            var noteType = data.readByte();
            note.isTiedNote = ((noteType == 0x02));
            note.effect.deadNote = ((noteType == 0x03));
        }
        if ((flags & 0x01) != 0) {
            note.duration = data.readSignedByte();
            note.tuplet = data.readSignedByte();
        }
        if ((flags & 0x10) != 0) {
            note.velocity = ((Velocities.MIN_VELOCITY + (Velocities.VELOCITY_INCREMENT * data.readSignedByte())) -
            Velocities.VELOCITY_INCREMENT);
        }
        if ((flags & 0x20) != 0) {
            var fret = data.readSignedByte();
            var value = (note.isTiedNote ? getTiedNoteValue(guitarString.number, track) : fret);
            note.value = (value >= 0 && value < 100 ? value : 0);
        }
        if ((flags & 0x80) != 0) {
            note.effect.leftHandFinger = data.readSignedByte();
            note.effect.rightHandFinger = data.readSignedByte();
            note.effect.isFingering = true;
        }
        if ((flags & 0x08) != 0) {
            readNoteEffects(note.effect);
        }
        return note;
    }
    
    private function readNoteEffects(noteEffect:NoteEffect) : Void
    {
        var flags1:Int = data.readByte();
        noteEffect.slide = (flags1 & 0x04) != 0;
        noteEffect.hammer = (flags1 & 0x02) != 0;
        noteEffect.letRing = (flags1 & 0x08) != 0;

        if ((flags1 & 0x01) != 0) {
            readBend(noteEffect);
        }
        if ((flags1 & 0x10) != 0) {
            readGrace(noteEffect);
        }
    }
    
    private function readGrace(noteEffect:NoteEffect) : Void
    {
        var fret:Int = data.readByte();
        var dyn:Int = data.readByte();
        var transition:Int = data.readSignedByte();
        var duration:Int = data.readByte();
        var grace:GraceEffect = factory.newGraceEffect();
        
        grace.fret = (fret);
        grace.velocity = ((Velocities.MIN_VELOCITY + (Velocities.VELOCITY_INCREMENT * dyn)) -
        Velocities.VELOCITY_INCREMENT);
        grace.duration = (duration);
        grace.isDead = fret == 255;
        grace.isOnBeat = false;
        switch (transition) {
            case 0:
                grace.transition = GraceEffectTransition.None;
            case 1:
                grace.transition = GraceEffectTransition.Slide;
            case 2:
                grace.transition = GraceEffectTransition.Bend;
            case 3:
                grace.transition = GraceEffectTransition.Hammer;
        }
        noteEffect.grace = (grace);
    }
    
    private function readBend(noteEffect:NoteEffect) : Void
    {
        var bendEffect:BendEffect = factory.newBendEffect();
        bendEffect.type = data.readSignedByte();
        bendEffect.value = data.readInt();
        var pointCount = data.readInt();
        for (i in 0 ... pointCount) {
            var pointPosition = Math.round(data.readInt() * BendEffect.MAX_POSITION / GpReaderBase.BEND_POSITION);
            var pointValue = Math.round(data.readInt() * BendEffect.SEMITONE_LENGTH / GpReaderBase.BEND_SEMITONE);
            var vibrato = data.readBool();
            bendEffect.points.push(new BendPoint(pointPosition, pointValue, vibrato));
        } 
        
        if (pointCount > 0) 
            noteEffect.bend = bendEffect;
    }
    
    private function readMixTableChange(measure:Measure) : MixTableChange
    {
        var tableChange:MixTableChange = factory.newMixTableChange();
        tableChange.instrument.value = data.readSignedByte();
        tableChange.volume.value = data.readSignedByte();
        tableChange.balance.value = data.readSignedByte();
        tableChange.chorus.value = data.readSignedByte();
        tableChange.reverb.value = data.readSignedByte();
        tableChange.phaser.value = data.readSignedByte();
        tableChange.tremolo.value = data.readSignedByte();
        tableChange.tempoName = "";
        tableChange.tempo.value = data.readInt();
        
        if (tableChange.instrument.value < 0) 
            tableChange.instrument = null;
        
        if (tableChange.volume.value >= 0) 
            tableChange.volume.duration = data.readSignedByte();
        else 
            tableChange.volume = null;
        if (tableChange.balance.value >= 0) 
            tableChange.balance.duration = data.readSignedByte();
        else 
            tableChange.balance = null;
        if (tableChange.chorus.value >= 0) 
            tableChange.chorus.duration = data.readSignedByte();
        else 
            tableChange.chorus = null;
        if (tableChange.reverb.value >= 0) 
            tableChange.reverb.duration = data.readSignedByte();
        else 
            tableChange.reverb = null;
        if (tableChange.phaser.value >= 0) 
            tableChange.phaser.duration = data.readSignedByte();
        else 
            tableChange.phaser = null;
        if (tableChange.tremolo.value >= 0) 
            tableChange.tremolo.duration = data.readSignedByte();
        else 
            tableChange.tremolo = null;
        if (tableChange.tempo.value >= 0) {
            tableChange.tempo.duration = data.readSignedByte();
            measure.tempo().value = tableChange.tempo.value;
            tableChange.hideTempo = false;
        }
        else 
            tableChange.tempo = null;
        
        
        return tableChange;
    }
    
    private function readBeatEffects(beat:Beat, effect:NoteEffect)  : Void
    {
        var flags1:Int = data.readByte();
        beat.effect.fadeIn = (((flags1 & 0x10) != 0));
        beat.effect.vibrato = (((flags1 & 0x02) != 0)) || beat.effect.vibrato;
        
        if ((flags1 & 0x20) != 0) {
            var slapEffect:Int = data.readByte();
            if (slapEffect == 0) {
                readTremoloBar(beat.effect);
            }
            else {
                beat.effect.tapping = (slapEffect == 1);
                beat.effect.slapping = (slapEffect == 2);
                beat.effect.popping = (slapEffect == 3);
                data.readInt();
            }
        }
        if ((flags1 & 0x40) != 0) {
            var strokeUp:Int = data.readSignedByte();
            var strokeDown:Int = data.readSignedByte();
            if (strokeUp > 0) {
                beat.effect.stroke.direction = BeatStrokeDirection.Up;
                beat.effect.stroke.value = (toStrokeValue(strokeUp));
            } 
            else 
                if (strokeDown > 0) {
                    beat.effect.stroke.direction = BeatStrokeDirection.Down;
                    beat.effect.stroke.value = (toStrokeValue(strokeDown));
                }
        }
        if ((flags1 & 0x04) != 0)
        {
            var harmonic:HarmonicEffect = factory.newHarmonicEffect();
            harmonic.type = (HarmonicType.Natural);
            effect.harmonic = (harmonic);
        }
        if ((flags1 & 0x08) != 0)
        {
            var harmonic:HarmonicEffect = factory.newHarmonicEffect();
            harmonic.type = (HarmonicType.Artificial);
            harmonic.data = (0);
            effect.harmonic = (harmonic);
        }
    }
    
    private function readTremoloBar(effect:BeatEffect) : Void 
    {
        var barEffect:BendEffect = factory.newBendEffect();
        barEffect.type = data.readSignedByte();
        barEffect.value = data.readInt();
        
        barEffect.points.push(new BendPoint(0, 0, false));
        barEffect.points.push(new BendPoint(Math.round(BendEffect.MAX_POSITION/2.0), Math.round(barEffect.value / (GpReaderBase.BEND_SEMITONE * 2)), false));
        barEffect.points.push(new BendPoint(BendEffect.MAX_POSITION, 0, false));
        
        effect.tremoloBar = barEffect;
    }
    
    private function readText(beat:Beat) : Void
    {
        var text:BeatText = factory.newText();
        text.value = readIntSizeCheckByteString();
        beat.setText(text);
    }
    
    private function readChord(stringCount:Int, beat:Beat)
    {
        var chord:Chord = factory.newChord(stringCount);
        if ((data.readByte() & 0x01) == 0) {
            chord.name = (readIntSizeCheckByteString());
            chord.firstFret = (data.readInt());
            if (chord.firstFret != 0) {
                for (i in 0 ... 6) {
                    var fret = data.readInt();
                    if (i < chord.strings.length) {
                        chord.strings[i] = fret;
                    }
                }
            }
        }
        else {
            skip(25);
            chord.name = (readByteSizeString(34));
            chord.firstFret = (data.readInt());
            for (i in 0 ... 6) {
                var fret = data.readInt();
                if (i < chord.strings.length) {
                    chord.strings[i] = fret;
                }
            }
            skip(36);
        }
        if (chord.noteCount() > 0) {
            beat.setChord(chord);
        }
    }
    
    private function readDuration(flags:Int)
    {
        var duration:Duration = factory.newDuration();
        
        duration.value = Math.round(Math.pow(2, (data.readSignedByte() + 4)) / 4);
        duration.isDotted = (((flags & 0x01) != 0));
        if ((flags & 0x20) != 0) {
            var iTuplet = data.readInt();
            switch (iTuplet) {
                case 3:
                    duration.tuplet.enters = (3);
                    duration.tuplet.times = (2);
                case 5:
                    duration.tuplet.enters = (5);
                    duration.tuplet.times = (4);
                case 6:
                    duration.tuplet.enters = (6);
                    duration.tuplet.times = (4);
                case 7:
                    duration.tuplet.enters = (7);
                    duration.tuplet.times = (4);
                case 9:
                    duration.tuplet.enters = (9);
                    duration.tuplet.times = (8);
                case 10:
                    duration.tuplet.enters = (10);
                    duration.tuplet.times = (8);
                case 11:
                    duration.tuplet.enters = (11);
                    duration.tuplet.times = (8);
                case 12:
                    duration.tuplet.enters = (12);
                    duration.tuplet.times = (8);
            }
        }
        return duration;
    }
    
    private function getBeat(measure:Measure, start:Int) : Beat
    {
        for (b in 0 ... measure.beats.length) {
            var beat:Beat = measure.beats[b];
            if (beat.start == start) 
                return beat;
        }
        
        var newBeat:Beat = factory.newBeat();
        newBeat.start = start;
        measure.addBeat(newBeat);
        return newBeat;
    }
    
    private function readTracks(song:Song, trackCount:Int, channels:Array<MidiChannel>) : Void
    {
        for (i in 1 ... trackCount + 1) {
            song.addTrack(readTrack(i, channels));
        }
    }
    
    private function readTrack(number:Int, channels:Array<MidiChannel>) : Track
    {
        var flags:Int = data.readByte();
        var track:Track = factory.newTrack();
        
        track.isPercussionTrack = (flags & 0x1) != 0;
        track.is12StringedGuitarTrack = (flags & 0x02) != 0;
        track.isBanjoTrack = (flags & 0x04) != 0;
        track.number = number;
        track.name = readByteSizeString(40);
        
        var stringCount = data.readInt();
        for (i in 0 ... 7) 
        {
            var iTuning:Int = data.readInt();
            if (stringCount > i) {
                var oString:GuitarString = factory.newString();
                oString.number = (i + 1);
                oString.value = (iTuning);
                track.strings.push(oString);
            }
        }
        
        track.port = data.readInt();
        readChannel(track.channel, channels);
        if(track.channel.channel == 9)
        {
            track.isPercussionTrack = true;
        }
        track.fretCount = data.readInt();
        track.offset = data.readInt();
        track.color = readColor();
        
        return track;
    }
    
    private function readChannel(midiChannel:MidiChannel, channels:Array<MidiChannel>) : Void
    {
        var index:Int = (data.readInt() - 1);
        var effectChannel:Int = (data.readInt() - 1);
        if (index >= 0 && index < channels.length) {
            channels[index].copy(midiChannel);
            if (midiChannel.instrument() < 0) {
                midiChannel.instrument(0);
            }
            if (!midiChannel.isPercussionChannel()) {
                midiChannel.effectChannel = (effectChannel);
            }
        }
    }
    
    private function readMeasureHeaders(song:Song, measureCount:Int) : Void
    {
        var timeSignature:TimeSignature = factory.newTimeSignature();
        for (i in 0 ... measureCount)
        {
            song.addMeasureHeader(readMeasureHeader(i, timeSignature, song));
        }
    }
    
    private function readMeasureHeader(i:Int, timeSignature:TimeSignature, song:Song) : MeasureHeader
    {
       
        var flags:Int = data.readByte();
        
        var header:MeasureHeader = factory.newMeasureHeader();
        header.number = i + 1;
        header.start = 0;
        header.tempo.value = song.tempo;
        header.tripletFeel = _tripletFeel;
        
        if ((flags & 0x01) != 0) 
            timeSignature.numerator = data.readSignedByte();
        if ((flags & 0x02) != 0) 
            timeSignature.denominator.value = data.readSignedByte();
        
        header.isRepeatOpen = ((flags & 0x04) != 0);
        
        timeSignature.copy(header.timeSignature);
        
        if ((flags & 0x08) != 0) 
            header.repeatClose = (data.readSignedByte() - 1);
        
        if ((flags & 0x10) != 0) 
            header.repeatAlternative = parseRepeatAlternative(song, header.number, data.readByte());
            
        if ((flags & 0x20) != 0) 
            header.marker = readMarker(header);
                
        if ((flags & 0x40) != 0) {
            header.keySignature = toKeySignature(data.readSignedByte());
            header.keySignatureType = data.readSignedByte();
        }
        else if(header.number > 1) {
            header.keySignature = song.measureHeaders[i-1].keySignature;
            header.keySignatureType = song.measureHeaders[i-1].keySignatureType;
        }
        header.hasDoubleBar = (flags & 0x80) != 0;
       
        return header;
    }
    
    private function parseRepeatAlternative(song:Song, measure:Int, value:Int) : Int
    {
        var repeatAlternative:Int = 0;
        var existentAlternatives:Int = 0;
        for (i in 0 ... song.measureHeaders.length) {
            var header:MeasureHeader = song.measureHeaders[i];
            if (header.number == measure) 
                break;
            if (header.isRepeatOpen) 
                existentAlternatives = 0;
            existentAlternatives |= header.repeatAlternative;
        }
        
        for (i in 0 ... 8) {
            if (value > i && (existentAlternatives & (1 << i)) == 0) {
                repeatAlternative |= (1 << i);
            }
        }
        return repeatAlternative;
    }
    
    private function readMarker(header:MeasureHeader) 
    {
        var marker:Marker = factory.newMarker();
        marker.measureHeader = header;
        marker.title = readIntSizeCheckByteString();
        marker.color = readColor();
        return marker;
    }
    
    private function readColor() : Color
    {
        var r:Int = (data.readByte());
        var g:Int = data.readByte();
        var b:Int = (data.readByte());
        skip(1);
        return new Color(r, g, b);
    }
    
    private function readMidiChannels() : Array<MidiChannel>
    {
        var channels:Array<MidiChannel> = new Array<MidiChannel>();
        for (i in 0 ...64) 
        {
            var newChannel:MidiChannel = factory.newMidiChannel();
            newChannel.channel = (i);
            newChannel.effectChannel = (i);
            newChannel.instrument(data.readInt());
            newChannel.volume = (GpReaderBase.toChannelShort(data.readSignedByte()));
            newChannel.balance = (GpReaderBase.toChannelShort(data.readSignedByte()));
            newChannel.chorus = (GpReaderBase.toChannelShort(data.readSignedByte()));
            newChannel.reverb = (GpReaderBase.toChannelShort(data.readSignedByte()));
            newChannel.phaser = (GpReaderBase.toChannelShort(data.readSignedByte()));
            newChannel.tremolo = (GpReaderBase.toChannelShort(data.readSignedByte()));
            channels.push(newChannel);
            // Backward compatibility with version 3.0
            skip(2);
        }
        return channels;
    }
    
    private function readPageSetup(song:Song) : Void
    {
        var setup:PageSetup = factory.newPageSetup();
        song.pageSetup = setup;
    }
    
    private function readLyrics(song:Song) : Void
    {
        song.lyrics = factory.newLyrics();
    }
    
    private function readInfo(song:Song)
    {
        song.title = (readIntSizeCheckByteString());
        song.subtitle = readIntSizeCheckByteString();
        song.artist = (readIntSizeCheckByteString());
        song.album = (readIntSizeCheckByteString());
        song.words = (readIntSizeCheckByteString());
        song.music = song.words;
        song.copyright = readIntSizeCheckByteString();
        song.tab = readIntSizeCheckByteString();
        song.instructions = readIntSizeCheckByteString();
        
        var iNotes = data.readInt();
        song.notice = "";
        for (i in 0 ... iNotes) {
            song.notice += readIntSizeCheckByteString() + "\n";
        }
    }
    
    public static function toKeySignature(p:Int) : Int
    {
        return p < 0 ? 7 + Math.round(Math.abs(p)) : p;
    }
    
    public static function toStrokeValue(value:Int) : Int
    {
        switch (value)
        {
            case 1:
                return Duration.SIXTY_FOURTH;
            case 2:
                return Duration.SIXTY_FOURTH;
            case 3:
                return Duration.THIRTY_SECOND;
            case 4:
                return Duration.SIXTEENTH;
            case 5:
                return Duration.EIGHTH;
            case 6:
                return Duration.QUARTER;
            default:
                return Duration.SIXTY_FOURTH;
        }
    }
    

}