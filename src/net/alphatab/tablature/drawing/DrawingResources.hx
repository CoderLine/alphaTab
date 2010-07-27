/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.drawing;
import net.alphatab.model.Size;
import net.alphatab.tablature.ViewLayout;
import net.alphatab.Utils;

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
	public static var EffectFont:String;
	public static var EffectFontHeight:Int;
	
	public static var TitleFont:String;
	public static var SubtitleFont:String;
	public static var WordsFont:String;

	public static function Init(scale:Float) : Void
	{ 
		DefaultFontHeight = Math.round(9*scale);
		DefaultFont = Utils.string(DefaultFontHeight) + "px Arial";
		ChordFont = Utils.string(9*scale) + "px Arial";
		TimeSignatureFont = Utils.string(20*scale) + "px Arial";
		ClefFont = Utils.string(13*scale) + "px Arial";
		MusicFont = Utils.string(13*scale) + "px Arial";
		TempoFont = Utils.string(11*scale) + "px Arial";
		GraceFontHeight = Math.round(9*scale);
		GraceFont = Utils.string(GraceFontHeight) + "px Arial";
		NoteFontHeight = Math.round(11 * scale);
		NoteFont = Utils.string(NoteFontHeight) + "px Arial";
		EffectFontHeight = Math.round(11 * scale);
		EffectFont = "italic " + Utils.string(EffectFontHeight) + "px Times New Roman";
		
		TitleFont =  Utils.string(30*scale) + "px Times New Roman";
		SubtitleFont = Utils.string(19 * scale) + "px Times New Roman";
		WordsFont =  Utils.string(13 * scale) + "px Times New Roman";
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