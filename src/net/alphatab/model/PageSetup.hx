package net.alphatab.model;

/**
 * The page setup describes how the document is rendered
 */
class PageSetup
{
	private static var _defaults:PageSetup = null;
	public static function defaults() : PageSetup
	{
		if(_defaults == null)
		{
			_defaults = new PageSetup();
			_defaults.pageSize = new Point(210,297);
			_defaults.pageMargin = new Rectangle(10,15,10,10);
			_defaults.scoreSizeProportion = 1;
			_defaults.headerAndFooter = HeaderFooterElements.ALL;
			_defaults.title = "%TITLE%";
			_defaults.subtitle = "%SUBTITLE%";
			_defaults.artist = "%ARTIST%";
			_defaults.album = "%ALBUM%";
			_defaults.words = "Words by %WORDS%";
			_defaults.music = "Music by %MUSIC%";
			_defaults.wordsAndMusic = "Words & Music by %WORDSMUSIC%";
			_defaults.copyright = "Copyright %COPYRIGHT%\n"  +
					  "All Rights Reserved - International Copyright Secured";
			_defaults.pageNumber = "Page %N%/%P%";
		}
		return _defaults;
	}
	
	public var pageSize:Point;
	public var pageMargin:Rectangle;
	public var scoreSizeProportion:Float;
	public var headerAndFooter:Int;
	
	public var title:String;
	public var subtitle:String;
	public var artist:String;
	public var album:String;
	public var words:String;
	public var music:String;
	public var wordsAndMusic:String;
	public var copyright:String;
	public var pageNumber:String;
	
	public function new()
	{
	}
}