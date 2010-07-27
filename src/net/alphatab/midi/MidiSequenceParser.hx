/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.midi;
import haxe.remoting.DelayedConnection;
import net.alphatab.model.effects.GsBendEffect;
import net.alphatab.model.effects.GsBendPoint;
import net.alphatab.model.effects.GsHarmonicEffect;
import net.alphatab.model.effects.GsHarmonicType;
import net.alphatab.model.effects.GsTremoloBarEffect;
import net.alphatab.model.effects.GsTremoloBarPoint;
import net.alphatab.model.GsBeat;
import net.alphatab.model.GsBeatStrokeDirection;
import net.alphatab.model.GsDuration;
import net.alphatab.model.GsMeasure;
import net.alphatab.model.GsMeasureHeader;
import net.alphatab.model.GsMidiChannel;
import net.alphatab.model.GsMixTableChange;
import net.alphatab.model.GsNote;
import net.alphatab.model.GsSong;
import net.alphatab.model.GsSongFactory;
import net.alphatab.model.GsTempo;
import net.alphatab.model.GsTrack;
import net.alphatab.model.GsTripletFeel;
import net.alphatab.model.GsVelocities;
import net.alphatab.model.GsVoice;

class MidiSequenceParser 
{
	private static inline var DefaultBend:Int = 0x40;
	private static inline var DefaultBendSemiTone:Float = 2.75;
	private static inline var DefaultDurationDead:Int = 30;
	private static inline var DefaultDurationPm:Int = 80;
	private static inline var DefaultMetronomeKey:Int = 0x25;
	
	private var _firstTickMove:Int;
	private var  _flags:Int;
	private var _tempoPercent:Int;
	private var _transpose:Int;
	private var _factory:GsSongFactory;
	private var _infoTrack :Int;
	private var _metronomeTrack :Int;
	private var _song:GsSong;

	public function new(factory:GsSongFactory, song:GsSong,  flags:Int, tempoPercent:Int, transpose:Int) 
	{
		_song = song;
		_factory = factory;
		_flags = flags;
		_transpose = transpose;
		_tempoPercent = tempoPercent;
		_firstTickMove = ((flags & MidiSequenceParserFlags.AddFirstTickMove) == 0) ? 0 : GsDuration.QuarterTime;
	}
	
	private function AddBend(sequence:MidiSequenceHandler, track:Int, tick:Int, bend:Int, channel:Int) : Void
	{
		sequence.AddPitchBend(GetTick(tick), track, channel, bend);
	}

	 
	 
	 
	 
	public function AddDefaultMessages(oSequence:MidiSequenceHandler) : Void
	{
		if ((_flags & MidiSequenceParserFlags.AddDefaultControls) == 0) return;
		for (i in 0 ... 16)
		{
			oSequence.AddControlChange(GetTick(GsDuration.QuarterTime), _infoTrack, i, MidiController.RpnMsb, 0);
			oSequence.AddControlChange(GetTick(GsDuration.QuarterTime), _infoTrack, i, MidiController.RpnLsb, 0);
			oSequence.AddControlChange(GetTick(GsDuration.QuarterTime), _infoTrack, i, MidiController.DataEntryMsb, 12);
			oSequence.AddControlChange(GetTick(GsDuration.QuarterTime), _infoTrack, i, MidiController.DataEntryLsb, 0);
		}
	}	 
	 
	public function AddMetronome(sequence:MidiSequenceHandler, header:GsMeasureHeader, startMove:Int) : Void
	{
		if ((_flags & MidiSequenceParserFlags.AddMetronome) == 0) return;
		var start:Int = startMove + header.Start;
		var length:Int = header.TimeSignature.Denominator.Time();
		for (i in  1 ... header.TimeSignature.Numerator + 1)
		{
			MakeNote(sequence, _metronomeTrack, DefaultMetronomeKey, start, length, GsVelocities.Default, 9);
			start += length;
		}
	}

	private function AddTempo(sequence:MidiSequenceHandler, currentMeasure:GsMeasure, previousMeasure:GsMeasure, startMove:Int) : Void
	{
		var bAddTempo:Bool = false;
		if (previousMeasure == null)
		{
			bAddTempo = true;
		}
		else if (currentMeasure.GetTempo().InUsq() != previousMeasure.GetTempo().InUsq())
		{
			bAddTempo = true;
		}
		if (!bAddTempo) return;
		var usq:Int = Math.floor(currentMeasure.GetTempo().InUsq() * 100.0 / _tempoPercent);
		sequence.AddTempoInUSQ(GetTick(currentMeasure.Start() + startMove), _infoTrack, usq);
	}

	 
	 
	 
	 
	 
	 
	 
	private function AddTimeSignature(sequence:MidiSequenceHandler, currentMeasure:GsMeasure, previousMeasure:GsMeasure, startMove:Int) : Void
	{
		var addTimeSignature:Bool = false;
		if (previousMeasure == null)
		{
			addTimeSignature = true;
		}
		else
		{
			var currNumerator:Int = currentMeasure.GetTimeSignature().Numerator;
			var currValue:Int = currentMeasure.GetTimeSignature().Denominator.Value;
			var prevNumerator:Int = previousMeasure.GetTimeSignature().Numerator;
			var prevValue:Int = previousMeasure.GetTimeSignature().Denominator.Value;
			if ((currNumerator != prevNumerator) || (currValue != prevValue))
			{
				addTimeSignature = true;
			}
		}
		if (addTimeSignature)
		{
			sequence.AddTimeSignature(GetTick(currentMeasure.Start() + startMove), _infoTrack, currentMeasure.GetTimeSignature());
		}
	}

	private static function ApplyDurationEffects(note:GsNote, tempo:GsTempo, duration:Int) : Int
	{
		if (note.Effect.DeadNote)
		{
			return ApplyStaticDuration(tempo, DefaultDurationDead, duration);
		}
		if (note.Effect.PalmMute)
		{
			return ApplyStaticDuration(tempo, DefaultDurationPm, duration);
		}
		if (note.Effect.Staccato)
		{
			return Math.floor((duration * 50.0) / 100.0);
		}
		return duration;
	}
	 
	private static function ApplyStaticDuration(tempo:GsTempo, duration:Int, maximum:Int) : Int
	{
		var value:Int = Math.floor((tempo.Value * duration) / 60);
		return ((value < maximum) ? value : maximum);
	}

	private static function ApplyStrokeDuration(note:GsNote, duration:Int, stroke:Array<Int>) : Int
	{
		return (duration - stroke[note.String - 1]);
	}

	private static function ApplyStrokeStart(node:GsNote, start:Int, stroke:Array<Int>) : Int
	{
		return (start + stroke[node.String - 1]);
	}

	private function CheckTripletFeel(voice:GsVoice, beatIndex:Int) : BeatData 
	{
		var beatStart:Int = voice.Beat.Start;
		var beatDuration:Int = voice.Duration.Time(); 
		if (voice.Beat.Measure.GetTripletFeel() == GsTripletFeel.Eighth)
		{
			if (voice.Duration == NewDuration(GsDuration.Eighth))
			{
				if ((beatStart % GsDuration.QuarterTime) == 0)
				{
					var voice2:GsVoice = GetNextBeat(voice, beatIndex);
					if (((voice2 == null) || (voice2.Beat.Start > (beatStart + voice2.Duration.Time()))) ||
						voice2.Duration == NewDuration(GsDuration.Eighth))
					{
						var duration:GsDuration = NewDuration(GsDuration.Eighth);
						duration.Triplet.Enters = 3;
						duration.Triplet.Times = 2;
						beatDuration = duration.Time() * 2;
					}
				}
				else if ((beatStart % (GsDuration.QuarterTime / 2)) == 0)
				{
					var voice2:GsVoice = GetPreviousBeat(voice, beatIndex);
					if (((voice2 == null) || (voice2.Beat.Start < (beatStart - voice.Duration.Time()))) ||
						voice2.Duration == NewDuration(GsDuration.Eighth))
					{
						var duration:GsDuration = NewDuration(GsDuration.Eighth);
						duration.Triplet.Enters = 3;
						duration.Triplet.Times = 2;
						beatStart = (beatStart - voice.Duration.Time()) + (duration.Time() * 2);
						beatDuration = duration.Time();
					}
				}
			}
		}
		else if (voice.Beat.Measure.GetTripletFeel() == GsTripletFeel.Sixteenth)
		{
			if (voice.Duration == NewDuration(GsDuration.Sixteenth))
				if ((beatStart % (GsDuration.QuarterTime / 2)) == 0)
				{
					var voice2:GsVoice = GetNextBeat(voice, beatIndex);
					if (voice2 == null || (voice2.Beat.Start > (beatStart + voice.Duration.Time())) ||
						voice2.Duration == NewDuration(GsDuration.Sixteenth))
					{
						var duration:GsDuration = NewDuration(GsDuration.Sixteenth);
						duration.Triplet.Enters = 3;
						duration.Triplet.Times = 2;
						beatDuration = duration.Time() * 2;
					}
				}
				else if ((beatStart % (GsDuration.QuarterTime / 4)) == 0)
				{
					var voice2:GsVoice = GetPreviousBeat(voice, beatIndex);
					if (voice2 == null || (voice2.Beat.Start < (beatStart - voice2.Duration.Time()) ||
						voice2.Duration == NewDuration(GsDuration.Sixteenth)))
					{
						var duration:GsDuration = NewDuration(GsDuration.Sixteenth);
						duration.Triplet.Enters = 3;
						duration.Triplet.Times = 2;
						beatStart = (beatStart - voice.Duration.Time()) + (duration.Time() * 2);
						beatDuration = duration.Time();
					}
				}
		}
		return new BeatData(beatStart, beatDuration);
	}
	
	private function CreateTrack(sequence:MidiSequenceHandler, track:GsTrack) : Void
	{
		var previous:GsMeasure = null;
		var controller:MidiRepeatController = new MidiRepeatController(track.Song);
		AddBend(sequence, track.Number, GsDuration.QuarterTime, DefaultBend, track.Channel.Channel);
		MakeChannel(sequence, track.Channel, track.Number);
		while (!controller.Finished())
		{
			var measure:GsMeasure = track.Measures[controller.Index];
			var index:Int = controller.Index;
			var move:Int = controller.RepeatMove;
			controller.Process();
			if (controller.ShouldPlay)
			{
				if (track.Number == 1)
				{
					AddTimeSignature(sequence, measure, previous, move);
					AddTempo(sequence, measure, previous, move);
					AddMetronome(sequence, measure.Header, move);
				}
				MakeBeats(sequence, track, measure, index, move);
			}
			previous = measure;
		}
	}

	private static function GetNextBeat(voice:GsVoice, beatIndex:Int) : GsVoice
	{
		var next:GsVoice = null;
		for (b in beatIndex + 1 ... voice.Beat.Measure.BeatCount())
		{
			var current:GsBeat = voice.Beat.Measure.Beats[b];
			if (((current.Start > voice.Beat.Start) && !current.Voices[voice.Index].IsEmpty) &&
				((next == null) || (current.Start < next.Beat.Start)))
			{
				next = current.Voices[voice.Index];
			}
		}
		return next;
	}

	private static function GetNextNote(note:GsNote, track:GsTrack, measureIndex:Int, beatIndex:Int) : GsNote
	{
		var nextBeatIndex:Int = beatIndex + 1;
		var measureCount:Int = track.MeasureCount();
		for (m in measureIndex ... measureCount)
		{
			var measure:GsMeasure = track.Measures[m];
			var beatCount:Int = measure.BeatCount();
			for (b in nextBeatIndex ... beatCount)
			{
				var beat:GsBeat = measure.Beats[b];
				var voice:GsVoice = beat.Voices[note.Voice.Index];
				var noteCount:Int = voice.Notes.length;
				for (n in 0 ... noteCount)
				{
					var currNode:GsNote = voice.Notes[n];
					if (currNode.String == note.String)
					{
						return currNode;
					}
				}
				return null;
			}
			nextBeatIndex = 0;
		}
		return null;
	}
	 
	private static function GetPreviousBeat(voice:GsVoice, beatIndex:Int) :GsVoice
	{
		var previous:GsVoice = null;
		var b:Int = beatIndex -1;
		while (b >= 0)
		{
			var current:GsBeat = voice.Beat.Measure.Beats[b];
			if (((current.Start < voice.Beat.Start) && !current.Voices[voice.Index].IsEmpty) &&
				((previous == null) || (current.Start > previous.Beat.Start)))
			{
				previous = current.Voices[voice.Index];
			}
			b--;
		}
		return previous;
	}
	
	private static function GetPreviousNote(note:GsNote, track:GsTrack, measureIndex:Int, beatIndex:Int) : GsNote
	{
		var nextBeatIndex:Int = beatIndex;
		var m:Int = measureIndex;
		while(m >= 0)
		{
			var measure:GsMeasure = track.Measures[m];
			nextBeatIndex = (nextBeatIndex < 0) ? measure.BeatCount() : nextBeatIndex;
			var b:Int = nextBeatIndex -1;
			while (b >= 0)
			{
				var voice:GsVoice = measure.Beats[b].Voices[note.Voice.Index];
				var noteCount:Int = voice.Notes.length;
				for (n in 0 ... noteCount)
				{
					var current:GsNote = voice.Notes[n];
					if (current.String == note.String)
					{
						return current;
					}
				}
				b--;
			}
			nextBeatIndex = -1;
			m--;
		}
		return null;
	}

	private function GetRealNoteDuration(track:GsTrack, note:GsNote, tempo:GsTempo, duration:Int, measureIndex:Int, beatIndex:Int) : Int
	{
		var lastEnd:Int = note.Voice.Beat.Start + note.Voice.Duration.Time();
		var realDuration:Int = duration;
		var nextBeatIndex:Int = beatIndex + 1;
		var measureCount:Int = track.MeasureCount();
		for (m in measureIndex ... measureCount)
		{
			var measure:GsMeasure = track.Measures[m];
			var  beatCount:Int = measure.BeatCount();
			var letRingSuspend:Bool = false;
			for (b in nextBeatIndex ... beatCount)
			{
				var beat:GsBeat = measure.Beats[b];
				var voice:GsVoice = beat.Voices[note.Voice.Index];
				if (voice.IsRestVoice())
				{
					return ApplyDurationEffects(note, tempo, realDuration);
				}
				var noteCount:Int = voice.Notes.length;

				var letRing:Bool = m == measureIndex && b != beatIndex &&
					note.Effect.LetRing;
				var letRingAppliedForBeat:Bool = false;
				for (n in 0 ... noteCount)
				{
					var nextNote:GsNote = voice.Notes[n];
					if (nextNote == note || nextNote.String != note.String) continue;
					// quit letring?
					if (nextNote.String == note.String && !nextNote.IsTiedNote)
					{  
						letRing = false;
						letRingSuspend = true;
					}
					if (!nextNote.IsTiedNote && !letRing)
					{
						return ApplyDurationEffects(note, tempo, realDuration);
					}
					letRingAppliedForBeat = true;
					realDuration += (beat.Start - lastEnd) + nextNote.Voice.Duration.Time();
					lastEnd = beat.Start + voice.Duration.Time();
				}

				if (letRing && !letRingAppliedForBeat && !letRingSuspend)
				{
					realDuration += (beat.Start - lastEnd) + voice.Duration.Time();
					lastEnd = beat.Start + voice.Duration.Time();
				}
			}
			nextBeatIndex = 0;
		}
		return ApplyDurationEffects(note, tempo, realDuration);
	}

	private static function GetRealVelocity(note:GsNote, track:GsTrack, measureIndex:Int, beatIndex:Int) : Int
	{
		var velocity:Int = note.Velocity;
		if (!track.IsPercussionTrack)
		{
			var previousNote:GsNote = GetPreviousNote(note, track, measureIndex, beatIndex);
			if ((previousNote != null) && previousNote.Effect.Hammer)
			{
				velocity = Math.floor(Math.max(GsVelocities.MinVelocity, velocity - 25));
			}
		}
		if (note.Effect.GhostNote)
		{
			velocity = Math.floor(Math.max(GsVelocities.MinVelocity, velocity - GsVelocities.VelocityIncrement));
		}
		else if (note.Effect.AccentuatedNote)
		{
			velocity = Math.floor(Math.max(GsVelocities.MinVelocity, velocity + GsVelocities.VelocityIncrement));
		}
		else if (note.Effect.HeavyAccentuatedNote)
		{
			velocity =Math.floor(Math.max(GsVelocities.MinVelocity, velocity + (GsVelocities.VelocityIncrement * 2)));
		}
		return ((velocity > 127) ? 127 : velocity);
	}

	private static function GetStroke(beat:GsBeat, previous:GsBeat, stroke:Array<Int>) : Array<Int>
	{
		var direction:GsBeatStrokeDirection = beat.Stroke.Direction;
		if (((previous == null) || (direction != GsBeatStrokeDirection.None)) || (previous.Stroke.Direction != GsBeatStrokeDirection.None))
		{
			if (direction == GsBeatStrokeDirection.None)
			{
				for (i in 0 ... stroke.length)
				{
					stroke[i] = 0;
				}
			}
			else
			{
				var stringUsed:Int = 0;
				var stringCount:Int = 0;
				for (vIndex in  0 ... beat.Voices.length)
				{
					var voice:GsVoice = beat.Voices[vIndex];
					for (nIndex in 0 ... voice.Notes.length)
					{
						var note:GsNote = voice.Notes[nIndex];
						if (note.IsTiedNote) continue;
						stringUsed |= 0x01 << (note.String - 1);
						stringCount++;
					}
				}
				if (stringCount > 0)
				{
					var strokeMove:Int = 0;
					var strokeIncrement:Int = beat.Stroke.GetIncrementTime(beat);
					for (i in 0 ... stroke.length)
					{
						var iIndex:Int = (direction != GsBeatStrokeDirection.Down) ? i : ((stroke.length - 1) - i);
						if ((stringUsed & (0x01 << iIndex)) != 0)
						{
							stroke[iIndex] = strokeMove;
							strokeMove += strokeIncrement;
						}
					}
				}
			}
		}
		return stroke;
	}

	 
	private function GetTick(tick:Int) : Int
	{
		return (tick + _firstTickMove);
	}

	private function MakeBeats(sequence:MidiSequenceHandler, track:GsTrack, measure:GsMeasure, measureIndex:Int, startMove:Int) : Void
	{
		var stroke:Array<Int> = new Array<Int>();
		for (i in 0 ... track.StringCount())
		{
			stroke.push(0);
		}
		var previous:GsBeat = null;
		for (beatIndex in 0 ... measure.BeatCount())
		{
			var beat:GsBeat = measure.Beats[beatIndex];
			if (beat.MixTableChange != null)
			{
				MakeMixChange(sequence, track.Channel, track.Number, beat);
			}

			MakeNotes(sequence, track, beat, measure.GetTempo(), measureIndex, beatIndex, startMove,
					  GetStroke(beat, previous, stroke));
			previous = beat;
		}
	}

	
	public function MakeBend(sequence:MidiSequenceHandler, track:Int, start:Int, duration:Int,
								 bend:GsBendEffect, channel:Int) : Void
	{
		var points:Array<GsBendPoint> = bend.Points;
		for (i in 0 ... points.length)
		{
			var point:GsBendPoint = points[i];
			var bendStart:Int = start + point.GetTime(duration);
			var value:Int = Math.round(DefaultBend + (point.Value * DefaultBendSemiTone / GsBendEffect.SemitoneLength));
			value = (value <= 127) ? value : 127;
			value = (value >= 0) ? value : 0;
			AddBend(sequence, track, bendStart, value, channel);
			if (points.length <= (i + 1)) continue;

			var nextPoint:GsBendPoint = points[i + 1];
			var nextValue:Int = Math.round(DefaultBend + (nextPoint.Value * DefaultBendSemiTone / GsBendEffect.SemitoneLength));
			var nextBendStart:Int = Math.round(start + nextPoint.GetTime(duration));
			if (nextValue == value) continue;
			var width:Float = (nextBendStart - bendStart) / Math.abs(nextValue - value);
			if (value < nextValue)
			{
				while (value < nextValue)
				{
					value++;
					bendStart += Math.round(width);
					AddBend(sequence, track, bendStart, (value <= 127) ? value : 127, channel);
				}
			}
			else if (value > nextValue)
			{
				while (value > nextValue)
				{
					value--;
					bendStart += Math.round(width);
					AddBend(sequence, track, bendStart, (value >= 0) ? value : 0, channel);
				}
			}
		}
		AddBend(sequence, track, start + duration, 0x40, channel);
	}

	
	private function MakeChannel(sequence:MidiSequenceHandler, channel:GsMidiChannel, track:Int) : Void
	{
		if ((_flags & MidiSequenceParserFlags.AddMixerMessages) == 0) return;
		MakeChannel2(sequence, channel, track, true);
		if (channel.Channel != channel.EffectChannel)
		{
			MakeChannel2(sequence, channel, track, false);
		}
	}

	private function MakeChannel2(sequence:MidiSequenceHandler, channel:GsMidiChannel, track:Int, primary:Bool) : Void
	{
		var number:Int = (!primary) ? channel.EffectChannel : channel.Channel;
		sequence.AddControlChange(GetTick(GsDuration.QuarterTime), track, number, MidiController.Volume, channel.Volume);
		sequence.AddControlChange(GetTick(GsDuration.QuarterTime), track, number, MidiController.Balance, channel.Balance);
		sequence.AddControlChange(GetTick(GsDuration.QuarterTime), track, number, MidiController.Chorus, channel.Chorus);
		sequence.AddControlChange(GetTick(GsDuration.QuarterTime), track, number, MidiController.Reverb, channel.Reverb);
		sequence.AddControlChange(GetTick(GsDuration.QuarterTime), track, number, MidiController.Phaser, channel.Phaser);
		sequence.AddControlChange(GetTick(GsDuration.QuarterTime), track, number, MidiController.Tremolo, channel.Tremolo);
		sequence.AddControlChange(GetTick(GsDuration.QuarterTime), track, number, MidiController.Expression, 127);
		sequence.AddProgramChange(GetTick(GsDuration.QuarterTime), track, number, channel.Instrument());
	}


	private function MakeMixChange(sequence:MidiSequenceHandler, channel:GsMidiChannel, track:Int, beat:GsBeat) : Void
	{
		var change:GsMixTableChange = beat.MixTableChange;
		var start:Int = GetTick(beat.Start);

		if (change.Volume != null)
		{
			sequence.AddControlChange(start, track, channel.Channel, MidiController.Volume, change.Volume.Value);
			sequence.AddControlChange(start, track, channel.EffectChannel, MidiController.Volume, change.Volume.Value);
		}
		if (change.Balance != null)
		{
			sequence.AddControlChange(start, track, channel.Channel, MidiController.Balance, change.Balance.Value);
			sequence.AddControlChange(start, track, channel.EffectChannel, MidiController.Balance, change.Balance.Value);
		}
		if (change.Chorus != null)
		{
			sequence.AddControlChange(start, track, channel.Channel, MidiController.Chorus, change.Chorus.Value);
			sequence.AddControlChange(start, track, channel.EffectChannel, MidiController.Chorus, change.Chorus.Value);
		}
		if (change.Reverb != null)
		{
			sequence.AddControlChange(start, track, channel.Channel, MidiController.Reverb, change.Reverb.Value);
			sequence.AddControlChange(start, track, channel.EffectChannel, MidiController.Reverb, change.Reverb.Value);
		}
		if (change.Phaser != null)
		{
			sequence.AddControlChange(start, track, channel.Channel, MidiController.Phaser, change.Phaser.Value);
			sequence.AddControlChange(start, track, channel.EffectChannel, MidiController.Phaser, change.Phaser.Value);
		}
		if (change.Tremolo != null)
		{
			sequence.AddControlChange(start, track, channel.Channel, MidiController.Tremolo, change.Tremolo.Value);
			sequence.AddControlChange(start, track, channel.EffectChannel, MidiController.Tremolo, change.Tremolo.Value);
		}
		if (change.Instrument != null)
		{
			sequence.AddProgramChange(start, track, channel.Channel, change.Instrument.Value);
			sequence.AddProgramChange(start, track, channel.EffectChannel, change.Instrument.Value);
		}
		if(change.Tempo != null)
		{
			sequence.AddTempoInUSQ(start, _infoTrack, GsTempo.TempoToUsq(change.Tempo.Value));
		}
	}

	private function MakeFadeIn(sequence:MidiSequenceHandler, track:Int, start:Int, duration:Int, channel:Int) : Void
	{
		var expression:Int = 0x1f;
		var expressionIncrement:Int = 1;
		var tick:Int = start;
		var tickIncrement:Int = Math.round(duration / ((0x7f - expression) / expressionIncrement));
		while ((tick < (start + duration)) && (expression < 0x7f))
		{
			sequence.AddControlChange(GetTick(tick), track, channel, MidiController.Expression, expression);
			tick += tickIncrement;
			expression += expressionIncrement;
		}
		sequence.AddControlChange(GetTick(start + duration), track, channel, MidiController.Expression, 0x7f);
	}
	 
	private function MakeNote(sequence:MidiSequenceHandler, track:Int, key:Int, start:Int, duration:Int, velocity:Int, channel:Int) : Void
	{
		sequence.AddNoteOn(GetTick(start), track, channel, key, velocity);
		sequence.AddNoteOff(GetTick(start + duration), track, channel, key, velocity);
	}

	private function MakeNotes(sequence:MidiSequenceHandler, track:GsTrack, beat:GsBeat, tempo:GsTempo, measureIndex:Int, beatIndex:Int, startMove:Int, stroke:Array<Int>) : Void
	{ 
		var trackId:Int = track.Number;
		for (vIndex in 0 ... beat.Voices.length)
		{
			var voice:GsVoice = beat.Voices[vIndex];
			var data:BeatData = CheckTripletFeel(voice, beatIndex);
			for (noteIndex in 0 ... voice.Notes.length)
			{
				var note:GsNote = voice.Notes[noteIndex];

				if (note.IsTiedNote) continue;

				var key:Int = (_transpose + track.Offset + note.Value) +
						   track.Strings[note.String - 1].Value;
				var start:Int = ApplyStrokeStart(note, data.Start + startMove, stroke);
				var duration:Int = ApplyStrokeDuration(note,
													 GetRealNoteDuration(track, note, tempo, data.Duration,
																		 measureIndex, beatIndex), stroke);
				var velocity:Int = GetRealVelocity(note, track, measureIndex, beatIndex);
				var channel:Int = track.Channel.Channel;
				var effectChannel:Int = track.Channel.EffectChannel;
				var percussionTrack:Bool = track.IsPercussionTrack;
				if (note.Effect.FadeIn)
				{
					channel = effectChannel;
					MakeFadeIn(sequence, trackId, start, duration, channel);
				}
				if ((note.Effect.IsGrace() && (effectChannel >= 0)) && !percussionTrack)
				{
					channel = effectChannel;
					var graceKey:Int = (track.Offset + note.Effect.Grace.Fret) +
									(track.Strings[note.String - 1].Value);
					var graceLength:Int = note.Effect.Grace.DurationTime();
					var graceVelocity:Int = note.Effect.Grace.Dynamic;
					var graceDuration:Int = (!note.Effect.Grace.IsDead)
											  ? graceLength
											  : ApplyStaticDuration(tempo, DefaultDurationDead, graceLength);
					if (note.Effect.Grace.IsOnBeat || ((start - graceLength) < GsDuration.QuarterTime))
					{
						start += graceLength;
						duration -= graceLength;
					}
					MakeNote(sequence, trackId, graceKey, start - graceLength, graceDuration, graceVelocity,
							 channel);
				}
				if ((note.Effect.IsTrill() && (effectChannel >= 0)) && !percussionTrack)
				{
					var trillKey:Int = (track.Offset + note.Effect.Trill.Fret) +
									(track.Strings[note.String - 1].Value);
					var trillLength:Int = note.Effect.Trill.Duration.Time();
					var realKey:Bool = true;
					var tick:Int = start;
					while (tick + 10 < (start + duration))
					{
						if ((tick + trillLength) >= (start + duration))
						{
							trillLength = (((start + duration) - tick) - 1);
						}
						MakeNote(sequence, trackId, ((realKey) ? key : trillKey), tick, trillLength,
								 velocity, channel);
						realKey = !realKey;
						tick += trillLength;
					}
					continue;
				}
				if (note.Effect.IsTremoloPicking() && (effectChannel >= 0))
				{
					var tpLength:Int = note.Effect.TremoloPicking.Duration.Time();
					var tick:Int  = start;
					while (tick + 10 < (start + duration))
					{
						if ((tick + tpLength) >= (start + duration))
						{
							tpLength = (((start + duration) - tick) - 1);
						}
						MakeNote(sequence, trackId, key, start, tpLength, velocity, channel);
						tick += tpLength;
					}
					continue;
				}
				if ((note.Effect.IsBend() && (effectChannel >= 0)) && !percussionTrack)
				{
					channel = effectChannel;
					MakeBend(sequence, trackId, start, duration, note.Effect.Bend, channel);
				}
				else if ((note.Effect.IsTremoloBar() && (effectChannel >= 0)) && !percussionTrack)
				{
					channel = effectChannel;
					MakeTremoloBar(sequence, trackId, start, duration, note.Effect.TremoloBar, channel);
				}
				else if ((note.Effect.Slide && (effectChannel >= 0)) && !percussionTrack)
				{
					channel = effectChannel;
					var nextNote:GsNote = GetNextNote(note, track, measureIndex, beatIndex);
					MakeSlide(sequence, trackId, note, nextNote, startMove, channel);
				}
				else if ((note.Effect.Vibrato && (effectChannel >= 0)) && !percussionTrack)
				{
					channel = effectChannel;
					MakeVibrato(sequence, trackId, start, duration, channel);
				}
				if (note.Effect.IsHarmonic() && !percussionTrack)
				{
					var orig:Int = key; 
					if (note.Effect.Harmonic.Type == GsHarmonicType.Natural)
					{
						for (i in 0 ... GsHarmonicEffect.NaturalFrequencies.length)
						{
							if ((note.Value % 12) == (GsHarmonicEffect.NaturalFrequencies[i][0] % 12))
							{
								key = (orig + GsHarmonicEffect.NaturalFrequencies[i][1]) - note.Value;
								break;
							}
						}
					}
					else
					{
						if (note.Effect.Harmonic.Type == GsHarmonicType.Semi)
						{ 
							MakeNote(sequence, trackId, Math.round(Math.min(127, orig)), start, duration,
									Math.round(Math.max(GsVelocities.MinVelocity, velocity - (GsVelocities.VelocityIncrement * 3))), channel);
						}
						key = orig + GsHarmonicEffect.NaturalFrequencies[note.Effect.Harmonic.Data][1];
					}
					if ((key - 12) > 0)
					{
						var hVelocity:Int = Math.round(Math.max(GsVelocities.MinVelocity, velocity - (GsVelocities.VelocityIncrement * 4)));
						MakeNote(sequence, trackId, key - 12, start, duration, hVelocity, channel);
					}
				}
				MakeNote(sequence, trackId, Math.round(Math.min(0x7f, key)), start, duration, velocity, channel);
			}
		}
	}

	public function MakeSlide(sequence:MidiSequenceHandler, track:Int, note:GsNote, nextNote:GsNote ,
								  startMove:Int, channel:Int) : Void
	{
		if (nextNote != null)
		{
			// TODO calculate all slide types (zero or -10 to note, from note to zero or -10, from note + 10, +10 to note)
			MakeSlide2(sequence, track, note.Voice.Beat.Start + startMove, note.Value,
					  nextNote.Voice.Beat.Start + startMove, nextNote.Value, channel);
			AddBend(sequence, track, nextNote.Voice.Beat.Start + startMove, DefaultBend, channel);
		}
	}

	public function MakeSlide2(sequence:MidiSequenceHandler, track:Int, tick1:Int, value1:Int, tick2:Int,
								  value2:Int, channel:Int) : Void
	{
		var lDistance:Int = value2 - value1;
		var lLength:Int = tick2 - tick1;
		var points:Int = Math.floor(lLength / (GsDuration.QuarterTime / 8));
		for (i in 1 ... points + 1)
		{
			var fTone:Float = (((lLength / points) * i) * lDistance) / lLength;
			var iBend:Int = Math.round(DefaultBend + (fTone * (DefaultBendSemiTone * 2)));
			AddBend(sequence, track, Math.round(tick1 + ((lLength / points) * i)), iBend, channel);
		}
	}
	 
	public function MakeTremoloBar(sequence:MidiSequenceHandler, track:Int, start:Int, duration:Int,
									   effect:GsTremoloBarEffect, channel:Int) : Void
	{
		var points:Array<GsTremoloBarPoint> = effect.Points;
		
		for (i in 0 ... points.length)
		{
			var point:GsTremoloBarPoint = points[i];
			var pointStart = start + point.GetTime(duration);
			var value:Int = Math.round(DefaultBend + (point.Value * (DefaultBendSemiTone * 2)));
			value = (value <= 127) ? value : 127;
			value = (value >= 0) ? value : 0;
			AddBend(sequence, track, pointStart, value, channel);
			if (points.length > (i + 1))
			{
				var nextPoint:GsTremoloBarPoint = points[i + 1];
				var nextValue:Int = Math.round(DefaultBend + (nextPoint.Value * (DefaultBendSemiTone * 2)));
				var nextPointStart = start + nextPoint.GetTime(duration);
				if (nextValue != value)
				{
					var width:Float = (nextPointStart - pointStart) / Math.abs(nextValue - value);
					if (value < nextValue)
					{
						while (value < nextValue)
						{
							value++;
							pointStart += Math.round(width);
							AddBend(sequence, track, pointStart, (value <= 127) ? value : 127, channel);
						}
					}
					else if (value > nextValue)
					{
						while (value > nextValue)
						{
							value += -1;
							pointStart += Math.round(pointStart + width);
							AddBend(sequence, track, pointStart, (value >= 0) ? value : 0, channel);
						}
					}
				}
			}
		}
		AddBend(sequence, track, start + duration, 0x40, channel);
	}

	public function MakeVibrato(sequence:MidiSequenceHandler, track:Int, start:Int, duration:Int, channel:Int) : Void
	{
		var nextStart:Int = start;
		var end:Int = nextStart + duration;
		while (nextStart < end)
		{
			nextStart = ((nextStart + 160) > end) ? end : (nextStart + 160);
			AddBend(sequence, track, nextStart, DefaultBend, channel);
			nextStart = ((nextStart + 160) > end) ? end : (nextStart + 160);
			AddBend(sequence, track, nextStart, Math.round(DefaultBend + (DefaultBendSemiTone / 2.0)), channel);
		}
		AddBend(sequence, track, nextStart, DefaultBend, channel);
	}

	private function NewDuration(value:Int) : GsDuration
	{
		var duration:GsDuration = _factory.NewDuration();
		duration.Value = (value);
		return duration;
	}
	
	public function Parse(sequence:MidiSequenceHandler) : Void
	{		
		_infoTrack = sequence.InfoTrack;
		_metronomeTrack = sequence.MetronomeTrack;
		AddDefaultMessages(sequence);
		for (i in 0 ... _song.Tracks.length)
		{
			var songTrack:GsTrack = _song.Tracks[i];
			CreateTrack(sequence, songTrack);
		}
		sequence.NotifyFinish();
	}
}