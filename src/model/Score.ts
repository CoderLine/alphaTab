import { MasterBar } from '@src/model/MasterBar';
import { RenderStylesheet } from '@src/model/RenderStylesheet';
import { RepeatGroup } from '@src/model/RepeatGroup';
import { Track } from '@src/model/Track';
import { Settings } from '@src/Settings';
import { ElementStyle } from './ElementStyle';
import { Bar } from './Bar';
import { Beat } from './Beat';
import { Voice } from './Voice';
import { Note } from './Note';
import { TextAlign } from '@src/platform';
import type { NotationSettings } from '@src/NotationSettings';

/**
 * Lists all graphical sub elements within a {@link Score} which can be styled via {@link Score.style}
 */
export enum ScoreSubElement {
    /**
     * The title of the song
     */
    Title,
    /**
     * The subtitle of the song
     */
    SubTitle,
    /**
     * The artist of the song
     */
    Artist,
    /**
     * The album of the song
     */
    Album,
    /**
     * The word author of the song
     */
    Words,
    /**
     * The Music author of the song
     */
    Music,
    /**
     * The Words&Music author of the song
     */
    WordsAndMusic,
    /**
     * The transcriber of the music sheet
     */
    Transcriber,

    /**
     * The copyright holder of the song
     */
    Copyright,

    /**
     * The second copyright line (typically something like 'All Rights Reserved')
     */
    CopyrightSecondLine,

    /**
     * The chord diagram list shown on top of the score.
     */
    ChordDiagramList
}

/**
 * The additional style and display information for header and footer elements.
 * @json
 * @json_strict
 */
export class HeaderFooterStyle {
    /**
     * The template how the text should be formatted. Following placeholders exist and are filled from the song information:
     * * `%TITLE%`
     * * `%SUBTITLE%`
     * * `%ARTIST%`
     * * `%ALBUM%`
     * * `%WORDS%`
     * * `%MUSIC%`
     * * `%TABBER%`
     * * `%COPYRIGHT%`
     */
    public template: string;

    /**
     * Whether the element should be visible. Overriden by {@link NotationSettings.elements} if specified.
     */
    public isVisible?: boolean;

    /**
     * The alignment of the element on the page.
     */
    public textAlign: TextAlign;

    public constructor(
        template: string = '',
        isVisible: boolean | undefined = undefined,
        textAlign: TextAlign = TextAlign.Left
    ) {
        this.template = template;
        this.isVisible = isVisible;
        this.textAlign = textAlign;
    }

    public buildText(score: Score) {
        let anyPlaceholderFilled = false;
        let anyPlaceholder = false;
        const replaced = this.template.replace(HeaderFooterStyle.PlaceholderPattern, (match, variable) => {
            anyPlaceholder = true;
            let value = '';
            switch (variable) {
                case `TITLE`:
                    value = score.title;
                    break;
                case `SUBTITLE`:
                    value = score.subTitle;
                    break;
                case `ARTIST`:
                    value = score.artist;
                    break;
                case `ALBUM`:
                    value = score.album;
                    break;
                case `WORDS`:
                    value = score.words;
                    break;
                case `MUSIC`:
                    value = score.music;
                    break;
                case `TABBER`:
                    value = score.tab;
                    break;
                case `COPYRIGHT`:
                    value = score.copyright;
                    break;
                default:
                    value = score.title;
                    break;
            }

            if (value) {
                anyPlaceholderFilled = true;
            }
            return value;
        });

        if (anyPlaceholder && !anyPlaceholderFilled) {
            return '';
        }
        return replaced;
    }

    private static readonly PlaceholderPattern = new RegExp('%([^%]+)%', 'g');
}

/**
 * Defines the custom styles for Scores.
 * @json
 * @json_strict
 */
export class ScoreStyle extends ElementStyle<ScoreSubElement> {
    /**
     * Changes additional style aspects fo the of the specified sub-element.
     */
    public headerAndFooter: Map<ScoreSubElement, HeaderFooterStyle | null> = new Map<
        ScoreSubElement,
        HeaderFooterStyle | null
    >();

    /**
     * The default styles applied to headers and footers if not specified
     */
    public static readonly defaultHeaderAndFooter: Map<ScoreSubElement, HeaderFooterStyle> = new Map<
        ScoreSubElement,
        HeaderFooterStyle
    >([
        [ScoreSubElement.Title, new HeaderFooterStyle('%TITLE%', undefined, TextAlign.Center)],
        [ScoreSubElement.SubTitle, new HeaderFooterStyle('%SUBTITLE%', undefined, TextAlign.Center)],
        [ScoreSubElement.Artist, new HeaderFooterStyle('%ARTIST%', undefined, TextAlign.Center)],
        [ScoreSubElement.Album, new HeaderFooterStyle('%ALBUM%', undefined, TextAlign.Center)],
        [ScoreSubElement.Words, new HeaderFooterStyle('Words by %WORDS%', undefined, TextAlign.Left)],
        [ScoreSubElement.Music, new HeaderFooterStyle('Music by %MUSIC%', undefined, TextAlign.Right)],
        [ScoreSubElement.WordsAndMusic, new HeaderFooterStyle('Words & Music by %MUSIC%', undefined, TextAlign.Right)],
        [ScoreSubElement.Transcriber, new HeaderFooterStyle('Tabbed by %TABBER%', false, TextAlign.Right)],
        [ScoreSubElement.Copyright, new HeaderFooterStyle('%COPYRIGHT%', undefined, TextAlign.Center)],
        [
            ScoreSubElement.CopyrightSecondLine,
            new HeaderFooterStyle('All Rights Reserved - International Copyright Secured', true, TextAlign.Center)
        ]
    ]);
}

/**
 * The score is the root node of the complete
 * model. It stores the basic information of
 * a song and stores the sub components.
 * @json
 * @json_strict
 */
export class Score {
    private _currentRepeatGroup: RepeatGroup | null = null;
    private _openedRepeatGroups: RepeatGroup[] = [];
    private _properlyOpenedRepeatGroups: number = 0;

    /**
     * Resets all internal ID generators.
     */
    public static resetIds() {
        Bar.resetIds();
        Beat.resetIds();
        Voice.resetIds();
        Note.resetIds();
    }

    /**
     * The album of this song.
     */
    public album: string = '';

    /**
     * The artist who performs this song.
     */
    public artist: string = '';

    /**
     * The owner of the copyright of this song.
     */
    public copyright: string = '';

    /**
     * Additional instructions
     */
    public instructions: string = '';

    /**
     * The author of the music.
     */
    public music: string = '';

    /**
     * Some additional notes about the song.
     */
    public notices: string = '';

    /**
     * The subtitle of the song.
     */
    public subTitle: string = '';

    /**
     * The title of the song.
     */
    public title: string = '';

    /**
     * The author of the song lyrics
     */
    public words: string = '';

    /**
     * The author of this tablature.
     */
    public tab: string = '';

    /**
     * Gets or sets the global tempo of the song in BPM. The tempo might change via {@link MasterBar.tempoAutomations}.
     */
    public tempo: number = 120;

    /**
     * Gets or sets the name/label of the tempo.
     */
    public tempoLabel: string = '';

    /**
     * Gets or sets a list of all masterbars contained in this song.
     * @json_add addMasterBar
     */
    public masterBars: MasterBar[] = [];

    /**
     * Gets or sets a list of all tracks contained in this song.
     * @json_add addTrack
     */
    public tracks: Track[] = [];

    /**
     * Defines how many bars are placed into the systems (rows) when displaying
     * multiple tracks unless a value is set in the systemsLayout.
     */
    public defaultSystemsLayout: number = 3;

    /**
     * Defines how many bars are placed into the systems (rows) when displaying
     * multiple tracks.
     */
    public systemsLayout: number[] = [];

    /**
     * Gets or sets the rendering stylesheet for this song.
     */
    public stylesheet: RenderStylesheet = new RenderStylesheet();

    /**
     * The style customizations for this item.
     */
    public style?: ScoreStyle;

    public rebuildRepeatGroups(): void {
        this._currentRepeatGroup = null;
        this._openedRepeatGroups = [];
        this._properlyOpenedRepeatGroups = 0;
        for (const bar of this.masterBars) {
            this.addMasterBarToRepeatGroups(bar);
        }
    }

    public addMasterBar(bar: MasterBar): void {
        bar.score = this;
        bar.index = this.masterBars.length;
        if (this.masterBars.length !== 0) {
            bar.previousMasterBar = this.masterBars[this.masterBars.length - 1];
            bar.previousMasterBar.nextMasterBar = bar;
            // TODO: this will not work on anacrusis. Correct anacrusis durations are only working
            // when there are beats with playback positions already computed which requires full finish
            // chicken-egg problem here. temporarily forcing anacrusis length here to 0
            bar.start =
                bar.previousMasterBar.start +
                (bar.previousMasterBar.isAnacrusis ? 0 : bar.previousMasterBar.calculateDuration());
        }

        this.addMasterBarToRepeatGroups(bar);

        this.masterBars.push(bar);
    }

    /**
     * Adds the given bar correctly into the current repeat group setup.
     * @param bar
     */
    private addMasterBarToRepeatGroups(bar: MasterBar) {
        // handling the repeats is quite tricky due to many invalid combinations a user might define
        // there are also some complexities due to nested repeats and repeats with multiple endings but only one opening.
        // all scenarios are handled below.

        // NOTE: In all paths we need to ensure that the bar is added to some repeat group

        // start a new repeat group if really a repeat is started
        // or we don't have a group.
        if (bar.isRepeatStart) {
            // if the current group was already closed (this opening doesn't cause nesting)
            // we consider the group as completed
            if (this._currentRepeatGroup?.isClosed) {
                this._openedRepeatGroups.pop();
                this._properlyOpenedRepeatGroups--;
            }
            this._currentRepeatGroup = new RepeatGroup();
            this._openedRepeatGroups.push(this._currentRepeatGroup);
            this._properlyOpenedRepeatGroups++;
        } else if (!this._currentRepeatGroup) {
            this._currentRepeatGroup = new RepeatGroup();
            this._openedRepeatGroups.push(this._currentRepeatGroup);
        }

        // close current group if there was one started
        this._currentRepeatGroup.addMasterBar(bar);

        // handle repeat ends
        if (bar.isRepeatEnd) {
            // if we have nested repeat groups a repeat end
            // will treat the group as completed
            if (this._properlyOpenedRepeatGroups > 1) {
                this._openedRepeatGroups.pop();
                this._properlyOpenedRepeatGroups--;
                // restore outer group in cases like "open open close close"
                this._currentRepeatGroup =
                    this._openedRepeatGroups.length > 0
                        ? this._openedRepeatGroups[this._openedRepeatGroups.length - 1]
                        : null;
            }
            // else: if only one group is opened, this group stays active for
            // scenarios like open close bar close
        }
    }

    public addTrack(track: Track): void {
        track.score = this;
        track.index = this.tracks.length;
        this.tracks.push(track);
    }

    public finish(settings: Settings): void {
        const sharedDataBag = new Map<string, unknown>();
        for (let i: number = 0, j: number = this.tracks.length; i < j; i++) {
            this.tracks[i].finish(settings, sharedDataBag);
        }
    }
}
