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
package alphatab.tablature;
import alphatab.model.HeaderFooterElements;
import alphatab.model.Measure;
import alphatab.model.Song;
import alphatab.model.Track;
import alphatab.model.Padding;
import alphatab.model.Point;
import alphatab.model.Rectangle;
import alphatab.model.Tuning;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.model.MeasureDrawing;
import alphatab.tablature.model.ScoreStave;
import alphatab.tablature.model.StaveLine;
import alphatab.tablature.model.StaveSpacing;
import alphatab.tablature.model.TablatureStave;
import alphatab.tablature.model.MeasureClickable;

/**
 * This layout renders measures in form of a page. 
 */
class PageViewLayout extends ViewLayout
{
    public static var LAYOUT_ID = "page"; 
    
	public static var PAGE_PADDING:Padding = new Padding(20, 40, 20, 40);
	public static inline var WIDTH_ON_100:Int = 795;
	
	private var _lines:Array<StaveLine>;
	private var _maximumWidth:Int;
	
	public function new() 
	{
		super();
		_lines = new Array<StaveLine>();
		_maximumWidth = 0;
		contentPadding = PAGE_PADDING;
	}
	
	public function getMaxWidth() : Int
	{
		if (_maximumWidth <= 0) {
			_maximumWidth = tablature.canvas.width();
		}
		return _maximumWidth - contentPadding.getHorizontal();
	}
	
	public function getSheetWidth() : Int
	{
		return Math.round(PageViewLayout.WIDTH_ON_100 * scale);
	}
	
	public override function init(scale:Float) : Void
	{
		super.init(scale);
		layoutSize = new Point(this.getSheetWidth() - PAGE_PADDING.getHorizontal(), height);
	}
        
    // 
    // Layouting
    //
	
	public override function prepareLayout(clientArea:Rectangle, x:Int, y:Int) : Void
	{
		_lines = new Array<StaveLine>();
		_maximumWidth = Math.floor(clientArea.width);
		
		width = 0;
		height = 0;
		
		var posY:Int = y;
		
		var track:Track = tablature.track;
		var measureCount:Int = tablature.track.measures.length;
		var nextMeasureIndex:Int = 0;
		
		x += contentPadding.left;
		posY = Math.floor(layoutSongInfo(x, posY) + firstMeasureSpacing);
		 
		while (measureCount > nextMeasureIndex) 
        {
            // calculate a stave line
			var line:StaveLine = getStaveLine(track, nextMeasureIndex, posY, x);
            _lines.push(line);

            // try to fit full line
            fitLine(track, line);            
			
            // add it to offset
            posY += line.getHeight();
			
            // next measure index
			nextMeasureIndex = line.lastIndex() + 1;
		}
        
        height = posY + contentPadding.bottom;
		
		width = getSheetWidth();
	}
        
    public function getStaveLine(track:Track, startIndex:Int, y:Int, x:Int) : StaveLine
	{
		var line:StaveLine = createStaveLine(track);
		line.y = y;
		line.x = x;
                
        // default spacings
        line.spacing.set(StaveLine.TopPadding, Math.floor(10 * scale));
        line.spacing.set(StaveLine.BottomSpacing, Math.floor(10 * scale));
		
        var measuresPerLine = tablature.getLayoutSetting("measuresPerLine", -1);
        
		var measureCount = track.measureCount(); 
        x = 0;
		for (i in startIndex ... measureCount) 
        {
			var measure:MeasureDrawing = cast track.measures[i];
            measure.staveLine = line;
            measure.performLayout(this);            
                        
            var lineIsFull:Bool = false;
                        
            // try to fit using the size
            if (measuresPerLine == -1 && ((x + measure.width) >= getMaxWidth() && line.measures.length != 0) )
            {
                lineIsFull = true;
            }
            // check if measuresPerLine is reached
            else if (line.measures.length == measuresPerLine)
            {
                lineIsFull = true;
            }
            
            
            if (lineIsFull)
            {                
                line.fullLine = true;
                line.width = x;  
                return line;
            }
            
            measure.x = x;            
			x += measure.width;            
            
            for (stave in line.staves)
            {
                stave.prepare(measure);
            }
            		
			line.addMeasure(i);
		}
        line.width = x;        
		return line;
	}
    
    private function fitLine(track:Track, line:StaveLine)
    {
        // calculate additional space for each measure
        var measureSpace:Int = 0;
		if (line.fullLine) 
        {
			var freeSpace = getMaxWidth() - line.width;
           
			if (freeSpace != 0 && line.measures.length > 0) 
            {
				measureSpace = Math.round(freeSpace / line.measures.length);
			}
		}
        
        // add it to the measures
        var measureX:Int = 0;
        for (i in 0 ... line.measures.length)
        {
			var index:Int = line.measures[i];
			var measure:MeasureDrawing = cast track.measures[index];
            
            measure.setSpacing(measureSpace);
            measure.x = measureX;
            
            measureX += measure.width + measureSpace;
        }
        line.width = measureX;
        
        width = Math.round(Math.max(width, measureX));
    }
	
	private function layoutSongInfo(x:Int, y:Int): Int
	{
        if (tablature.getLayoutSetting("hideSongInfo", false)) return y;
        
		var song:Song = tablature.track.song;
		if (song.title != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.TITLE != 0))
		{
			y += Math.floor(35 * scale);
		}
		if (song.subtitle != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.SUBTITLE != 0))
		{
			y += Math.floor(20 * scale);
		}
		if (song.artist != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.ARTIST != 0))
		{
			y += Math.floor(20 * scale);
		}
		if (song.album != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.ALBUM != 0))
		{
			y += Math.floor(20 * scale);
		}
		if (song.music != "" && song.music == song.words && (song.pageSetup.headerAndFooter & HeaderFooterElements.WORDS_AND_MUSIC != 0))
		{
			y += Math.floor(20 * scale);
		}
		else 
		{
			if (song.music != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.MUSIC != 0))
			{
				y += Math.floor(20 * scale);
			}
			if (song.words != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.WORDS != 0))
			{
				y += Math.floor(20 * scale);
			}
		}	
		
		y += Math.floor(20 * scale);
		
		// tuning info
		if(!tablature.track.isPercussionTrack)
		{
			var tuning:Tuning = Tuning.findTuning(tablature.track.strings);
			if(tuning != null)
			{
			    // Name
			    y += Math.floor(15*scale);
			    
			    if(!tuning.IsStandard)
	            {
				    // Strings
				    var stringsPerColumn = Math.ceil(tablature.track.strings.length/2);
				    y += stringsPerColumn * Math.floor(15*scale);
			    }
			    
			    y += Math.floor(15*scale);
			}
		}
		
		y += Math.floor(40 * scale);
		
		return y;
	}
	
	//
    // Painting
    //
	
	public override function paintSong(ctx:DrawingContext, clientArea:Rectangle, x:Int, y:Int) : Void
	{
		var track:Track = tablature.track;
		y = Math.round(y + contentPadding.top);
		y = Math.round(paintSongInfo(ctx, clientArea, x, y) + firstMeasureSpacing);
		//var beatCount:Int = 0;
		for (l in 0 ... _lines.length) 
		{
			var line:StaveLine = _lines[l];
            line.paint(this, track, ctx, _map);
		}
	}
	
	private function paintSongInfo(ctx:DrawingContext, clientArea:Rectangle, x:Int, y:Int) : Int
	{
        if (tablature.getLayoutSetting("hideSongInfo", false)) return y;

		var song:Song = tablature.track.song;
		x += contentPadding.left;
		var tX:Float;
		var size:Float;
		var str:String = "";
		if (song.title != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.TITLE != 0))
		{
			str = parsePageSetupString(song.pageSetup.title);
			ctx.graphics.font = DrawingResources.titleFont;
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.titleFont, tX, y, "top");
			y += Math.floor(35*scale); 
		}		
		if (song.subtitle != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.SUBTITLE != 0))
		{
			str = parsePageSetupString(song.pageSetup.subtitle);
			ctx.graphics.font = DrawingResources.subtitleFont;
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.subtitleFont, tX, y, "top");
			y += Math.floor(20*scale);
		}
		if (song.artist != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.ARTIST != 0))
		{
			str = parsePageSetupString(song.pageSetup.artist);
			ctx.graphics.font = DrawingResources.subtitleFont;
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.subtitleFont, tX, y, "top");
			y += Math.floor(20*scale);
		}
		if (song.album != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.ALBUM != 0))
		{
			str = parsePageSetupString(song.pageSetup.album);
			ctx.graphics.font = DrawingResources.subtitleFont;
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.subtitleFont, tX, y, "top");
			y += Math.floor(20*scale);
		}
		if (song.music != "" && song.music == song.words && (song.pageSetup.headerAndFooter & HeaderFooterElements.WORDS_AND_MUSIC != 0))
		{
			str = parsePageSetupString(song.pageSetup.wordsAndMusic);
			ctx.graphics.font = DrawingResources.wordsFont;
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size - contentPadding.right);
			ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.wordsFont, x, y, "top");
			y += Math.floor(20*scale);
		}
		else 
		{
			if (song.music != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.MUSIC != 0))
			{
				str = parsePageSetupString(song.pageSetup.music);
				ctx.graphics.font = DrawingResources.wordsFont;
				size = ctx.graphics.measureText(str);
				tX = (clientArea.width - size - contentPadding.right);
				ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.wordsFont, tX, y, "top");
			}
			if (song.words != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.WORDS != 0))
			{
				str = parsePageSetupString(song.pageSetup.words);
				ctx.graphics.font = DrawingResources.wordsFont;
				ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.wordsFont, x, y, "top");
			}
			y += Math.floor(20*scale);
		}	
		
		y += Math.floor(20*scale);
		
		// tuning info
        if(!tablature.track.isPercussionTrack)
        {
	        var tuning:Tuning = Tuning.findTuning(tablature.track.strings);
	        if(tuning != null)
	        {
	            // Name
	            ctx.get(DrawingLayers.LayoutBackground).addString(tuning.Name, DrawingResources.effectFont, x, y, "top");
	            
	            y += Math.floor(15*scale);
	            
	            if(!tuning.IsStandard)
	            {
		            // Strings
		            var stringsPerColumn = Math.ceil(tablature.track.strings.length/2);
		            
		            var currentX = x;
		            var currentY = y;
		            
		            for(i in 0 ... tablature.track.strings.length)
		            {
		                str = "(" + Std.string(i+1) + ") = " + Tuning.getTextForTuning(tablature.track.strings[i].value);
		                ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.effectFont, currentX, currentY, "top");
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
	
	private function parsePageSetupString(input:String) : String
	{
		var song:Song = tablature.track.song;
		input = StringTools.replace(input, "%TITLE%", song.title);
		input = StringTools.replace(input, "%SUBTITLE%", song.subtitle);
		input = StringTools.replace(input, "%ARTIST%", song.artist);
		input = StringTools.replace(input, "%ALBUM%", song.album);
		input = StringTools.replace(input, "%WORDS%", song.words);
		input = StringTools.replace(input, "%MUSIC%", song.music);
		input = StringTools.replace(input, "%WORDSMUSIC%", song.words);
		input = StringTools.replace(input, "%COPYRIGHT%", song.copyright);
		return input;
	}
	
}