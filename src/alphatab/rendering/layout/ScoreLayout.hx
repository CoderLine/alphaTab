package alphatab.rendering.layout;
import alphatab.rendering.ScoreRenderer;
import alphatab.rendering.staves.StaveLine;

/**
 * This is the base class for creating new layouting engines for the score renderer. 
 */
class ScoreLayout 
{
    public var renderer:ScoreRenderer;
    
    private function new(renderer:ScoreRenderer) 
    {
        this.renderer = renderer;
    }
 
    public function doLayout()
    {
        
    }
    
    private function createEmptyStaveLine() : StaveLine
    {
        var line:StaveLine = new StaveLine();
        // TODO: Add all stave types to it
        return line;
    }
}