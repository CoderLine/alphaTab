package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.platform.model.TextAlign;
import alphatab.rendering.Glyph;
import alphatab.rendering.TabBarRenderer;
import js.html.Point;

class WhammyBarGlyph extends Glyph
{
    private static inline var WhammyMaxOffset = 60;
    private var _beat:Beat;
    private var _parent:BeatContainerGlyph;
    public function new(beat:Beat, parent:BeatContainerGlyph) 
    {
        super();
        _beat = beat;
        _parent = parent;
    }
    
    override public function doLayout():Void 
    {
        super.doLayout();
        
        // 
        // Calculate the min and max offsets
        var minY = 0;
        var maxY = 0;
        
        var sizeY = Std.int(WhammyMaxOffset * getScale());
        if (_beat.whammyBarPoints.length >= 2)
        {
            var dy = sizeY / Beat.WhammyBarMaxValue;
            for (i in 0 ... _beat.whammyBarPoints.length)
            {
                var pt = _beat.whammyBarPoints[i];
                var ptY = Std.int( 0 - (dy * pt.value));
                if (ptY > maxY) maxY = ptY;
                if (ptY < minY) minY = ptY;
            }
        }
        
        //
        // calculate the overflow 
        var tabBarRenderer:TabBarRenderer = cast renderer;
        var track = renderer.getLayout().renderer.track;
        var tabTop = tabBarRenderer.getTabY(0, -2);
        var tabBottom = tabBarRenderer.getTabY(track.tuning.length, -2);

        var absMinY = y + minY + tabTop; 
        var absMaxY = y + maxY - tabBottom;
        
        if(absMinY < 0)
            tabBarRenderer.registerOverflowTop(Std.int(Math.abs(absMinY)));
        if(absMaxY > 0)
            tabBarRenderer.registerOverflowBottom(Std.int(Math.abs(absMaxY)));
            
        var height = tabBarRenderer.height;
        
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var tabBarRenderer:TabBarRenderer = cast renderer;
        var res = renderer.getResources();
        var startX = cx + x + _parent.onNotes.width / 2;
        var endX = _beat.nextBeat == null || _beat.voice !=  _beat.nextBeat.voice
                ? cx + x + _parent.onNotes.width / 2 + _parent.postNotes.width 
                : cx + tabBarRenderer.getBeatX(_beat.nextBeat);
        var startY = cy + y;
        var textOffset = Std.int(3 * getScale());
        
        var sizeY = Std.int(WhammyMaxOffset * getScale());
        
        canvas.setTextAlign(TextAlign.Center);
        if (_beat.whammyBarPoints.length >= 2)
        {
            var dx = (endX - startX) / Beat.WhammyBarMaxPosition;
            var dy = sizeY / Beat.WhammyBarMaxValue;
            
            canvas.beginPath();
            for (i in 0 ... _beat.whammyBarPoints.length - 1)
            {
                var pt1 = _beat.whammyBarPoints[i];
                var pt2 = _beat.whammyBarPoints[i + 1];
                
                if (pt1.value == pt2.value && i == _beat.whammyBarPoints.length - 2) continue;
                
                var pt1X = Std.int(startX + (dx * pt1.offset));
                var pt1Y = Std.int(startY - (dy * pt1.value));
                
                var pt2X = Std.int(startX + (dx * pt2.offset));
                var pt2Y = Std.int(startY - (dy * pt2.value));
                
                canvas.moveTo(pt1X, pt1Y);
                canvas.lineTo(pt2X, pt2Y);
                
                if (pt2.value != 0)
                {
                    var dv = pt2.value / 4.0;
                    var up = (pt2.value - pt1.value) >= 0;
                    var s = "";
                    if (dv < 0) s += "-";
                    
                    if (dv >= 1 || dv <= -1)
                        s += Std.string(Math.floor(Math.abs(dv))) + " ";
                    
                    dv -= Math.floor(dv);
                    if (dv == 0.25)
                        s += "1/4";
                    else if (dv == 0.5)
                        s += "1/2";
                    else if (dv == 0.75)
                        s += "3/4";
                    
                    canvas.setFont(res.graceFont);
                    var size = canvas.measureText(s);
                    var sy = up 
                                ? pt2Y - res.graceFont.getSize() - textOffset
                                : pt2Y + textOffset;
                    var sx = pt2X;
                    canvas.fillText(s, sx, sy);
                    
                }
            }
            canvas.stroke();
        }
    }
}