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
package alphatab.model;
import alphatab.file.SongLoader;

/**
 * This utility provides methods
 * for calculation and modifiying of the songmodel.
 */
class SongManager 
{
    public var factory(default,default):SongFactory;
    
    public function new(factory:SongFactory)
    {
        this.factory = factory;
    }
    
    public static function getDivisionLength(header:MeasureHeader) :Int
    {
        var defaulLenght:Int = Duration.QUARTER_TIME;
        var denominator:Int = header.timeSignature.denominator.value;
        switch (denominator)
        {
            case Duration.EIGHTH:
                if (header.timeSignature.numerator % 3 == 0)
                    defaulLenght += Math.floor(Duration.QUARTER_TIME / 2);
        }
        return defaulLenght;
    }
    
    public function getRealStart(measure:Measure, currentStart:Int) : Int
    {
        var beatLength:Int = getDivisionLength(measure.header);
        var start:Int = currentStart;
        var startBeat:Bool = start % beatLength == 0;
        if (!startBeat)
        {
            var minDuration:Duration = factory.newDuration();
            minDuration.value = Duration.SIXTY_FOURTH;
            minDuration.tuplet.enters = 3;
            minDuration.tuplet.times = 2;
            var time : Int = minDuration.time();
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
    
    public static function getFirstBeat(list:Array<Beat>) : Beat
    {
        return list.length > 0 ? list[0] : null;
    }
    
    public function autoCompleteSilences(measure:Measure)
    {
        var beat:Beat = getFirstBeat(measure.beats);
        if (beat == null)
        {
            createSilences(measure, measure.start(), measure.length(), 0);
            return;
        }
        for (v in 0 ... Beat.MAX_VOICES)
        {
            var voice:Voice = getFirstVoice(measure.beats, v);
            if (voice != null && voice.beat.start > measure.start())
                createSilences(measure, measure.start(), voice.beat.start - measure.start(), v);
        }

        var start:Array<Int> = new Array<Int>();
        var uncompletedLength:Array<Int> = new Array<Int>();
        for (i in 0 ... beat.voices.length)
        {
            start.push(0);
            uncompletedLength.push(0);
        }

        while (beat != null)
        {
            for (v  in 0 ... beat.voices.length)
            {
                var voice:Voice = beat.voices[v];
                if (!voice.isEmpty)
                {
                    var voiceEnd:Int = beat.start + voice.duration.time();
                    var nextPosition:Int = measure.start() + measure.length();

                    var nextVoice:Voice = getNextVoice(measure.beats, beat, voice.index);
                    if (nextVoice != null)
                    {
                        nextPosition = nextVoice.beat.start;
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
                    createSilences(measure, start[v], uncompletedLength[v], v);
                }
                start[v] = 0;
                uncompletedLength[v] = 0;
            }
            beat = getNextBeat2(measure.beats, beat);
        }
    }
    
    private function createSilences(measure:Measure, start:Int, length:Int, voiceIndex:Int) : Void
    {
        var nextStart:Int = start;
        var durations:Array<Duration> = createDurations(length);
        for (duration in durations)
        {
            var isNew:Bool = false;
            var beatStart:Int = getRealStart(measure, nextStart);
            var beat:Beat = getBeat(measure, beatStart);
            if (beat == null)
            {
                beat = factory.newBeat();
                beat.start = getRealStart(measure, nextStart);
                isNew = true;
            }

            var voice:Voice = beat.voices[voiceIndex];
            voice.isEmpty = false;
            duration.copy(voice.duration);

            if (isNew)
                measure.addBeat(beat);

            nextStart += duration.time();
        }
    }
    
    private function createDurations(time:Int) : Array<Duration>
    {
        var durations:Array<Duration> = new Array<Duration>();
        var min:Duration = factory.newDuration();
        min.value = Duration.SIXTY_FOURTH;
        min.isDotted = false;
        min.isDoubleDotted = false;
        min.tuplet.enters = 3;
        min.tuplet.times = 2;

        var missing:Int = time;
        while (missing > min.time())
        {
            var duration:Duration = Duration.fromTime(factory, missing, min, 10);
            durations.push(duration.clone(factory));
            missing -= duration.time();
        }
        return durations;
    }
    
    public static function getNextBeat2(beats:Array<Beat>, currentBeat:Beat) : Beat
    {
        var next:Beat = null;
        for (checkedBeat in beats)
        {
            if (checkedBeat.start > currentBeat.start)
            {
                if (next == null || checkedBeat.start < next.start)
                    next = checkedBeat;
            }
        }
        return next;
    }
    
    
    private static function getNextVoice(beats:Array<Beat>, beat:Beat, index:Int) : Voice
    {
        var next:Voice = null;
        for(current in beats)
        {
            if (current.start > beat.start && !current.voices[index].isEmpty)
            {
                if (next == null || current.start < next.beat.start)
                    next = current.voices[index];
            }
        }
        return next;
    }
    
    private static function getFirstVoice(beats:Array<Beat>, index:Int) : Voice
    {
        var first:Voice = null;
        for (current in beats)
        {
            if ((first == null || current.start < first.beat.start) && !current.voices[index].isEmpty)
                first = current.voices[index];
        }
        return first;
    }
    
    private static function getBeat(measure:Measure, start:Int) : Beat
    {
        for (beat in measure.beats)
        {
            if (beat.start == start)
                return beat;
        }
        return null;
    }

    public function orderBeats(measure:Measure) : Void
    {
        quickSort(measure.beats, 0, measure.beatCount() - 1);
    }

    public function getPreviousMeasure(measure:Measure) : Measure
    {
        return measure.number() > 1 ? measure.track.measures[measure.number() - 2] : null;
    }
    
    public function getPreviousMeasureHeader(header:MeasureHeader) : MeasureHeader
    {
        var prevIndex:Int = header.number - 1;
        if (prevIndex > 0)
        {
            return header.song.measureHeaders[prevIndex - 1];
        }
        return null;
    }

    public function getNextBeat(beat:Beat) : Beat
    {
        // Try get next beat uf current measure  
        var nextBeat:Beat = getNextBeat2(beat.measure.beats, beat);

        if (nextBeat == null && beat.measure.track.measureCount() > beat.measure.number())
        {// First beat of next measure if available 
            var measure:Measure = beat.measure.track.measures[beat.measure.number()];
            if (measure.beatCount() > 0)
            {
                return measure.beats[0];
            }
        }
        return nextBeat;
    }
    
    public function getNextNote(measure:Measure, start:Int, voiceIndex:Int, guitarString:Int) : Note
    {
        var beat:Beat = getBeat(measure, start);
        if (beat != null)
        {
            var next:Beat = getNextBeat2(measure.beats, beat);

            while (next != null)
            {
                var voice:Voice = next.voices[voiceIndex];
                if (!voice.isEmpty)
                {
                    for (current in voice.notes)
                    {
                        if (current.string == guitarString || guitarString == -1) return current;
                    }
                }
                next = getNextBeat2(measure.beats, next);
            }
        }
        return null;
    }
    
    private static function quickSort(elements:Array<Beat>, left:Int, right:Int) : Void
    {
        var i:Int = left;
        var j:Int = right;

        var pivot:Beat = elements[Math.floor((left + right) / 2)];
        do
        {
            while ((elements[i].start < pivot.start) && (i < right)) i++;
            while ((pivot.start < elements[j].start) && (j > left)) j--;
            if (i <= j)
            {
                var temp:Beat = elements[i];
                elements[i] = elements[j];
                elements[j] = temp;
                i++; j--;
            }
        } while (i <= j);

        if (left < j) quickSort(elements, left, j);
        if (i < right) quickSort(elements, i, right);
    }
    
    public static function getFirstMeasure(track:Track):Measure
    {
        return track.measureCount() > 0 ? track.measures[0] : null;
    }
}