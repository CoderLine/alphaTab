package alphatab.model;

/**
 * A chord definition.
 */
class Chord 
{
    public var name:String;
    public var firstFret:Int;
    public var strings:Array<Int>;
    
    public function new() 
    {
        strings = new Array<Int>();
    }
    
}