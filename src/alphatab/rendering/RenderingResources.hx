package alphatab.rendering;
import alphatab.platform.model.Color;
import alphatab.platform.model.Font;

class RenderingResources 
{
    public var copyrightFont:Font;
	public var titleFont:Font;
    public var subTitleFont:Font;
    public var wordsFont:Font;
    public var effectFont:Font;

	public var tablatureFont:Font;

	public var staveLineColor:Color;
	public var barSeperatorColor:Color;

    public function new(scale:Float)
    {
        init(scale);
    }
    
    public function init(scale:Float) : Void
    { 
        var sansFont = "Arial";
        var serifFont = "Times New Roman";
        
		effectFont = new Font(serifFont, 11 * scale, Font.STYLE_ITALIC);
		copyrightFont = new Font(sansFont, 12 * scale, Font.STYLE_BOLD);
		
		titleFont = new Font(serifFont, 32 * scale);
		subTitleFont = new Font(serifFont, 20 * scale);
		wordsFont = new Font(serifFont, 15 * scale);
		
		tablatureFont = new Font(sansFont, 12 * scale); 
		
		staveLineColor = new Color(165, 165, 165);
		barSeperatorColor = new Color(34, 34, 17);
	}
}