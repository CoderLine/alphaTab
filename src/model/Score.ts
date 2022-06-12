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
    private _openedRepeatGroups: RepeatGroup[] = [];
    private _closedRepeatGroups: RepeatGroup[] = [];
    private _currentRepeatGroup: RepeatGroup | null = null;

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
        this._openedRepeatGroups = [];
        this._closedRepeatGroups = [];
        this._currentRepeatGroup = null;
        for (const bar of this.masterBars) {
            this.addMasterBarToRepeatGroups(bar)
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

        // start a new properly opened repeat group
        if (bar.isRepeatStart) {
            this._currentRepeatGroup = new RepeatGroup();
            this._openedRepeatGroups.push(this._currentRepeatGroup);

            // if a new group is started, we can drop the group we remembered as closed. 
            // not that accidentally later on it is picked up by a malformed group.
            this._closedRepeatGroups.pop();
        }

        // handle repeat ends
        if (bar.isRepeatEnd) {

            // close current group if there was one started
            if (this._currentRepeatGroup) {
                // add current bar to current group..
                this._currentRepeatGroup.addMasterBar(bar);

                // here we remember the closed groups for scenarios like open, bar, close, close (second close needs to be added to the already closed group)
                this._closedRepeatGroups.push(this._currentRepeatGroup);
                this._openedRepeatGroups.pop();

                // and then restore previous repeat group for setups like: open,open,close,close
                if (this._openedRepeatGroups.length > 0) {
                    this._currentRepeatGroup = this._openedRepeatGroups[this._openedRepeatGroups.length - 1];
                } else {
                    // if no previously opened groups -> just clear the current group, next bar will start a new group then accordingly.
                    this._currentRepeatGroup = null;
                }
            } else {
                // if setup like: open, bar, close, bar, close 
                // we need to add the second close to the previously opened bar.
                if (this._closedRepeatGroups.length > 0) {
                    this._closedRepeatGroups[this._closedRepeatGroups.length - 1].addMasterBar(bar);
                }

                // malformed setup where we have a close without ever a group started.
                // in this case we try to add the ending to the existing repeat on the first bar or create a new repeat group starting there
                if (this._openedRepeatGroups.length > 0 && this._openedRepeatGroups[0].opening.index === 0) {
                    this._openedRepeatGroups[0].addMasterBar(bar);
                } else {
                    const recoveryGroup = new RepeatGroup();
                    this._openedRepeatGroups.unshift(recoveryGroup);
                    recoveryGroup.addMasterBar(bar);
                }
            }
        } else {
            // normal bar, create group if needed and add
            if (!this._currentRepeatGroup) {
                this._currentRepeatGroup = new RepeatGroup();
                this._openedRepeatGroups.push(this._currentRepeatGroup);
            }
            this._currentRepeatGroup!.addMasterBar(bar);
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
