package alphatab.model;

/**
 * A bar is a single block within a track, also known as Measure.
 */
class Bar 
{
    public var index:Int;
    public var nextBar:Bar;
    public var previousBar:Bar;
    
    public var clef:Clef;
    
    public var track:Track;
    public var voices:Array<Voice>;
    
    
    public function new() 
    {
        voices = new Array<Voice>();
        clef = Clef.G2;
    }
    
    public function addVoice(voice:Voice)
    {
        voice.bar = this;
        voice.index = voices.length;
        voices.push(voice);
    }
}