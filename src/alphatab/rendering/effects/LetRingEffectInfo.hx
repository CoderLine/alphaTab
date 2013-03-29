package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class LetRingEffectInfo extends NoteEffectInfoBase
{
    public function new() 
    {       
        super();
    }
    
    private override function shouldCreateGlyphForNote(renderer:EffectBarRenderer, note:Note):Bool 
    {
        return note.isLetRing;
    }
    
    public override function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(20 * renderer.getScale());
    }
    
    public override function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
    }

    public override function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new DummyEffectGlyph(0,0, "LetRing");
    }
}