package alphatab.model;

/**
 * Automations are used to change the behaviour of a song.
 */
class Automation 
{
    public var isLinear:Bool;
    public var type:AutomationType;
    public var value:Float;
    public var duration:Int;
    
    public function new() 
    {
        
    }
    
}