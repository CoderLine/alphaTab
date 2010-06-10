/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;

class GsPageSetup
{
	private static var _defaults:GsPageSetup = null;
	public static function Defaults() : GsPageSetup
	{
		if(_defaults == null)
		{
			_defaults = new GsPageSetup();
			_defaults.PageSize = new Point(210,297);
			_defaults.PageMargin = new Rectangle(10,15,10,10);
			_defaults.ScoreSizeProportion = 1;
			_defaults.HeaderAndFooter = GsHeaderFooterElements.All;
			_defaults.Title = "%TITLE%";
			_defaults.Subtitle = "%SUBTITLE%";
			_defaults.Artist = "%ARTIST%";
			_defaults.Album = "%ALBUM%";
			_defaults.Words = "Words by %WORDS%";
			_defaults.Music = "Music by %MUSIC%";
			_defaults.WordsAndMusic = "Words & Music by %WORDSMUSIC%";
			_defaults.Copyright = "Copyright %COPYRIGHT%\n"  +
					  "All Rights Reserved - International Copyright Secured";
			_defaults.PageNumber = "Page %N%/%P%";
		}
		return _defaults;
	}
	
	public var PageSize:Point;
	public var PageMargin:Rectangle;
	public var ScoreSizeProportion:Float;
	public var HeaderAndFooter:Int;
	
	public var Title:String;
	public var Subtitle:String;
	public var Artist:String;
	public var Album:String;
	public var Words:String;
	public var Music:String;
	public var WordsAndMusic:String;
	public var Copyright:String;
	public var PageNumber:String;
	
	public function new()
	{
	}

}