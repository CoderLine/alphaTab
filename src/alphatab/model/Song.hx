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
package alphatab.model;

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