package alphatab.model;

/**
 * This class stores the midi specific information of a track needed
 * for playback.
 */
class PlaybackInformation 
{
    public var volume:Int;
    public var balance:Int;
    
    public var port:Int;
    public var program:Int;
    public var primaryChannel:Int;
    public var secondaryChannel:Int;
    
    public var isMute:Bool;
    public var isSolo:Bool;

    
    public function new() 
    {
        
    }
    
}