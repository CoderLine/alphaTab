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

class Gp3Reader extends GpReaderBase
{
	private var _tripletFeel:GsTripletFeel;

	public function new() 
	{
		super(["FICHIER GUITAR PRO v3.00"]);
	}
	
	public override function ReadSong() : GsSong
	{
		if (!ReadVersion())
		{
			throw new FileFormatException("Unsupported Version");
		}
		
		var song:GsSong = Factory.NewSong();
        
        this.ReadInfo(song);
		
		this._tripletFeel = this.ReadBool() ? GsTripletFeel.Eighth : GsTripletFeel.None;
        
        this.ReadLyrics(song);
        
        this.ReadPageSetup(song);
        
        song.TempoName = "";
        song.Tempo = ReadInt();
		song.HideTempo = false;
        
        song.Key = ReadInt();
        song.Octave = 0;
        
        var channels:Array<GsMidiChannel> = ReadMidiChannels();
        
        var measureCount = ReadInt();
        var trackCount = ReadInt();
        
        this.ReadMeasureHeaders(song, measureCount);
        this.ReadTracks(song, trackCount, channels);
        this.ReadMeasures(song);
        
        return song;
	}
	
	private function ReadMeasures(song:GsSong) : Void
	{
		var tempo:GsTempo = Factory.NewTempo();
        tempo.Value = song.Tempo;
        var start = GsDuration.QuarterTime;
		for(h in 0 ... song.MeasureHeaders.length) {
			var header:GsMeasureHeader = song.MeasureHeaders[h];
            header.Start = start;
			for(t in 0 ... song.Tracks.length) {
				var track = song.Tracks[t];
                var measure = Factory.NewMeasure(header);
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
		var start = measure.Start();
		var beats = ReadInt();
		for (beat in 0 ... beats) { 
			start += this.ReadBeat(start, measure, track, 0);
		}
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
        var effect:GsNoteEffect = Factory.NewNoteEffect();
        if ((flags & 0x02) != 0) {
            this.ReadChord(track.StringCount(), beat);
        }
        if ((flags & 0x04) != 0) {
            this.ReadText(beat);
        }
        if ((flags & 0x08) != 0) {
            this.ReadBeatEffects(beat, effect);
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
                var guitarString = track.Strings[6 - i].Clone(Factory);
                var note = this.ReadNote(guitarString, track, effect.Clone(Factory));
                voice.AddNote(note);
            }
            duration.Copy(voice.Duration);
		}
        
        
        return (!voice.IsEmpty) ? duration.Time() : 0;
	}
	
	private function ReadNote(guitarString:GsGuitarString, track:GsTrack, effect:GsNoteEffect) : GsNote
	{
		var flags:Int = ReadUnsignedByte();
        var note:GsNote = Factory.NewNote();
        note.String = (guitarString.Number);
        note.Effect = (effect);
        note.Effect.AccentuatedNote = (((flags & 0x40) != 0));
        note.Effect.HeavyAccentuatedNote = (((flags & 0x02) != 0));
        note.Effect.GhostNote = (((flags & 0x04) != 0));
        if ((flags & 0x20) != 0) {
            var noteType = ReadUnsignedByte();
            note.IsTiedNote = ((noteType == 0x02));
            note.Effect.DeadNote = ((noteType == 0x03));
        }
        if ((flags & 0x01) != 0) {
            note.Duration = ReadByte();
            note.Triplet = ReadByte();
        }
        if ((flags & 0x10) != 0) {
            note.Velocity = ((GsVelocities.MinVelocity + (GsVelocities.VelocityIncrement * ReadByte())) -
            GsVelocities.VelocityIncrement);
        }
        if ((flags & 0x20) != 0) {
            var fret = ReadByte();
            var value = (note.IsTiedNote ? GetTiedNoteValue(guitarString.Number, track) : fret);
            note.Value = (value >= 0 && value < 100 ? value : 0);
        }
        if ((flags & 0x80) != 0) {
            note.LeftHandFinger = ReadByte();
            note.RightHandFinger = ReadByte();
            note.IsFingering = true;
        }
        if ((flags & 0x08) != 0) {
            this.ReadNoteEffects(note.Effect);
        }
        return note;
	}
	
	private function ReadNoteEffects(noteEffect:GsNoteEffect) : Void
	{
		var flags1:Int = ReadUnsignedByte();
		noteEffect.Slide = (flags1 & 0x04) != 0;
		noteEffect.Hammer = (flags1 & 0x02) != 0;
		noteEffect.LetRing = (flags1 & 0x08) != 0;

        if ((flags1 & 0x01) != 0) {
            this.ReadBend(noteEffect);
        }
        if ((flags1 & 0x10) != 0) {
            this.ReadGrace(noteEffect);
        }
	}
	
	private function ReadGrace(noteEffect:GsNoteEffect) : Void
	{
		var fret:Int = ReadUnsignedByte();
        var dyn:Int = ReadUnsignedByte();
        var transition:Int = ReadByte();
        var duration:Int = ReadUnsignedByte();
        var grace:GsGraceEffect = Factory.NewGraceEffect();
		
        grace.Fret = (fret);
        grace.Dynamic = ((GsVelocities.MinVelocity + (GsVelocities.VelocityIncrement * dyn)) -
        GsVelocities.VelocityIncrement);
        grace.Duration = (duration);
        grace.IsDead = fret == 255;
        grace.IsOnBeat = false;
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
        var pointCount = ReadInt();
        for (i in 0 ... pointCount) {
            var pointPosition = Math.round(ReadInt() * GsBendPoint.MaxPositionLength / GpReaderBase.BendPosition);
            var pointValue = Math.round(ReadInt() * GsBendPoint.SemiToneLength / GpReaderBase.BendSemitone);
            var vibrato = ReadBool();
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
					var beat = measure.Beats[b];
					
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
            tableChange.HideTempo = false;
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

		return tableChange;
	}
	
	private function ReadBeatEffects(beat:GsBeat, effect:GsNoteEffect)  : Void
	{
		var flags1:Int = ReadUnsignedByte();
        beat.Effect.FadeIn = (((flags1 & 0x10) != 0));
        beat.Effect.Vibrato = (((flags1 & 0x02) != 0)) || beat.Effect.Vibrato;
        
		if ((flags1 & 0x20) != 0) {
            var slapEffect:Int = ReadUnsignedByte();
			if (slapEffect == 0) {
				this.ReadTremoloBar(beat.Effect);
			}
			else {
				beat.Effect.Tapping = (slapEffect == 1);
				beat.Effect.Slapping = (slapEffect == 2);
				beat.Effect.Popping = (slapEffect == 3);
				ReadInt();
			}
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
        if ((flags1 & 0x04) != 0)
        {
            var harmonic:GsHarmonicEffect = Factory.NewHarmonicEffect();
            harmonic.Type = (GsHarmonicType.Natural);
            effect.Harmonic = (harmonic);
        }
        if ((flags1 & 0x08) != 0)
        {
            var harmonic:GsHarmonicEffect = Factory.NewHarmonicEffect();
            harmonic.Type = (GsHarmonicType.Artificial);
            harmonic.Data = (0);
            effect.Harmonic = (harmonic);
        }
	}
	
	private function ReadTremoloBar(effect:GsBeatEffect) : Void 
	{
		var barEffect:GsTremoloBarEffect = Factory.NewTremoloBarEffect();
        barEffect.Type = GsBendTypesConverter.FromInt(ReadByte());
        barEffect.Value = ReadInt();
		
        barEffect.Points.push(new GsTremoloBarPoint(0, 0, false));
        barEffect.Points.push(new GsTremoloBarPoint(Math.round(GsTremoloBarPoint.MaxPositionLength/2.0), Math.round(barEffect.Value / (GpReaderBase.BendSemitone * 2)), false));
        barEffect.Points.push(new GsTremoloBarPoint(GsTremoloBarPoint.MaxPositionLength, 0, false));
		
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
        if ((ReadUnsignedByte() & 0x01) == 0) {
            chord.Name = (ReadIntSizeCheckByteString());
            chord.FirstFret = (ReadInt());
            if (chord.FirstFret != 0) {
                for (i in 0 ... 6) {
                    var fret = ReadInt();
                    if (i < chord.Strings.length) {
                        chord.Strings[i] = fret;
                    }
                }
            }
        }
        else {
            Skip(25);
            chord.Name = (ReadByteSizeString(34));
            chord.FirstFret = (ReadInt());
            for (i in 0 ... 6) {
                var fret = ReadInt();
                if (i < chord.Strings.length) {
                    chord.Strings[i] = fret;
                }
            }
            Skip(36);
        }
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
            var iTuplet = ReadInt();
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
	}
	
	private function ReadTrack(number:Int, channels:Array<GsMidiChannel>) : GsTrack
	{
		var flags:Int = ReadUnsignedByte();
        var track:GsTrack = Factory.NewTrack();
		
        track.IsPercussionTrack = (flags & 0x1) != 0;
        track.Is12StringedGuitarTrack = (flags & 0x02) != 0;
        track.IsBanjoTrack = (flags & 0x04) != 0;
        track.Number = number;
        track.Name = ReadByteSizeString(40);
        
        var stringCount = ReadInt();
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
       
        var flags:Int = ReadUnsignedByte();
        
        var header:GsMeasureHeader = Factory.NewMeasureHeader();
        header.Number = i + 1;
        header.Start = 0;
        header.Tempo.Value = song.Tempo;
		header.TripletFeel = this._tripletFeel;
        
        if ((flags & 0x01) != 0) 
            timeSignature.Numerator = ReadByte();
        if ((flags & 0x02) != 0) 
            timeSignature.Denominator.Value = ReadByte();
        
        header.IsRepeatOpen = ((flags & 0x04) != 0);
        
        timeSignature.Copy(header.TimeSignature);
        
        if ((flags & 0x08) != 0) 
            header.RepeatClose = (ReadByte() - 1);
		
		if ((flags & 0x10) != 0) 
            header.RepeatAlternative = this.ParseRepeatAlternative(song, header.Number, ReadUnsignedByte());
			
        if ((flags & 0x20) != 0) 
            header.Marker = this.ReadMarker(header);
                
        if ((flags & 0x40) != 0) {
            header.KeySignature = this.ToKeySignature(ReadByte());
            header.KeySignatureType = ReadByte();
        }
		else if(header.Number > 1) {
			header.KeySignature = song.MeasureHeaders[i-1].KeySignature;
			header.KeySignatureType = song.MeasureHeaders[i-1].KeySignatureType;
		}
        header.HasDoubleBar = (flags & 0x80) != 0;
       
        return header;
	}
	
	private function ParseRepeatAlternative(song:GsSong, measure:Int, value:Int) : Int
	{
		var repeatAlternative:Int = 0;
        var existentAlternatives:Int = 0;
        for (i in 0 ... song.MeasureHeaders.length) {
            var header:GsMeasureHeader = song.MeasureHeaders[i];
            if (header.Number == measure) 
                break;
            if (header.IsRepeatOpen) 
                existentAlternatives = 0;
            existentAlternatives |= header.RepeatAlternative;
        }
        
        for (i in 0 ... 8) {
            if (value > i && (existentAlternatives & (1 << i)) == 0) {
                repeatAlternative |= (1 << i);
            }
        }
        return repeatAlternative;
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
		var setup:GsPageSetup = GsPageSetup.Defaults();
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
        song.Music = song.Words;
        song.Copyright = ReadIntSizeCheckByteString();
        song.Tab = ReadIntSizeCheckByteString();
        song.Instructions = ReadIntSizeCheckByteString();
        
        var iNotes = ReadInt();
        song.Notice = "";
        for (i in 0 ... iNotes) {
            song.Notice += ReadIntSizeCheckByteString() + "\n";
        }
	}
}