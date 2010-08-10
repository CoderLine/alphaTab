package net.alphatab.model;

/**
 * Represents a collection of lyrics lines for a track. 
 */
class Lyrics
{
	public static inline var MAX_LINE_COUNT:Int = 5;
	
	public var trackChoice:Int;
	public var lines:Array<LyricLine>;
	
	public function lyricsBeats() : Array<String>
	{
		var full:String = "";
		for (line in lines)
		{
			if(line != null)
				full += line.lyrics + "\n";
		}

		var ret = StringTools.trim(full);
		ret = StringTools.replace(ret, "\n", " ");
		ret = StringTools.replace(ret, "\r", " ");
		return ret.split(" ");
	}
	
	public function new(trackChoice:Int = 0)
	{
		this.trackChoice = trackChoice;
		lines = new Array<LyricLine>();
	}

}