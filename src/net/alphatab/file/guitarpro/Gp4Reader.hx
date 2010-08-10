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
import net.alphatab.model.SongManager;

/**
 * A reader for GuitarPro 4 files. 
 */
class Gp4Reader extends Gp3Reader
{
	public function new() 
	{
		super();
		initVersions(["FICHIER GUITAR PRO v4.00", "FICHIER GUITAR PRO v4.06", "FICHIER GUITAR PRO L4.06"]);
	}
	
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
        song.octave = readByte();
        
        var channels:Array<MidiChannel> = readMidiChannels();
        
        var measureCount = readInt();
        var trackCount = readInt();
        
        readMeasureHeaders(song, measureCount);
        readTracks(song, trackCount, channels);
        readMeasures(song);
        
        return song;
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
                var guitarString = track.strings[6 - i].clone(factory);
                var note = readNote(guitarString, track, factory.newNoteEffect());
                voice.addNote(note);
            }
            duration.copy(voice.duration);
		}
        
        return (!voice.isEmpty) ? duration.time() : 0;
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
	
	private function readTrill(noteEffect:NoteEffect) : Void
	{
		var fret:Int = readByte();
        var period:Int = readByte();
        var trill:TrillEffect = factory.newTrillEffect();
        trill.fret = (fret);
        switch (period) {
            case 1:
                trill.duration.value = Duration.SIXTEENTH;
                noteEffect.trill = (trill);
            case 2:
                trill.duration.value = (Duration.THIRTY_SECOND);
                noteEffect.trill = (trill);
            case 3:
                trill.duration.value = (Duration.SIXTY_FOURTH);
                noteEffect.trill = (trill);
        }
	}
	
	private function readArtificialHarmonic(noteEffect:NoteEffect) : Void
	{
		var type:Int = readByte();
        var oHarmonic:HarmonicEffect = factory.newHarmonicEffect();
        oHarmonic.data = 0;
        switch (type) {
            case 1:
                oHarmonic.type = (HarmonicType.Natural);
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
			case 15:
                oHarmonic.data = 2;
                oHarmonic.type = (HarmonicType.Artificial);
                noteEffect.harmonic = (oHarmonic);
			case 17:
                oHarmonic.data = 3;
                oHarmonic.type = (HarmonicType.Artificial);
                noteEffect.harmonic = (oHarmonic);
			case 22:
                oHarmonic.data = 0;
                oHarmonic.type = (HarmonicType.Artificial);
                noteEffect.harmonic = (oHarmonic);
        }
	}
	
	private function readTremoloPicking(noteEffect:NoteEffect) : Void
	{
		var value:Int = readUnsignedByte();
        var tp:TremoloPickingEffect = factory.newTremoloPickingEffect();
        switch (value) {
            case 1:
                tp.duration.value = (Duration.EIGHTH);
                noteEffect.tremoloPicking = (tp);
            case 2:
                tp.duration.value = (Duration.SIXTEENTH);
                noteEffect.tremoloPicking = (tp);
            case 3:
                tp.duration.value = (Duration.THIRTY_SECOND);
                noteEffect.tremoloPicking = (tp);
        }
	}
	
	override private function readMixTableChange(measure:Measure) : MixTableChange
	{
		var tableChange:MixTableChange = factory.newMixTableChange();
        tableChange.instrument.value = readByte();
        tableChange.volume.value = readByte();
        tableChange.balance.value = readByte();
        tableChange.chorus.value = readByte();
        tableChange.reverb.value = readByte();
        tableChange.phaser.value = readByte();
        tableChange.tremolo.value = readByte();
        tableChange.tempoName = "";
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
	
	override private function readBeatEffects(beat:Beat, effect:NoteEffect)  : Void
	{
		var flags1:Int = readUnsignedByte();
        var flags2:Int = readUnsignedByte();
        beat.effect.fadeIn = (((flags1 & 0x10) != 0));
        beat.effect.vibrato = (((flags1 & 0x02) != 0)) || beat.effect.vibrato;
        if ((flags1 & 0x20) != 0) {
            var slapEffect:Int = readUnsignedByte();
            beat.effect.tapping = (slapEffect == 1);
            beat.effect.slapping = (slapEffect == 2);
            beat.effect.popping = (slapEffect == 3);
        }
        if ((flags2 & 0x04) != 0) {
            readTremoloBar(beat.effect);
        }
        if ((flags1 & 0x40) != 0) {
            var strokeUp:Int = readByte();
            var strokeDown:Int = readByte();
            if (strokeUp > 0) {
                beat.effect.stroke.direction = BeatStrokeDirection.Up;
                beat.effect.stroke.value = (Gp3Reader.toStrokeValue(strokeUp));
            } 
            else 
                if (strokeDown > 0) {
                    beat.effect.stroke.direction = BeatStrokeDirection.Down;
                    beat.effect.stroke.value = (Gp3Reader.toStrokeValue(strokeDown));
                }
        }
        beat.effect.hasRasgueado = (flags2 & 0x1) != 0;
        if ((flags2 & 0x02) != 0) {
            beat.effect.pickStroke = readByte();
            beat.effect.hasPickStroke = true;
        }
	}
	
	override private function readTremoloBar(effect:BeatEffect) : Void 
	{
		var barEffect:TremoloBarEffect = factory.newTremoloBarEffect();
        barEffect.type = BendTypesConverter.fromInt(readByte());
        barEffect.value = readInt();
        var pointCount = readInt();
        for (i in 0 ... pointCount) {
            var pointPosition = Math.round(readInt() * TremoloBarEffect.MAX_POSITION / GpReaderBase.BEND_POSITION);
            var pointValue = Math.round(readInt() / (GpReaderBase.BEND_SEMITONE * 2.0));
            var vibrato = readBool();
            barEffect.points.push(new BendPoint(pointPosition, pointValue, vibrato));
        }
        
        if (pointCount > 0) 
            effect.tremoloBar = barEffect;
	}
	
	
	
	override private function readChord(stringCount:Int, beat:Beat)
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
            skip(16);
            chord.name = (readByteSizeString(21));
            skip(4);
            chord.firstFret = (readInt());
            for (i in 0 ... 7) {
                var fret = readInt();
                if (i < chord.strings.length) {
                    chord.strings[i] = fret;
                }
            }
            skip(32);
        }
        if (chord.noteCount() > 0) {
			beat.setChord(chord);
        }
	}
}