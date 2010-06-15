/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature;

import js.Dom;
import net.coderline.jsgs.JQuery;
import net.coderline.jsgs.model.GsTrack;
import net.coderline.jsgs.model.Rectangle;
import net.coderline.jsgs.model.Size;
import net.coderline.jsgs.model.SongManager;
import net.coderline.jsgs.platform.Canvas;
import net.coderline.jsgs.platform.CanvasProvider;
import net.coderline.jsgs.tablature.drawing.DrawingResources;
import net.coderline.jsgs.tablature.model.GsSongFactoryImpl;



class Tablature 
{
	public var Canvas : Canvas;
	public var ErrorMessage:String;
	public var Width:Int;
	public var Height:Int;
	public var ViewLayout:ViewLayout;
	public var Track:GsTrack;
	
	private var UpdateDisplay:Bool;
	private var UpdateSong:Bool;
	
	public var SongManager:SongManager;
	
	public function new(source:Dynamic, errorMessage:String = "") 
	{
		this.Canvas = CanvasProvider.GetCanvas(source);
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
		this.UpdateScale(1.1);	
	}
	
	public function SetTrack(track:GsTrack) : Void 
	{
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
		var size:Size = this.ViewLayout.LayoutSize;
		this.ViewLayout.PrepareLayout(new Rectangle(0, 0, size.Width, size.Height), 0, 0);
		
		// store size
		this.Width = this.ViewLayout.Width;
		this.Height = this.ViewLayout.Height;
		
		// update canvas
		this.Canvas.SetWidth(this.ViewLayout.Width);
		this.Canvas.SetHeight(this.ViewLayout.Height);

	}
	
	public function OnPaint() 
	{
		this.PaintBackground();
		
		if (this.Track == null) {
			var text = this.ErrorMessage;
			
			this.Canvas.fillStyle = "#4e4e4e";
			this.Canvas.font = "20px Arial";
			this.Canvas.textBaseline = "middle";
			this.Canvas.fillText(text, 20, 30);
		}
		else 
		{
			var displayRect:Rectangle = new Rectangle(0, 0, this.Width, this.Height);
			this.ViewLayout.PaintCache(this.Canvas, displayRect, 0, 0);
			this.UpdateDisplay = false;
		}
	}
	
	public function UpdateTablature()
	{
		if (this.Track == null) return;
		
		this.ViewLayout.UpdateSong();
        this.DoLayout();
        this.UpdateSong = false;
	}
	 
	public function PaintBackground() {
		this.Canvas.fillStyle = "#eeeedd";
		this.Canvas.fillRect(0, 0, this.Width - 1, this.Height - 1);
		this.Canvas.strokeStyle = "#ddddcc";
		this.Canvas.lineWidth = 20;
		this.Canvas.strokeRect(0, 0, this.Width - 1, this.Height - 1);
	}
	
	public function Invalidate() 
	{
		this.Canvas.clearRect(0, 0, this.Width, this.Height);
		this.OnPaint();
	}
	
}