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
 * The page setup describes how the document is rendered
 */
class PageSetup
{
	
	public var pageSize:Point;
	public var pageMargin:Padding;
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
		pageSize = new Point(210,297);
		pageMargin = new Padding(10,15,10,10);
		scoreSizeProportion = 1;
		headerAndFooter = HeaderFooterElements.ALL;
		title = "%TITLE%";
		subtitle = "%SUBTITLE%";
		artist = "%ARTIST%";
		album = "%ALBUM%";
		words = "Words by %WORDS%";
		music = "Music by %MUSIC%";
		wordsAndMusic = "Words & Music by %WORDSMUSIC%";
		copyright = "Copyright %COPYRIGHT%\n"  +
				  "All Rights Reserved - International Copyright Secured";
		pageNumber = "Page %N%/%P%";
	}
}