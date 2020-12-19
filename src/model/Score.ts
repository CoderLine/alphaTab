import { MasterBar } from '@src/model/MasterBar';
import { RenderStylesheet } from '@src/model/RenderStylesheet';
import { RepeatGroup } from '@src/model/RepeatGroup';
import { Track } from '@src/model/Track';
import { Settings } from '@src/Settings';
import { Note } from './Note';

/**
 * The score is the root node of the complete
 * model. It stores the basic information of
 * a song and stores the sub components.
 * @json
 */
export class Score {
    private _noteByIdLookup: Map<number, Note> = new Map<number, Note>();
    private _currentRepeatGroup: RepeatGroup = new RepeatGroup();

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
        let currentGroup: RepeatGroup = new RepeatGroup();
        for (let bar of this.masterBars) {
            // if the group is closed only the next upcoming header can
            // reopen the group in case of a repeat alternative, so we
            // remove the current group
            if (bar.isRepeatStart || (this._currentRepeatGroup.isClosed && bar.alternateEndings <= 0)) {
                currentGroup = new RepeatGroup();
            }
            currentGroup.addMasterBar(bar);
        }
    }

    public addMasterBar(bar: MasterBar): void {
        bar.score = this;
        bar.index = this.masterBars.length;
        if (this.masterBars.length !== 0) {
            bar.previousMasterBar = this.masterBars[this.masterBars.length - 1];
            bar.previousMasterBar.nextMasterBar = bar;
            bar.start = bar.previousMasterBar.start + bar.previousMasterBar.calculateDuration();
        }
        // if the group is closed only the next upcoming header can
        // reopen the group in case of a repeat alternative, so we
        // remove the current group
        if (bar.isRepeatStart || (this._currentRepeatGroup.isClosed && bar.alternateEndings <= 0)) {
            this._currentRepeatGroup = new RepeatGroup();
        }
        this._currentRepeatGroup.addMasterBar(bar);
        this.masterBars.push(bar);
    }

    public addTrack(track: Track): void {
        track.score = this;
        track.index = this.tracks.length;
        this.tracks.push(track);
    }

    public finish(settings: Settings): void {
        this._noteByIdLookup.clear();

        for (let i: number = 0, j: number = this.tracks.length; i < j; i++) {
            this.tracks[i].finish(settings);
        }
    }

    public registerNote(note: Note) {
        this._noteByIdLookup.set(note.id, note);
    }

    public getNoteById(noteId: number): Note | null {
        return this._noteByIdLookup.has(noteId)
            ? this._noteByIdLookup.get(noteId)!
            : null;
    }
}
