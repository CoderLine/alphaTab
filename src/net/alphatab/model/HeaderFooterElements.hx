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
package net.alphatab.model;

/**
 * A list of header and footer elements. 
 */
class HeaderFooterElements
{
	public static inline var NONE:Int= 0x0;
	public static inline var TITLE:Int= 0x1;
	public static inline var SUBTITLE:Int= 0x2;
	public static inline var ARTIST:Int= 0x4;
	public static inline var ALBUM:Int= 0x8;
	public static inline var WORDS:Int= 0x10;
	public static inline var MUSIC:Int= 0x20;
	public static inline var WORDS_AND_MUSIC:Int= 0x40;
	public static inline var COPYRIGHT:Int= 0x80;
	public static inline var PAGE_NUMBER:Int= 0x100;
	public static inline var ALL:Int= NONE | TITLE | SUBTITLE | ARTIST | ALBUM | WORDS | MUSIC |
	WORDS_AND_MUSIC | COPYRIGHT | PAGE_NUMBER;
}