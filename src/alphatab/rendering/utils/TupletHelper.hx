package alphatab.rendering.utils;
import alphatab.model.Beat;

class TupletHelper
{
    public var beats:Array<Beat>;
    public var voiceIndex:Int;
    public var tuplet : Int;
    
    private var _isFinished:Bool;

    public function new(voice:Int) 
    {
        voiceIndex = voice;
        beats = new Array<Beat>();
    }
        
    public inline function isFull()
    {
        return beats.length == tuplet;
    }
    
    public function finish()
    {
        _isFinished = true;
    }
    
    public function check(beat:Beat) : Bool
    {
        if (beats.length == 0)
        { 
            tuplet = beat.tupletNumerator;
        }
        else
        {
            if (beat.voice.index != voiceIndex || beat.tupletNumerator != tuplet || isFull() || _isFinished) return false;
        }
        beats.push(beat);        
        return true;
    }    
}