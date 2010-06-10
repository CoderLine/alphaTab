/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;
import haxe.Log;
import net.coderline.jsgs.file.SongLoader;
import net.coderline.jsgs.tablature.model.BeatGroup;
import net.coderline.jsgs.tablature.model.GsSongFactoryImpl;

class SongManager 
{
	
	public var Factory:GsSongFactory;
	
	public function new(factory:GsSongFactory)
	{
		this.Factory = factory;
	}
	
	public static function GetDivisionLength(header:GsMeasureHeader) :Int
	{
		var defaulLenght:Int = GsDuration.QuarterTime;
		var denominator:Int = header.TimeSignature.Denominator.Value;
		switch (denominator)
		{
			case GsDuration.Eighth:
				if (header.TimeSignature.Numerator % 3 == 0)
					defaulLenght += Math.floor(GsDuration.QuarterTime / 2);
		}
		return defaulLenght;
	}
	
	public function GetRealStart(measure:GsMeasure, currentStart:Int) : Int
	{
		var beatLength:Int = GetDivisionLength(measure.Header);
		var start:Int = currentStart;
		var startBeat:Bool = start % beatLength == 0;
		if (!startBeat)
		{
			var minDuration:GsDuration = Factory.NewDuration();
			minDuration.Value = GsDuration.SixtyFourth;
			minDuration.Triplet.Enters = 3;
			minDuration.Triplet.Times = 2;
			var time : Int = minDuration.Time();
			for (i in 0 ... time)
			{
				start++;
				startBeat = start % beatLength == 0;
				if (startBeat)
					break;
			}
			if (!startBeat)
				start = currentStart;
		}
		return start;
	}
	
	public function GetFirstBeat(list:Array<GsBeat>) : GsBeat
	{
		return list.length > 0 ? list[0] : null;
	}
	
	public function AutoCompleteSilences(measure:GsMeasure)
	{
		var beat:GsBeat = GetFirstBeat(measure.Beats);
		if (beat == null)
		{
			CreateSilences(measure, measure.Start(), measure.Length(), 0);
			return;
		}
		for (v in 0 ... GsBeat.MaxVoices)
		{
			var voice:GsVoice = GetFirstVoice(measure.Beats, v);
			if (voice != null && voice.Beat.Start > measure.Start())
				CreateSilences(measure, measure.Start(), voice.Beat.Start - measure.Start(), v);
		}

		var start:Array<Int> = new Array<Int>();
		var uncompletedLength:Array<Int> = new Array<Int>();
		for (i in 0 ... beat.Voices.length)
		{
			start.push(0);
			uncompletedLength.push(0);
		}

		while (beat != null)
		{
			for (v  in 0 ... beat.Voices.length)
			{
				var voice:GsVoice = beat.Voices[v];
				if (!voice.IsEmpty)
				{
					var voiceEnd:Int = beat.Start + voice.Duration.Time();
					var nextPosition:Int = measure.Start() + measure.Length();

					var nextVoice:GsVoice = GetNextVoice(measure.Beats, beat, voice.Index);
					if (nextVoice != null)
					{
						nextPosition = nextVoice.Beat.Start;
					}
					if (voiceEnd < nextPosition)
					{
						start[v] = voiceEnd;
						uncompletedLength[v] = nextPosition - voiceEnd;
					}
				}
			}

			for (v in 0 ... uncompletedLength.length)
			{
				if (uncompletedLength[v] > 0)
				{
					CreateSilences(measure, start[v], uncompletedLength[v], v);
				}
				start[v] = 0;
				uncompletedLength[v] = 0;
			}
			beat = GetNextBeat2(measure.Beats, beat);
		}
	}
	
	private function CreateSilences(measure:GsMeasure, start:Int, length:Int, voiceIndex:Int) : Void
	{
		var nextStart:Int = start;
		var durations:Array<GsDuration> = CreateDurations(length);
		for (duration in durations)
		{
			var isNew:Bool = false;
			var beatStart:Int = GetRealStart(measure, nextStart);
			var beat:GsBeat = GetBeat(measure, beatStart);
			if (beat == null)
			{
				beat = Factory.NewBeat();
				beat.Start = GetRealStart(measure, nextStart);
				isNew = true;
			}

			var voice:GsVoice = beat.Voices[voiceIndex];
			voice.IsEmpty = false;
			duration.Copy(voice.Duration);

			if (isNew)
				measure.AddBeat(beat);

			nextStart += duration.Time();
		}
	}
	
	private function CreateDurations(time:Int) : Array<GsDuration>
	{
		var durations:Array<GsDuration> = new Array<GsDuration>();
		var min:GsDuration = Factory.NewDuration();
		min.Value = GsDuration.SixtyFourth;
		min.IsDotted = false;
		min.IsDoubleDotted = false;
		min.Triplet.Enters = 3;
		min.Triplet.Times = 2;

		var missing:Int = time;
		while (missing > min.Time())
		{
			var oDuration:GsDuration = GsDuration.FromTime(Factory, missing, min, 10);
			durations.push(oDuration.Clone(Factory));
			missing -= oDuration.Time();
		}
		return durations;
	}
	
	public static function GetNextBeat2(beats:Array<GsBeat>, currentBeat:GsBeat) : GsBeat
	{
		var oNext:GsBeat = null;
		for (checkedBeat in beats)
		{
			if (checkedBeat.Start > currentBeat.Start)
			{
				if (oNext == null || checkedBeat.Start < oNext.Start)
					oNext = checkedBeat;
			}
		}
		return oNext;
	}
	
	
	private static function GetNextVoice(beats:Array<GsBeat>, beat:GsBeat, index:Int) : GsVoice
	{
		var next:GsVoice = null;
		for(current in beats)
		{
			if (current.Start > beat.Start && !current.Voices[index].IsEmpty)
			{
				if (next == null || current.Start < next.Beat.Start)
					next = current.Voices[index];
			}
		}
		return next;
	}
	
	private static function GetFirstVoice(beats:Array<GsBeat>, index:Int) : GsVoice
	{
		var first:GsVoice = null;
		for (current in beats)
		{
			if ((first == null || current.Start < first.Beat.Start) && !current.Voices[index].IsEmpty)
				first = current.Voices[index];
		}
		return first;
	}
	
	private static function GetBeat(measure:GsMeasure, start:Int) : GsBeat
	{
		for (beat in measure.Beats)
		{
			if (beat.Start == start)
				return beat;
		}
		return null;
	}

	public function OrderBeats(measure:GsMeasure) : Void
	{
		QuickSort(measure.Beats, 0, measure.BeatCount() - 1);
	}

	public function GetPreviousMeasure(measure:GsMeasure) : GsMeasure
	{
		return measure.Number() > 1 ? measure.Track.Measures[measure.Number() - 2] : null;
	}
	
	public function GetPreviousMeasureHeader(header:GsMeasureHeader) : GsMeasureHeader
	{
		var prevIndex:Int = header.Number - 1;
		if (prevIndex > 0)
		{
			return header.Song.MeasureHeaders[prevIndex - 1];
		}
		return null;
	}

	public function GetNextBeat(beat:GsBeat, voice:Int) : GsBeat
	{
		// Try get next beat uf current measure  
		var nextBeat:GsBeat = SongManager.GetNextBeat2(beat.Measure.Beats, beat);

		if (nextBeat == null && beat.Measure.Track.MeasureCount() > beat.Measure.Number())
		{// First beat of next measure if available 
			var measure:GsMeasure = beat.Measure.Track.Measures[beat.Measure.Number()];
			if (measure.BeatCount() > 0)
			{
				return measure.Beats[0];
			}
		}
		return nextBeat;
	}
	
	public function GetNextNote(measure:GsMeasure, start:Int, voiceIndex:Int, guitarString:Int) : GsNote
	{
		var beat:GsBeat = GetBeat(measure, start);
		if (beat != null)
		{
			var next:GsBeat = GetNextBeat2(measure.Beats, beat);

			while (next != null)
			{
				var voice:GsVoice = next.Voices[voiceIndex];
				if (!voice.IsEmpty)
				{
					for (current in voice.Notes)
					{
						if (current.String == guitarString || guitarString == -1) return current;
					}
				}
				next = GetNextBeat2(measure.Beats, next);
			}
		}
		return null;
	}
	
	private static function QuickSort(elements:Array<GsBeat>, left:Int, right:Int) : Void
	{
		var i:Int = left;
		var j:Int = right;

		var pivot:GsBeat = elements[Math.floor((left + right) / 2)];
		do
		{
			while ((elements[i].Start < pivot.Start) && (i < right)) i++;
			while ((pivot.Start < elements[j].Start) && (j > left)) j--;
			if (i <= j)
			{
				var temp:GsBeat = elements[i];
				elements[i] = elements[j];
				elements[j] = temp;
				i++; j--;
			}
		} while (i <= j);

		if (left < j) QuickSort(elements, left, j);
		if (i < right) QuickSort(elements, i, right);
	}
}