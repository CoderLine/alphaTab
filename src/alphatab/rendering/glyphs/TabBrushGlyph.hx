package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.BrushType;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.TabBarRenderer;

class TabBrushGlyph extends Glyph
{
    private var _beat:Beat;
    
    public function new(beat:Beat) 
    {
        super(0, 0);        
        _beat = beat;
    }
    
    public override function doLayout():Void 
    {
        width = Std.int(10 * getScale());
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var tabBarRenderer:TabBarRenderer = cast renderer;
        var res = renderer.getResources();
        var startY = cy + y + Std.int(tabBarRenderer.getNoteY(_beat.maxNote()) - res.tablatureFont.getSize() / 2);
        var endY = cy + y + tabBarRenderer.getNoteY(_beat.minNote()) + res.tablatureFont.getSize() / 2;
        var arrowX = Std.int(cx + x + width / 2);
        var arrowSize = 8 * getScale();
        
        canvas.setColor(res.mainGlyphColor);
        if (_beat.brushType != BrushType.None)
        {
            if (_beat.brushType == BrushType.BrushUp || _beat.brushType == BrushType.BrushDown)
            {
                canvas.beginPath();
                canvas.moveTo(arrowX, startY);
                canvas.lineTo(arrowX, endY);
                canvas.stroke();
            }
            else
            {
                var size = Std.int(15 * getScale());
                var steps = Math.floor(Math.abs(endY - startY) / size);
                for (i in 0 ... steps)
                {
                    var arrow = new SvgGlyph(Std.int(3 * getScale()), 0, MusicFont.WaveVertical, 1, 1);
                    arrow.renderer = renderer;
                    arrow.doLayout();
                    
                    arrow.paint(cx + x, startY + (i * size), canvas);
                }
            }
            
            if (_beat.brushType == BrushType.BrushUp || _beat.brushType == BrushType.ArpeggioUp)
            {
                canvas.beginPath();
                canvas.moveTo(arrowX, endY);
                canvas.lineTo(Std.int(arrowX + arrowSize / 2), Std.int(endY - arrowSize));
                canvas.lineTo(Std.int(arrowX - arrowSize / 2), Std.int(endY - arrowSize));
                canvas.closePath();
                canvas.fill();
            }
            else
            {
                canvas.beginPath();
                canvas.moveTo(arrowX, startY);
                canvas.lineTo(Std.int(arrowX + arrowSize / 2), Std.int(startY + arrowSize));
                canvas.lineTo(Std.int(arrowX - arrowSize / 2), Std.int(startY + arrowSize));
                canvas.closePath();
                canvas.fill();
            }        
        }
    }
}