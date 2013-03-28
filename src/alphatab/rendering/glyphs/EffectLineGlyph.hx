package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.RenderingResources;

class EffectLineGlyph extends GlyphGroup
{
    public var height:Int;
    public var effect:EffectBarEffects;
    
    public function new(effect:EffectBarEffects) 
    {
        super();
        this.effect = effect;
    }
    
    public override function doLayout():Void 
    {
        height = Std.int(20 * getScale());
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var res:RenderingResources = this.renderer.getResources();
        
        canvas.setColor(new Color(0, 0, 0, 100));
        canvas.fillRect(cx + x, cy + y, width, height);
        
        canvas.setFont(res.tablatureFont);
        canvas.setColor(res.barNumberColor);
        canvas.fillText(Std.string(effect), cx + x, cy + y);
    }
}