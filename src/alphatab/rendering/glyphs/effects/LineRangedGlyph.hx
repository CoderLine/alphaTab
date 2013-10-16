package alphatab.rendering.glyphs.effects;
import alphatab.model.Beat;
import alphatab.platform.ICanvas;
import alphatab.platform.model.TextAlign;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.IMultiBeatEffectGlyph;



class LineRangedGlyph extends Glyph implements IMultiBeatEffectGlyph
{
    private static inline var LineSpacing = 3;
    private static inline var LineTopPadding =8;
    private static inline var LineTopOffset = 6;
    private static inline var LineSize = 8;
    private var _isExpanded:Bool;
    private var _label:String;
    
	public function new(x:Int = 0, y:Int = 0, label:String)
	{
		super(x, y);
        _label = label;
	}	
    
    public function expandedTo(beat:Beat)
    {
        _isExpanded = true;
    }
	
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var step:Float = 11 * getScale();        
        var loops:Int = Math.floor(Math.max(1, (width / step)));
               
        var res = renderer.getResources();
        canvas.setColor(res.mainGlyphColor);
        canvas.setFont(res.effectFont);
        canvas.setTextAlign(TextAlign.Left);
        var textWidth = canvas.measureText(_label);
        canvas.fillText(_label, cx + x, cy + y);
        
        // check if we need lines
        if (_isExpanded)
        {
            var lineSpacing = Std.int(LineSpacing * getScale());
            var startX = cx + x + textWidth + lineSpacing;
            var endX = cx + x + width - lineSpacing - lineSpacing;
            var lineY = cy + y + Std.int(LineTopPadding * getScale());
            var lineSize = Std.int(LineSize * getScale());
                        
            if (endX > startX)
            {
                var lineX = startX;
                canvas.beginPath();
                while (lineX < endX)
                {
                    canvas.beginPath();
                    canvas.moveTo(lineX, lineY);
                    canvas.lineTo(Std.int(Math.min(lineX + lineSize, endX)), lineY);
                    lineX += lineSize + lineSpacing;
                }
                canvas.stroke();
                canvas.moveTo(endX, lineY - Std.int(LineTopOffset * getScale()));
                canvas.lineTo(endX, lineY + Std.int(LineTopOffset * getScale()));
                canvas.stroke();
                
            }
        }
    }
}