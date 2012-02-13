package alphatab.model;

/**
 * The MasterBar stores information about a bar which affects
 * all tracks.
 */
class MasterBar 
{
    public var alternateEndings:Int;
    public var nextMasterBar:MasterBar;
    public var previousMasterBar:MasterBar;
    public var index:Int;
    public var keySignature:Int;
    public var isDoubleBar:Bool;
    
    public var isRepeatStart:Bool;
    public inline function isRepeatEnd():Bool { return repeatCount > 0; }
    public var repeatCount:Int;
 
    public var timeSignatureDenominator:Int;
    public var timeSignatureNumerator:Int;
    
    public var tripletFeel:TripletFeel;
    
    public var section:Section;
    public inline function isSectionStart():Bool { return section != null; }
    
    public var tempoAutomation:Automation;
    public var volumeAutomation:Automation;
    
    public var score:Score;
    
    public function new() 
    {
        alternateEndings = 0;
        repeatCount = 0;
    }
    
}