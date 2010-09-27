package alphatab.tablature;

import alphatab.model.Chord;
import alphatab.model.Duration;
import alphatab.model.Measure;
import alphatab.model.Note;
import alphatab.model.Song;
import alphatab.model.Track;
import alphatab.model.Voice;
import alphatab.model.Point;
import alphatab.model.Padding;
import alphatab.model.Rectangle;
import alphatab.platform.Canvas;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.model.ChordImpl;
import alphatab.tablature.model.MeasureHeaderImpl;
import alphatab.tablature.model.MeasureImpl;
import alphatab.tablature.model.TrackImpl;


/**
 * This is the base class for creating layouts which arrange measures
 */
class ViewLayout 
{		
	private var _cache:DrawingContext;

	public var tablature:Tablature;
	
	// Size presets
	public var stringSpacing :Float;
	public var scoreLineSpacing :Float;
	public var scale :Float;
	public var fontScale :Float;
	public var firstMeasureSpacing :Float;
	public var minBufferSeparator :Float;
	public var minTopSpacing :Float;
	public var minScoreTabSpacing :Float;
	public var scoreSpacing :Float;
	public var firstTrackSpacing :Float;
	public var trackSpacing :Float;

	public var chordFretIndexSpacing :Float;
	public var chordStringSpacing :Float;
	public var chordFretSpacing :Float;
	public var chordNoteSize :Float;
	public var repeatEndingSpacing :Float;
	public var textSpacing :Float;
	public var markerSpacing :Float;
	public var tupletoSpacing :Float;
	public var effectSpacing :Float;
	
	public var layoutSize:Point;
	public var width:Int;
	public var height:Int;
	public var contentPadding:Padding;
	
	public function songManager()
	{
		return tablature.songManager;
	}
	
	
	public function new() 
	{
		this.init(1);
		this.contentPadding = new Padding(0, 0, 0, 0);
	}
	
	public function setTablature(tablature:Tablature) : Void
	{
		this.tablature = tablature;
	}
	
	public function getDefaultChordSpacing() : Int
	{
		var spacing:Float = 0;
		spacing += (ChordImpl.MAX_FRETS * chordFretSpacing) + chordFretSpacing;
		spacing += Math.round(15.0 * scale);
		return Math.round(spacing);
	}
	
	public function init(scale:Float)
	{
		stringSpacing = (10 * scale);
        scoreLineSpacing = (8 * scale);
        this.scale = scale;
        fontScale = scale;
        firstMeasureSpacing = Math.round(10 * scale);
        minBufferSeparator = this.firstMeasureSpacing;
        minTopSpacing = Math.round(30 * scale);
        minScoreTabSpacing = this.firstMeasureSpacing;
        scoreSpacing = (this.scoreLineSpacing * 4) + this.minScoreTabSpacing;
        firstTrackSpacing = this.firstMeasureSpacing;
        trackSpacing = (10 * scale);
        
        chordFretIndexSpacing = Math.round(8 * scale);
        chordStringSpacing = Math.round(5 * scale);
        chordFretSpacing = Math.round(6 * scale);
        chordNoteSize = Math.round(4 * scale);
        repeatEndingSpacing = Math.round(20 * scale);
        textSpacing = Math.round(15 * scale);
        markerSpacing = Math.round(15 * scale);
        tupletoSpacing = Math.round(15 * scale);
        effectSpacing = Math.round(10 * scale);
	}
	
	public function paintCache(graphics:Canvas, area:Rectangle, fromX:Int, fromY:Int) : Void
	{
		if (_cache == null)
		{
			updateCache(graphics, area, fromX, fromY);
			return;
		}
		_cache.draw();
	}
	
	public function updateCache(graphics:Canvas, area:Rectangle, fromX:Int, fromY:Int) : Void 
	{
		_cache = new DrawingContext(scale);
        _cache.graphics = graphics;
        paintSong(_cache, area, fromX, fromY);
        paintCache(graphics, area, fromX, fromY);
	}
	
	public function paintSong(ctx:DrawingContext, clientArea:Rectangle, x:Int, y:Int)
	{
		// implemented in subclass
	}
	
	public function prepareLayout(clientArea:Rectangle, x:Int, y:Int)
	{
		// implemented in subclass
	}
	
	public function updateSong() : Void
	{
		if (tablature.track == null) 
            return;
        this.updateTracks();
	}
	
	public function updateTracks() : Void
	{
		var song:Song = tablature.track.song;
        var measureCount:Int = song.measureHeaders.length;
        var track:TrackImpl = cast tablature.track;
		track.previousBeat = null;
		track.update(this);
				
        for (i in 0 ... measureCount) {
            var header:MeasureHeaderImpl = cast song.measureHeaders[i];
            header.update(this, track);
            
			var measure:MeasureImpl = cast track.measures[i];
			measure.create(this);
			measure.update(this);
        }
	}
	
	public function paintLines(track:Track, ts:TrackSpacing, context:DrawingContext, x:Int, y:Int, width:Int)  : Void
	{
		if (width > 0) {
            var tempX:Float = Math.max(0, x);
            var tempY:Float = y;
            
            var posY:Float = tempY + ts.get(TrackSpacingPositions.ScoreMiddleLines);
            for (i in 1 ... 6) {
                context.get(DrawingLayers.Lines).startFigure();
                context.get(DrawingLayers.Lines).addLine(Math.round(tempX), Math.round(posY), Math.round(tempX + width), Math.round(posY));
                posY += (this.scoreLineSpacing);
            }
            
            tempY += ts.get(TrackSpacingPositions.Tablature);
            for (i in 0 ... track.stringCount()) {
                context.get(DrawingLayers.Lines).startFigure();
                context.get(DrawingLayers.Lines).addLine(Math.round(tempX), Math.round(tempY), Math.round(tempX + width), Math.round(tempY));
                tempY += cast this.stringSpacing;
            }
        }
	}
	
	public function getSpacingForQuarter(duration:Duration) :Float
	{
		return (Duration.QUARTER_TIME / duration.time()) * getMinSpacing(duration);
	}
	
	public function getMinSpacing(duration:Duration) :Float
	{
        switch (duration.value) {
            case Duration.WHOLE:
                return 50.0 * scale;
            case Duration.HALF:
                return 30.0 * scale;
            case Duration.QUARTER:
                return 55.0 * scale;
            case Duration.EIGHTH:
                return 20.0 * scale;
            default:
                return 18.0 * scale;
        }
	}
	
	public function getVoiceWidth(voice:Voice) :Float
	{
        var duration = voice.duration;
        if (duration != null) {
            switch (duration.value) {
                case Duration.WHOLE:
                    return (90.0 * scale);
                case Duration.HALF:
                    return (65.0 * scale);
                case Duration.QUARTER:
                    return (45.0 * scale);
                case Duration.EIGHTH:
                    return (30.0 * scale);
                case Duration.SIXTEENTH:
                    return (20.0 * scale);
                case Duration.THIRTY_SECOND:
                    return (17.0 * scale);
                default:
                    return (15.0 * scale);
            }
        }
		return 20.0 * scale;
	}
	
	public function isFirstMeasure(measure:Measure): Bool
	{
		return measure.number() == 1;
	}
	
	public function isLastMeasure(measure:Measure) : Bool
	{
		return measure.number() == tablature.track.song.measureHeaders.length;
	}
	
	public function getNoteOrientation(x:Int, y:Int, note:Note) : Rectangle
	{
		var noteAsString:String = "";
		if(note.isTiedNote) {
			noteAsString = "L";
		}
		else if(note.effect.deadNote) {
			noteAsString = "X";
		} 
		else
		{
			noteAsString = Std.string(note.value);
		}
		noteAsString = note.effect.ghostNote ? "(" + noteAsString + ")" : noteAsString;
		return this.getOrientation(x,y,noteAsString);
	}
	
	public function getOrientation(x:Int, y:Int, str:String) : Rectangle
	{
		tablature.canvas.font = DrawingResources.noteFont;
		var size = tablature.canvas.measureText(str);
		return new Rectangle(x,y, cast size, DrawingResources.noteFontHeight);
	}
	
	public function checkDefaultSpacing(ts:TrackSpacing) : Void
	{
		var bufferSeparator:Int = ts.get(TrackSpacingPositions.ScoreUpLines) - ts.get(TrackSpacingPositions.BufferSeparator);
		if(bufferSeparator < minBufferSeparator) {
			ts.set(TrackSpacingPositions.BufferSeparator, Math.round(minBufferSeparator - bufferSeparator));
		}
		var checkPosition:Int = ts.get(TrackSpacingPositions.ScoreMiddleLines);
		
		if(checkPosition >= 0 && checkPosition < minTopSpacing) {
			ts.set(TrackSpacingPositions.Top, Math.round(minTopSpacing - checkPosition));
		}
	}
}