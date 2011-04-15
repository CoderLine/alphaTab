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
import alphatab.tablature.model.MeasureDrawing;
import alphatab.tablature.model.StaveFactory;
import alphatab.tablature.model.StaveLine;


/**
 * This is the base class for creating layouts which arrange measures
 */
class ViewLayout 
{		
	private var _cache:DrawingContext;

	public var tablature:Tablature;
	
	// Size presets
	public var stringSpacing :Int;
	public var scoreLineSpacing :Float;
	public var scale :Float;
    
	public var firstMeasureSpacing :Float;
    

	public var effectSpacing :Float;
	
	public var layoutSize:Point;
	public var width:Int;
	public var height:Int;
	public var contentPadding:Padding;
    
	
	public function new() 
	{
		this.init(1);
		this.contentPadding = new Padding(0, 0, 0, 0);
	}
	
	public function setTablature(tablature:Tablature) : Void
	{
		this.tablature = tablature;
	}
		
	public function init(scale:Float)
	{
		stringSpacing = cast (10 * scale);
        scoreLineSpacing = (8 * scale);
        this.scale = scale;
        firstMeasureSpacing = Math.round(10 * scale);
        effectSpacing = Math.round(15 * scale);
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
    
	public function getVoiceWidth(voice:Voice) : Int
	{
        var duration = voice.duration;
        if (duration != null) {
            switch (duration.value) {
                case Duration.WHOLE:
                    return cast (90.0 * scale);
                case Duration.HALF:
                    return cast (65.0 * scale);
                case Duration.QUARTER:
                    return cast (45.0 * scale);
                case Duration.EIGHTH:
                    return cast (30.0 * scale);
                case Duration.SIXTEENTH:
                    return cast (20.0 * scale);
                case Duration.THIRTY_SECOND:
                    return cast (17.0 * scale);
                default:
                    return cast (15.0 * scale);
            }
        }
		return cast (20.0 * scale);
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
    
    public function getNoteSize(note:Note) : Point
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
        
        tablature.canvas.font = DrawingResources.noteFont;
		var size:Float = tablature.canvas.measureText(noteAsString);
		return new Point(cast size, DrawingResources.noteFontHeight);        
    }
    
    public function createStaveLine(track:Track) : StaveLine
    {
        var line :StaveLine = new StaveLine();
        line.track = track;
        line.tablature = tablature;
        
        var staves:Array<String> = cast tablature.settings.get("staves");
        for (stave in staves)
        { 
            var staveImpl = StaveFactory.getStave(stave, line, this);
            if(staveImpl != null)
                line.addStave(staveImpl);
        }        
        
        return line;
    }
}