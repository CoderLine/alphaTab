import { Color } from '@src/model/Color';
import { Font, FontStyle, FontWeight } from '@src/model/Font';

/**
 * This public class contains central definitions for controlling the visual appearance.
 * 
 * ### Fonts
 * 
 * For the JavaScript platform any font that might be installed on the client machines can be used. 
 * Any additional fonts can be added via WebFonts. The rendering of the score will be delayed until it is detected that the font was loaded. 
 * Simply use any CSS font property compliant string as configuration. Relative font sizes with percentual values are not supported, remaining values will be considered if supported.
 * 
 * {@since 1.2.3}
 * Multiple fonts are also supported for the Web version. alphaTab will check if any of the fonts in the list is loaded instead of all. If none is available at the time alphaTab is initialized, 
 * it will try to initiate the load of the specified fonts individual through the Browser Font APIs.
 * 
 * For the .net platform any installed font on the system can be used. Simply construct the `Font` object to configure your desired fonts. 
 * 
 * ### Colors
 * 
 * For JavaScript you can use any CSS font property compliant string. (#RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb(r,g,b), rgba(r,g,b,a) )
 * 
 * On .net simply construct the `Color` object to configure your desired color. 
 * 
 * @json
 * @json_declaration
 */
export class RenderingResources {
    private static sansFont: string = 'Arial, sans-serif';
    private static serifFont: string = 'Georgia, serif';

    /**
     * The font to use for displaying the songs copyright information in the header of the music sheet.
     * @since 0.9.6
     */
    public copyrightFont: Font = new Font(RenderingResources.sansFont, 12, FontStyle.Plain, FontWeight.Bold);

    /**
     * The font to use for displaying the songs title in the header of the music sheet.
     * @since 0.9.6
     */
    public titleFont: Font = new Font(RenderingResources.serifFont, 32, FontStyle.Plain);

    /**
     * The font to use for displaying the songs subtitle in the header of the music sheet.
     * @since 0.9.6
     */
    public subTitleFont: Font = new Font(RenderingResources.serifFont, 20, FontStyle.Plain);

    /**
     * The font to use for displaying the lyrics information in the header of the music sheet.
     * @since 0.9.6
     */
    public wordsFont: Font = new Font(RenderingResources.serifFont, 15, FontStyle.Plain);

    /**
     * The font to use for displaying certain effect related elements in the music sheet.
     * @since 0.9.6
     */
    public effectFont: Font = new Font(RenderingResources.serifFont, 12, FontStyle.Italic);

    /**
     * The font to use for displaying the fretboard numbers in chord diagrams.
     * @since 0.9.6
     */
    public fretboardNumberFont: Font = new Font(RenderingResources.sansFont, 11, FontStyle.Plain);

    /**
     * The font to use for displaying the guitar tablature numbers in the music sheet.
     * @since 0.9.6
     */
    public tablatureFont: Font = new Font(RenderingResources.sansFont, 13, FontStyle.Plain);

    /**
     * The font to use for grace notation related texts in the music sheet.
     * @since 0.9.6
     */
    public graceFont: Font = new Font(RenderingResources.sansFont, 11, FontStyle.Plain);

    /**
     * The color to use for rendering the lines of staves.
     * @since 0.9.6
     */
    public staffLineColor: Color = new Color(165, 165, 165, 0xff);

    /**
     * The color to use for rendering bar separators, the accolade and repeat signs.
     * @since 0.9.6
     */
    public barSeparatorColor: Color = new Color(34, 34, 17, 0xff);

    /**
     * The font to use for displaying the bar numbers above the music sheet.
     * @since 0.9.6
     */
    public barNumberFont: Font = new Font(RenderingResources.sansFont, 11, FontStyle.Plain);

    /**
     * The color to use for displaying the bar numbers above the music sheet.
     * @since 0.9.6
     */
    public barNumberColor: Color = new Color(200, 0, 0, 0xff);

    /**
     * The font to use for displaying finger information in the music sheet.
     * @since 0.9.6
     */
    public fingeringFont: Font = new Font(RenderingResources.serifFont, 14, FontStyle.Plain);

    /**
     * The font to use for section marker labels shown above the music sheet.
     * @since 0.9.6
     */
    public markerFont: Font = new Font(RenderingResources.serifFont, 14, FontStyle.Plain, FontWeight.Bold);

    /**
     * The color to use for music notation elements of the primary voice.
     * @since 0.9.6
     */
    public mainGlyphColor: Color = new Color(0, 0, 0, 0xff);

    /**
     * The color to use for music notation elements of the secondary voices.
     * @since 0.9.6
     */
    public secondaryGlyphColor: Color = new Color(0, 0, 0, 100);

    /**
     * The color to use for displaying the song information above the music sheet.
     * @since 0.9.6
     */
    public scoreInfoColor: Color = new Color(0, 0, 0, 0xff);
}
