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
package alphatab.tablature.drawing;
import alphatab.tablature.ViewLayout;
import alphatab.model.Point;

/**
 * This class contains all font settings for drawing. 
 */
class DrawingResources 
{
	public static var defaultFontHeight:Int;
	public static var defaultFont:String;
	public static var chordFont:String;
	public static var timeSignatureFont:String;
	public static var clefFont:String;
	public static var musicFont:String;
	public static var tempoFont:String;
	public static var graceFontHeight:Int;
	public static var graceFont:String;
	public static var noteFont:String;
	public static var noteFontHeight:Int;
	public static var effectFont:String;
	public static var effectFontHeight:Int;
	
	public static var titleFont:String;
	public static var subtitleFont:String;
	public static var wordsFont:String;
	public static var copyrightFont:String;

	public static function init(scale:Float) : Void
	{ 
		defaultFontHeight = Math.round(9*scale);
		defaultFont = Std.string(defaultFontHeight) + "px 'Arial'";
		chordFont = Std.string(9*scale) + "px 'Arial'";
		timeSignatureFont = Std.string(20*scale) + "px 'Arial'";
		clefFont = Std.string(13*scale) + "px 'Arial'";
		musicFont = Std.string(13*scale) + "px 'Arial'";
		tempoFont = Std.string(11*scale) + "px 'Arial'";
		graceFontHeight = Math.round(9*scale);
		graceFont = Std.string(graceFontHeight) + "px 'Arial'";
		noteFontHeight = Math.round(11 * scale);
		noteFont = Std.string(noteFontHeight) + "px 'Arial'";
		effectFontHeight = Math.round(11 * scale);
		effectFont = "italic " + Std.string(effectFontHeight) + "px 'Times New Roman'";
		
		titleFont =  Std.string(30*scale) + "px 'Times New Roman'";
		subtitleFont = Std.string(19 * scale) + "px 'Times New Roman'";
		wordsFont =  Std.string(13 * scale) + "px 'Times New Roman'";
		copyrightFont =  "bold " + Std.string(11 * scale) + "px 'Arial'";
	}
	
	public static function getScoreNoteSize(layout:ViewLayout, full:Bool) : Point
	{
		var scale:Float = (full ? layout.scoreLineSpacing + 1 : layout.scoreLineSpacing) - 2;
		return new Point(Math.round(scale * 1.3), Math.round(scale * 1.0));
	}
}