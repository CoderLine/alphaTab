package alphatab.rendering.info;
import alphatab.model.Bar;
import alphatab.rendering.staves.StaveLine;

class BarRenderingInfo 
{
    public var bar:Bar;    
    public var staveLine:StaveLine;
    
    /**
     * Relative X position within a StaveLine
     */
    public var x:Int;
    
    public var width:Int;
    
    public function new(bar:Bar) 
    {
        this.bar = bar;
    }
    
    public function doLayout()
    {
        
    }
    
    public function applySpacing(spacing:Int)
    {
        
    }
}