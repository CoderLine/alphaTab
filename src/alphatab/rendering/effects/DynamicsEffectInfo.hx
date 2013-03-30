package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.glyphs.effects.DynamicsGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class DynamicsEffectInfo implements IEffectBarRendererInfo
{
    public function new() 
    {       
    }
    
    public function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        return (beat.index == 0 && beat.voice.bar.index == 0) || (beat.previousBeat != null && beat.dynamicValue != beat.previousBeat.dynamicValue);
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
        return new DynamicsGlyph(0,0, beat.dynamicValue);
    }
}