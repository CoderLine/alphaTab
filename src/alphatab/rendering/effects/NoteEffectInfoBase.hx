package alphatab.rendering.effects;
import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.IEffectBarRendererInfo;

class NoteEffectInfoBase implements IEffectBarRendererInfo
{
    private var _lastCreateInfo:Array<Note>;
    public function new() 
    {       
    }
    
    public function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        _lastCreateInfo = new Array<Note>();
        for (n in beat.notes)
        {
            if (shouldCreateGlyphForNote(renderer, n))
            {
                _lastCreateInfo.push(n);
            }
        }
        return _lastCreateInfo.length > 0;
    }
    
    private function shouldCreateGlyphForNote(renderer : EffectBarRenderer, note:Note) : Bool
    {
        return false;
    }
    
    public function getHeight(renderer : EffectBarRenderer) : Int
    {
        return 0;
    }
    
    public function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
    }

    public function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return null;
    }
    
}