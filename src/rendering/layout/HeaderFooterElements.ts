/**
 * A list of the elements which can be shown in the header and footer
 * of a rendered song sheet. All values can be combined using bit-operators as they are flags.
 */
export enum HeaderFooterElements {
    /**
     * No elements get rendered.
     */
    None = 0x0,

    /**
     * Enables rendering of the title.
     */
    Title = 0x1,

    /**
     * Enables rendering of the subtitle.
     */
    SubTitle = 0x2,

    /**
     * Enables rendering of the artist.
     */
    Artist = 0x4,

    /**
     * Enables rendering of the album.
     */
    Album = 0x8,

    /**
     * Enables rendering of the words.
     */
    Words = 0x10,

    /**
     * Enables rendering of the music.
     */
    Music = 0x20,

    /**
     * Enables rendering of the words and music.
     */
    WordsAndMusic = 0x40,

    /**
     * Enables rendering of the copyright.
     */
    Copyright = 0x80,

    /**
     * Enables rendering of the page number.
     */
    PageNumber = 0x100,

    /**
     * Enables rendering of all elements.
     */
    All = None | Title | SubTitle | Artist | Album | Words | Music | WordsAndMusic | Copyright | PageNumber
}
