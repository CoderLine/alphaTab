/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;
	
class GsLyrics
{
	public static inline var MaxLineCount:Int = 5;
	public static inline var Regex:String = " ";
	
	public var TrackChoice:Int;
	public var Lines:Array<GsLyricLine>;
	
	public function LyricsBeats() : Array<String>
	{
		var full:String = "";
		for(i in 0 ... this.Lines.length)
		{
			var line:GsLyricLine = this.Lines[i];
			if(line != null)
				full += line.Lyrics + "\n";
		}
		
		var ret = StringTools.trim(full);
		ret = StringTools.replace(ret, "\n", Regex);
		ret = StringTools.replace(ret, "\r", Regex);
		return ret.split(Regex);
	}
	
	public function new(trackChoice:Int = 0)
	{
		this.TrackChoice = trackChoice;
		this.Lines = new Array<GsLyricLine>();
	}

}