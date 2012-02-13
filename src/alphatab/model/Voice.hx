package alphatab.model;

class Voice 
{
    public var index:Int;
    
    public var bar:Bar;
    public var beats:Array<Beat>;
    
    public function new() 
    {
        beats = new Array<Beat>();
    }
    
    public function addBeat(beat:Beat)
    {
        beat.voice = this;
        beat.index = beats.length;
        if (beats.length > 0)
        {
            beat.previousBeat = beats[beats.length - 1];
            beat.previousBeat.nextBeat = beat;
        }
        beats.push(beat);
    }
    
}