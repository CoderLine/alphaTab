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
 * The page setup describes how the document is rendered. 
 * It contains page size, margins, paddings, and how the title elements are rendered. 
 * 
 * Following template vars are available for defining the page texts:
 *    %TITLE% - Will get replaced with Song.title
 *    %SUBTITLE% - Will get replaced with Song.subtitle
 *    %ARTIST% - Will get replaced with Song.artist
 *    %ALBUM% - Will get replaced with Song.album
 *    %WORDS% - Will get replaced with Song.words
 *    %MUSIC% - Will get replaced with Song.music
 *    %WORDSANDMUSIC% - Will get replaced with the according word and music values
 *    %COPYRIGHT% - Will get replaced with Song.copyright
 *    %N% - Will get replaced with the current page number (if supported by layout)
 *    %P% - Will get replaced with the number of pages (if supported by layout)
 */
class PageSetup
{
	/**
	 * The size of the page in millimeter x millimeter
	 */
	public var pageSize:Point;
	
	/**
	 * The padding between the page border and the song contents.
	 */
	public var pageMargin:Padding;
	
	/**
	 * The zoom level of the song. 
	 */
	public var scoreSizeProportion:Float;
	
	/**
	 * Flags which elements of the page should get rendered.
	 */
	public var headerAndFooter:Int;
	
	/**
	 * The template which defines the text of the title. 
	 */
	public var title:String;
    /**
     * The template which defines the text of the subtitle. 
     */
	public var subtitle:String;
    /**
     * The template which defines the text of the artist. 
     */
	public var artist:String;
    /**
     * The template which defines the text of the album. 
     */
	public var album:String;
    /**
     * The template which defines the text of the title. 
     */
	public var words:String;
    /**
     * The template which defines the text of the music. 
     */
	public var music:String;
    /**
     * The template which defines the text of the wordsAndMusic. 
     */
	public var wordsAndMusic:String;
    /**
     * The template which defines the text of the copyright. 
     */
	public var copyright:String;
    /**
     * The template which defines the text of the pageNumber. 
     */
	public var pageNumber:String;
	
	/**
	 * Initializes a new instance of the PageSetup class. 
	 */
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