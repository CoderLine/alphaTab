/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature;

import haxe.Log;
import js.Dom;
import net.coderline.jsgs.model.GsChord;
import net.coderline.jsgs.model.GsDuration;
import net.coderline.jsgs.model.GsMeasure;
import net.coderline.jsgs.model.GsNote;
import net.coderline.jsgs.model.GsSong;
import net.coderline.jsgs.model.GsTrack;
import net.coderline.jsgs.model.GsVoice;
import net.coderline.jsgs.model.Rectangle;
import net.coderline.jsgs.model.Size;
import net.coderline.jsgs.platform.Canvas;
import net.coderline.jsgs.tablature.drawing.DrawingContext;
import net.coderline.jsgs.tablature.drawing.DrawingLayers;
import net.coderline.jsgs.tablature.drawing.DrawingResources;
import net.coderline.jsgs.tablature.model.GsChordImpl;
import net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl;
import net.coderline.jsgs.tablature.model.GsMeasureImpl;
import net.coderline.jsgs.tablature.model.GsTrackImpl;
import net.coderline.jsgs.Utils;

class ViewLayout 
{
	public var Tablature:Tablature;
	public var CompactMode:Bool;
	
	public var StringSpacing :Float;
	public var ScoreLineSpacing :Float;
	public var Scale :Float;
	public var FontScale :Float;
	public var FirstMeasureSpacing :Float;
	public var MinBufferSeparator :Float;
	public var MinTopSpacing :Float;
	public var MinScoreTabSpacing :Float;
	public var ScoreSpacing :Float;
	public var FirstTrackSpacing :Float;
	public var TrackSpacing :Float;

	public var ChordFretIndexSpacing :Float;
	public var ChordStringSpacing :Float;
	public var ChordFretSpacing :Float;
	public var ChordNoteSize :Float;
	public var RepeatEndingSpacing :Float;
	public var TextSpacing :Float;
	public var MarkerSpacing :Float;
	public var TupletoSpacing :Float;
	public var EffectSpacing :Float;
	
	public var LayoutSize:Size;
	public var Width:Int;
	public var Height:Int;
	
	private var Cache:DrawingContext;
	
	public function SongManager()
	{
		return this.Tablature.SongManager;
	}
	
	public function new() 
	{
		this.Init(1);
		this.CompactMode = true;
	}
	
	public function SetTablature(tablature:Tablature) : Void
	{
		this.Tablature = tablature;
	}
	
	public function GetDefaultChordSpacing() : Int
	{
		var spacing:Float = 0;
		spacing += (GsChordImpl.MaxFrets * this.ChordFretSpacing) + this.ChordFretSpacing;
		spacing += Math.round(15.0 * this.Scale);
		return Math.round(spacing);
	}
	
	public function Init(scale:Float)
	{
		this.StringSpacing = (10 * scale);
        this.ScoreLineSpacing = (8 * scale);
        this.Scale = scale;
        this.FontScale = this.Scale;
        this.FirstMeasureSpacing = Math.round(10 * this.Scale);
        this.MinBufferSeparator = this.FirstMeasureSpacing;
        this.MinTopSpacing = Math.round(30 * this.Scale);
        this.MinScoreTabSpacing = this.FirstMeasureSpacing;
        this.ScoreSpacing = (this.ScoreLineSpacing * 4) + this.MinScoreTabSpacing;
        this.FirstTrackSpacing = this.FirstMeasureSpacing;
        this.TrackSpacing = (10 * this.Scale);
        
        this.ChordFretIndexSpacing = Math.round(8 * this.Scale);
        this.ChordStringSpacing = Math.round(5 * this.Scale);
        this.ChordFretSpacing = Math.round(6 * this.Scale);
        this.ChordNoteSize = Math.round(4 * this.Scale);
        this.RepeatEndingSpacing = Math.round(20 * this.Scale);
        this.TextSpacing = Math.round(15 * this.Scale);
        this.MarkerSpacing = Math.round(15 * this.Scale);
        this.TupletoSpacing = Math.round(15 * this.Scale);
        this.EffectSpacing = Math.round(10 * this.Scale);
	}
	
	public function PaintCache(graphics:Canvas, area:Rectangle, fromX:Int, fromY:Int) : Void
	{
		if (Cache == null)
		{
			UpdateCache(graphics, area, fromX, fromY);
			return;
		}
		Log.trace("Painting Cache");
		Cache.Draw();
	}
	
	public function UpdateCache(graphics:Canvas, area:Rectangle, fromX:Int, fromY:Int) : Void 
	{
		Log.trace("Updating Cache");
		Cache = new DrawingContext(this.Scale);
        Cache.Graphics = graphics;
        this.PaintSong(Cache, area, fromX, fromY);
        PaintCache(graphics, area, fromX, fromY);
	}
	
	public function PaintSong(ctx:DrawingContext, clientArea:Rectangle, x:Int, y:Int)
	{
		
	}
	
	public function PrepareLayout(clientArea:Rectangle, x:Int, y:Int)
	{
		
	}
	
	public function UpdateSong() : Void
	{
		if (this.Tablature.Track == null) 
            return;
		Log.trace("Updating Song Data");
        this.UpdateTracks();
		Log.trace("Updating Song Data finished");
	}
	
	public function UpdateTracks() : Void
	{
		var song:GsSong = this.Tablature.Track.Song;
        var measureCount:Int = song.MeasureHeaders.length;
        var track:GsTrackImpl = cast this.Tablature.Track;
		track.PreviousBeat = null;
		track.Update(this);
				
        for (i in 0 ... measureCount) {
            var header:GsMeasureHeaderImpl = cast song.MeasureHeaders[i];
            header.Update(this, track);
            
			var measure:GsMeasureImpl = cast track.Measures[i];
			measure.Create(this);
			measure.Update(this);
        }
	}
	
	public function PaintLines(track:GsTrack, ts:TrackSpacing, context:DrawingContext, x:Int, y:Int, width:Int)  : Void
	{
		if (width > 0) {
            var tempX:Float = Math.max(0, x);
            var tempY:Float = y;
            
            var posY:Float = tempY + ts.Get(TrackSpacingPositions.ScoreMiddleLines);
            for (i in 1 ... 6) {
                context.Get(DrawingLayers.Lines).StartFigure();
                context.Get(DrawingLayers.Lines).AddLine(Math.round(tempX), Math.round(posY), Math.round(tempX + width), Math.round(posY));
                posY += (this.ScoreLineSpacing);
            }
            
            tempY += ts.Get(TrackSpacingPositions.Tablature);
            for (i in 0 ... track.StringCount()) {
                context.Get(DrawingLayers.Lines).StartFigure();
                context.Get(DrawingLayers.Lines).AddLine(Math.round(tempX), Math.round(tempY), Math.round(tempX + width), Math.round(tempY));
                tempY += cast this.StringSpacing;
            }
        }
	}
	
	public function GetSpacingForQuarter(duration:GsDuration) :Float
	{
		return (GsDuration.QuarterTime / duration.Time()) * this.GetMinSpacing(duration);
	}
	
	public function GetMinSpacing(duration:GsDuration) :Float
	{
		var scale = this.Scale;
        switch (duration.Value) {
            case GsDuration.Whole:
                return 50.0 * scale;
            case GsDuration.Half:
                return 30.0 * scale;
            case GsDuration.Quarter:
                return 55.0 * scale;
            case GsDuration.Eighth:
                return 20.0 * scale;
            default:
                return 18.0 * this.Scale;
        }
	}
	
	public function GetVoiceWidth(voice:GsVoice) :Float
	{
		var scale = this.Scale;
        var duration = voice.Duration;
        if (duration != null) {
            switch (duration.Value) {
                case GsDuration.Whole:
                    return (90.0 * scale);
                case GsDuration.Half:
                    return (65.0 * scale);
                case GsDuration.Quarter:
                    return (45.0 * scale);
                case GsDuration.Eighth:
                    return (30.0 * scale);
                case GsDuration.Sixteenth:
                    return (20.0 * scale);
                case GsDuration.ThirtySecond:
                    return (17.0 * scale);
                default:
                    return (15.0 * scale);
            }
        }
		return 20.0 * scale;
	}
	
	public function IsFirstMeasure(measure:GsMeasure): Bool
	{
		return measure.Number() == 1;
	}
	
	
	public function IsLastMeasure(measure:GsMeasure) : Bool
	{
		return measure.Number() == this.Tablature.Track.Song.MeasureHeaders.length;
	}
	
	public function GetNoteOrientation(x:Int, y:Int, note:GsNote) : Rectangle
	{
		var noteAsString:String = "";
		if(note.IsTiedNote) {
			noteAsString = "L";
		}
		else if(note.Effect.DeadNote) {
			noteAsString = "X";
		} 
		else
		{
			noteAsString = Utils.string(note.Value);
		}
		noteAsString = note.Effect.GhostNote ? "(" + noteAsString + ")" : noteAsString;
		return this.GetOrientation(x,y,noteAsString);
	}
	
	public function GetOrientation(x:Int, y:Int, str:String) : Rectangle
	{
		this.Tablature.Canvas.font = DrawingResources.NoteFont;
		var size = this.Tablature.Canvas.measureText(str);
		return new Rectangle(x,y, cast size.width, DrawingResources.NoteFontHeight);
	}
	
	public function CheckDefaultSpacing(ts:TrackSpacing) : Void
	{
		var minBufferSeparator:Float = this.MinBufferSeparator;
		var bufferSeparator:Int = ts.Get(TrackSpacingPositions.ScoreUpLines) - ts.Get(TrackSpacingPositions.BufferSeparator);
		if(bufferSeparator < minBufferSeparator) {
			ts.Set(TrackSpacingPositions.BufferSeparator, Math.round(minBufferSeparator - bufferSeparator));
		}
		var checkPosition:Int = ts.Get(TrackSpacingPositions.ScoreMiddleLines);
		
		if(checkPosition >= 0 && checkPosition < this.MinTopSpacing) {
			ts.Set(TrackSpacingPositions.Top, Math.round(this.MinTopSpacing - checkPosition));
		}
	}
}