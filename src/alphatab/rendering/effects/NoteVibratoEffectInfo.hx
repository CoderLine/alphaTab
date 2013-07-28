package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.VibratoType;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.glyphs.effects.VibratoGlyph;

class NoteVibratoEffectInfo extends NoteEffectInfoBase
{
    public function new() 
    {
        super();
    }
    
    private override function shouldCreateGlyphForNote(renderer:EffectBarRenderer, note:Note):Bool 
    {
        return note.vibrato != VibratoType.None;
    }
    
    public override function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
    }
    
    public override function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(15 * renderer.getScale());
    }
    
    public override function createNewGlyph(renderer:EffectBarRenderer, beat:Beat):Glyph 
    {
        return new VibratoGlyph(0, Std.int(5*renderer.getScale()));
    }
}