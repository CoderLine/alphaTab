/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.drawing;
import net.coderline.jsgs.model.Size;
import net.coderline.jsgs.tablature.ViewLayout;

class DrawingResources 
{
	public static var DefaultFontHeight:Int;
	public static var DefaultFont:String;
	public static var ChordFont:String;
	public static var TimeSignatureFont:String;
	public static var ClefFont:String;
	public static var MusicFont:String;
	public static var TempoFont:String;
	public static var GraceFontHeight:Int;
	public static var GraceFont:String;
	public static var NoteFont:String;
	public static var NoteFontHeight:Int;
	
	public static var TitleFont:String;
	public static var SubtitleFont:String;
	public static var WordsFont:String;

	public static function Init(scale:Float) : Void
	{
		DefaultFontHeight = Math.round(9*scale);
		DefaultFont = Std.string(DefaultFontHeight) + "px Arial";
		ChordFont = Std.string(9*scale) + "px Arial";
		TimeSignatureFont = Std.string(20*scale) + "px Arial";
		ClefFont = Std.string(13*scale) + "px Arial";
		MusicFont = Std.string(13*scale) + "px Arial";
		TempoFont = Std.string(11*scale) + "px Arial";
		GraceFontHeight = Math.round(11*scale);
		GraceFont = Std.string(GraceFontHeight) + "px Arial";
		NoteFontHeight = Math.round(11 * scale);
		NoteFont = Std.string(NoteFontHeight) + "px Arial";
		
		TitleFont =  Std.string(30*scale) + "px Times New Roman";
		SubtitleFont = Std.string(19 * scale) + "px Times New Roman";
		WordsFont =  Std.string(13 * scale) + "px Times New Roman";
	}
	
	public static function GetScoreNoteSize(layout:ViewLayout, full:Bool) : Size
	{
		var scale:Float = (full ? layout.ScoreLineSpacing + 1 : layout.ScoreLineSpacing) - 2;
		return new Size(Math.round(scale * 1.3), Math.round(scale * 1.0));
	}
	
	public function new() 
	{
		
	}
	
}