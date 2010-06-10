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
import net.coderline.jsgs.tablature.drawing.DrawingResources;
import net.coderline.jsgs.tablature.model.GsSongFactoryImpl;


class Tablature 
{
	public var Canvas: js.HtmlDom;
	public var JCanvas:JQuery;
	public var ErrorMessage:String;
	public var Width:Int;
	public var Height:Int;
	public var ViewLayout:ViewLayout;
	public var Track:GsTrack;
	
	public var Ctx: Dynamic; // Canvas2DRenderingContext
	private var UpdateDisplay:Bool;
	private var UpdateSong:Bool;
	
	public var SongManager:SongManager;
	
	public function new(canvasId:String) 
	{
		this.JCanvas = JQuery.Qy("#" + canvasId);
		this.Canvas =  this.JCanvas.GetAt(0);
		this.Track = null;
		this.SongManager = new SongManager(new GsSongFactoryImpl());
		
		this.UpdateContext();
		this.ErrorMessage = StringTools.trim(this.JCanvas.Text());
		
		if (this.ErrorMessage == "" || this.ErrorMessage == null) 
		{
			this.ErrorMessage = "Please set a song's track to display the tablature";
		}
		
		this.Width = this.JCanvas.Width();
		this.Height = this.JCanvas.Height();
		this.ViewLayout = new PageViewLayout();
		this.ViewLayout.SetTablature(this);
		this.UpdateScale(1.1);	
	}
	
	public function UpdateContext() {
		untyped
		{
			if (this.Canvas.getContext) {
				this.Ctx = this.Canvas.getContext("2d");
			} else {
				throw "The specified tag is no valid HTML5 canvas element";
			}
		}	
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
		
		// Update graphics
		untyped
		{
			this.Canvas.width = this.Width;
			this.Canvas.height = this.Height;
		}
		
		// update html element
		this.JCanvas.SetWidth(this.ViewLayout.Width);
		this.JCanvas.SetHeight(this.ViewLayout.Height);
		// update context
		this.UpdateContext();
	}
	
	public function OnPaint() 
	{
		this.PaintBackground();
		
		if (this.Track == null) {
			var text = this.ErrorMessage;
			
			this.Ctx.fillStyle = "#4e4e4e";
			this.Ctx.font = "20px Arial";
			this.Ctx.textBaseline = "middle";
			this.Ctx.fillText(text, 20, 30);
		}
		else 
		{
			var displayRect:Rectangle = new Rectangle(0, 0, this.Width, this.Height);
			this.ViewLayout.PaintCache(this.Ctx, displayRect, 0, 0);
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
		this.Ctx.fillStyle = "#eeeedd";
		this.Ctx.fillRect(0, 0, this.Width - 1, this.Height - 1);
		this.Ctx.strokeStyle = "#ddddcc";
		this.Ctx.lineWidth = 20;
		this.Ctx.strokeRect(0, 0, this.Width - 1, this.Height - 1);
	}
	
	public function Invalidate() 
	{
		this.Ctx.clearRect(0, 0, this.Width, this.Height);
		this.OnPaint();
	}
	
}