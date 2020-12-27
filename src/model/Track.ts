import { Beat } from '@src/model/Beat';
import { Color } from '@src/model/Color';
import { Lyrics } from '@src/model/Lyrics';
import { PlaybackInformation } from '@src/model/PlaybackInformation';
import { Score } from '@src/model/Score';
import { Staff } from '@src/model/Staff';
import { Settings } from '@src/Settings';
import { InstrumentArticulation } from './InstrumentArticulation';

/**
 * This public class describes a single track or instrument of score.
 * It is bascially a list of staffs containing individual music notation kinds.
 * @json
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
     * Gets or sets the list of staffs that are defined for this track.
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
     * Gets or sets the short name of this track.
     */
    public shortName: string = '';

    /**
     * Gets or sets a mapping on which staff liens particular percussion instruments
     * should be shown.
     */
    public percussionArticulations: InstrumentArticulation[] = [];

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

    public finish(settings: Settings): void {
        if (!this.shortName) {
            this.shortName = this.name;
            if (this.shortName.length > Track.ShortNameMaxLength) {
                this.shortName = this.shortName.substr(0, Track.ShortNameMaxLength);
            }
        }
        for (let i: number = 0, j: number = this.staves.length; i < j; i++) {
            this.staves[i].finish(settings);
        }
    }

    public applyLyrics(lyrics: Lyrics[]): void {
        for (let lyric of lyrics) {
            lyric.finish();
        }
        let staff: Staff = this.staves[0];
        for (let li: number = 0; li < lyrics.length; li++) {
            let lyric: Lyrics = lyrics[li];
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
