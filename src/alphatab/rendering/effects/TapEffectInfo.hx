package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class TapEffectInfo extends NoteEffectInfoBase
{
    public function new() 
    {
        super();
    }
    
    public override function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        if (beat.slap || beat.pop) return true;
        return super.shouldCreateGlyph(renderer, beat);
    }
    
    private override function shouldCreateGlyphForNote(renderer:EffectBarRenderer, note:Note):Bool 
    {
        return note.tapping;
    } 
    
    public override function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(20 * renderer.getScale());
    }
    
    public override function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.SingleOnBeatOnly;
    }

    public override function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new DummyEffectGlyph(0,0, "Tap");
    }
}