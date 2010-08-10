package net.alphatab.model;

/**
 * This is the toplevel node of the song model. 
 */
class Song
{
	public var title:String;
	public var subtitle:String;
	public var artist:String;
	public var album:String;
	public var words:String;
	public var music:String;
	public var copyright:String;
	public var tab:String;
	public var instructions:String;
	public var notice:String;
	
	public var lyrics:Lyrics;
	public var pageSetup:PageSetup;

	public var tempoName:String;
	public var tempo:Int;
	public var hideTempo:Bool;
	
	public var key:Int;
	public var octave:Int;
	
	public var measureHeaders:Array<MeasureHeader>;
	public var tracks:Array<Track>;
	
	public function new()
	{
		measureHeaders = new Array<MeasureHeader>();
		tracks = new Array<Track>();
		title = "";
		subtitle = "";
		artist = "";
		album = "";
		words = "";
		music = "";
		copyright = "";
		tab = "";
		instructions = "";
		notice = "";
	}
	
	public function addMeasureHeader(header:MeasureHeader): Void
	{
		header.song = this;
		measureHeaders.push(header);
	}
	
	public function addTrack(track:Track) : Void 
	{
		track.song = this;
		tracks.push(track);
	}
}