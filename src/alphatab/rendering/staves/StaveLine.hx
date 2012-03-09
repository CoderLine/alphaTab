package alphatab.rendering.staves;
import alphatab.model.Bar;
import alphatab.rendering.info.BarRenderingInfo;

class StaveLine 
{
    public var renderingInfos:Array<BarRenderingInfo>;
    
    public var x:Int;
    public var y:Int;
    
    /**
     * Indicates whether this line is full or not. If the line is full the
     * bars can be aligned to the maximum width. If the line is not full 
     * the bars will not get stretched.
     */
    public var isFull:Bool;
    /**
     * The width that the content bars actually need
     */
    public var width:Int;
    
    public function new() 
    {
        renderingInfos = new Array<BarRenderingInfo>();
    }
    
    
    public inline function getLastBarIndex() : Int
    {
        return renderingInfos[renderingInfos.length - 1].bar.index;
    }
    
    public function addBarRenderingInfo(info:BarRenderingInfo)
    {
        info.staveLine = this;
        renderingInfos.push(info);
    }
    
    public function analyze(bar:Bar)
    {
        
    }
    
        
    public function calculateHeight() : Int
    {
        return 100;
    }
}