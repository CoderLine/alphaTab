package alphatab.rendering.layout;
import alphatab.rendering.ScoreBarRendererFactory;
import alphatab.rendering.ScoreRenderer;
import alphatab.rendering.staves.Stave;
import alphatab.rendering.staves.StaveGroup;
import alphatab.rendering.TabBarRendererFactory;

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
    
    private function createEmptyStaveGroup() : StaveGroup
    {
        var group:StaveGroup = new StaveGroup();
		group.layout = this;
		group.addStave(new Stave(new ScoreBarRendererFactory()));
		group.addStave(new Stave(new TabBarRendererFactory()));
        return group;
    }
}