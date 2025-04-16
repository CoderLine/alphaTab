import type { Beat } from '@src/model/Beat';
import { Color } from '@src/model/Color';
import type { Lyrics } from '@src/model/Lyrics';
import { PlaybackInformation } from '@src/model/PlaybackInformation';
import type { Score } from '@src/model/Score';
import { Staff } from '@src/model/Staff';
import type { Settings } from '@src/Settings';
import type { InstrumentArticulation } from '@src/model/InstrumentArticulation';
import { ElementStyle } from '@src/model/ElementStyle';

/**
 * Lists all graphical sub elements within a {@link Track} which can be styled via {@link Track.style}
 */
export enum TrackSubElement {
    /**
     * The track names shown before the staves.
     */
    TrackName = 0,

    /**
     * The braces and brackets grouping the staves.
     * If a bracket spans multiple tracks, the color of the first track counts.
     */
    BracesAndBrackets = 1,

    /**
     * The system separator.
     */
    SystemSeparator = 2,

    /**
     * The tuning of the strings.
     */
    StringTuning = 3
}

/**
 * Defines the custom styles for tracks.
 * @json
 * @json_strict
 */
export class TrackStyle extends ElementStyle<TrackSubElement> {}

/**
 * This public class describes a single track or instrument of score.
 * It is primarily a list of staves containing individual music notation kinds.
 * @json
 * @json_strict
 */
export class Track {
    private static readonly ShortNameMaxLength: number = 10;
    /**
     * Gets or sets the zero-based index of this track.
     * @json_ignore
     */
    public index: number = 0;

    /**
     * Gets or sets the reference this track belongs to.
     * @json_ignore
     */
    public score!: Score;

    /**
     * Gets or sets the list of staves that are defined for this track.
     * @json_add addStaff
     */
    public staves: Staff[] = [];

    /**
     * Gets or sets the playback information for this track.
     */
    public playbackInfo: PlaybackInformation = new PlaybackInformation();

    /**
     * Gets or sets the display color defined for this track.
     */
    public color: Color = new Color(200, 0, 0, 255);

    /**
     * Gets or sets the long name of this track.
     */
    public name: string = '';

    /**
     * Gets or sets whether this track should be visible in the UI.
     * This information is purely informational and might not be provided by all input formats.
     * In formats like Guitar Pro this flag indicates whether on the default "multi-track" layout
     * tracks should be visible or not.
     */
    public isVisibleOnMultiTrack: boolean = true;

    /**
     * Gets or sets the short name of this track.
     */
    public shortName: string = '';

    /**
     * Defines how many bars are placed into the systems (rows) when displaying
     * the track unless a value is set in the systemsLayout.
     */
    public defaultSystemsLayout: number = 3;

    /**
     * Defines how many bars are placed into the systems (rows) when displaying
     * the track.
     */
    public systemsLayout: number[] = [];

    /**
     * Defines on which bars specifically a line break is forced.
     * @json_add addLineBreaks
     */
    public lineBreaks?: Set<number>;

    /**
     * Adds a new line break.
     * @param index  The index of the bar before which a line break should happen.
     */
    public addLineBreaks(index: number) {
        if (!this.lineBreaks) {
            this.lineBreaks = new Set<number>();
        }

        this.lineBreaks!.add(index);
    }

    /**
     * Gets or sets a mapping on which staff lines particular percussion instruments
     * should be shown.
     */
    public percussionArticulations: InstrumentArticulation[] = [];

    /**
     * The style customizations for this item.
     */
    public style?: TrackStyle;

    public ensureStaveCount(staveCount: number): void {
        while (this.staves.length < staveCount) {
            this.addStaff(new Staff());
        }
    }

    public addStaff(staff: Staff): void {
        staff.index = this.staves.length;
        staff.track = this;
        this.staves.push(staff);
    }

    public finish(settings: Settings, sharedDataBag: Map<string, unknown> | null = null): void {
        if (!this.shortName) {
            this.shortName = this.name;
            if (this.shortName.length > Track.ShortNameMaxLength) {
                this.shortName = this.shortName.substr(0, Track.ShortNameMaxLength);
            }
        }
        for (let i: number = 0, j: number = this.staves.length; i < j; i++) {
            this.staves[i].finish(settings, sharedDataBag);
        }
    }

    public applyLyrics(lyrics: Lyrics[]): void {
        for (const lyric of lyrics) {
            lyric.finish();
        }
        const staff: Staff = this.staves[0];
        for (let li: number = 0; li < lyrics.length; li++) {
            const lyric: Lyrics = lyrics[li];
            if (lyric.startBar >= 0 && lyric.startBar < staff.bars.length) {
                let beat: Beat | null = staff.bars[lyric.startBar].voices[0].beats[0];
                for (let ci: number = 0; ci < lyric.chunks.length && beat; ci++) {
                    // skip rests and empty beats
                    while (beat && (beat.isEmpty || beat.isRest)) {
                        beat = beat.nextBeat;
                    }
                    // mismatch between chunks and beats might lead to missing beats
                    if (beat) {
                        // initialize lyrics list for beat if required
                        if (!beat.lyrics) {
                            beat.lyrics = new Array<string>(lyrics.length);
                            beat.lyrics.fill('');
                        }
                        // assign chunk
                        beat.lyrics[li] = lyric.chunks[ci];
                        beat = beat.nextBeat;
                    }
                }
            }
        }
    }
}
