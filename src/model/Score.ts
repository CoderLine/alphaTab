import { MasterBar } from '@src/model/MasterBar';
import { RenderStylesheet } from '@src/model/RenderStylesheet';
import { RepeatGroup } from '@src/model/RepeatGroup';
import { Track } from '@src/model/Track';
import { Settings } from '@src/Settings';

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
    private _properlyOpenedRepeatGroups:number = 0;

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
     * Gets or sets the global tempo of the song in BPM. The tempo might change via {@link MasterBar.tempo}.
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
     * Gets or sets the rendering stylesheet for this song.
     */
    public stylesheet: RenderStylesheet = new RenderStylesheet();

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
            if(this._currentRepeatGroup?.isClosed) {
                this._openedRepeatGroups.pop();
                this._properlyOpenedRepeatGroups--;
            }
            this._currentRepeatGroup = new RepeatGroup();
            this._openedRepeatGroups.push(this._currentRepeatGroup);
            this._properlyOpenedRepeatGroups++;
        } else if(!this._currentRepeatGroup) {
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
