package alphatab.rendering.layout;
import alphatab.rendering.ScoreRenderer;
import alphatab.rendering.staves.StaveLine;

/**
 * This is the base class for creating new layouting engines for the score renderer. 
 */
class ScoreLayout 
{
    public var renderer:ScoreRenderer;
    
    public var width:Int;
    public var height:Int;

    private function new(renderer:ScoreRenderer) 
    {
        this.renderer = renderer;
    }
 
    public function doLayout()
    {
        
    }
 
    public function paintScore() : Void
    {
        
    }
    
    private function createEmptyStaveLine() : StaveLine
    {
        var line:StaveLine = new StaveLine();
        // TODO: Add all stave types to it
        return line;
    }
}