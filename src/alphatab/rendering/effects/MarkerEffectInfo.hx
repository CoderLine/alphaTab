package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class MarkerEffectInfo implements IEffectBarRendererInfo
{
    public function new() 
    {       
    }
    
    public function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        return beat.index == 0 && beat.voice.bar.getMasterBar().isSectionStart();
    }
    
    public function getHeight(renderer : EffectBarRenderer) : Int
    {
        return 0;
    }
    
    public function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.SinglePreBeatOnly;
    }

    public function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new DummyEffectGlyph(0,0, "Marker");
    }
    
}