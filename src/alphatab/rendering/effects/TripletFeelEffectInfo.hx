package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.model.TripletFeel;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class TripletFeelEffectInfo implements IEffectBarRendererInfo
{
    public function new() 
    {       
    }
    
    public function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        return beat.index == 0 && 
                (beat.voice.bar.getMasterBar().index == 0 && beat.voice.bar.getMasterBar().tripletFeel != TripletFeel.NoTripletFeel) 
                || (beat.voice.bar.getMasterBar().index > 0 && beat.voice.bar.getMasterBar().tripletFeel != beat.voice.bar.getMasterBar().previousMasterBar.tripletFeel);
    }
    
    public function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(20 * renderer.getScale());
    }
    
    public function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.SinglePreBeatOnly;
    }

    public function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new DummyEffectGlyph(0,0,"TripletFeel");
    }
}