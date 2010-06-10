/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;

class GsHeaderFooterElements
{
	public static inline var None:Int= 0x0;
	public static inline var Title:Int= 0x1;
	public static inline var Subtitle:Int= 0x2;
	public static inline var Artist:Int= 0x4;
	public static inline var Album:Int= 0x8;
	public static inline var Words:Int= 0x10;
	public static inline var Music:Int= 0x20;
	public static inline var WordsAndMusic:Int= 0x40;
	public static inline var Copyright:Int= 0x80;
	public static inline var PageNumber:Int= 0x100;
	public static inline var All:Int= None | Title | Subtitle | Artist | Album | Words | Music |
	WordsAndMusic | Copyright | PageNumber;
	
	private function new()
	{		
	}
}