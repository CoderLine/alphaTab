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

import alphatab.midi.MidiRepeatController;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Measure;
import alphatab.model.MeasureHeader;
import alphatab.model.Song;
import alphatab.model.Track;
import alphatab.model.Voice;
import alphatab.model.Rectangle;
import alphatab.model.Point;
import alphatab.model.SongManager;
import alphatab.platform.Canvas;
import alphatab.platform.PlatformFactory;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.model.ScoreStave;
import alphatab.tablature.model.TablatureStave;

/**
 * A helper type used for searching measures. 
 */
typedef MeasureSearchResult = {
    var measure : Measure;
    var realPosition : Int;
}

/**
 * A control which renders a tablature and music notation into a canvas
 */
class Tablature 
{
    public static var DEFAULT_LAYOUT:String = PageViewLayout.LAYOUT_ID;
    
	private var _updateDisplay:Bool; 
	private var _updateSong:Bool;
    
    public var settings:Hash<Dynamic>;
	public var canvas : Canvas;
	public var isError:Bool;
	public var errorMessage:String;
	public var viewLayout:ViewLayout;
	public var track:Track;
	public var autoSizeWidth:Bool;
	public var onCaretChanged:Beat->Void;
    
	public function new(source:Dynamic, staves:Array<String> = null, msg:String = "") 
	{
		canvas = PlatformFactory.getCanvas(source);
		track = null;
        
        settings = new Hash <Dynamic> ();
		
		errorMessage = StringTools.trim(msg);
		
		if (errorMessage == "" || errorMessage == null) 
		{ 
			errorMessage = "Please set a song's track to display the tablature";
		}
		if (staves == null)
        {	
            staves = new Array<String>();
            staves.push(ScoreStave.STAVE_ID);
            staves.push(TablatureStave.STAVE_ID);
        }      
        settings.set("staves", staves);
        
		setViewLayoutByKey(DEFAULT_LAYOUT);
	}
    
    public function setViewLayoutByKey(layout:String)
    {
        if (layout == "horizontal")
        {
            viewLayout = new HorizontalViewLayout();
        }
        else if (layout == "page")
        {
            viewLayout = new PageViewLayout();
        }
        else
        {
            viewLayout = new PageViewLayout();
        }
        
        viewLayout.setTablature(this);
        updateScale(1.0);
    }
    
    public function setStaveSetting(staveId:String, setting:String, value:Dynamic)
    {   
        settings.set(staveId + "." + setting, value);
    }
    
    public function getStaveSetting(staveId:String, setting:String, defaultValue:Dynamic = null) : Dynamic
    {
        var value:Dynamic = settings.get(staveId + "." + setting);
        return value != null ? value : defaultValue;
    }
     
    
    public function setLayoutSetting(setting:String, value:Dynamic)
    {   
        settings.set("layout." + setting, value);
    }
    
    public function getLayoutSetting(setting:String, defaultValue:Dynamic = null) : Dynamic
    {
        var value:Dynamic = settings.get("layout." + setting);
        return value != null ? value : defaultValue;
    }
	
	public function setTrack(track:Track) : Void 
	{
		this.track = track;
		_updateSong = true;
		_updateDisplay = true;
		updateTablature();
		invalidate();
	}
	
	public function updateScale(scale:Float) : Void 
	{ 
		DrawingResources.init(scale);
		viewLayout.init(scale);
		_updateSong = true;
		_updateDisplay = true;
		updateTablature();
		invalidate();
	}
	
	public function doLayout() : Void 
	{
		if (track == null)
			return;
		var size:Point = viewLayout.layoutSize;
		if (!autoSizeWidth) 
		{
			size.x = canvas.width() - viewLayout.contentPadding.getHorizontal();
		}
		viewLayout.prepareLayout(new Rectangle(0, 0, size.x, size.y), 0, 0);
		
		// update canvas
		if(autoSizeWidth)
			canvas.setWidth(viewLayout.width);
		canvas.setHeight(viewLayout.height);
	}
	
	public function onPaint() 
	{		
		this.paintBackground();
		
		if (track == null || isError) 
		{
			var text = errorMessage;
			
			canvas.fillStyle = "#4e4e4e";
			canvas.font = "20px 'Arial'";
			canvas.textBaseline = "middle";
			canvas.fillText(text, 20, 30);
		}
		else if(_updateDisplay)
		{
			var displayRect:Rectangle = new Rectangle(0, 0, canvas.width(), canvas.height());
			viewLayout.updateCache(canvas, displayRect, 0, 0);
			_updateDisplay = false;
		}
		else
		{
			var displayRect:Rectangle = new Rectangle(0, 0, canvas.width(), canvas.height());
			viewLayout.paintCache(canvas, displayRect, 0, 0);
			_updateDisplay = false;
		}
	}
	
	public function updateTablature()
	{
		if (track == null) return;
		
        doLayout();
        _updateSong = false;
	}
	 
	public function paintBackground() {
		// attention, you are not allowed to remove change this notice within any version of this library without permission!
		var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
		canvas.fillStyle = "#4e4e4e";
		canvas.font = DrawingResources.copyrightFont;
		canvas.textBaseline = "top";
		var x:Float = (canvas.width() - canvas.measureText(msg)) / 2;
		canvas.fillText(msg, x, canvas.height() - 15);
	}
	
	public function invalidate() 
	{
		canvas.clear();
		this.onPaint();
	}
	
	// Caret
	
	private var _lastPosition:Int; 
	private var _lastRealPosition:Int; 
	private var _selectedBeat:Beat; 
	
	public function notifyTickPosition(position:Int)
	{
		position -= Duration.QUARTER_TIME; // remove first tick start
		if (position != _lastPosition)
		{
			_lastPosition = position;
			var result:MeasureSearchResult = findMeasure(position);
			var realPosition:Int = result.realPosition;
			_lastRealPosition = realPosition;
			var measure:Measure = result.measure;
			var beat:Beat = cast findBeat(realPosition, position, measure);
			if (measure != null && beat != null)
			{
				_selectedBeat = beat;
				 if (onCaretChanged != null)
					onCaretChanged(beat);
			}
		}
	}
	
	private function findMeasure(position:Int):MeasureSearchResult
	{		
		var result:MeasureSearchResult = getMeasureAt(position);
		if (result.measure == null)
		{
			result.measure = SongManager.getFirstMeasure(track);
		}
		return result;
	}
	
	private function getMeasureAt(tick:Int) : MeasureSearchResult
	{
		var start:Int = Duration.QUARTER_TIME;
		var result:MeasureSearchResult = { measure:null, realPosition: start };
		var song:Song = track.song;
		var controller:MidiRepeatController = new MidiRepeatController(song);
		// start at current measure
		if (_selectedBeat != null && tick > _lastPosition)
		{		
			controller.index = _selectedBeat.measure.number() - 1;
			start = _lastRealPosition;
		}
		while (!controller.finished())
		{
			var header:MeasureHeader = song.measureHeaders[controller.index];
			controller.process();
			if (controller.shouldPlay)
			{
				var length:Int = header.length();
				if (tick >= start && tick < (start + length))
				{
					result.measure = cast track.measures[header.number - 1];
					result.realPosition = start;
					return result;
				}
				start += length;
			}
		}
		result.realPosition = start;
		return result;
	}
	
	private function findBeat(measurePosition:Int, playerPosition:Int, measure:Measure) : Beat
	{
		if (measure != null)
		{
			for (beat in measure.beats)
			{
				var realBeat:Int = measurePosition + (beat.start - measure.start());
				var voice:Voice = beat.voices[0];
				
				// player position inbetween start and end of beat position
				if (!voice.isEmpty && realBeat <= playerPosition && (realBeat + voice.duration.time()) > playerPosition)
				{
					return beat;
				}
			}
			return SongManager.getFirstBeat(measure.beats);
		}
		return null;
	}	
}