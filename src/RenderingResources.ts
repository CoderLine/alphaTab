import { Color } from '@src/model/Color';
import { Font, FontStyle, FontWeight } from '@src/model/Font';
import { ScoreSubElement } from '@src/model/Score';

/**
 * This public class contains central definitions for controlling the visual appearance.
 * @json
 * @json_declaration
 */
export class RenderingResources {
    private static sansFont: string = 'Arial, sans-serif';
    private static serifFont: string = 'Georgia, serif';

    /**
     * The SMuFL Font to use for rendering music symbols.
     * @remarks
     * This is only meant for internal passing of font family information between components.
     * Setting this manually can lead to unexpected side effects.
     * @defaultValue `alphaTab`
     * @since 0.9.6
     * @internal
     */
    public smuflFont?: Font;

    /**
     * The font to use for displaying the songs copyright information in the header of the music sheet.
     * @defaultValue `bold 12px Arial, sans-serif`
     * @since 0.9.6
     */
    public copyrightFont: Font = new Font(RenderingResources.sansFont, 12, FontStyle.Plain, FontWeight.Bold);

    /**
     * The font to use for displaying the songs title in the header of the music sheet.
     * @defaultValue `32px Georgia, serif`
     * @since 0.9.6
     */
    public titleFont: Font = new Font(RenderingResources.serifFont, 32, FontStyle.Plain);

    /**
     * The font to use for displaying the songs subtitle in the header of the music sheet.
     * @defaultValue `20px Georgia, serif`
     * @since 0.9.6
     */
    public subTitleFont: Font = new Font(RenderingResources.serifFont, 20, FontStyle.Plain);

    /**
     * The font to use for displaying the lyrics information in the header of the music sheet.
     * @defaultValue `15px Arial, sans-serif`
     * @since 0.9.6
     */
    public wordsFont: Font = new Font(RenderingResources.serifFont, 15, FontStyle.Plain);

    /**
     * The font to use for displaying certain effect related elements in the music sheet.
     * @defaultValue `italic 12px Georgia, serif`
     * @since 0.9.6
     */
    public effectFont: Font = new Font(RenderingResources.serifFont, 12, FontStyle.Italic);

    /**
     * The font to use for displaying beat time information in the music sheet.
     * @defaultValue `12px Georgia, serif`
     * @since 1.4.0
     */
    public timerFont: Font = new Font(RenderingResources.serifFont, 12, FontStyle.Plain);

    /**
     * The font to use for displaying the directions texts.
     * @defaultValue `14px Georgia, serif`
     * @since 1.4.0
     */
    public directionsFont: Font = new Font(RenderingResources.serifFont, 14, FontStyle.Plain);

    /**
     * The font to use for displaying the fretboard numbers in chord diagrams.
     * @defaultValue `11px Arial, sans-serif`
     * @since 0.9.6
     */
    public fretboardNumberFont: Font = new Font(RenderingResources.sansFont, 11, FontStyle.Plain);

    /**
     * The font to use for displaying the numbered music notation in the music sheet.
     * @defaultValue `14px Arial, sans-serif`
     * @since 1.4.0
     */
    public numberedNotationFont: Font = new Font(RenderingResources.sansFont, 16, FontStyle.Plain);

    /**
     * The font to use for displaying the grace notes in numbered music notation in the music sheet.
     * @defaultValue `16px Arial, sans-serif`
     * @since 1.4.0
     */
    public numberedNotationGraceFont: Font = new Font(RenderingResources.sansFont, 14, FontStyle.Plain);

    /**
     * The font to use for displaying the guitar tablature numbers in the music sheet.
     * @defaultValue `13px Arial, sans-serif`
     * @since 0.9.6
     */
    public tablatureFont: Font = new Font(RenderingResources.sansFont, 13, FontStyle.Plain);

    /**
     * The font to use for grace notation related texts in the music sheet.
     * @defaultValue `11px Arial, sans-serif`
     * @since 0.9.6
     */
    public graceFont: Font = new Font(RenderingResources.sansFont, 11, FontStyle.Plain);

    /**
     * The color to use for rendering the lines of staves.
     * @defaultValue `rgb(165, 165, 165)`
     * @since 0.9.6
     */
    public staffLineColor: Color = new Color(165, 165, 165, 0xff);

    /**
     * The color to use for rendering bar separators, the accolade and repeat signs.
     * @defaultValue `rgb(34, 34, 17)`
     * @since 0.9.6
     */
    public barSeparatorColor: Color = new Color(34, 34, 17, 0xff);

    /**
     * The font to use for displaying the bar numbers above the music sheet.
     * @defaultValue `11px Arial, sans-serif`
     * @since 0.9.6
     */
    public barNumberFont: Font = new Font(RenderingResources.sansFont, 11, FontStyle.Plain);

    /**
     * The color to use for displaying the bar numbers above the music sheet.
     * @defaultValue `rgb(200, 0, 0)`
     * @since 0.9.6
     */
    public barNumberColor: Color = new Color(200, 0, 0, 0xff);

    /**
     * The font to use for displaying finger information in the music sheet.
     * @defaultValue `14px Georgia, serif`
     * @since 0.9.6
     */
    public fingeringFont: Font = new Font(RenderingResources.serifFont, 14, FontStyle.Plain);

    /**
     * The font to use for displaying finger information when inline into the music sheet.
     * @defaultValue `12px Georgia, serif`
     * @since 1.4.0
     */
    public inlineFingeringFont: Font = new Font(RenderingResources.serifFont, 12, FontStyle.Plain);

    /**
     * The font to use for section marker labels shown above the music sheet.
     * @defaultValue `bold 14px Georgia, serif`
     * @since 0.9.6
     */
    public markerFont: Font = new Font(RenderingResources.serifFont, 14, FontStyle.Plain, FontWeight.Bold);

    /**
     * The color to use for music notation elements of the primary voice.
     * @defaultValue `rgb(0, 0, 0)`
     * @since 0.9.6
     */
    public mainGlyphColor: Color = new Color(0, 0, 0, 0xff);

    /**
     * The color to use for music notation elements of the secondary voices.
     * @defaultValue `rgb(0,0,0,0.4)`
     * @since 0.9.6
     */
    public secondaryGlyphColor: Color = new Color(0, 0, 0, 100);

    /**
     * The color to use for displaying the song information above the music sheets.
     * @defaultValue `rgb(0, 0, 0)`
     * @since 0.9.6
     */
    public scoreInfoColor: Color = new Color(0, 0, 0, 0xff);

    /**
     * @internal
     * @param element
     */
    public getFontForElement(element: ScoreSubElement): Font {
        switch (element) {
            case ScoreSubElement.Title:
                return this.titleFont;
            case ScoreSubElement.SubTitle:
            case ScoreSubElement.Artist:
            case ScoreSubElement.Album:
                return this.subTitleFont;
            case ScoreSubElement.Words:
            case ScoreSubElement.Music:
            case ScoreSubElement.WordsAndMusic:
            case ScoreSubElement.Transcriber:
                return this.wordsFont;
            case ScoreSubElement.Copyright:
            case ScoreSubElement.CopyrightSecondLine:
                return this.copyrightFont;
        }

        return this.wordsFont;
    }
}
