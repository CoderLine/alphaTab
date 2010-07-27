/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature;

import haxe.Log;
import net.alphatab.midi.MidiRepeatController;
import net.alphatab.model.GsBeat;
import net.alphatab.model.GsDuration;
import net.alphatab.model.GsMeasure;
import net.alphatab.model.GsMeasureHeader;
import net.alphatab.model.GsSong;
import net.alphatab.model.GsTrack;
import net.alphatab.model.GsVoice;
import net.alphatab.model.Rectangle;
import net.alphatab.model.Size;
import net.alphatab.model.SongManager;
import net.alphatab.platform.Canvas;
import net.alphatab.platform.PlatformFactory;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.model.GsBeatImpl;
import net.alphatab.tablature.model.GsMeasureImpl;
import net.alphatab.tablature.model.GsSongFactoryImpl;

typedef MeasureSearchResult = {
    var measure : GsMeasureImpl;
    var realPosition : Int;
}


class Tablature 
{
	public var Canvas : Canvas;
	public var IsError:Bool;
	public var ErrorMessage:String;
	public var Width:Int;
	public var Height:Int;
	public var ViewLayout:ViewLayout;
	public var Track:GsTrack;
	
	private var UpdateDisplay:Bool;
	private var UpdateSong:Bool;
	
	public var OnCaretChanged:GsBeatImpl->Void;
	
	public var SongManager:SongManager;
	
	public function new(source:Dynamic, errorMessage:String = "") 
	{
		this.Canvas = PlatformFactory.GetCanvas(source);
		this.Track = null;
		this.SongManager = new SongManager(new GsSongFactoryImpl());
		
		this.ErrorMessage = StringTools.trim(errorMessage);
		
		if (this.ErrorMessage == "" || this.ErrorMessage == null) 
		{ 
			this.ErrorMessage = "Please set a song's track to display the tablature";
		}
		this.Width = this.Canvas.Width();
		this.Height = this.Canvas.Height();
		this.ViewLayout = new PageViewLayout();
		this.ViewLayout.SetTablature(this);
		this.UpdateScale(1.0);	
	}
	
	public function SetTrack(track:GsTrack) : Void 
	{
		Log.trace("Updating Track");
		this.Track = track;
		this.UpdateDisplay = true;
		this.UpdateTablature();
		this.Invalidate();
	}
	
	public function UpdateScale(scale:Float) : Void 
	{ 
		DrawingResources.Init(scale);
		this.ViewLayout.Init(scale);
		this.UpdateSong = true;
		this.UpdateTablature();
		this.UpdateDisplay = true;
		this.Invalidate();
	}
	
	public function DoLayout() : Void 
	{
		if (this.Track == null)
			return;
		Log.trace("Starting layouting");
		var size:Size = this.ViewLayout.LayoutSize;
		this.ViewLayout.PrepareLayout(new Rectangle(0, 0, size.Width, size.Height), 0, 0);
		
		// store size
		this.Width = this.ViewLayout.Width;
		this.Height = this.ViewLayout.Height;
		
		// update canvas
		this.Canvas.SetWidth(this.ViewLayout.Width);
		this.Canvas.SetHeight(this.ViewLayout.Height);

		Log.trace("Layouting finished");
	}
	
	public function OnPaint() 
	{		
		this.PaintBackground();
		
		if (this.Track == null || IsError) 
		{
			var text = this.ErrorMessage;
			
			this.Canvas.fillStyle = "#4e4e4e";
			this.Canvas.font = "20px Arial";
			this.Canvas.textBaseline = "middle";
			this.Canvas.fillText(text, 20, 30);
		}
		else if(UpdateDisplay)
		{
			var displayRect:Rectangle = new Rectangle(0, 0, this.Width, this.Height);
			this.ViewLayout.UpdateCache(this.Canvas, displayRect, 0, 0);
			this.UpdateDisplay = false;
		}
		else
		{
			var displayRect:Rectangle = new Rectangle(0, 0, this.Width, this.Height);
			this.ViewLayout.PaintCache(this.Canvas, displayRect, 0, 0);
			this.UpdateDisplay = false;
		}
		Log.trace("Drawing Finished");
	}
	
	public function UpdateTablature()
	{
		if (this.Track == null) return;
		
		this.ViewLayout.UpdateSong();
        this.DoLayout();
        this.UpdateSong = false;
	}
	 
	public function PaintBackground() {
		// attention, you are not allowed to remove change this notice within any version of this library without permission
		var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
		this.Canvas.fillStyle = "#4e4e4e";
		this.Canvas.font = "bold 11px Arial";
		this.Canvas.textBaseline = "middle";
		var x:Float = (Canvas.Width() - this.Canvas.measureText(msg).width) / 2;
		this.Canvas.fillText(msg, x, this.Canvas.Height() - 20);
	}
	
	public function Invalidate() 
	{
		this.Canvas.clearRect(0, 0, this.Canvas.Width(), this.Canvas.Height());
		this.OnPaint();
	}
	
	// Caret
	
	private var _lastPosition:Int; 
	private var _lastRealPosition:Int; 
	private var _selectedBeat:GsBeat; 
	
	public function NotifyTickPosition(position:Int)
	{
		position -= GsDuration.QuarterTime; // remove first tick start
		if (position != _lastPosition)
		{
			_lastPosition = position;
			var result:MeasureSearchResult = FindMeasure(position);
			var realPosition:Int = result.realPosition;
			_lastRealPosition = realPosition;
			var measure:GsMeasureImpl = result.measure;
			var beat:GsBeatImpl = cast FindBeat(realPosition, position, measure);
			if (measure != null && beat != null)
			{
				_selectedBeat = beat;
				 if (OnCaretChanged != null)
					OnCaretChanged(beat);
			}
		}
	}
	
	private function FindMeasure(position:Int):MeasureSearchResult
	{		
		var result:MeasureSearchResult = GetMeasureAt(position);
		if (result.measure == null)
		{
			result.measure = cast SongManager.GetFirstMeasure(Track);
		}
		return result;
	}
	
	private function GetMeasureAt(tick:Int) : MeasureSearchResult
	{
		var start:Int = GsDuration.QuarterTime;
		var result:MeasureSearchResult = { measure:null, realPosition: start };
		var song:GsSong = Track.Song;
		var controller:MidiRepeatController = new MidiRepeatController(song);
		// start at current measure
		if (_selectedBeat != null && tick > _lastPosition)
		{		
			controller.Index = _selectedBeat.Measure.Number() - 1;
			start = _lastRealPosition;
		}
		while (!controller.Finished())
		{
			var header:GsMeasureHeader = song.MeasureHeaders[controller.Index];
			controller.Process();
			if (controller.ShouldPlay)
			{
				var length:Int = header.Length();
				if (tick >= start && tick < (start + length))
				{
					result.measure = cast Track.Measures[header.Number - 1];
					result.realPosition = start;
					return result;
				}
				start += length;
			}
		}
		result.realPosition = start;
		return result;
	}
	
	private function FindBeat(measurePosition:Int, playerPosition:Int, measure:GsMeasure) : GsBeat
	{
		if (measure != null)
		{
			for (beat in measure.Beats)
			{
				var realBeat:Int = measurePosition + (beat.Start - measure.Start());
				var voice:GsVoice = beat.Voices[0];
				
				// player position inbetween start and end of beat position
				if (!voice.IsEmpty && realBeat <= playerPosition && (realBeat + voice.Duration.Time()) > playerPosition)
				{
					return beat;
				}
			}
			return SongManager.GetFirstBeat(measure.Beats);
		}
		return null;
	}	
}