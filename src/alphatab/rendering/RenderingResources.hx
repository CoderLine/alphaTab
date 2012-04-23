package alphatab.rendering;

class RenderingResources 
{
    public var copyrightFont:String;
	public var titleFont:String;
    public var subTitleFont:String;
    public var wordsFont:String;
    public var effectFont:String;


    public function new(scale:Float)
    {
        init(scale);
    }
    
    public function init(scale:Float) : Void
    { 
        var sansFont = "'Arial'";
        var serifFont = "'Times New Roman'";
        
		effectFont = "italic " + formatFontSize(11 * scale) + " " + serifFont;

        copyrightFont =  "bold " + formatFontSize(12 * scale) + " " + sansFont;
		
		titleFont =  formatFontSize(32*scale) + " " + serifFont;
        subTitleFont = formatFontSize(20 * scale) + " " + serifFont;
        wordsFont =  formatFontSize(15 * scale) + " " + serifFont;
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