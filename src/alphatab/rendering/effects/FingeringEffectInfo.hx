package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.glyphs.GlyphGroup;
import alphatab.rendering.IEffectBarRendererInfo;

class FingeringEffectInfo extends NoteEffectInfoBase
{
    private var _maxGlyphCount:Int;
    public function new() 
    {       
        super();
        _maxGlyphCount = 0;
    }
    
    public override function shouldCreateGlyph(renderer:EffectBarRenderer, beat:Beat):Bool 
    {
        var result = super.shouldCreateGlyph(renderer, beat);
        if (_lastCreateInfo.length > _maxGlyphCount) _maxGlyphCount = _lastCreateInfo.length;
        return result;
    }
    
    private override function shouldCreateGlyphForNote(renderer:EffectBarRenderer, note:Note):Bool 
    {
        return (note.leftHandFinger != Note.FingeringNoOrDead && note.leftHandFinger != Note.FingeringUnknown) ||
            (note.rightHandFinger != Note.FingeringNoOrDead && note.rightHandFinger != Note.FingeringUnknown);
    }
    
    public override function getHeight(renderer : EffectBarRenderer) : Int
    {
        return _maxGlyphCount * Std.int(20 * renderer.getScale());
    }
    
    public override function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.SingleOnBeatOnly;
    }

    public override function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new DummyEffectGlyph(0, 0, _lastCreateInfo.length + "fingering");
    }
}