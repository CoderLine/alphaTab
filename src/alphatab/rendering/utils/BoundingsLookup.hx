package alphatab.rendering.utils;
import alphatab.model.Bar;
import alphatab.model.Beat;

class BeatBoundings
{
    public var beat:Beat;
    public var x:Int;
    public var y:Int;
    public var w:Int;
    public var h:Int;
    
    public function new()
    {
        
    }
}

class BarBoundings
{
    public var bar:Bar;
    public var x:Int;
    public var y:Int;
    public var w:Int;
    public var h:Int;
    
    public var beats:Array<BeatBoundings>;
    
    public function new()
    {
        beats = new Array<BeatBoundings>();
    }
}

class BoundingsLookup
{
    public var bars:Array<BarBoundings>;
    
    public function new() 
    {
        bars = new Array<BarBoundings>();
    }
    
}