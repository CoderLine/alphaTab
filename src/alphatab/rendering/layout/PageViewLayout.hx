/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.rendering.layout;

import alphatab.model.Bar;
import alphatab.model.Score;
import alphatab.model.Track;
import alphatab.model.Tuning;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.platform.model.Font;
import alphatab.platform.model.TextAlign;
import alphatab.rendering.BarRendererBase;
import alphatab.rendering.RenderingResources;
import alphatab.rendering.ScoreRenderer;
import alphatab.rendering.staves.StaveGroup;

/**
 * This layout arranges the bars into a fixed width and dynamic height region. 
 */
class PageViewLayout extends ScoreLayout
{
	public static var SCORE_INFOS = "scoreInfos";
	
    // left top right bottom
    public static var PAGE_PADDING:Array<Int> = [20, 20, 20, 20];
    public static inline var WIDTH_ON_100:Int = 795;

        
    private var _groups:Array<StaveGroup>;
    
    public function new(renderer:ScoreRenderer) 
    {
        super(renderer);
        _groups = new Array<StaveGroup>();
    }
	
	public static inline var GroupSpacing = 20;
    
    public override function doLayout()
    {
		_groups = new Array<StaveGroup>();
        var currentBarIndex = 0;
        var endBarIndex = renderer.track.bars.length - 1;
        
        var x = PAGE_PADDING[0];
        var y = PAGE_PADDING[1];
		
		y = doScoreInfoLayout(y);
        
        while (currentBarIndex <= endBarIndex)
        {
            var group:StaveGroup = createStaveGroup(currentBarIndex);
            _groups.push(group);
            
            group.x = x;
            group.y = y;
            
            fitGroup(group);
            group.finalizeGroup(this);
			
            y += group.calculateHeight() + Std.int(GroupSpacing * renderer.scale);
            
            currentBarIndex = group.getLastBarIndex() + 1;
        }
        
        height = y + PAGE_PADDING[3];
        width = Std.int(WIDTH_ON_100 * renderer.scale);
    }
	
	private function doScoreInfoLayout(y:Int)
	{
        // TODO: Check if it's a good choice to provide the complete flags as setting
		var flags:Int = renderer.settings.layout.get("hideInfo", false) ? HeaderFooterElements.NONE : HeaderFooterElements.ALL;
		var score:Score = renderer.score;
		var scale:Float = renderer.scale;

        if (!isNullOrEmpty(score.title) && (flags & HeaderFooterElements.TITLE != 0))
        {
            y += Math.floor(35 * scale);
        }
        if (!isNullOrEmpty(score.subTitle) && (flags & HeaderFooterElements.SUBTITLE != 0))
        {
            y += Math.floor(20 * scale);
        }
        if (!isNullOrEmpty(score.artist) && (flags & HeaderFooterElements.ARTIST != 0))
        {
            y += Math.floor(20 * scale);
        }
        if (!isNullOrEmpty(score.album) && (flags & HeaderFooterElements.ALBUM != 0))
        {
            y += Math.floor(20 * scale);
        }
        if (!isNullOrEmpty(score.music) && score.music == score.words && (flags & HeaderFooterElements.WORDS_AND_MUSIC != 0))
        {
            y += Math.floor(20 * scale);
        }
        else 
        {
            if (!isNullOrEmpty(score.music) && (flags & HeaderFooterElements.MUSIC != 0))
            {
                y += Math.floor(20 * scale);
            }
            if (!isNullOrEmpty(score.words) && (flags & HeaderFooterElements.WORDS != 0))
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
		
        for (g in _groups)
		{
			g.paint(0, 0, renderer.canvas);
		}
	}
	
	private function drawCentered(text:String, font:Font, y:Int)
	{
		renderer.canvas.setFont(font);
		renderer.canvas.fillText(text, width/2, y);
	}
	
	private function paintScoreInfo(x:Int, y:Int)
	{
		var flags:Int = renderer.settings.layout.get("hideInfo", false) ? HeaderFooterElements.NONE : HeaderFooterElements.ALL;
		var score:Score = renderer.score;
		var scale:Float = renderer.scale;
		
		var canvas:ICanvas = renderer.canvas;
		var res:RenderingResources = renderer.renderingResources;
		
		canvas.setColor(new Color(0, 0, 0));
		canvas.setTextAlign(TextAlign.Center);
        
		var tX:Float;
        var size:Float;
        var str:String = "";
        if (!isNullOrEmpty(score.title) && (flags & HeaderFooterElements.TITLE != 0))
        {
			drawCentered(score.title, res.titleFont, y);
            y += Math.floor(35*scale); 
        }        
        if (!isNullOrEmpty(score.subTitle) && (flags & HeaderFooterElements.SUBTITLE != 0))
        {
			drawCentered(score.subTitle, res.subTitleFont, y);
            y += Math.floor(20*scale);
        }
        if (!isNullOrEmpty(score.artist) && (flags & HeaderFooterElements.ARTIST != 0))
        {
			drawCentered(score.artist, res.subTitleFont, y);
            y += Math.floor(20*scale);
        }
        if (!isNullOrEmpty(score.album) && (flags & HeaderFooterElements.ALBUM != 0))
        {
			drawCentered(score.album, res.subTitleFont, y);
            y += Math.floor(20*scale);
        }
        if (!isNullOrEmpty(score.music) && score.music == score.words && (flags & HeaderFooterElements.WORDS_AND_MUSIC != 0))
        {
			drawCentered(score.words, res.wordsFont, y);
            y += Math.floor(20*scale);
        }
        else 
        {
			canvas.setFont(res.wordsFont);
            if (!isNullOrEmpty(score.music) && (flags & HeaderFooterElements.MUSIC != 0))
            {
				var size = canvas.measureText(score.music);
				canvas.fillText(score.music, (width - size - PAGE_PADDING[2]), y);
            }
            if (!isNullOrEmpty(score.words) && (flags & HeaderFooterElements.WORDS != 0))
            {
				canvas.fillText(score.music, x, y);
            }
            y += Math.floor(20*scale);
        }    
        
        y += Math.floor(20*scale);
        
        // tuning info
        if(!renderer.track.isPercussion)
        {
			canvas.setTextAlign(TextAlign.Left);
            var tuning:Tuning = Tuning.findTuning(renderer.track.tuning);
            if(tuning != null)
            {
                // Name
				canvas.setFont(res.effectFont);
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
	
	private function isNullOrEmpty(s:String) : Bool
	{
		return s == null || StringTools.trim(s) == "";
	}
	
    
    /**
     * Realignes the bars in this line according to the available space
     */
    private function fitGroup(group:StaveGroup)
    {
        // calculate additional space for each bar (can be negative!)
        var barSpace:Int = 0;
        if (group.isFull) 
        {
            var freeSpace = getMaxWidth() - group.width;
           
            if (freeSpace != 0 && group.bars.length > 0) 
            {
                barSpace = Math.round(freeSpace / group.bars.length);
            }
        }
        
        // add it to the measures
		group.applyBarSpacing(barSpace);
        
        width = Math.round(Math.max(width, group.width));    
    }
	
    private function createStaveGroup(currentBarIndex:Int) : StaveGroup
    {
        var group:StaveGroup = createEmptyStaveGroup();
        
        var maxWidth = getMaxWidth();
        for (i in currentBarIndex ... renderer.track.bars.length)
        {
			var bar = renderer.track.bars[i];
			group.addBar(bar);
            
            var groupIsFull:Bool = false;
            
            // can bar placed in this line?
            if ( (group.width) >= maxWidth && group.bars.length != 0)
            {
                groupIsFull = true;
            }
            
            if (groupIsFull)
            {
				group.revertLastBar();
				group.isFull = true;
                return group;
            }
            
            group.x = 0;
        }
        
        return group;
    }
    
    private inline function getMaxWidth() : Int
    {
        return (getSheetWidth() - PAGE_PADDING[0] - PAGE_PADDING[2]);
    }
	
	    
    private function getSheetWidth() : Int
    {
        return Math.round(WIDTH_ON_100 * renderer.scale);
    }
    
}