package alphatab.rendering;

class RenderingResources 
{
    public var copyrightFont:String;

    public function new(scale:Float)
    {
        init(scale);
    }
    
    public function init(scale:Float) : Void
    { 
        var sansFont = "'Arial'";
        var serifFont = "'Times New Roman'";
        
        copyrightFont =  "bold " + formatFontSize(11 * scale) + " " + sansFont;
    }
    
    private static function formatFontSize(size:Float) 
    {
        // round to 2 decimal places
        var num = size;
        num = num * Math.pow(10, 2);
        num = Math.round( num ) / Math.pow(10, 2);
        return Std.string(num) + "px";
    }
}