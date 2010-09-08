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
package net.alphatab.file.guitarpro;
import net.alphatab.file.FileFormatException;
import net.alphatab.model.effects.BendEffect;
import net.alphatab.model.effects.BendPoint;
import net.alphatab.model.effects.BendTypesConverter;
import net.alphatab.model.effects.GraceEffect;
import net.alphatab.model.effects.GraceEffectTransition;
import net.alphatab.model.effects.HarmonicEffect;
import net.alphatab.model.effects.HarmonicType;
import net.alphatab.model.effects.TremoloBarEffect;
import net.alphatab.model.effects.TremoloPickingEffect;
import net.alphatab.model.effects.TrillEffect;
import net.alphatab.model.Beat;
import net.alphatab.model.BeatEffect;
import net.alphatab.model.BeatStrokeDirection;
import net.alphatab.model.BeatText;
import net.alphatab.model.Chord;
import net.alphatab.model.Color;
import net.alphatab.model.Duration;
import net.alphatab.model.GuitarString;
import net.alphatab.model.HeaderFooterElements;
import net.alphatab.model.LyricLine;
import net.alphatab.model.Lyrics;
import net.alphatab.model.Marker;
import net.alphatab.model.Measure;
import net.alphatab.model.MeasureHeader;
import net.alphatab.model.MidiChannel;
import net.alphatab.model.MixTableChange;
import net.alphatab.model.Note;
import net.alphatab.model.NoteEffect;
import net.alphatab.model.PageSetup;
import net.alphatab.model.SlideType;
import net.alphatab.model.Song;
import net.alphatab.model.SongFactory;
import net.alphatab.model.Tempo;
import net.alphatab.model.TimeSignature;
import net.alphatab.model.Track;
import net.alphatab.model.Tuplet;
import net.alphatab.model.TripletFeel;
import net.alphatab.model.Velocities;
import net.alphatab.model.Voice;
import net.alphatab.model.Point;
import net.alphatab.model.Rectangle;

/**
 * A reader for GuitarPro 3 files. 
 */
class Gp3Reader extends GpReaderBase
{
	private var _tripletFeel:TripletFeel;

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
		
		_tripletFeel = readBool() ? TripletFeel.Eighth : TripletFeel.None;
        
        readLyrics(song);
        
        readPageSetup(song);
        
        song.tempoName = "";
        song.tempo = readInt();
		song.hideTempo = false;
       
        song.key = readInt();
        song.octave = 0;
        
        var channels:Array<MidiChannel> = readMidiChannels();
        
        var measureCount = readInt();
        var trackCount = readInt();
        
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
		var beats = readInt();
		for (beat in 0 ... beats) { 
			start += readBeat(start, measure, track, 0);
		}
	}
	
	private function readBeat(start:Int, measure:Measure, track:Track, voiceIndex:Int) : Int
	{
		var flags:Int = readUnsignedByte();
        
        var beat:Beat = getBeat(measure, start);
        var voice:Voice = beat.voices[voiceIndex];
		
        if ((flags & 0x40) != 0) {
            var beatType:Int = readUnsignedByte();
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
        var stringFlags:Int = readUnsignedByte();
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
		var flags:Int = readUnsignedByte();
        var note:Note = factory.newNote();
        note.string = (guitarString.number);
        note.effect = (effect);
        note.effect.accentuatedNote = (((flags & 0x40) != 0));
        note.effect.heavyAccentuatedNote = (((flags & 0x02) != 0));
        note.effect.ghostNote = (((flags & 0x04) != 0));
        if ((flags & 0x20) != 0) {
            var noteType = readUnsignedByte();
            note.isTiedNote = ((noteType == 0x02));
            note.effect.deadNote = ((noteType == 0x03));
        }
        if ((flags & 0x01) != 0) {
            note.duration = readByte();
            note.tuplet = readByte();
        }
        if ((flags & 0x10) != 0) {
            note.velocity = ((Velocities.MIN_VELOCITY + (Velocities.VELOCITY_INCREMENT * readByte())) -
            Velocities.VELOCITY_INCREMENT);
        }
        if ((flags & 0x20) != 0) {
            var fret = readByte();
            var value = (note.isTiedNote ? getTiedNoteValue(guitarString.number, track) : fret);
            note.value = (value >= 0 && value < 100 ? value : 0);
        }
        if ((flags & 0x80) != 0) {
            note.effect.leftHandFinger = readByte();
            note.effect.rightHandFinger = readByte();
            note.effect.isFingering = true;
        }
        if ((flags & 0x08) != 0) {
            readNoteEffects(note.effect);
        }
        return note;
	}
	
	private function readNoteEffects(noteEffect:NoteEffect) : Void
	{
		var flags1:Int = readUnsignedByte();
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
		var fret:Int = readUnsignedByte();
        var dyn:Int = readUnsignedByte();
        var transition:Int = readByte();
        var duration:Int = readUnsignedByte();
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
        bendEffect.type = BendTypesConverter.fromInt(readByte());
        bendEffect.value = readInt();
        var pointCount = readInt();
        for (i in 0 ... pointCount) {
            var pointPosition = Math.round(readInt() * BendEffect.MAX_POSITION / GpReaderBase.BEND_POSITION);
            var pointValue = Math.round(readInt() * BendEffect.SEMITONE_LENGTH / GpReaderBase.BEND_SEMITONE);
            var vibrato = readBool();
            bendEffect.points.push(new BendPoint(pointPosition, pointValue, vibrato));
        } 
        
        if (pointCount > 0) 
            noteEffect.bend = bendEffect;
	}
	
	private function readMixTableChange(measure:Measure) : MixTableChange
	{
		var tableChange:MixTableChange = factory.newMixTableChange();
        tableChange.instrument.value = readByte();
        tableChange.volume.value = readByte();
        tableChange.balance.value = readByte();
        tableChange.chorus.value = readByte();
        tableChange.reverb.value = readByte();
        tableChange.phaser.value = readByte();
        tableChange.tremolo.value = readByte();
        tableChange.tempoName = readIntSizeCheckByteString();
        tableChange.tempo.value = readInt();
        
        if (tableChange.instrument.value < 0) 
            tableChange.instrument = null;
        
        if (tableChange.volume.value >= 0) 
            tableChange.volume.duration = readByte();
        else 
            tableChange.volume = null;
        if (tableChange.balance.value >= 0) 
            tableChange.balance.duration = readByte();
        else 
            tableChange.balance = null;
        if (tableChange.chorus.value >= 0) 
            tableChange.chorus.duration = readByte();
        else 
            tableChange.chorus = null;
        if (tableChange.reverb.value >= 0) 
            tableChange.reverb.duration = readByte();
        else 
            tableChange.reverb = null;
        if (tableChange.phaser.value >= 0) 
            tableChange.phaser.duration = readByte();
        else 
            tableChange.phaser = null;
        if (tableChange.tremolo.value >= 0) 
            tableChange.tremolo.duration = readByte();
        else 
            tableChange.tremolo = null;
        if (tableChange.tempo.value >= 0) {
            tableChange.tempo.duration = readByte();
			measure.tempo().value = tableChange.tempo.value;
            tableChange.hideTempo = false;
        }
        else 
            tableChange.tempo = null;
        
        
        var allTracksFlags:Int = readUnsignedByte();
        if (tableChange.volume != null) 
            tableChange.volume.allTracks = (allTracksFlags & 0x01) != 0;
        if (tableChange.balance != null) 
            tableChange.balance.allTracks = (allTracksFlags & 0x02) != 0;
        if (tableChange.chorus != null) 
            tableChange.chorus.allTracks = (allTracksFlags & 0x04) != 0;
        if (tableChange.reverb != null) 
            tableChange.reverb.allTracks = (allTracksFlags & 0x08) != 0;
        if (tableChange.phaser != null) 
            tableChange.phaser.allTracks = (allTracksFlags & 0x10) != 0;
        if (tableChange.tremolo != null) 
            tableChange.tremolo.allTracks = (allTracksFlags & 0x20) != 0;
        if (tableChange.tempo != null) 
            tableChange.tempo.allTracks = true;

		return tableChange;
	}
	
	private function readBeatEffects(beat:Beat, effect:NoteEffect)  : Void
	{
		var flags1:Int = readUnsignedByte();
        beat.effect.fadeIn = (((flags1 & 0x10) != 0));
        beat.effect.vibrato = (((flags1 & 0x02) != 0)) || beat.effect.vibrato;
        
		if ((flags1 & 0x20) != 0) {
            var slapEffect:Int = readUnsignedByte();
			if (slapEffect == 0) {
				readTremoloBar(beat.effect);
			}
			else {
				beat.effect.tapping = (slapEffect == 1);
				beat.effect.slapping = (slapEffect == 2);
				beat.effect.popping = (slapEffect == 3);
				readInt();
			}
        }
        if ((flags1 & 0x40) != 0) {
            var strokeUp:Int = readByte();
            var strokeDown:Int = readByte();
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
		var barEffect:TremoloBarEffect = factory.newTremoloBarEffect();
        barEffect.type = BendTypesConverter.fromInt(readByte());
        barEffect.value = readInt();
		
        barEffect.points.push(new BendPoint(0, 0, false));
        barEffect.points.push(new BendPoint(Math.round(TremoloBarEffect.MAX_POSITION/2.0), Math.round(barEffect.value / (GpReaderBase.BEND_SEMITONE * 2)), false));
        barEffect.points.push(new BendPoint(TremoloBarEffect.MAX_POSITION, 0, false));
		
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
        if ((readUnsignedByte() & 0x01) == 0) {
            chord.name = (readIntSizeCheckByteString());
            chord.firstFret = (readInt());
            if (chord.firstFret != 0) {
                for (i in 0 ... 6) {
                    var fret = readInt();
                    if (i < chord.strings.length) {
                        chord.strings[i] = fret;
                    }
                }
            }
        }
        else {
            skip(25);
            chord.name = (readByteSizeString(34));
            chord.firstFret = (readInt());
            for (i in 0 ... 6) {
                var fret = readInt();
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
		
        duration.value = Math.round(Math.pow(2, (readByte() + 4)) / 4);
        duration.isDotted = (((flags & 0x01) != 0));
        if ((flags & 0x20) != 0) {
            var iTuplet = readInt();
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
		var flags:Int = readUnsignedByte();
        var track:Track = factory.newTrack();
		
        track.isPercussionTrack = (flags & 0x1) != 0;
        track.is12StringedGuitarTrack = (flags & 0x02) != 0;
        track.isBanjoTrack = (flags & 0x04) != 0;
        track.number = number;
        track.name = readByteSizeString(40);
        
        var stringCount = readInt();
        for (i in 0 ... 7) 
		{
            var iTuning:Int = readInt();
            if (stringCount > i) {
                var oString:GuitarString = factory.newString();
                oString.number = (i + 1);
                oString.value = (iTuning);
                track.strings.push(oString);
            }
        }
        
        track.port = readInt();
        readChannel(track.channel, channels);
        track.fretCount = readInt();
        track.offset = readInt();
        track.color = readColor();
        
        return track;
	}
	
	private function readChannel(midiChannel:MidiChannel, channels:Array<MidiChannel>) : Void
	{
		var index:Int = (readInt() - 1);
        var effectChannel:Int = (readInt() - 1);
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
       
        var flags:Int = readUnsignedByte();
        
        var header:MeasureHeader = factory.newMeasureHeader();
        header.number = i + 1;
        header.start = 0;
        header.tempo.value = song.tempo;
		header.tripletFeel = _tripletFeel;
        
        if ((flags & 0x01) != 0) 
            timeSignature.numerator = readByte();
        if ((flags & 0x02) != 0) 
            timeSignature.denominator.value = readByte();
        
        header.isRepeatOpen = ((flags & 0x04) != 0);
        
        timeSignature.copy(header.timeSignature);
        
        if ((flags & 0x08) != 0) 
            header.repeatClose = (readByte() - 1);
		
		if ((flags & 0x10) != 0) 
            header.repeatAlternative = parseRepeatAlternative(song, header.number, readUnsignedByte());
			
        if ((flags & 0x20) != 0) 
            header.marker = readMarker(header);
                
        if ((flags & 0x40) != 0) {
            header.keySignatureType = toKeySignature(readByte());
            header.keySignatureType = readByte();
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
		var r:Int = (readUnsignedByte());
        var g:Int = readUnsignedByte();
        var b:Int = (readUnsignedByte());
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
            newChannel.instrument(readInt());
            newChannel.volume = (GpReaderBase.toChannelShort(readByte()));
            newChannel.balance = (GpReaderBase.toChannelShort(readByte()));
            newChannel.chorus = (GpReaderBase.toChannelShort(readByte()));
            newChannel.reverb = (GpReaderBase.toChannelShort(readByte()));
            newChannel.phaser = (GpReaderBase.toChannelShort(readByte()));
            newChannel.tremolo = (GpReaderBase.toChannelShort(readByte()));
            channels.push(newChannel);
            // Backward compatibility with version 3.0
            skip(2);
        }
        return channels;
	}
	
	private function readPageSetup(song:Song) : Void
	{
		var setup:PageSetup = PageSetup.defaults();
        song.pageSetup = setup;
	}
	
	private function readLyrics(song:Song) : Void
	{
		song.lyrics = factory.newLyrics();
        song.lyrics.trackChoice = readInt();
        for (i in 0 ... Lyrics.MAX_LINE_COUNT) 
		{
            var line:LyricLine = factory.newLyricLine();			
            line.startingMeasure = readInt();
            line.lyrics = readIntSizeString(); 
            song.lyrics.lines.push(line);
        }
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
        
        var iNotes = readInt();
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