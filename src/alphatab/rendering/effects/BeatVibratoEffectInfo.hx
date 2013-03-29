package alphatab.rendering.effects;
import alphatab.model.Beat;
import alphatab.model.VibratoType;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class BeatVibratoEffectInfo implements IEffectBarRendererInfo
{
    public function new() 
    {       
    }
    
    public function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        return (beat.vibrato != VibratoType.None);
    }
    
    public function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.SingleOnBeatToPostBeat;
    }
    
    public function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(20 * renderer.getScale());
    }
    
    public function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new DummyEffectGlyph("b~");
    }
    
}