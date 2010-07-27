/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;
	
class GsSong
{
	public var Title:String;
	public var Subtitle:String;
	public var Artist:String;
	public var Album:String;
	public var Words:String;
	public var Music:String;
	public var Copyright:String;
	public var Tab:String;
	public var Instructions:String;
	public var Notice:String;
	
	public var Lyrics:GsLyrics;
	public var PageSetup:GsPageSetup;
	
	public var TempoName:String;
	public var Tempo:Int;
	public var HideTempo:Bool;
	
	public var Key:Int;
	public var Octave:Int;
	
	public var MeasureHeaders:Array<GsMeasureHeader>;
	public var Tracks:Array<GsTrack>;
	
	public function new()
	{
		this.MeasureHeaders = new Array<GsMeasureHeader>();
		this.Tracks = new Array<GsTrack>();
		Title = "";
		Subtitle = "";
		Artist = "";
		Album = "";
		Words = "";
		Music = "";
		Copyright = "";
		Tab = "";
		Instructions = "";
		Notice = "";
	}
	
	public function AddMeasureHeader(header:GsMeasureHeader): Void
	{
		header.Song = this;
		this.MeasureHeaders.push(header);
	}
	
	public function AddTrack(track:GsTrack) : Void 
	{
		track.Song = this;
		this.Tracks.push(track);
	}
}