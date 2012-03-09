package alphatab.rendering.layout;
import alphatab.model.Bar;
import alphatab.rendering.info.BarRenderingInfo;
import alphatab.rendering.ScoreRenderer;
import alphatab.rendering.staves.StaveLine;

class PageViewLayout extends ScoreLayout
{
    // left top right bottom
    public static var PAGE_PADDING:Array<Int> = [20, 40, 20, 40];
    public static inline var WIDTH_ON_100:Int = 795;

        
    private var _lines:Array<StaveLine>;
    
    public var width:Int;
    public var height:Int;
    
    public function new(renderer:ScoreRenderer) 
    {
        super(renderer);
        _lines = new Array<StaveLine>();
    }
    
    public override function doLayout()
    {
        var currentBarIndex = 0;
        var endBarIndex = renderer.track.bars.length - 1;
        
        var x = PAGE_PADDING[0];
        var y = PAGE_PADDING[1];
        
        while (currentBarIndex <= endBarIndex)
        {
            var line:StaveLine = createStaveLine(currentBarIndex);
            _lines.push(line);
            
            line.x = x;
            line.y = y;
            
            fitLine(line);
            
            y += line.calculateHeight();
            
            currentBarIndex = line.getLastBarIndex() + 1;
        }
        
        height = y + PAGE_PADDING[3];
        width = Std.int(WIDTH_ON_100 * renderer.scale);
    }
    
    /**
     * Realignes the bars in this line according to the available space
     */
    private function fitLine(line:StaveLine)
    {
        // calculate additional space for each bar (can be negative!)
        var barSpace:Int = 0;
        if (line.isFull) 
        {
            var freeSpace = getMaxWidth() - line.width;
           
            if (freeSpace != 0 && line.renderingInfos.length > 0) 
            {
                barSpace = Math.round(freeSpace / line.renderingInfos.length);
            }
        }
        
        // add it to the measures
        var barX:Int = 0;
        for (info in line.renderingInfos)
        {
            info.applySpacing(barSpace);
            info.x = barX;
            
            barX += info.width + barSpace;
        }
        
        line.width = barX;
        
        width = Math.round(Math.max(width, barX));    
    }
    
    private function createStaveLine(currentBarIndex:Int) : StaveLine
    {
        var line:StaveLine = createEmptyStaveLine();
        
        var x = 0;
        var maxWidth = getMaxWidth();
        for (i in currentBarIndex ... renderer.track.bars.length)
        {
            var bar:Bar = renderer.track.bars[i];
            
            var info:BarRenderingInfo = new BarRenderingInfo(bar);
            info.doLayout();
            
            var lineIsFull:Bool = false;
            
            // can bar placed in this line?
            if ( (x + info.width) >= maxWidth && line.renderingInfos.length != 0)
            {
                lineIsFull = true;
            }
            
            
            if (lineIsFull)
            {
                line.isFull = true;
                line.width = x;
                return line;
            }
            
            info.x = x;
            x += info.width;
            
            line.analyze(bar);
            line.addBarRenderingInfo(info);
        }
        
        return line;
    }
    
    private inline function getMaxWidth() : Int
    {
        return (renderer.canvas.width - PAGE_PADDING[0] - PAGE_PADDING[2]);
    }
    
}