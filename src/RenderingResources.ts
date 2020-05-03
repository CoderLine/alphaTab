import { Color } from '@src/model/Color';
import { Font, FontStyle } from '@src/model/Font';

/**
 * This public class contains central definitions for controlling the visual appearance.
 * @json
 */
export class RenderingResources {
    private static sansFont: string = 'Arial';
    private static serifFont: string = 'Georgia';

    /**
     * Gets or sets the font to use for displaying the songs copyright information in the header of the music sheet.
     */
    public copyrightFont: Font = new Font(RenderingResources.sansFont, 12, FontStyle.Bold);

    /**
     * Gets or sets the font to use for displaying the songs title in the header of the music sheet.
     */
    public titleFont: Font = new Font(RenderingResources.serifFont, 32, FontStyle.Plain);

    /**
     * Gets or sets the font to use for displaying the songs subtitle in the header of the music sheet.
     */
    public subTitleFont: Font = new Font(RenderingResources.serifFont, 20, FontStyle.Plain);

    /**
     * Gets or sets the font to use for displaying the lyrics information in the header of the music sheet.
     */
    public wordsFont: Font = new Font(RenderingResources.serifFont, 15, FontStyle.Plain);

    /**
     * Gets or sets the font to use for displaying certain effect related elements in the music sheet.
     */
    public effectFont: Font = new Font(RenderingResources.serifFont, 12, FontStyle.Italic);

    /**
     * Gets or sets the font to use for displaying the fretboard numbers in chord diagrams.
     */
    public fretboardNumberFont: Font = new Font(RenderingResources.sansFont, 11, FontStyle.Plain);

    /**
     * Gets or sets the font to use for displaying the guitar tablature numbers in the music sheet.
     */
    public tablatureFont: Font = new Font(RenderingResources.sansFont, 13, FontStyle.Plain);

    /**
     * Gets or sets the font to use for grace notation related texts in the music sheet.
     */
    public graceFont: Font = new Font(RenderingResources.sansFont, 11, FontStyle.Plain);

    /**
     * Gets or sets the color to use for rendering the lines of staves.
     */
    public staffLineColor: Color = new Color(165, 165, 165, 0xff);

    /**
     * Gets or sets the color to use for rendering bar separators, the accolade and repeat signs.
     */
    public barSeparatorColor: Color = new Color(34, 34, 17, 0xff);

    /**
     * Gets or sets the font to use for displaying the bar numbers above the music sheet.
     */
    public barNumberFont: Font = new Font(RenderingResources.sansFont, 11, FontStyle.Plain);

    /**
     * Gets or sets the color to use for displaying the bar numbers above the music sheet.
     */
    public barNumberColor: Color = new Color(200, 0, 0, 0xff);

    /**
     * Gets or sets the font to use for displaying finger information in the music sheet.
     */
    public fingeringFont: Font = new Font(RenderingResources.serifFont, 14, FontStyle.Plain);

    /**
     * Gets or sets the font to use for section marker labels shown above the music sheet.
     */
    public markerFont: Font = new Font(RenderingResources.serifFont, 14, FontStyle.Bold);

    /**
     * Gets or sets the color to use for music notation elements of the primary voice.
     */
    public mainGlyphColor: Color = new Color(0, 0, 0, 0xff);

    /**
     * Gets or sets the color to use for music notation elements of the secondary voices.
     */
    public secondaryGlyphColor: Color = new Color(0, 0, 0, 100);

    /**
     * Gets or sets the color to use for displaying the song information above the music sheet.
     */
    public scoreInfoColor: Color = new Color(0, 0, 0, 0xff);
}
