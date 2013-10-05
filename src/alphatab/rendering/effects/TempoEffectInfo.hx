package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.glyphs.effects.TempoGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class TempoEffectInfo implements IEffectBarRendererInfo
{
    public function new() 
    {       
    }
    
    public function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        return beat.index == 0 && (beat.voice.bar.getMasterBar().tempoAutomation != null || beat.voice.bar.index == 0);
    }
    
    public function canExpand(renderer : EffectBarRenderer, from:Beat, to:Beat): Bool
    {
        return true;
    } 
    
    public function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(25 * renderer.getScale());
    }
    
    public function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.SinglePreBeatOnly;
    }

    public function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        var tempo:Int;
        if (beat.voice.bar.getMasterBar().tempoAutomation != null)
        {
            tempo = Std.int(beat.voice.bar.getMasterBar().tempoAutomation.value);
        }
        else
        {
            tempo = beat.voice.bar.track.score.tempo;
        }
        return new TempoGlyph(0, 0, tempo);
    }
}