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
    public static inline var NONE:Int= 0x0;
    /**
     * Enables rendering of the title.
     */
    public static inline var TITLE:Int= 0x1;
    /**
     * Enables rendering of the subtitle.
     */    
    public static inline var SUBTITLE:Int= 0x2;
    /**
     * Enables rendering of the artist.
     */
    public static inline var ARTIST:Int= 0x4;
    /**
     * Enables rendering of the album.
     */    
    public static inline var ALBUM:Int= 0x8;
    /**
     * Enables rendering of the words.
     */
    public static inline var WORDS:Int= 0x10;
    /**
     * Enables rendering of the music.
     */    
    public static inline var MUSIC:Int= 0x20;
    /**
     * Enables rendering of the words and music.
     */    
    public static inline var WORDS_AND_MUSIC:Int= 0x40;
    /**
     * Enables rendering of the copyright.
     */
    public static inline var COPYRIGHT:Int= 0x80;
    /**
     * Enables rendering of the page number.
     */    
    public static inline var PAGE_NUMBER:Int= 0x100;
    /**
     * Enables rendering of all elements. 
     */
    public static inline var ALL:Int= NONE | TITLE | SUBTITLE | ARTIST | ALBUM | WORDS | MUSIC |
    WORDS_AND_MUSIC | COPYRIGHT | PAGE_NUMBER;
}