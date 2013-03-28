package alphatab.rendering;
import alphatab.model.Beat;

/**
 * A class implementing this interface can provide the 
 * data needed by a EffectBarRenderer to create effect glyphs dynamically.
 */
interface IEffectBarRendererInfo 
{
    /**
     * Checks whether the given beat has the appropriate effect set and
     * needs a glyph creation 
     * @param renderer the renderer which requests for glyph creation
     * @param beat the beat storing the data 
     * @return true if the beat has the effect set, otherwise false.
     */
    function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool;
    
    /**
     * Gets the sizing mode of the glyphs created by this info.
     * @return the sizing mode to apply to the glyphs during layout.
     */
    function getSizingMode() : EffectBarGlyphSizing;
    
    /**
     * Gets the height of that this effect needs
     * @param renderer the renderer
     * @return the height needed by this effect 
     */
    function getHeight(renderer : EffectBarRenderer) : Int;
    
    /**
     * Creates a new effect glyph for the given beat. 
     * @param renderer the renderer which requests for glyph creation
     * @param beat the beat storing the data 
     * @return the glyph which needs to be added to the renderer
     */
    function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph;
}
