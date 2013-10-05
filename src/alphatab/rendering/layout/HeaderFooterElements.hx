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
package alphatab.rendering.layout;

/**
 * A list of the elements which can be shown in the header and footer 
 * of a rendered song sheet. All values can be combined using bit-operators as they are flags. 
 */
class HeaderFooterElements
{
    /**
     * No elements get rendered. 
     */
    public static inline var None:Int= 0x0;
    /**
     * Enables rendering of the title.
     */
    public static inline var Title:Int= 0x1;
    /**
     * Enables rendering of the subtitle.
     */    
    public static inline var SubTitle:Int= 0x2;
    /**
     * Enables rendering of the artist.
     */
    public static inline var Artist:Int= 0x4;
    /**
     * Enables rendering of the album.
     */    
    public static inline var Album:Int= 0x8;
    /**
     * Enables rendering of the words.
     */
    public static inline var Words:Int= 0x10;
    /**
     * Enables rendering of the music.
     */    
    public static inline var Music:Int= 0x20;
    /**
     * Enables rendering of the words and music.
     */    
    public static inline var WordsAndMusic:Int= 0x40;
    /**
     * Enables rendering of the copyright.
     */
    public static inline var Copyright:Int= 0x80;
    /**
     * Enables rendering of the page number.
     */    
    public static inline var PageNumber:Int= 0x100;
    /**
     * Enables rendering of all elements. 
     */
    public static inline var All:Int= None | Title | SubTitle | Artist | Album | Words | Music | WordsAndMusic | Copyright | PageNumber;
}