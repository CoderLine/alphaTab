package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Font;
import alphatab.platform.model.TextAlign;
import alphatab.rendering.Glyph;
import alphatab.rendering.TabBarRenderer;



class TabClefGlyph extends Glyph
{
    public function new() 
    {
        super(0, 0);        
    }
		
	public override function doLayout():Void 
	{
		width = Std.int(28 * getScale());
	}
	
	public override function canScale():Bool 
    {
        return false;
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var tabBarRenderer:TabBarRenderer = cast renderer;
        var track = renderer.getLayout().renderer.track;
        var res = renderer.getResources();
        
        var startY = cy + y + TabBarRenderer.LineSpacing * getScale() * 0.6;
        var endY = cy + y + tabBarRenderer.getTabY(track.tuning.length, -2);
        
        // TODO: Find a more generic way of calculating the font size but for now this works.
        var fontScale:Float = 1;
        var correction:Float = 0;
        switch(track.tuning.length)
        {
            case 4: fontScale = 0.6;  
            case 5: fontScale = 0.8;
            case 6: fontScale = 1.1; correction = 3;
            case 7: fontScale = 1.15;
            case 8: fontScale = 1.35;
        }
                
        var font = res.tabClefFont.clone();
        font.setSize(font.getSize() * fontScale);
        
        canvas.setColor(res.mainGlyphColor);
        canvas.setFont(font);
        canvas.setTextAlign(TextAlign.Center);
        
        canvas.fillText("T", cx + x + Std.int(width/2), startY);
        canvas.fillText("A", cx + x + Std.int(width/2), startY + font.getSize() - Std.int(correction * getScale()));
        canvas.fillText("B", cx + x + Std.int(width/2), startY + (font.getSize() - Std.int(correction* getScale())) * 2);
    }
}