/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.file.guitarpro;
import net.alphatab.file.FileFormatException;
import net.alphatab.model.effects.GsBendEffect;
import net.alphatab.model.effects.GsBendPoint;
import net.alphatab.model.effects.GsBendTypesConverter;
import net.alphatab.model.effects.GsGraceEffect;
import net.alphatab.model.effects.GsGraceEffectTransition;
import net.alphatab.model.effects.GsHarmonicEffect;
import net.alphatab.model.effects.GsHarmonicType;
import net.alphatab.model.effects.GsTremoloBarEffect;
import net.alphatab.model.effects.GsTremoloBarPoint;
import net.alphatab.model.effects.GsTremoloPickingEffect;
import net.alphatab.model.effects.GsTrillEffect;
import net.alphatab.model.GsBeat;
import net.alphatab.model.GsBeatEffect;
import net.alphatab.model.GsBeatStrokeDirection;
import net.alphatab.model.GsBeatText;
import net.alphatab.model.GsChord;
import net.alphatab.model.GsColor;
import net.alphatab.model.GsDuration;
import net.alphatab.model.GsGuitarString;
import net.alphatab.model.GsHeaderFooterElements;
import net.alphatab.model.GsLyricLine;
import net.alphatab.model.GsLyrics;
import net.alphatab.model.GsMarker;
import net.alphatab.model.GsMeasure;
import net.alphatab.model.GsMeasureHeader;
import net.alphatab.model.GsMidiChannel;
import net.alphatab.model.GsMixTableChange;
import net.alphatab.model.GsNote;
import net.alphatab.model.GsNoteEffect;
import net.alphatab.model.GsPageSetup;
import net.alphatab.model.GsSlideType;
import net.alphatab.model.GsSong;
import net.alphatab.model.GsSongFactory;
import net.alphatab.model.GsTempo;
import net.alphatab.model.GsTimeSignature;
import net.alphatab.model.GsTrack;
import net.alphatab.model.GsTriplet;
import net.alphatab.model.GsTripletFeel;
import net.alphatab.model.GsVelocities;
import net.alphatab.model.GsVoice;
import net.alphatab.model.Point;
import net.alphatab.model.Rectangle;

class Gp5Reader extends GpReaderBase
{

	public function new() 
	{
		super(["FICHIER GUITAR PRO v5.00", "FICHIER GUITAR PRO v5.10"]);
	}
	
	public override function ReadSong() : GsSong
	{
		if (!ReadVersion())
		{
			throw new FileFormatException("Unsupported Version");
		}

		var song:GsSong = Factory.NewSong();
        
        this.ReadInfo(song);
        
        this.ReadLyrics(song);
        
        this.ReadPageSetup(song);
        
        song.TempoName = ReadIntSizeCheckByteString();
        song.Tempo = ReadInt();
        
        if (this.VersionIndex > 0) 
            song.HideTempo = ReadBool();
        
        song.Key = ReadByte();
        song.Octave = ReadInt();
        
        var channels:Array<GsMidiChannel> = ReadMidiChannels();
        
        Skip(42); // rse info?
        var measureCount:Int = ReadInt();
        var trackCount:Int = ReadInt();
        
        this.ReadMeasureHeaders(song, measureCount);
        this.ReadTracks(song, trackCount, channels);
        this.ReadMeasures(song);
        
        return song;
	}
	
	private function ReadMeasures(song:GsSong) : Void
	{
		var tempo:GsTempo = Factory.NewTempo();
        tempo.Value = song.Tempo;
        var start:Int = GsDuration.QuarterTime;
		for(h in 0 ... song.MeasureHeaders.length) {
			var header:GsMeasureHeader = song.MeasureHeaders[h];
            header.Start = start;
			for(t in 0 ... song.Tracks.length) {
				var track:GsTrack = song.Tracks[t];
                var measure:GsMeasure = Factory.NewMeasure(header);
				header.Tempo.Copy(tempo);
                track.AddMeasure(measure);
                this.ReadMeasure(measure, track);
            }
            tempo.Copy(header.Tempo);
            start += header.Length();
        }
	}
	
	private function ReadMeasure(measure:GsMeasure, track:GsTrack): Void
	{
		for (voice in 0 ... GsBeat.MaxVoices) {
            var start:Int = measure.Start();
            var beats:Int = ReadInt();
            for (beat in 0 ... beats) { 
                start += this.ReadBeat(start, measure, track, voice);
			}
        }
        Skip(1);
	}
	
	private function ReadBeat(start:Int, measure:GsMeasure, track:GsTrack, voiceIndex:Int) : Int
	{
		var flags:Int = ReadUnsignedByte();
        
        var beat:GsBeat = GetBeat(measure, start);
        var voice:GsVoice = beat.Voices[voiceIndex];
        if ((flags & 0x40) != 0) {
            var beatType:Int = ReadUnsignedByte();
            voice.IsEmpty = ((beatType & 0x02) == 0);
        }
        var duration:GsDuration = this.ReadDuration(flags);
        if ((flags & 0x02) != 0) {
            this.ReadChord(track.StringCount(), beat);
        }
        if ((flags & 0x04) != 0) {
            this.ReadText(beat);
        }
        if ((flags & 0x08) != 0) {
            this.ReadBeatEffects(beat);
        }
        if ((flags & 0x10) != 0) {
            var mixTableChange:GsMixTableChange = this.ReadMixTableChange(measure);
            beat.Effect.MixTableChange = mixTableChange;
        }
        var stringFlags:Int = ReadUnsignedByte();
		for (j in 0 ... 7)
		{
			var i:Int = 6 - j;
			if ((stringFlags & (1 << i)) != 0 && (6 - i) < track.StringCount()) {
                var guitarString:GsGuitarString = track.Strings[6 - i].Clone(Factory);
                var note:GsNote = this.ReadNote(guitarString, track);
                voice.AddNote(note);
            }
            duration.Copy(voice.Duration);
		}
        
        Skip(1);
        
        var read:Int = ReadByte();
        if (read == 8 || read == 10) {
            Skip(1);
        }
        
        return (!voice.IsEmpty) ? duration.Time() : 0;
	}
	
	private function ReadNote(guitarString:GsGuitarString, track:GsTrack) : GsNote
	{
		var flags:Int = ReadUnsignedByte();
        var note:GsNote = Factory.NewNote();
        note.String = (guitarString.Number);
        note.Effect.AccentuatedNote = (((flags & 0x40) != 0));
        note.Effect.HeavyAccentuatedNote = (((flags & 0x02) != 0));
        note.Effect.GhostNote = (((flags & 0x04) != 0));
        if ((flags & 0x20) != 0) {
            var noteType:Int = ReadUnsignedByte();
            note.IsTiedNote = ((noteType == 0x02));
            note.Effect.DeadNote = ((noteType == 0x03));
        }
        if ((flags & 0x10) != 0) {
            note.Velocity = ((GsVelocities.MinVelocity + (GsVelocities.VelocityIncrement * ReadByte())) -
            GsVelocities.VelocityIncrement);
        }
        if ((flags & 0x20) != 0) {
            var fret:Int = ReadByte();
            var value:Int = (note.IsTiedNote ? GetTiedNoteValue(guitarString.Number, track) : fret);
            note.Value = (value >= 0 && value < 100 ? value : 0);
        }
        if ((flags & 0x80) != 0) {
            note.LeftHandFinger = ReadByte();
            note.RightHandFinger = ReadByte();
            note.IsFingering = true;
        }
        if ((flags & 0x01) != 0) {
            note.DurationPercent = ReadDouble();
        }
        Skip(1);
        if ((flags & 0x08) != 0) {
            this.ReadNoteEffects(note.Effect);
        }
        return note;
	}
	
	private function ReadNoteEffects(noteEffect:GsNoteEffect) : Void
	{
		var flags1:Int = ReadUnsignedByte();
        var flags2:Int = ReadUnsignedByte();
        if ((flags1 & 0x01) != 0) {
            this.ReadBend(noteEffect);
        }
        if ((flags1 & 0x10) != 0) {
            this.ReadGrace(noteEffect);
        }
        if ((flags2 & 0x04) != 0) {
            this.ReadTremoloPicking(noteEffect);
        }
        if ((flags2 & 0x08) != 0) {
            noteEffect.Slide = (true);
            var type:Int = ReadByte();
            switch (type) {
                case 1:
                    noteEffect.SlideType = GsSlideType.FastSlideTo;
                case 2:
                    noteEffect.SlideType = GsSlideType.SlowSlideTo;
                case 4:
                    noteEffect.SlideType = GsSlideType.OutDownWards;
                case 8:
                    noteEffect.SlideType = GsSlideType.OutUpWards;
                case 16:
                    noteEffect.SlideType = GsSlideType.IntoFromBelow;
                case 32:
                    noteEffect.SlideType = GsSlideType.IntoFromAbove;
            }
        }
        if ((flags2 & 0x10) != 0) {
            this.ReadArtificialHarmonic(noteEffect);
        }
        if ((flags2 & 0x20) != 0) {
            this.ReadTrill(noteEffect);
        }
        noteEffect.LetRing = (flags1 & 0x08) != 0;
        noteEffect.Hammer = (((flags1 & 0x02) != 0));
        noteEffect.Vibrato = (((flags2 & 0x40) != 0) || noteEffect.Vibrato);
        noteEffect.PalmMute = (((flags2 & 0x02) != 0));
        noteEffect.Staccato = (((flags2 & 0x01) != 0));
	}
	
	private function ReadTrill(noteEffect:GsNoteEffect) : Void
	{
		var fret:Int = ReadByte();
        var period:Int = ReadByte();
        var trill:GsTrillEffect = Factory.NewTrillEffect();
        trill.Fret = (fret);
        switch (period) {
            case 1:
                trill.Duration.Value = GsDuration.Sixteenth;
                noteEffect.Trill = (trill);
            case 2:
                trill.Duration.Value = (GsDuration.ThirtySecond);
                noteEffect.Trill = (trill);
            case 3:
                trill.Duration.Value = (GsDuration.SixtyFourth);
                noteEffect.Trill = (trill);
        }
	}
	
	private function ReadArtificialHarmonic(noteEffect:GsNoteEffect) : Void
	{
		var type:Int = ReadByte();
        var oHarmonic:GsHarmonicEffect = Factory.NewHarmonicEffect();
        oHarmonic.Data = 0;
        switch (type) {
            case 1:
                oHarmonic.Type = (GsHarmonicType.Natural);
                noteEffect.Harmonic = (oHarmonic);
            case 2:
                Skip(3); // Note?
                oHarmonic.Type = (GsHarmonicType.Artificial);
                noteEffect.Harmonic = (oHarmonic);
            case 3:
                Skip(1); // Key?
                oHarmonic.Type = (GsHarmonicType.Tapped);
                noteEffect.Harmonic = (oHarmonic);
            case 4:
                oHarmonic.Type = (GsHarmonicType.Pinch);
                noteEffect.Harmonic = (oHarmonic);
            case 5:
                oHarmonic.Type = (GsHarmonicType.Semi);
                noteEffect.Harmonic = (oHarmonic);
        }
	}
	
	private function ReadTremoloPicking(noteEffect:GsNoteEffect) : Void
	{
		var value:Int = ReadUnsignedByte();
        var tp:GsTremoloPickingEffect = Factory.NewTremoloPickingEffect();
        switch (value) {
            case 1:
                tp.Duration.Value = (GsDuration.Eighth);
                noteEffect.TremoloPicking = (tp);
            case 2:
                tp.Duration.Value = (GsDuration.Sixteenth);
                noteEffect.TremoloPicking = (tp);
            case 3:
                tp.Duration.Value = (GsDuration.ThirtySecond);
                noteEffect.TremoloPicking = (tp);
        }
	}
	
	private function ReadGrace(noteEffect:GsNoteEffect) : Void
	{
		var fret:Int = ReadUnsignedByte();
        var dyn:Int = ReadUnsignedByte();
        var transition:Int = ReadByte();
        var duration:Int = ReadUnsignedByte();
        var flags:Int = ReadUnsignedByte();
        var grace:GsGraceEffect = Factory.NewGraceEffect();
		
        grace.Fret = (fret);
        grace.Dynamic = ((GsVelocities.MinVelocity + (GsVelocities.VelocityIncrement * dyn)) -
        GsVelocities.VelocityIncrement);
        grace.Duration = (duration);
        grace.IsDead = ((flags & 0x01) != 0);
        grace.IsOnBeat = ((flags & 0x02) != 0);
        switch (transition) {
            case 0:
                grace.Transition = GsGraceEffectTransition.None;
            case 1:
                grace.Transition = GsGraceEffectTransition.Slide;
            case 2:
                grace.Transition = GsGraceEffectTransition.Bend;
            case 3:
                grace.Transition = GsGraceEffectTransition.Hammer;
        }
        noteEffect.Grace = (grace);
	}
	
	private function ReadBend(noteEffect:GsNoteEffect) : Void
	{
		var bendEffect:GsBendEffect = Factory.NewBendEffect();
        bendEffect.Type = GsBendTypesConverter.FromInt(ReadByte());
        bendEffect.Value = ReadInt();
        var pointCount:Int = ReadInt();
        for (i in 0 ... pointCount) {
            var pointPosition:Int = Math.round(ReadInt() * GsBendPoint.MaxPositionLength / GpReaderBase.BendPosition);
            var pointValue:Int = Math.round(ReadInt() * GsBendPoint.SemiToneLength / GpReaderBase.BendSemitone);
            var vibrato:Bool = ReadBool();
            bendEffect.Points.push(new GsBendPoint(pointPosition, pointValue, vibrato));
        } 
        
        if (pointCount > 0) 
            noteEffect.Bend = bendEffect;
	}
	
	private function GetTiedNoteValue(stringIndex:Int, track:GsTrack) : Int
	{
		var iMeasureCount:Int = track.MeasureCount();
        if (iMeasureCount > 0) {
			for (m2 in 0 ... iMeasureCount)
			{
				var m:Int = iMeasureCount - 1 - m2;
				var measure:GsMeasure = track.Measures[m];
				for (b2 in 0 ... measure.BeatCount())
				{
					var b:Int = measure.BeatCount() - 1 - b2;
					var beat:GsBeat = measure.Beats[b];
					
					for (v in 0 ... beat.Voices.length)
					{
						var oVoice:GsVoice = beat.Voices[v];
                        if (!oVoice.IsEmpty) {
                            for (n in 0 ... oVoice.Notes.length) {
                                var note:GsNote = oVoice.Notes[n];
                                if (note.String == stringIndex) {
                                    return note.Value;
                                }
                            }
                        }
					}
				}
			}
        }
        return -1;
	}
	
	private function ReadMixTableChange(measure:GsMeasure) : GsMixTableChange
	{
		var tableChange:GsMixTableChange = Factory.NewMixTableChange();
        tableChange.Instrument.Value = ReadByte();
        Skip(16); // Rse Info 
        tableChange.Volume.Value = ReadByte();
        tableChange.Balance.Value = ReadByte();
        tableChange.Chorus.Value = ReadByte();
        tableChange.Reverb.Value = ReadByte();
        tableChange.Phaser.Value = ReadByte();
        tableChange.Tremolo.Value = ReadByte();
        tableChange.TempoName = ReadIntSizeCheckByteString();
        tableChange.Tempo.Value = ReadInt();
        
        if (tableChange.Instrument.Value < 0) 
            tableChange.Instrument = null;
        
        if (tableChange.Volume.Value >= 0) 
            tableChange.Volume.Duration = ReadByte();
        else 
            tableChange.Volume = null;
        if (tableChange.Balance.Value >= 0) 
            tableChange.Balance.Duration = ReadByte();
        else 
            tableChange.Balance = null;
        if (tableChange.Chorus.Value >= 0) 
            tableChange.Chorus.Duration = ReadByte();
        else 
            tableChange.Chorus = null;
        if (tableChange.Reverb.Value >= 0) 
            tableChange.Reverb.Duration = ReadByte();
        else 
            tableChange.Reverb = null;
        if (tableChange.Phaser.Value >= 0) 
            tableChange.Phaser.Duration = ReadByte();
        else 
            tableChange.Phaser = null;
        if (tableChange.Tremolo.Value >= 0) 
            tableChange.Tremolo.Duration = ReadByte();
        else 
            tableChange.Tremolo = null;
        if (tableChange.Tempo.Value >= 0) {
            tableChange.Tempo.Duration = ReadByte();
			measure.GetTempo().Value = tableChange.Tempo.Value;
            tableChange.HideTempo = this.VersionIndex > 0 && ReadBool();
        }
        else 
            tableChange.Tempo = null;
        
        
        var allTracksFlags:Int = ReadUnsignedByte();
        if (tableChange.Volume != null) 
            tableChange.Volume.AllTracks = (allTracksFlags & 0x01) != 0;
        if (tableChange.Balance != null) 
            tableChange.Balance.AllTracks = (allTracksFlags & 0x02) != 0;
        if (tableChange.Chorus != null) 
            tableChange.Chorus.AllTracks = (allTracksFlags & 0x04) != 0;
        if (tableChange.Reverb != null) 
            tableChange.Reverb.AllTracks = (allTracksFlags & 0x08) != 0;
        if (tableChange.Phaser != null) 
            tableChange.Phaser.AllTracks = (allTracksFlags & 0x10) != 0;
        if (tableChange.Tremolo != null) 
            tableChange.Tremolo.AllTracks = (allTracksFlags & 0x20) != 0;
        if (tableChange.Tempo != null) 
            tableChange.Tempo.AllTracks = true;
        Skip(1);
        if (this.VersionIndex > 0) {
            ReadIntSizeCheckByteString();
            ReadIntSizeCheckByteString();
        }
        return tableChange;
	}
	
	private function ReadBeatEffects(beat:GsBeat)  : Void
	{
		var flags1:Int = ReadUnsignedByte();
        var flags2:Int = ReadUnsignedByte();
        beat.Effect.FadeIn = (((flags1 & 0x10) != 0));
        beat.Effect.Vibrato = (((flags1 & 0x02) != 0)) || beat.Effect.Vibrato;
        if ((flags1 & 0x20) != 0) {
            var slapEffect:Int = ReadUnsignedByte();
            beat.Effect.Tapping = (slapEffect == 1);
            beat.Effect.Slapping = (slapEffect == 2);
            beat.Effect.Popping = (slapEffect == 3);
        }
        if ((flags2 & 0x04) != 0) {
            ReadTremoloBar(beat.Effect);
        }
        if ((flags1 & 0x40) != 0) {
            var strokeUp:Int = ReadByte();
            var strokeDown:Int = ReadByte();
            if (strokeUp > 0) {
                beat.Effect.Stroke.Direction = GsBeatStrokeDirection.Up;
                beat.Effect.Stroke.Value = (ToStrokeValue(strokeUp));
            } 
            else 
                if (strokeDown > 0) {
                    beat.Effect.Stroke.Direction = GsBeatStrokeDirection.Down;
                    beat.Effect.Stroke.Value = (ToStrokeValue(strokeDown));
                }
        }
        beat.Effect.HasRasgueado = (flags2 & 0x1) != 0;
        if ((flags2 & 0x02) != 0) {
            beat.Effect.PickStroke = ReadByte();
            beat.Effect.HasPickStroke = true;
        }
	}
	
	private function ReadTremoloBar(effect:GsBeatEffect) : Void 
	{
		var barEffect:GsTremoloBarEffect = Factory.NewTremoloBarEffect();
        barEffect.Type = GsBendTypesConverter.FromInt(ReadByte());
        barEffect.Value = ReadInt();
        var pointCount:Int = ReadInt();
        for (i in 0 ... pointCount) {
            var pointPosition:Int = Math.round(ReadInt() * GsTremoloBarEffect.MaxPositionLength / GpReaderBase.BendPosition);
            var pointValue:Int = Math.round(ReadInt() / (GpReaderBase.BendSemitone * 2.0));
            var vibrato:Bool = ReadBool();
            barEffect.Points.push(new GsTremoloBarPoint(pointPosition, pointValue, vibrato));
        }
        
        if (pointCount > 0) 
            effect.TremoloBar = barEffect;
	}
	
	private function ToStrokeValue(value:Int) : Int
	{
		switch (value) {
            case 1:
                return GsDuration.SixtyFourth;
            case 2:
				return GsDuration.SixtyFourth;
            case 3:
                return GsDuration.ThirtySecond;
            case 4:
                return GsDuration.Sixteenth;
            case 5:
                return GsDuration.Eighth;
            case 6:
                return GsDuration.Quarter;
            default:
                return GsDuration.SixtyFourth;
        }
	}
	
	private function ReadText(beat:GsBeat) : Void
	{
		var text:GsBeatText = Factory.NewText();
        text.Value = ReadIntSizeCheckByteString();
        beat.SetText(text);
	}
	
	private function ReadChord(stringCount:Int, beat:GsBeat)
	{
		var chord:GsChord = Factory.NewChord(stringCount);
        Skip(17);
        chord.Name = (ReadByteSizeString(21));
        Skip(4);
        chord.FirstFret = ReadInt();
        for (i in 0 ... 7) {
            var fret:Int = ReadInt();
            if (i < chord.Strings.length) {
                chord.Strings[i] = fret;
            }
        }
        Skip(32);
        if (chord.NoteCount() > 0) {
            beat.SetChord(chord);
        }
	}
	
	private function ReadDuration(flags:Int)
	{
		var duration:GsDuration = Factory.NewDuration();
		
        duration.Value = Math.round(Math.pow(2, (ReadByte() + 4)) / 4);
        duration.IsDotted = (((flags & 0x01) != 0));
        if ((flags & 0x20) != 0) {
            var iTuplet:Int = ReadInt();
            switch (iTuplet) {
                case 3:
                    duration.Triplet.Enters = (3);
                    duration.Triplet.Times = (2);
                case 5:
                    duration.Triplet.Enters = (5);
                    duration.Triplet.Times = (4);
                case 6:
                    duration.Triplet.Enters = (6);
                    duration.Triplet.Times = (4);
                case 7:
                    duration.Triplet.Enters = (7);
                    duration.Triplet.Times = (4);
                case 9:
                    duration.Triplet.Enters = (9);
                    duration.Triplet.Times = (8);
                case 10:
                    duration.Triplet.Enters = (10);
                    duration.Triplet.Times = (8);
                case 11:
                    duration.Triplet.Enters = (11);
                    duration.Triplet.Times = (8);
                case 12:
                    duration.Triplet.Enters = (12);
                    duration.Triplet.Times = (8);
            }
        }
        return duration;
	}
	
	private function GetBeat(measure:GsMeasure, start:Int) : GsBeat
	{
		for(b in 0 ... measure.Beats.length) {
			var beat:GsBeat = measure.Beats[b];
            if (beat.Start == start) 
                return beat;
        }
        
        var newBeat:GsBeat = Factory.NewBeat();
        newBeat.Start = start;
        measure.AddBeat(newBeat);
        return newBeat;
	}
	
	private function ReadTracks(song:GsSong, trackCount:Int, channels:Array<GsMidiChannel>) : Void
	{
		for (i in 1 ... trackCount + 1) {
            song.AddTrack(this.ReadTrack(i, channels));
        }
        Skip((this.VersionIndex == 0 ? 2 : 1));
	}
	
	private function ReadTrack(number:Int, channels:Array<GsMidiChannel>) : GsTrack
	{
		var flags:Int = ReadUnsignedByte();
        
        if (number == 1 || this.VersionIndex == 0) 
            Skip(1);
        var track:GsTrack = Factory.NewTrack();
		
        track.IsPercussionTrack = (flags & 0x1) != 0;
        track.Is12StringedGuitarTrack = (flags & 0x02) != 0;
        track.IsBanjoTrack = (flags & 0x04) != 0;
        track.Number = number;
        track.Name = ReadByteSizeString(40);
        
        var stringCount:Int = ReadInt();
        for (i in 0 ... 7) 
		{
            var iTuning:Int = ReadInt();
            if (stringCount > i) {
                var oString:GsGuitarString = Factory.NewString();
                oString.Number = (i + 1);
                oString.Value = (iTuning);
                track.Strings.push(oString);
            }
        }
        
        track.Port = ReadInt();
        this.ReadChannel(track.Channel, channels);
        track.FretCount = ReadInt();
        track.Offset = ReadInt();
        track.Color = ReadColor();
        
        Skip((this.VersionIndex > 0) ? 49 : 44);
        if (this.VersionIndex > 0) {
            ReadIntSizeCheckByteString();
            ReadIntSizeCheckByteString();
        }
        return track;
	}
	
	private function ReadChannel(midiChannel:GsMidiChannel, channels:Array<GsMidiChannel>) : Void
	{
		var index:Int = (ReadInt() - 1);
        var effectChannel:Int = (ReadInt() - 1);
        if (index >= 0 && index < channels.length) {
            channels[index].Copy(midiChannel);
            if (midiChannel.Instrument() < 0) {
                midiChannel.Instrument(0);
            }
            if (!midiChannel.IsPercussionChannel()) {
                midiChannel.EffectChannel = (effectChannel);
            }
        }
	}
	
	private function ReadMeasureHeaders(song:GsSong, measureCount:Int) : Void
	{
		var timeSignature:GsTimeSignature = Factory.NewTimeSignature();
        for (i in 0 ... measureCount)
		{
            song.AddMeasureHeader(this.ReadMeasureHeader(i, timeSignature, song));
        }
	}
	
	private function ReadMeasureHeader(i:Int, timeSignature:GsTimeSignature, song:GsSong) : GsMeasureHeader
	{
		if (i > 0) 
            Skip(1);
        
        var flags:Int = ReadUnsignedByte();
        
        var header:GsMeasureHeader = Factory.NewMeasureHeader();
        header.Number = i + 1;
        header.Start = 0;
        header.Tempo.Value = song.Tempo;
        
        if ((flags & 0x01) != 0) 
            timeSignature.Numerator = ReadByte();
        if ((flags & 0x02) != 0) 
            timeSignature.Denominator.Value = ReadByte();
        
        header.IsRepeatOpen = ((flags & 0x04) != 0);
        
        timeSignature.Copy(header.TimeSignature);
        
        if ((flags & 0x08) != 0) 
            header.RepeatClose = (ReadByte() - 1);
        
        if ((flags & 0x20) != 0) 
            header.Marker = this.ReadMarker(header);
        
        if ((flags & 0x10) != 0) 
            header.RepeatAlternative = ReadUnsignedByte();
        
        if ((flags & 0x40) != 0) {
            header.KeySignature = this.ToKeySignature(ReadByte());
            header.KeySignatureType = ReadByte();
        }
		else if(header.Number > 1) {
			header.KeySignature = song.MeasureHeaders[i-1].KeySignature;
			header.KeySignatureType = song.MeasureHeaders[i-1].KeySignatureType;
		}
        header.HasDoubleBar = (flags & 0x80) != 0;
        if ((flags & 0x01) != 0) 
            Skip(4);
        if ((flags & 0x10) == 0) 
            Skip(1);
        var tripletFeel:Int = ReadByte();
        switch (tripletFeel) {
            case 1:
                header.TripletFeel = GsTripletFeel.Eighth;
            case 2:
                header.TripletFeel = GsTripletFeel.Sixteenth;
            default:
                header.TripletFeel = GsTripletFeel.None;
        }
        return header;
	}
	
	private function ToKeySignature(p:Int) : Int
	{
        return p < 0 ? 7 + Math.round(Math.abs(p)) : p;
	}
	
	private function ReadMarker(header:GsMeasureHeader) 
	{
        var marker:GsMarker = Factory.NewMarker();
        marker.MeasureHeader = header;
        marker.Title = ReadIntSizeCheckByteString();
        marker.Color = ReadColor();
        return marker;
	}
	
	private function ReadColor() : GsColor
	{
		var r:Int = (ReadUnsignedByte());
        var g:Int = ReadUnsignedByte();
        var b:Int = (ReadUnsignedByte());
        Skip(1);
        return new GsColor(r, g, b);
	}
	
	private function ReadMidiChannels() : Array<GsMidiChannel>
	{
		var channels:Array<GsMidiChannel> = new Array<GsMidiChannel>();
        for (i in 0 ...64) {
            var newChannel:GsMidiChannel = Factory.NewMidiChannel();
            newChannel.Channel = (i);
            newChannel.EffectChannel = (i);
            newChannel.Instrument(ReadInt());
            newChannel.Volume = (GpReaderBase.ToChannelShort(ReadByte()));
            newChannel.Balance = (GpReaderBase.ToChannelShort(ReadByte()));
            newChannel.Chorus = (GpReaderBase.ToChannelShort(ReadByte()));
            newChannel.Reverb = (GpReaderBase.ToChannelShort(ReadByte()));
            newChannel.Phaser = (GpReaderBase.ToChannelShort(ReadByte()));
            newChannel.Tremolo = (GpReaderBase.ToChannelShort(ReadByte()));
            channels.push(newChannel);
            // Backward compatibility with version 3.0
            Skip(2);
        }
        return channels;
	}
	
	private function ReadPageSetup(song:GsSong) : Void
	{
		var setup:GsPageSetup = Factory.NewPageSetup();
        if (this.VersionIndex > 0) 
            Skip(19);
        setup.PageSize = new Point(ReadInt(), ReadInt());
        
        var l:Int = ReadInt();
        var r:Int = ReadInt();
        var t:Int = ReadInt();
        var b:Int = ReadInt(); 
        setup.PageMargin = new Rectangle(l, t, r, b);
        setup.ScoreSizeProportion = ReadInt() / 100.0;
        
        setup.HeaderAndFooter = ReadByte();
        
        var flags2:Int = ReadUnsignedByte();
        if ((flags2 & 0x01) != 0) 
            setup.HeaderAndFooter |= GsHeaderFooterElements.PageNumber;
        
        setup.Title = ReadIntSizeCheckByteString();
        setup.Subtitle = ReadIntSizeCheckByteString();
        setup.Artist = ReadIntSizeCheckByteString();
        setup.Album = ReadIntSizeCheckByteString();
        setup.Words = ReadIntSizeCheckByteString();
        setup.Music = ReadIntSizeCheckByteString();
        setup.WordsAndMusic = ReadIntSizeCheckByteString();
        setup.Copyright = ReadIntSizeCheckByteString() + "\n" + ReadIntSizeCheckByteString();
        setup.PageNumber = ReadIntSizeCheckByteString();
        song.PageSetup = setup;
	}
	
	private function ReadLyrics(song:GsSong) : Void
	{
		song.Lyrics = Factory.NewLyrics();
        song.Lyrics.TrackChoice = ReadInt();
        for (i in 0 ... GsLyrics.MaxLineCount) {
            var line:GsLyricLine = Factory.NewLyricLine();			
            line.StartingMeasure = ReadInt();
            line.Lyrics = ReadIntSizeString(); 
            song.Lyrics.Lines.push(line);
        }
	}
	
	private function ReadInfo(song:GsSong) {
		song.Title = (ReadIntSizeCheckByteString());
        song.Subtitle = ReadIntSizeCheckByteString();
        song.Artist = (ReadIntSizeCheckByteString());
        song.Album = (ReadIntSizeCheckByteString());
        song.Words = (ReadIntSizeCheckByteString());
        song.Music = ReadIntSizeCheckByteString();
        song.Copyright = ReadIntSizeCheckByteString();
        song.Tab = ReadIntSizeCheckByteString();
        song.Instructions = ReadIntSizeCheckByteString();
        
        var iNotes:Int = ReadInt();
        song.Notice = "";
        for (i in 0 ... iNotes) {
            song.Notice += ReadIntSizeCheckByteString() + "\n";
        }
	}
}