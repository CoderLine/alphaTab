/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature;
import haxe.Log;
import haxe.Template;
import js.Boot;
import js.Lib;
import net.coderline.jsgs.model.GsHeaderFooterElements;
import net.coderline.jsgs.model.GsMeasure;
import net.coderline.jsgs.model.GsSong;
import net.coderline.jsgs.model.GsTrack;
import net.coderline.jsgs.model.Padding;
import net.coderline.jsgs.model.Rectangle;
import net.coderline.jsgs.model.Size;
import net.coderline.jsgs.tablature.drawing.DrawingContext;
import net.coderline.jsgs.tablature.drawing.DrawingLayers;
import net.coderline.jsgs.tablature.drawing.DrawingResources;
import net.coderline.jsgs.tablature.model.GsLyricsImpl;
import net.coderline.jsgs.tablature.model.GsMeasureImpl;
import net.coderline.jsgs.tablature.model.GsTrackImpl;
import net.coderline.jsgs.Utils;

class PageViewLayout extends ViewLayout
{
	public static var PagePadding:Padding = new Padding(20, 40, 20, 40);
	public static inline var WidthOn100:Int = 795;
	
	private var Lines:Array<TempLine>;
	private var MarginLeft:Int;
	private var MarginRight:Int;
	private var MaximumWidth:Int;
	
	public function new() 
	{
		super();
		this.Lines = new Array<TempLine>();
		this.MaximumWidth = 0;
		this.MarginLeft = 0;
		this.MarginRight = 0;
	}
	
	public function GetMaxWidth() : Int
	{
		if (this.MaximumWidth <= 0) {
			this.MaximumWidth = this.Tablature.Width;
		}
		return this.MaximumWidth - this.MarginLeft + this.MarginRight;
	}
	
	public function GetSheetWidth() : Int
	{
		return Math.round(PageViewLayout.WidthOn100 * this.Scale);
	}
	
	public override function Init(scale:Float) : Void
	{
		super.Init(scale);
		this.LayoutSize = new Size(this.GetSheetWidth() - PageViewLayout.PagePadding.getHorizontal(), this.Height);
	}
	
	public override function PrepareLayout(clientArea:Rectangle, x:Int, y:Int) : Void
	{
		this.Lines = new Array<TempLine>();
		this.MaximumWidth = clientArea.Width;
		this.MarginLeft = PagePadding.Left;
		this.MarginRight = PagePadding.Right;
		
		this.Width = 0;
		this.Height = 0;
		
		var posY:Int = Math.round(y);
		var height:Int = Math.round(this.FirstMeasureSpacing);
		
		var track:GsTrackImpl = cast this.Tablature.Track;
		var measureCount:Int = this.Tablature.Track.Measures.length;
		var nextMeasureIndex:Int = 0;
		
		
		posY = Math.floor(LayoutSongInfo(x, posY) + this.FirstMeasureSpacing);
		height = posY;
		
		
		while (measureCount > nextMeasureIndex) {
			var spacing:TrackSpacing = new TrackSpacing();
			spacing.Set(TrackSpacingPositions.ScoreMiddleLines, Math.round(this.ScoreLineSpacing * 5));
			
			var line:TempLine = this.GetTempLines(track, nextMeasureIndex, spacing);
			this.Lines.push(line);
			
			spacing.Set(TrackSpacingPositions.ScoreUpLines, Math.round(Math.abs(line.MinY)));
			if (line.MaxY + this.MinScoreTabSpacing > this.ScoreSpacing) {
				spacing.Set(TrackSpacingPositions.ScoreDownLines, Math.round(line.MaxY - (this.ScoreLineSpacing * 4)));
			}
			spacing.Set(TrackSpacingPositions.TablatureTopSeparator, Math.round(this.MinScoreTabSpacing));
			spacing.Set(TrackSpacingPositions.Tablature, Math.round(track.TabHeight + this.StringSpacing + 1));
			spacing.Set(TrackSpacingPositions.Lyric, 10);
			this.CheckDefaultSpacing(spacing);
			
			this.MeasureLine(track, line, x, posY, spacing);
			
			var lineHeight = Math.round(spacing.GetSize()); 
			posY += Math.round(lineHeight + this.TrackSpacing);
			height += Math.round(lineHeight + this.TrackSpacing);
			
			nextMeasureIndex = line.LastIndex + 1;
		}
		
		this.Height = height;
		this.Width = this.GetSheetWidth();
	}
	
	private function LayoutSongInfo(x:Int, y:Int): Int
	{
		var song:GsSong = this.Tablature.Track.Song;
		var anySongInfo = false;
		if (song.Title != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Title != 0))
		{
			y += Math.floor(35 * Scale);
			anySongInfo = true;
		}
		if (song.Subtitle != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Subtitle != 0))
		{
			y += Math.floor(20 * Scale);
			anySongInfo = true;
		}
		if (song.Artist != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Artist != 0))
		{
			y += Math.floor(20 * Scale);
			anySongInfo = true;
		}
		if (song.Album != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Album != 0))
		{
			y += Math.floor(20 * Scale);
			anySongInfo = true;
		}
		if (song.Music != "" && song.Music == song.Words && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.WordsAndMusic != 0))
		{
			y += Math.floor(20 * Scale);
			anySongInfo = true;
		}
		else 
		{
			if (song.Music != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Music != 0))
			{
				y += Math.floor(20 * Scale);
				anySongInfo = true;
			}
			if (song.Words != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Music != 0))
			{
				y += Math.floor(20 * Scale);
				anySongInfo = true;
			}
		}	
		
		if (anySongInfo)
		{
			y += Math.floor(20 * Scale);
		}
		
		return y;
	}
	
	public function MeasureLine(track:GsTrack, line:TempLine, x:Int, y:Int, spacing:TrackSpacing) : Void
	{
		var realX:Int = this.MarginLeft + x;
		var realY:Int = y;
		var width:Int = this.MarginLeft;
		
		var measureSpacing:Int = 0;
		if(line.FullLine) {
			var diff = this.GetMaxWidth() - line.TempWidth;
			if(diff != 0 && line.Measures.length > 0) {
				measureSpacing = Math.round(diff / line.Measures.length);
			}
		}
		
		for(i in 0 ... line.Measures.length) {
			var index:Int = line.Measures[i];
			var currMeasure:GsMeasureImpl = cast track.Measures[index];
			
			currMeasure.PosX = realX;
			currMeasure.PosY = realY;
			currMeasure.Ts = spacing;
			currMeasure.IsFirstOfLine = i==0;
			
			var measureWidth:Int = Math.round(currMeasure.Width + measureSpacing);
			currMeasure.Spacing = measureSpacing;
			
			realX += measureWidth;
			width += measureWidth;
		}
		this.Width = Math.round(Math.max(this.Width, width));
	}
	
	public override function PaintSong(ctx:DrawingContext, clientArea:Rectangle, x:Int, y:Int) : Void
	{
		var track:GsTrack = this.Tablature.Track;
		y = Math.round(y + PagePadding.Top);
		y = Math.round(PaintSongInfo(ctx, clientArea, x, y) + this.FirstMeasureSpacing);
		for (l in 0 ... this.Lines.length) 
		{
			var line:TempLine = this.Lines[l];
			this.PaintLine(track, line, ctx);
		}
	}
	
	private function PaintSongInfo(ctx:DrawingContext, clientArea:Rectangle, x:Int, y:Int) : Int
	{
		Log.trace("Paint Song info");
		var song:GsSong = this.Tablature.Track.Song;
		x += PagePadding.Left;
		var tX:Float;
		var size:Dynamic;
		var str:String = "";
		if (song.Title != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Title != 0))
		{
			str = ParsePageSetupString(song.PageSetup.Title);
			ctx.Graphics.font = DrawingResources.TitleFont;
			size = ctx.Graphics.measureText(str);
			tX = (clientArea.Width - size.width) / 2;
			ctx.Get(DrawingLayers.LayoutBackground).AddString(str, DrawingResources.TitleFont, tX, y, "top");
			y += Math.floor(35*Scale); 
		}		
		if (song.Subtitle != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Subtitle != 0))
		{
			str = ParsePageSetupString(song.PageSetup.Subtitle);
			ctx.Graphics.font = DrawingResources.SubtitleFont;
			size = ctx.Graphics.measureText(str);
			tX = (clientArea.Width - size.width) / 2;
			ctx.Get(DrawingLayers.LayoutBackground).AddString(str, DrawingResources.SubtitleFont, tX, y, "top");
			y += Math.floor(20*Scale);
		}
		if (song.Artist != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Artist != 0))
		{
			str = ParsePageSetupString(song.PageSetup.Artist);
			ctx.Graphics.font = DrawingResources.SubtitleFont;
			size = ctx.Graphics.measureText(str);
			tX = (clientArea.Width - size.width) / 2;
			ctx.Get(DrawingLayers.LayoutBackground).AddString(str, DrawingResources.SubtitleFont, tX, y, "top");
			y += Math.floor(20*Scale);
		}
		if (song.Album != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Album != 0))
		{
			str = ParsePageSetupString(song.PageSetup.Album);
			ctx.Graphics.font = DrawingResources.SubtitleFont;
			size = ctx.Graphics.measureText(str);
			tX = (clientArea.Width - size.width) / 2;
			ctx.Get(DrawingLayers.LayoutBackground).AddString(str, DrawingResources.SubtitleFont, tX, y, "top");
			y += Math.floor(20*Scale);
		}
		if (song.Music != "" && song.Music == song.Words && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.WordsAndMusic != 0))
		{
			str = ParsePageSetupString(song.PageSetup.WordsAndMusic);
			ctx.Graphics.font = DrawingResources.WordsFont;
			size = ctx.Graphics.measureText(str);
			tX = (clientArea.Width - size.width - PagePadding.Right);
			ctx.Get(DrawingLayers.LayoutBackground).AddString(str, DrawingResources.WordsFont, x, y, "top");
			y += Math.floor(20*Scale);
		}
		else 
		{
			if (song.Music != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Music != 0))
			{
				str = ParsePageSetupString(song.PageSetup.Music);
				ctx.Graphics.font = DrawingResources.WordsFont;
				size = ctx.Graphics.measureText(str);
				tX = (clientArea.Width - size.width - PagePadding.Right);
				ctx.Get(DrawingLayers.LayoutBackground).AddString(str, DrawingResources.WordsFont, tX, y, "top");
			}
			if (song.Words != "" && (song.PageSetup.HeaderAndFooter & GsHeaderFooterElements.Music != 0))
			{
				str = ParsePageSetupString(song.PageSetup.Words);
				ctx.Graphics.font = DrawingResources.WordsFont;
				ctx.Get(DrawingLayers.LayoutBackground).AddString(str, DrawingResources.WordsFont, x, y, "top");
			}
			y += Math.floor(20*Scale);
		}	
		
		return y;
	}
	
	private function ParsePageSetupString(input:String) : String
	{
		var song:GsSong = this.Tablature.Track.Song;
		input = StringTools.replace(input, "%TITLE%", song.Title);
		input = StringTools.replace(input, "%SUBTITLE%", song.Subtitle);
		input = StringTools.replace(input, "%ARTIST%", song.Artist);
		input = StringTools.replace(input, "%ALBUM%", song.Album);
		input = StringTools.replace(input, "%WORDS%", song.Words);
		input = StringTools.replace(input, "%MUSIC%", song.Music);
		input = StringTools.replace(input, "%WORDSMUSIC%", song.Words);
		input = StringTools.replace(input, "%COPYRIGHT%", song.Copyright);
		return input;
	}
	
	public function PaintLine(track:GsTrack, line:TempLine, context:DrawingContext) : Void
	{ 
		Log.trace("Paint Measures " + Utils.string(line.Measures[0]) + " to " + Utils.string(line.Measures[line.Measures.length - 1]));
		for(i in 0 ... line.Measures.length) {
			var index:Int = line.Measures[i];
			var currentMeasure:GsMeasureImpl = cast track.Measures[index];
			
			currentMeasure.PaintMeasure(this, context);
			if (track.Song.Lyrics != null && track.Song.Lyrics.TrackChoice == track.Number)
			{
				var ly:GsLyricsImpl = cast track.Song.Lyrics;
				ly.PaintCurrentNoteBeats(context, this, currentMeasure,
																	   currentMeasure.PosX, currentMeasure.PosY);
			}
		}
	}
	
	public function GetTempLines(track:GsTrack, fromIndex:Int, trackSpacing:TrackSpacing) : TempLine
	{
		var line:TempLine = new TempLine();
		line.MaxY = 0;
		line.MinY = 0;
		line.TrackSpacing = trackSpacing;
		
		var measureCount = track.MeasureCount();
		for (i in fromIndex ...  measureCount) {
			var measure:GsMeasureImpl = cast track.Measures[i];
			
			if((line.TempWidth + measure.Width) >= this.GetMaxWidth() && line.Measures.length != 0) {
				line.FullLine = true;
				return line;
			}
			line.TempWidth += measure.Width;
			line.MaxY = measure.MaxY > line.MaxY ? measure.MaxY : line.MaxY;
			line.MinY = measure.MinY < line.MinY ? measure.MinY : line.MinY;
			
			line.AddMeasure(i);
			measure.RegisterSpacing(this, trackSpacing);
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