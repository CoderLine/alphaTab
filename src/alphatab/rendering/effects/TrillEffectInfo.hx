package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.glyphs.effects.TextGlyph;
import alphatab.rendering.glyphs.effects.TrillGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class TrillEffectInfo extends NoteEffectInfoBase
{
    public function new() 
    {
        super();
    }
    
    private override function shouldCreateGlyphForNote(renderer:EffectBarRenderer, note:Note):Bool 
    {
        return note.isTrill();
    }
    
    public override function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.SingleOnBeatToPostBeat;
    }
    
    public override function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(20 * renderer.getScale());
    }
    
    public override function createNewGlyph(renderer:EffectBarRenderer, beat:Beat):Glyph 
    {
        return new TrillGlyph();
    }
}