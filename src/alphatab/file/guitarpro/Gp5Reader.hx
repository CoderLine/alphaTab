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
import alphatab.model.Padding;

/**
 * A reader for GuitarPro 5 files. 
 */
// TODO: There must be a wah wah flag somewhere. 
class Gp5Reader extends Gp4Reader
{
	public function new() 
	{
		super();
		initVersions(["FICHIER GUITAR PRO v5.00", "FICHIER GUITAR PRO v5.10"]);
	}
	
	public override function readSong() : Song
	{
		if (!readVersion())
		{
			throw new FileFormatException("Unsupported Version");
		}

		var song:Song = factory.newSong();
        
        readInfo(song);
        
        readLyrics(song);
        
        readPageSetup(song);
        
        song.tempoName = readIntSizeCheckByteString();
        song.tempo = readInt();
        
        if (_versionIndex > 0) 
            song.hideTempo = readBool();
        
        song.key = readByte();
        song.octave = readInt();
        
        var channels:Array<MidiChannel> = readMidiChannels();
        
        skip(42); // rse info?
        var measureCount:Int = readInt();
        var trackCount:Int = readInt();
        
        readMeasureHeaders(song, measureCount);
        readTracks(song, trackCount, channels);
        readMeasures(song);
        
        return song;
	}
	    
	override private function readMeasure(measure:Measure, track:Track): Void
	{
		for (voice in 0 ... Beat.MAX_VOICES) {
            var start:Int = measure.start();
            var beats:Int = readInt();
            for (beat in 0 ... beats) { 
                start += readBeat(start, measure, track, voice);
			}
        }
        skip(1);
	}
	
	override private function readBeat(start:Int, measure:Measure, track:Track, voiceIndex:Int) : Int
	{
		var flags:Int = readUnsignedByte();
        
        var beat:Beat = getBeat(measure, start);
        var voice:Voice = beat.voices[voiceIndex];
		
        if ((flags & 0x40) != 0) {
            var beatType:Int = readUnsignedByte();
            voice.isEmpty = ((beatType & 0x02) == 0);
        }
		
        var duration:Duration = readDuration(flags);
        if ((flags & 0x02) != 0) {
            readChord(track.stringCount(), beat);
        }
        if ((flags & 0x04) != 0) {
            readText(beat);
        }
        if ((flags & 0x08) != 0) {
            readBeatEffects(beat, null);
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
                var guitarString:GuitarString = track.strings[6 - i].clone(factory);
                var note:Note = readNote(guitarString, track, factory.newNoteEffect());
                voice.addNote(note);
            }
            duration.copy(voice.duration);
		}
        
        skip(1);
        
        var read:Int = readByte();
        if (read == 8 || read == 10) {
            skip(1);
        }
        
        return (!voice.isEmpty) ? duration.time() : 0;
	}
	
	override private function readNote(guitarString:GuitarString, track:Track, effect:NoteEffect) : Note
	{
		var flags:Int = readUnsignedByte();
        var note:Note = factory.newNote();
        note.string = (guitarString.number);
        note.effect.accentuatedNote = (((flags & 0x40) != 0));
        note.effect.heavyAccentuatedNote = (((flags & 0x02) != 0));
        note.effect.ghostNote = (((flags & 0x04) != 0));
        if ((flags & 0x20) != 0) {
            var noteType:Int = readUnsignedByte();
            note.isTiedNote = ((noteType == 0x02));
            note.effect.deadNote = ((noteType == 0x03));
        }
        if ((flags & 0x10) != 0) {
            note.velocity = ((Velocities.MIN_VELOCITY + (Velocities.VELOCITY_INCREMENT * readByte())) -
            Velocities.VELOCITY_INCREMENT);
        }
        if ((flags & 0x20) != 0) {
            var fret:Int = readByte();
            var value:Int = (note.isTiedNote ? getTiedNoteValue(guitarString.number, track) : fret);
            note.value = (value >= 0 && value < 100 ? value : 0);
        }
        if ((flags & 0x80) != 0) {
            note.effect.leftHandFinger = readByte();
            note.effect.rightHandFinger = readByte();
            note.effect.isFingering = true;
        }
        if ((flags & 0x01) != 0) {
            note.durationPercent = readDouble();
        }
        skip(1);
        if ((flags & 0x08) != 0) {
            readNoteEffects(note.effect);
        }
        return note;
	}
	
	override private function readNoteEffects(noteEffect:NoteEffect) : Void
	{
		var flags1:Int = readUnsignedByte();
        var flags2:Int = readUnsignedByte();
        if ((flags1 & 0x01) != 0) {
            readBend(noteEffect);
        }
        if ((flags1 & 0x10) != 0) {
            readGrace(noteEffect);
        }
        if ((flags2 & 0x04) != 0) {
            readTremoloPicking(noteEffect);
        }
        if ((flags2 & 0x08) != 0) {
            noteEffect.slide = (true);
            var type:Int = readByte();
            switch (type) {
                case 1:
                    noteEffect.slideType = SlideType.FastSlideTo;
                case 2:
                    noteEffect.slideType = SlideType.SlowSlideTo;
                case 4:
                    noteEffect.slideType = SlideType.OutDownWards;
                case 8:
                    noteEffect.slideType = SlideType.OutUpWards;
                case 16:
                    noteEffect.slideType = SlideType.IntoFromBelow;
                case 32:
                    noteEffect.slideType = SlideType.IntoFromAbove;
            }
        }
        if ((flags2 & 0x10) != 0) {
            readArtificialHarmonic(noteEffect);
        }
        if ((flags2 & 0x20) != 0) {
            readTrill(noteEffect);
        }
        noteEffect.letRing = (flags1 & 0x08) != 0;
        noteEffect.hammer = (((flags1 & 0x02) != 0));
        noteEffect.vibrato = (((flags2 & 0x40) != 0) || noteEffect.vibrato);
        noteEffect.palmMute = (((flags2 & 0x02) != 0));
        noteEffect.staccato = (((flags2 & 0x01) != 0));
	}
	
	
	override private function readArtificialHarmonic(noteEffect:NoteEffect) : Void
	{
		var type:Int = readByte();
        var oHarmonic:HarmonicEffect = factory.newHarmonicEffect();
        oHarmonic.data = 0;
        switch (type) {
            case 1:
                oHarmonic.type = (HarmonicType.Natural);
                noteEffect.harmonic = (oHarmonic);
            case 2:
                skip(3); // Note?
                oHarmonic.type = (HarmonicType.Artificial);
                noteEffect.harmonic = (oHarmonic);
            case 3:
                skip(1); // Key?
                oHarmonic.type = (HarmonicType.Tapped);
                noteEffect.harmonic = (oHarmonic);
            case 4:
                oHarmonic.type = (HarmonicType.Pinch);
                noteEffect.harmonic = (oHarmonic);
            case 5:
                oHarmonic.type = (HarmonicType.Semi);
                noteEffect.harmonic = (oHarmonic);
        }
	}

	override private function readGrace(noteEffect:NoteEffect) : Void
	{
		var fret:Int = readUnsignedByte();
        var dyn:Int = readUnsignedByte();
        var transition:Int = readByte();
        var duration:Int = readUnsignedByte();
        var flags:Int = readUnsignedByte();
        var grace:GraceEffect = factory.newGraceEffect();
		
        grace.fret = (fret);
        grace.velocity = ((Velocities.MIN_VELOCITY + (Velocities.VELOCITY_INCREMENT * dyn)) -
        Velocities.VELOCITY_INCREMENT);
        grace.duration = (duration);
        grace.isDead = ((flags & 0x01) != 0);
        grace.isOnBeat = ((flags & 0x02) != 0);
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
	
	override private function readMixTableChange(measure:Measure) : MixTableChange
	{
		var tableChange:MixTableChange = factory.newMixTableChange();
        tableChange.instrument.value = readByte();
        skip(16); // Rse Info 
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
            tableChange.hideTempo = _versionIndex > 0 && readBool();
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
        skip(1);
        if (_versionIndex > 0) {
            readIntSizeCheckByteString();
            readIntSizeCheckByteString();
        }
        return tableChange;
	}

	
	override private function readChord(stringCount:Int, beat:Beat)
	{
		var chord:Chord = factory.newChord(stringCount);
        skip(17);
        chord.name = (readByteSizeString(21));
        skip(4);
        chord.firstFret = readInt();
        for (i in 0 ... 7) {
            var fret:Int = readInt();
            if (i < chord.strings.length) {
                chord.strings[i] = fret;
            }
        }
        skip(32);
        if (chord.noteCount() > 0) {
            beat.setChord(chord);
        }
	}
	
	override private function readTracks(song:Song, trackCount:Int, channels:Array<MidiChannel>) : Void
	{
		for (i in 1 ... trackCount + 1) {
            song.addTrack(readTrack(i, channels));
        }
        skip((_versionIndex == 0 ? 2 : 1));
	}
	
	override private function readTrack(number:Int, channels:Array<MidiChannel>) : Track
	{
		var flags:Int = readUnsignedByte();
        
        if (number == 1 || _versionIndex == 0) 
            skip(1);
        var track:Track = factory.newTrack();
		
        track.isPercussionTrack = (flags & 0x1) != 0;
        track.is12StringedGuitarTrack = (flags & 0x02) != 0;
        track.isBanjoTrack = (flags & 0x04) != 0;
        track.number = number;
        track.name = readByteSizeString(40);
        
        var stringCount:Int = readInt();
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
        if(track.channel.channel == 9)
        {
            track.isPercussionTrack = true;
        }
        track.fretCount = readInt();
        track.offset = readInt();
        track.color = readColor();
        
        skip((_versionIndex > 0) ? 49 : 44);
        if (_versionIndex > 0) {
            readIntSizeCheckByteString();
            readIntSizeCheckByteString();
        }
        return track;
	}
	
	override private function readMeasureHeader(i:Int, timeSignature:TimeSignature, song:Song) : MeasureHeader
	{
		if (i > 0) 
            skip(1);
        
        var flags:Int = readUnsignedByte();
        
        var header:MeasureHeader = factory.newMeasureHeader();
        header.number = i + 1;
        header.start = 0;
        header.tempo.value = song.tempo;
        
        if ((flags & 0x01) != 0) 
            timeSignature.numerator = readByte();
        if ((flags & 0x02) != 0) 
            timeSignature.denominator.value = readByte();
        
        header.isRepeatOpen = ((flags & 0x04) != 0);
        
        timeSignature.copy(header.timeSignature);
        
        if ((flags & 0x08) != 0) 
            header.repeatClose = (readByte() - 1);
        
        if ((flags & 0x20) != 0) 
            header.marker = readMarker(header);
        
        if ((flags & 0x10) != 0) 
            header.repeatAlternative = readUnsignedByte();
        
        if ((flags & 0x40) != 0) {
            header.keySignature = Gp3Reader.toKeySignature(readByte());
            header.keySignatureType = readByte();
        }
		else if(header.number > 1) {
			header.keySignature = song.measureHeaders[i-1].keySignature;
			header.keySignatureType = song.measureHeaders[i-1].keySignatureType;
		}
        header.hasDoubleBar = (flags & 0x80) != 0;
        if ((flags & 0x01) != 0) 
            skip(4);
        if ((flags & 0x10) == 0) 
            skip(1);
        var tripletFeel:Int = readByte();
        switch (tripletFeel) {
            case 1:
                header.tripletFeel = TripletFeel.Eighth;
            case 2:
                header.tripletFeel = TripletFeel.Sixteenth;
            default:
                header.tripletFeel = TripletFeel.None;
        }
        return header;
	}
	
	
	override private function readPageSetup(song:Song) : Void
	{
		var setup:PageSetup = factory.newPageSetup();
        if (_versionIndex > 0) 
            skip(19);
        setup.pageSize = new Point(readInt(), readInt());
        
        var l:Int = readInt();
        var r:Int = readInt();
        var t:Int = readInt();
        var b:Int = readInt(); 
        setup.pageMargin = new Padding(l, t, r, b);
        setup.scoreSizeProportion = readInt() / 100.0;
        
        setup.headerAndFooter = readByte();
        
        var flags2:Int = readUnsignedByte();
        if ((flags2 & 0x01) != 0) 
            setup.headerAndFooter |= HeaderFooterElements.PAGE_NUMBER;
        
        setup.title = readIntSizeCheckByteString();
        setup.subtitle = readIntSizeCheckByteString();
        setup.artist = readIntSizeCheckByteString();
        setup.album = readIntSizeCheckByteString();
        setup.words = readIntSizeCheckByteString();
        setup.music = readIntSizeCheckByteString();
        setup.wordsAndMusic = readIntSizeCheckByteString();
        setup.copyright = readIntSizeCheckByteString() + "\n" + readIntSizeCheckByteString();
        setup.pageNumber = readIntSizeCheckByteString();
        song.pageSetup = setup;
	}
	
	override private function readInfo(song:Song) {
		song.title = (readIntSizeCheckByteString());
        song.subtitle = readIntSizeCheckByteString();
        song.artist = (readIntSizeCheckByteString());
        song.album = (readIntSizeCheckByteString());
        song.words = (readIntSizeCheckByteString());
        song.music = readIntSizeCheckByteString();
        song.copyright = readIntSizeCheckByteString();
        song.tab = readIntSizeCheckByteString();
        song.instructions = readIntSizeCheckByteString();
        
        var iNotes:Int = readInt();
        song.notice = "";
        for (i in 0 ... iNotes) {
            song.notice += readIntSizeCheckByteString() + "\n";
        }
	}
}