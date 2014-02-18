package alphatab.rendering.utils;
import alphatab.model.Bar;
import alphatab.model.Beat;

class Bounds
{
    public var x:Int;
    public var y:Int;
    public var w:Int;
    public var h:Int;

    public function new(x:Int, y:Int, w:Int, h:Int)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class BeatBoundings
{
    public var beat:Beat;
    public var bounds:Bounds;
    public var visualBounds:Bounds;
    
    public function new()
    {
        
    }
}

class BarBoundings
{
    public var bar:Bar;
    public var bounds:Bounds;
    public var visualBounds:Bounds;
    
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