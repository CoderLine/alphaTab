package alphatab.rendering.layout;
import alphatab.model.Bar;
import alphatab.model.Score;
import alphatab.model.Track;
import alphatab.model.Tuning;
import alphatab.platform.Canvas;
import alphatab.rendering.info.BarRenderingInfo;
import alphatab.rendering.RenderingResources;
import alphatab.rendering.ScoreRenderer;
import alphatab.rendering.staves.StaveLine;

class PageViewLayout extends ScoreLayout
{
	public static var SCORE_INFOS = "scoreInfos";
	
    // left top right bottom
    public static var PAGE_PADDING:Array<Int> = [20, 20, 20, 20];
    public static inline var WIDTH_ON_100:Int = 795;

        
    private var _lines:Array<StaveLine>;
    
    public function new(renderer:ScoreRenderer) 
    {
        super(renderer);
        _lines = new Array<StaveLine>();
		renderer.setLayoutSetting(SCORE_INFOS, HeaderFooterElements.ALL);
    }
    
    public override function doLayout()
    {
        var currentBarIndex = 0;
        var endBarIndex = renderer.track.bars.length - 1;
        
        var x = PAGE_PADDING[0];
        var y = PAGE_PADDING[1];
		
		y = doScoreInfoLayout(y);
        
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
	
	private function doScoreInfoLayout(y:Int)
	{
		var flags:Int = cast(renderer.getLayoutSetting(SCORE_INFOS), Int);
		var score:Score = renderer.score;
		var scale:Float = renderer.scale;

        if (score.title != "" && (flags & HeaderFooterElements.TITLE != 0))
        {
            y += Math.floor(35 * scale);
        }
        if (score.subTitle != "" && (flags & HeaderFooterElements.SUBTITLE != 0))
        {
            y += Math.floor(20 * scale);
        }
        if (score.artist != "" && (flags & HeaderFooterElements.ARTIST != 0))
        {
            y += Math.floor(20 * scale);
        }
        if (score.album != "" && (flags & HeaderFooterElements.ALBUM != 0))
        {
            y += Math.floor(20 * scale);
        }
        if (score.music != "" && score.music == score.words && (flags & HeaderFooterElements.WORDS_AND_MUSIC != 0))
        {
            y += Math.floor(20 * scale);
        }
        else 
        {
            if (score.music != "" && (flags & HeaderFooterElements.MUSIC != 0))
            {
                y += Math.floor(20 * scale);
            }
            if (score.words != "" && (flags & HeaderFooterElements.WORDS != 0))
            {
                y += Math.floor(20 * scale);
            }
        }    
        
        y += Math.floor(20 * scale);
        
        // tuning info
        if(!renderer.track.isPercussion)
        {
            var tuning:Tuning = Tuning.findTuning(renderer.track.tuning);
            if(tuning != null)
            {
                // Name
                y += Math.floor(15*scale);
                
                if(!tuning.isStandard)
                {
                    // Strings
                    var stringsPerColumn = Math.ceil(renderer.track.tuning.length/2);
                    y += stringsPerColumn * Math.floor(15*scale);
                }
                
                y += Math.floor(15*scale);
            }
        }
        
        y += Math.floor(40 * scale);
        
        return y;

	}
	
	public override function paintScore():Void 
	{
		var x = PAGE_PADDING[0];
        var y = PAGE_PADDING[1];
		
		y = paintScoreInfo(x, y);
	}
	
	private function drawCentered(text:String, font:String, y:Int)
	{
		renderer.canvas.font = font;
		var x = (width - renderer.canvas.measureText(text)) / 2;
		renderer.canvas.fillText(text, x, y);
	}
	
	private function paintScoreInfo(x:Int, y:Int)
	{
		var flags:Int = cast(renderer.getLayoutSetting(SCORE_INFOS), Int);
		var score:Score = renderer.score;
		var scale:Float = renderer.scale;
		
		var canvas:Canvas = renderer.canvas;
		var res:RenderingResources = renderer.renderingResources;
		
		canvas.fillStyle = "#000000";
		canvas.textBaseline = "top";
        
		var tX:Float;
        var size:Float;
        var str:String = "";
        if (score.title != "" && (flags & HeaderFooterElements.TITLE != 0))
        {
			drawCentered(score.title, res.titleFont, y);
            y += Math.floor(35*scale); 
        }        
        if (score.subTitle != "" && (flags & HeaderFooterElements.SUBTITLE != 0))
        {
			drawCentered(score.subTitle, res.subTitleFont, y);
            y += Math.floor(20*scale);
        }
        if (score.artist != "" && (flags & HeaderFooterElements.ARTIST != 0))
        {
			drawCentered(score.artist, res.subTitleFont, y);
            y += Math.floor(20*scale);
        }
        if (score.album != "" && (flags & HeaderFooterElements.ALBUM != 0))
        {
			drawCentered(score.album, res.subTitleFont, y);
            y += Math.floor(20*scale);
        }
        if (score.music != "" && score.music == score.words && (flags & HeaderFooterElements.WORDS_AND_MUSIC != 0))
        {
			drawCentered(score.words, res.wordsFont, y);
            y += Math.floor(20*scale);
        }
        else 
        {
			canvas.font = res.wordsFont;
            if (score.music != "" && (flags & HeaderFooterElements.MUSIC != 0))
            {
				var size = canvas.measureText(score.music);
				canvas.fillText(score.music, (width - size - PAGE_PADDING[2]), y);
            }
            if (score.words != "" && (flags & HeaderFooterElements.WORDS != 0))
            {
				canvas.fillText(score.music, x, y);
            }
            y += Math.floor(20*scale);
        }    
        
        y += Math.floor(20*scale);
        
        // tuning info
        if(!renderer.track.isPercussion)
        {
            var tuning:Tuning = Tuning.findTuning(renderer.track.tuning);
            if(tuning != null)
            {
                // Name
				canvas.font = res.effectFont;
				canvas.fillText(tuning.name, x, y);
                
                y += Math.floor(15*scale);
                
                if(!tuning.isStandard)
                {
                    // Strings
                    var stringsPerColumn = Math.ceil(renderer.track.tuning.length/2);
                    
                    var currentX = x;
                    var currentY = y;
                    
                    for(i in 0 ... renderer.track.tuning.length)
                    {
                        str = "(" + Std.string(i + 1) + ") = " + Tuning.getTextForTuning(renderer.track.tuning[i], false);
						canvas.fillText(str, currentX, currentY);
                        currentY += Math.floor(15*scale);
                        if(i == stringsPerColumn - 1)
                        {
                            currentY = y;
                            currentX += Math.floor(43*scale);
                        }
                    }
                    
                    y+= stringsPerColumn * Math.floor(15*scale);
                }
            }
        }
        y += Math.floor(25*scale);
        return y;
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