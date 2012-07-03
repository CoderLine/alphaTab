package alphatab.rendering.utils;
import alphatab.AlphaTestRunner;
import alphatab.audio.MidiUtils;
import alphatab.model.Bar;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Note;

enum BeamDirection
{
    Up;
    Down;
}

typedef BeatLinePositions = {
    up:Int,
    down:Int
}

/**
 * This class helps drawing beams and bars for notes.
 * 
 */
class BeamingHelper 
{
    private static var SCORE_MIDDLE_KEYS:Array<Int> = [ 48, 45, 38, 59 ];

    public var beats:Array<Beat>;
    private var _lastBeat:Beat;
    
    /**
     * the first min note within this group
     */
    public var firstMinNote:Note;
    /**
     * the first max note within this group
     */
    public var firstMaxNote:Note;
    
    /**
     * the last min note within this group
     */
    public var lastMinNote:Note;
    /**
     * the last max note within this group
     */
    public var lastMaxNote:Note;
    
    /**
     * the overall min note within this group
     */
    public var minNote:Note;
    /**
     * the overall max note within this group
     */
    public var maxNote:Note;
    
    public var valueCalculator : Note -> Int;
    
    public function new()
    {
        beats = new Array<Beat>();
        valueCalculator = function(n) { return n.realValue(); };
        _beatLineXPositions = new IntHash<BeatLinePositions>();
    }
    
    // stores the X-positions for beat indices
    private var _beatLineXPositions:IntHash<BeatLinePositions>;
    
    public function getBeatLineX(beat:Beat)
    {
        if (_beatLineXPositions.exists(beat.index)) 
        {
            if (getDirection() == BeamDirection.Up)
            {
                return _beatLineXPositions.get(beat.index).up;
            }
            else
            {
                return _beatLineXPositions.get(beat.index).down;
            }
        }
        return 0;
    }
    
    public function registerBeatLineX(beat:Beat, up:Int, down:Int)
    {
        _beatLineXPositions.set(beat.index, {up:up, down:down});
    }
    
    public function getDirection() : BeamDirection
    { 
        // the average key is used for determination
        //      key lowerequal than middle line -> up
        //      key higher than middle line -> down
        var avg = Std.int((valueCalculator(maxNote) + valueCalculator(minNote)) / 2);
        return avg <= SCORE_MIDDLE_KEYS[Type.enumIndex(_lastBeat.voice.bar.clef)] ? Up : Down;
    }
     
    public function checkBeat(beat:Beat) : Bool
    {
        // allow adding if there are no beats yet
        var add:Bool = false;
        if (beats.length == 0)
        {
            add = true;
        }
        else if (canJoin(_lastBeat, beat)) 
        {
            add = true;
        }
        
        if (add)
        {
            _lastBeat = beat;
            beats.push(beat);
            checkNote(beat.minNote);
            checkNote(beat.maxNote);
        }
        
        return add;
    }    
    
    private function checkNote(note:Note)
    {
        var value:Int = note.realValue();

        // detect the smallest note which is at the beginning of this group
        if (firstMinNote == null || note.beat.voice.index  < firstMinNote.beat.voice.index)
        {
            firstMinNote = note;
        }
        else if (note.beat.voice.index == firstMinNote.beat.voice.index)
        {
            if (note.realValue() < firstMinNote.realValue())
            {
                firstMinNote = note;
            }
        }
        
        // detect the biggest note which is at the beginning of this group
        if (firstMaxNote == null || note.beat.voice.index < firstMaxNote.beat.voice.index)
        {
            firstMaxNote = note;
        }
        else if (note.beat.voice.index == firstMaxNote.beat.voice.index)
        {
            if (note.realValue() > firstMaxNote.realValue())
            {
                firstMaxNote = note;
            }
        }

        // detect the smallest note which is at the end of this group
        if (lastMinNote == null || note.beat.voice.index > lastMinNote.beat.voice.index)
        {
            lastMinNote = note;
        }
        else if (note.beat.voice.index == lastMinNote.beat.voice.index)
        {
            if (note.realValue() < lastMinNote.realValue())
            {
                lastMinNote = note;
            }
        }
        // detect the biggest note which is at the end of this group
        if (lastMaxNote == null || note.beat.voice.index > lastMaxNote.beat.voice.index)
        {
            lastMaxNote = note;
        }
        else if (note.beat.voice.index == lastMaxNote.beat.voice.index)
        {
            if (note.realValue() > lastMaxNote.realValue())
            {
                lastMaxNote = note;
            }
        }

        if (maxNote == null || value > maxNote.realValue())
        {
            maxNote = note;
        }
        if (minNote == null || value < minNote.realValue())
        {
            minNote = note;
        }
    }
    
    private static function canJoin(b1:Beat, b2:Beat)
    {
        // is this a voice we can join with?
        if (b1 == null || b2 == null || b1.isRest() || b2.isRest())
        {
            return false;
        } 
        
        var m1 = b1.voice.bar;
        var m2 = b1.voice.bar;
        // only join on same measure
        if (m1 != m2) return false;
        
        // get times of those voices and check if the times 
        // are in the same division
        var start1 = b1.start;
        var start2 = b2.start;
        
        // we can only join 8th, 16th, 32th and 64th voices
        if (!canJoinDuration(b1.duration) || !canJoinDuration(b2.duration))
        {
            return start1 == start2;
        }
        
        
        // TODO: create more rules for automatic beaming
        var divisionLength:Int = MidiUtils.QUARTER_TIME;
        switch (m1.getMasterBar().timeSignatureDenominator)
        {
            case 8:
                if (m1.getMasterBar().timeSignatureNumerator % 3 == 0)
                {
                    divisionLength += Math.floor(MidiUtils.QUARTER_TIME / 2);
                }
        }

        // check if they are on the same division 
        var division1 = Std.int((divisionLength + start1) / divisionLength);
        var division2 = Std.int((divisionLength + start2) / divisionLength);
        
        return division1 == division2;
    }   
    
    private static function calculateDivision(b:Beat, l:Int)
    {
        var start = 0; 
    }
    
    private static function canJoinDuration(d:Duration)
    {
        switch (d) 
        {
            case Whole, Half, Quarter: return false;
            default: return true;
        }
    }
}