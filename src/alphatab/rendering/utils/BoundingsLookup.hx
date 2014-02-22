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
    public var isFirstOfLine:Bool;
    public var isLastOfLine:Bool;
    public var bar:Bar;
    public var bounds:Bounds;
    public var visualBounds:Bounds;
    
    public var beats:Array<BeatBoundings>;
    
    public function new()
    {
        beats = new Array<BeatBoundings>();
    }
    
    public function findBeatAtPos(x:Int) : Beat
    {
        var index = 0;
        // move right as long we didn't pass our x-pos
        while (index < (beats.length - 1) && x > (beats[index].bounds.x + beats[index].bounds.w))
        {
            index++;
        }
        
        return beats[index].beat;
    }    
}

class BoundingsLookup
{
    public var bars:Array<BarBoundings>;
    
    public function new() 
    {
        bars = new Array<BarBoundings>();
    }
    
    public function getBeatAtPos(x:Int, y:Int)
    {
        //
        // find a bar which matches in y-axis
        var bottom = 0;
        var top = bars.length - 1;
        
        var barIndex = -1;
        while (bottom <= top)
        {
            var middle = Std.int( (top + bottom) / 2);
            var bar = bars[middle];
            
            // found?
            if (y >= bar.bounds.y && y <= (bar.bounds.y + bar.bounds.h))
            {
                barIndex = middle;
                break;
            }            
            // search in lower half 
            else if (y < bar.bounds.y)
            {
                top = middle - 1;
            }
            // search in upper half
            else
            {
                bottom = middle + 1;
            }
        }

        // no bar found
        if (barIndex == -1) return null;
        
        // 
        // Find the matching bar in the row
        var currentBar = bars[barIndex];
        
        // clicked before bar
        if (x < currentBar.bounds.x)
        {
            // we move left till we either pass our x-position or are at the beginning of the line/score
            while (barIndex > 0 && x < bars[barIndex].bounds.x && !bars[barIndex].isFirstOfLine)
            {
                barIndex--;                
            }
        }
        else
        {
            // we move right till we either pass our our x-position or are at the end of the line/score
            while (barIndex < (bars.length-1) && x > (bars[barIndex].bounds.x + bars[barIndex].bounds.w) && !bars[barIndex].isLastOfLine)
            {
                barIndex++;
            }
        }
        
        // 
        // Find the matching beat within the bar
        return bars[barIndex].findBeatAtPos(x);
        
    }
    
}