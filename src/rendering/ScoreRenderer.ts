import { LayoutMode } from '@src/DisplaySettings';
import { Environment } from '@src/Environment';
import { EventEmitter } from '@src/EventEmitter';
import { Score } from '@src/model/Score';
import { Track } from '@src/model/Track';
import { ICanvas } from '@src/platform/ICanvas';
import { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import { ScoreLayout } from '@src/rendering/layout/ScoreLayout';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import { Settings } from '@src/Settings';
import { Logger } from '@src/util/Logger';

/**
 * This is the main wrapper of the rendering engine which
 * can render a single track of a score object into a notation sheet.
 */
export class ScoreRenderer implements IScoreRenderer {
    private _currentLayoutMode: LayoutMode = LayoutMode.Page;
    private _currentRenderEngine: string | null = null;
    private _renderedTracks: Track[] | null = null;

    public canvas: ICanvas | null = null;
    public score: Score | null = null;
    public tracks: Track[] | null = null;
    public layout: ScoreLayout | null = null;
    public settings: Settings;
    public boundsLookup: BoundsLookup | null = null;
    public width: number = 0;

    /**
     * Initializes a new instance of the {@link ScoreRenderer} class.
     * @param settings The settings to use for rendering.
     */
    public constructor(settings: Settings) {
        this.settings = settings;
        this.recreateCanvas();
        this.recreateLayout();
    }

    public destroy(): void {
        this.score = null;
        this.canvas = null;
        this.layout = null;
        this.boundsLookup = null;
        this.tracks = null;
    }

    private recreateCanvas(): boolean {
        if (this._currentRenderEngine !== this.settings.core.engine) {
            this.canvas = Environment.getRenderEngineFactory(this.settings).createCanvas();
            this._currentRenderEngine = this.settings.core.engine;
            return true;
        }
        return false;
    }

    private recreateLayout(): boolean {
        if (!this.layout || this._currentLayoutMode !== this.settings.display.layoutMode) {
            this.layout = Environment.getLayoutEngineFactory(this.settings).createLayout(this);
            this._currentLayoutMode = this.settings.display.layoutMode;
            return true;
        }
        return false;
    }

    public renderScore(score: Score, trackIndexes: Int32Array): void {
        try {
            this.score = score;
            let tracks: Track[];
            if (!trackIndexes) {
                tracks = score.tracks.slice(0);
            } else {
                tracks = [];
                for (let track of trackIndexes) {
                    if (track >= 0 && track < score.tracks.length) {
                        tracks.push(score.tracks[track]);
                    }
                }
            }
            if (tracks.length === 0 && score.tracks.length > 0) {
                tracks.push(score.tracks[0]);
            }
            this.tracks = tracks.splice(0) as any;
            this.render();
        } catch (e) {
            this.error.trigger('render', e);
        }
    }

    /**
     * Initiates rendering fof the given tracks.
     * @param tracks The tracks to render.
     */
    public renderTracks(tracks: Track[]): void {
        if (tracks.length === 0) {
            this.score = null;
        } else {
            this.score = tracks[0].score;
        }
        this.tracks = tracks;
        this.render();
    }

    public updateSettings(settings: Settings): void {
        this.settings = settings;
    }

    public render(): void {
        if (this.width === 0) {
            Logger.warning('Rendering', 'AlphaTab skipped rendering because of width=0 (element invisible)', null);
            return;
        }
        this.boundsLookup = new BoundsLookup();
        if (!this.tracks || this.tracks.length === 0) {
            return;
        }
        this.recreateCanvas();
        this.canvas!.lineWidth = this.settings.display.scale;
        this.canvas!.settings = this.settings;
        Logger.info('Rendering', 'Rendering ' + this.tracks.length + ' tracks');
        for (let i: number = 0; i < this.tracks.length; i++) {
            let track: Track = this.tracks[i];
            Logger.info('Rendering', 'Track ' + i + ': ' + track.name);
        }
        this.preRender.trigger(false);
        this.recreateLayout();
        this.layoutAndRender();
        this._renderedTracks = this.tracks;
        Logger.info('Rendering', 'Rendering finished');
    }

    public resizeRender(): void {
        if (this.recreateLayout() || this.recreateCanvas() || this._renderedTracks !== this.tracks || !this.tracks) {
            Logger.info('Rendering', 'Starting full rerendering due to layout or canvas change', null);
            this.render();
        } else if (this.layout!.supportsResize) {
            Logger.info('Rendering', 'Starting optimized rerendering for resize');
            this.boundsLookup = new BoundsLookup();
            this.preRender.trigger(true);
            this.canvas!.settings = this.settings;
            this.layout!.resize();
            this.layout!.renderAnnotation();
            this.onRenderFinished();
            this.postRenderFinished.trigger();
        } else {
            Logger.warning('Rendering', 'Current layout does not support dynamic resizing, nothing was done', null);
        }
        Logger.debug('Rendering', 'Resize finished');
    }

    private layoutAndRender(): void {
        Logger.info(
            'Rendering',
            'Rendering at scale ' + this.settings.display.scale + ' with layout ' + this.layout!.name,
            null
        );
        this.layout!.layoutAndRender();
        this.layout!.renderAnnotation();
        this.onRenderFinished();
        this.postRenderFinished.trigger();
    }

    public readonly preRender: EventEmitter<(isResize: boolean) => void> = new EventEmitter();
    public readonly renderFinished: EventEmitter<(e: RenderFinishedEventArgs) => void> = new EventEmitter();
    public readonly partialRenderFinished: EventEmitter<(e: RenderFinishedEventArgs) => void> = new EventEmitter();
    public readonly postRenderFinished: EventEmitter<() => void> = new EventEmitter();
    public readonly error: EventEmitter<(type: string, details: any) => void> = new EventEmitter();

    private onRenderFinished() {
        const e = new RenderFinishedEventArgs();
        e.totalHeight = this.layout!.height;
        e.totalWidth = this.layout!.width;
        e.renderResult = this.canvas!.onRenderFinished();
        this.renderFinished.trigger(e);
    }
}
