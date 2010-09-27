package alphatab.tablature;
import alphatab.model.HeaderFooterElements;
import alphatab.model.Measure;
import alphatab.model.Song;
import alphatab.model.Track;
import alphatab.model.Padding;
import alphatab.model.Point;
import alphatab.model.Rectangle;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.model.LyricsImpl;
import alphatab.tablature.model.MeasureImpl;
import alphatab.tablature.model.TrackImpl;


/**
 * This layout renders measures in form of a page. 
 */
class PageViewLayout extends ViewLayout
{
	public static var PAGE_PADDING:Padding = new Padding(20, 40, 20, 40);
	public static inline var WIDTH_ON_100:Int = 795;
	
	private var _lines:Array<TempLine>;
	private var _maximumWidth:Float;
	
	public function new() 
	{
		super();
		_lines = new Array<TempLine>();
		_maximumWidth = 0;
		contentPadding = PAGE_PADDING;
	}
	
	public function getMaxWidth() : Float
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
	
	public override function prepareLayout(clientArea:Rectangle, x:Int, y:Int) : Void
	{
		_lines = new Array<TempLine>();
		_maximumWidth = clientArea.width;
		
		width = 0;
		height = 0;
		
		var posY:Int = Math.round(y);
		
		var track:TrackImpl = cast tablature.track;
		var measureCount:Int = tablature.track.measures.length;
		var nextMeasureIndex:Int = 0;
		
		
		posY = Math.floor(LayoutSongInfo(x, posY) + firstMeasureSpacing);
		height = posY;
		 
		while (measureCount > nextMeasureIndex) {
			var spacing:TrackSpacing = new TrackSpacing();
			spacing.set(TrackSpacingPositions.ScoreMiddleLines, Math.round(scoreLineSpacing * 5));
			
			var line:TempLine = this.GetTempLines(track, nextMeasureIndex, spacing);
			_lines.push(line);
			
			spacing.set(TrackSpacingPositions.ScoreUpLines, Math.round(Math.abs(line.MinY)));
			if (line.MaxY + minScoreTabSpacing > scoreSpacing) {
				spacing.set(TrackSpacingPositions.ScoreDownLines, Math.round(line.MaxY - (scoreLineSpacing * 4)));
			}
			spacing.set(TrackSpacingPositions.TablatureTopSeparator, Math.round(minScoreTabSpacing));
			spacing.set(TrackSpacingPositions.Tablature, Math.round(track.tabHeight + stringSpacing + 1));
			spacing.set(TrackSpacingPositions.Lyric, 10);
			checkDefaultSpacing(spacing);
			
			measureLine(track, line, x, posY, spacing);
			
			var lineHeight = Math.round(spacing.getSize()); 
			posY += Math.round(lineHeight + trackSpacing);
			height += Math.round(lineHeight + trackSpacing);
			
			nextMeasureIndex = line.LastIndex + 1;
		}
		
		width = getSheetWidth();
	}
	
	private function LayoutSongInfo(x:Int, y:Int): Int
	{
		var song:Song = tablature.track.song;
		var anySongInfo = false;
		if (song.title != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.TITLE != 0))
		{
			y += Math.floor(35 * scale);
			anySongInfo = true;
		}
		if (song.subtitle != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.SUBTITLE != 0))
		{
			y += Math.floor(20 * scale);
			anySongInfo = true;
		}
		if (song.artist != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.ARTIST != 0))
		{
			y += Math.floor(20 * scale);
			anySongInfo = true;
		}
		if (song.album != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.ALBUM != 0))
		{
			y += Math.floor(20 * scale);
			anySongInfo = true;
		}
		if (song.music != "" && song.music == song.words && (song.pageSetup.headerAndFooter & HeaderFooterElements.WORDS_AND_MUSIC != 0))
		{
			y += Math.floor(20 * scale);
			anySongInfo = true;
		}
		else 
		{
			if (song.music != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.MUSIC != 0))
			{
				y += Math.floor(20 * scale);
				anySongInfo = true;
			}
			if (song.words != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.WORDS != 0))
			{
				y += Math.floor(20 * scale);
				anySongInfo = true;
			}
		}	
		
		y += Math.floor(20 * scale);
		if (anySongInfo)
		{
			y += Math.floor(20 * scale);
		}
		
		return y;
	}
	
	public function measureLine(track:Track, line:TempLine, x:Int, y:Int, spacing:TrackSpacing) : Void
	{
		var realX:Int = contentPadding.left + x;
		var realY:Int = y;
		var w:Int = contentPadding.left;
		
		var measureSpacing:Int = 0;
		if(line.FullLine) {
			var diff = getMaxWidth() - line.TempWidth;
			if(diff != 0 && line.Measures.length > 0) {
				measureSpacing = Math.round(diff / line.Measures.length);
			}
		}
		
		for(i in 0 ... line.Measures.length) {
			var index:Int = line.Measures[i];
			var currMeasure:MeasureImpl = cast track.measures[index];
			
			currMeasure.posX = realX;
			currMeasure.posY = realY;
			currMeasure.ts = spacing;
			currMeasure.isFirstOfLine = i==0;
			
			var measureWidth:Int = Math.round(currMeasure.width + measureSpacing);
			currMeasure.spacing = measureSpacing;
			
			realX += measureWidth;
			w += measureWidth;
		}
		width = Math.round(Math.max(width, w));
	}
	
	public override function paintSong(ctx:DrawingContext, clientArea:Rectangle, x:Int, y:Int) : Void
	{
		var track:Track = tablature.track;
		y = Math.round(y + contentPadding.top);
		y = Math.round(paintSongInfo(ctx, clientArea, x, y) + firstMeasureSpacing);
		var beatCount:Int = 0;
		for (l in 0 ... _lines.length) 
		{
			var line:TempLine = _lines[l];
			beatCount = this.PaintLine(track, line, beatCount, ctx);
		}
	}
	
	private function paintSongInfo(ctx:DrawingContext, clientArea:Rectangle, x:Int, y:Int) : Int
	{
		var song:Song = tablature.track.song;
		x += contentPadding.left;
		var tX:Float;
		var size:Float;
		var str:String = "";
		if (song.title != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.TITLE != 0))
		{
			str = ParsePageSetupString(song.pageSetup.title);
			ctx.graphics.font = DrawingResources.titleFont;
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.titleFont, tX, y, "top");
			y += Math.floor(35*scale); 
		}		
		if (song.subtitle != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.SUBTITLE != 0))
		{
			str = ParsePageSetupString(song.pageSetup.subtitle);
			ctx.graphics.font = DrawingResources.subtitleFont;
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.subtitleFont, tX, y, "top");
			y += Math.floor(20*scale);
		}
		if (song.artist != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.ARTIST != 0))
		{
			str = ParsePageSetupString(song.pageSetup.artist);
			ctx.graphics.font = DrawingResources.subtitleFont;
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.subtitleFont, tX, y, "top");
			y += Math.floor(20*scale);
		}
		if (song.album != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.ALBUM != 0))
		{
			str = ParsePageSetupString(song.pageSetup.album);
			ctx.graphics.font = DrawingResources.subtitleFont;
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.subtitleFont, tX, y, "top");
			y += Math.floor(20*scale);
		}
		if (song.music != "" && song.music == song.words && (song.pageSetup.headerAndFooter & HeaderFooterElements.WORDS_AND_MUSIC != 0))
		{
			str = ParsePageSetupString(song.pageSetup.wordsAndMusic);
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
				str = ParsePageSetupString(song.pageSetup.music);
				ctx.graphics.font = DrawingResources.wordsFont;
				size = ctx.graphics.measureText(str);
				tX = (clientArea.width - size - contentPadding.right);
				ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.wordsFont, tX, y, "top");
			}
			if (song.words != "" && (song.pageSetup.headerAndFooter & HeaderFooterElements.WORDS != 0))
			{
				str = ParsePageSetupString(song.pageSetup.words);
				ctx.graphics.font = DrawingResources.wordsFont;
				ctx.get(DrawingLayers.LayoutBackground).addString(str, DrawingResources.wordsFont, x, y, "top");
			}
			y += Math.floor(20*scale);
		}	
		
		return y;
	}
	
	private function ParsePageSetupString(input:String) : String
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
	
	public function PaintLine(track:Track, line:TempLine, beatCount:Int, context:DrawingContext) : Int
	{ 
		for(i in 0 ... line.Measures.length) {
			var index:Int = line.Measures[i];
			var currentMeasure:MeasureImpl = cast track.measures[index]; 
			
			currentMeasure.paintMeasure(this, context);
			
			if (track.song.lyrics != null && track.song.lyrics.trackChoice == track.number)
			{
				var ly:LyricsImpl = cast track.song.lyrics;
				ly.paintCurrentNoteBeats(context, this, currentMeasure, beatCount, currentMeasure.posX, currentMeasure.posY);
			}
			beatCount += currentMeasure.beatCount();
		}
		return beatCount;
	}
	
	public function GetTempLines(track:Track, fromIndex:Int, trackSpacing:TrackSpacing) : TempLine
	{
		var line:TempLine = new TempLine();
		line.MaxY = 0;
		line.MinY = 0;
		line.TrackSpacing = trackSpacing;
		
		var measureCount = track.measureCount();
		for (i in fromIndex ...  measureCount) {
			var measure:MeasureImpl = cast track.measures[i];
			
			if((line.TempWidth + measure.width) >= getMaxWidth() && line.Measures.length != 0) {
				line.FullLine = true;
				return line;
			}
			line.TempWidth += measure.width;
			line.MaxY = measure.maxY > line.MaxY ? measure.maxY : line.MaxY;
			line.MinY = measure.minY < line.MinY ? measure.minY : line.MinY;
			
			line.AddMeasure(i);
			measure.registerSpacing(this, trackSpacing);
		}
		
		return line;
	}
}

class TempLine 
{
	public var TrackSpacing:TrackSpacing;
	public var TempWidth:Int;
	public var LastIndex:Int;
	public var FullLine:Bool;
	public var MaxY:Int;
	public var MinY:Int;
	public var Measures:Array<Int>;
	
	public function new()
	{
		this.TrackSpacing = null;
		this.TempWidth = 0;
		this.LastIndex = 0;
		this.FullLine = false;
		this.MaxY = 0;
		this.MinY = 0;
		this.Measures = new Array<Int>();
	}
	
	public function AddMeasure(index:Int)
	{
		this.Measures.push(index);
		this.LastIndex = index;
	}
}