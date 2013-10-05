package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.VibratoType;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.CrescendoType;
import alphatab.rendering.glyphs.effects.CrescendoGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class CrescendoEffectInfo implements IEffectBarRendererInfo
{
    public function new() 
    {       
    }
    
    public function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        return beat.crescendo != CrescendoType.None;
    }
    
    public function canExpand(renderer : EffectBarRenderer, from:Beat, to:Beat): Bool
    {
        return from.crescendo == to.crescendo;
    }
    
    public function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.GroupedPreBeatToPostBeat;
    }
    
    public function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(CrescendoGlyph.Height * renderer.getScale());
    }
    
    public function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new CrescendoGlyph(0, 0, beat.crescendo);
    }    
}