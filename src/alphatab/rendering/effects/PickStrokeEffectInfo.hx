package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.model.PickStrokeType;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.glyphs.effects.PickStrokeGlyph;
import alphatab.rendering.glyphs.effects.TextGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class PickStrokeEffectInfo implements IEffectBarRendererInfo
{
    public function new() 
    {       
    }
    
    public function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        return beat.pickStroke != PickStrokeType.None;
    }
    
    public function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(20 * renderer.getScale());
    }
    
    public function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.SingleOnBeatOnly;
    }

    public function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new PickStrokeGlyph(0, 0, beat.pickStroke);
    }
}