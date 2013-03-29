package alphatab.rendering.effects;
import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.VibratoType;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;

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
    
    public override function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(20 * renderer.getScale());
    }
    
    public override function createNewGlyph(renderer:EffectBarRenderer, beat:Beat):Glyph 
    {
        return new DummyEffectGlyph("n~");
    }
}