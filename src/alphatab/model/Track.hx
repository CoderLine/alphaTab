package alphatab.model;

/**
 * This class describes a single track or instrument of score
 */
class Track 
{
    public var capo:Int;
    public var index:Int;
    public var name:String;
    public var shortName:String;
    public var tuning:Array<Int>;
    public var tuningName:String;

    public var playbackInfo:PlaybackInformation;
    public var isPercussion:Bool;
    
    public var score:Score;
    public var bars:Array<Bar>;
    
    public function new() 
    {
        tuning = new Array<Int>();
        bars = new Array<Bar>();
    }
    
    public function addBar(bar:Bar)
    {
        bar.track = this;
        bar.index = bars.length;
        if (bars.length > 0)
        {
            bar.previousBar = bars[bars.length - 1];
            bar.previousBar.nextBar = bar;
        }
        bars.push(bar);
    }
    
}