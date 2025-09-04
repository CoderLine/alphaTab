import type { IAlphaSynth } from '@src/synth/IAlphaSynth';
import type { PlayerState } from '@src/synth/PlayerState';
import type { Score } from '@src/model/Score';
import type { Track } from '@src/model/Track';
import { AlphaTabApi } from '@src/platform/javascript/AlphaTabApi';
import type { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import type { Settings } from '@src/Settings';
import { Logger } from '@src/Logger';
import type { MidiEventType } from '@src/midi/MidiEvent';

/**
 * @target web
 */
export declare class jQuery extends Array<HTMLElement> {
    public constructor(v?: any);

    public readonly context: HTMLElement;

    public readonly length: number;

    public data(key: string): unknown;
    public data(key: string, value: any): void;

    public removeData(key: string): void;

    public each(action: (i: number, x: HTMLElement) => void): void;

    public empty(): jQuery;
}

/**
 * @target web
 * @deprecated Migrate to {@link AlphaTabApi}.
 */
export class JQueryAlphaTab {
    public exec(element: HTMLElement, method: string, args: any[]): unknown {
        if (typeof method !== 'string') {
            args = [method];
            method = 'init';
        }
        if (method.charCodeAt(0) === 95 || method === 'exec') {
            return null;
        }
        const jElement: jQuery = new jQuery(element);
        const context: AlphaTabApi = jElement.data('alphaTab') as AlphaTabApi;
        if (method === 'destroy' && !context) {
            return null;
        }
        if (method !== 'init' && !context) {
            throw new Error('alphaTab not initialized');
        }
        // biome-ignore lint/complexity/noBannedTypes: Special use within jQuery plugin
        const apiMethod: Function = (this as any)[method];
        if (apiMethod) {
            const realArgs: string[] = ([jElement, context] as any[]).concat(args);
            return apiMethod.apply(this, realArgs);
        }
        Logger.error('Api', `Method '${method}' does not exist on jQuery.alphaTab`);
        return null;
    }

    public init(element: jQuery, context: AlphaTabApi, options: any): void {
        if (!context) {
            context = new AlphaTabApi(element[0], options);
            element.data('alphaTab', context);
            for (const listener of this._initListeners) {
                listener(element, context, options);
            }
        }
    }

    public destroy(element: jQuery, context: AlphaTabApi): void {
        element.removeData('alphaTab');
        context.destroy();
    }

    public print(_element: jQuery, context: AlphaTabApi, width: string, additionalSettings?: unknown): void {
        context.print(width, additionalSettings);
    }

    public load(_element: jQuery, context: AlphaTabApi, data: unknown, tracks?: number[]): boolean {
        return context.load(data, tracks);
    }

    public render(_element: jQuery, context: AlphaTabApi): void {
        context.render();
    }

    public renderScore(_element: jQuery, context: AlphaTabApi, score: Score, tracks?: number[]): void {
        context.renderScore(score, tracks);
    }

    public renderTracks(_element: jQuery, context: AlphaTabApi, tracks: Track[]): void {
        context.renderTracks(tracks);
    }

    public invalidate(_element: jQuery, context: AlphaTabApi): void {
        context.render();
    }

    public tex(_element: jQuery, context: AlphaTabApi, tex: string, tracks: number[]): void {
        context.tex(tex, tracks);
    }

    public muteTrack(_element: jQuery, context: AlphaTabApi, tracks: Track[], mute: boolean): void {
        context.changeTrackMute(tracks, mute);
    }

    public soloTrack(_element: jQuery, context: AlphaTabApi, tracks: Track[], solo: boolean): void {
        context.changeTrackSolo(tracks, solo);
    }

    public trackVolume(_element: jQuery, context: AlphaTabApi, tracks: Track[], volume: number): void {
        context.changeTrackVolume(tracks, volume);
    }

    public loadSoundFont(_element: jQuery, context: AlphaTabApi, value: unknown, append: boolean): void {
        context.loadSoundFont(value, append);
    }

    public resetSoundFonts(_element: jQuery, context: AlphaTabApi): void {
        context.resetSoundFonts();
    }

    public pause(_element: jQuery, context: AlphaTabApi): void {
        context.pause();
    }

    public play(_element: jQuery, context: AlphaTabApi): boolean {
        return context.play();
    }

    public playPause(_element: jQuery, context: AlphaTabApi): void {
        context.playPause();
    }

    public stop(_element: jQuery, context: AlphaTabApi): void {
        context.stop();
    }

    public api(_element: jQuery, context: AlphaTabApi): AlphaTabApi {
        return context;
    }

    public player(_element: jQuery, context: AlphaTabApi): IAlphaSynth | null {
        return context.player;
    }

    public isReadyForPlayback(_element: jQuery, context: AlphaTabApi): boolean {
        return context.isReadyForPlayback;
    }

    public playerState(_element: jQuery, context: AlphaTabApi): PlayerState {
        return context.playerState;
    }

    public masterVolume(_element: jQuery, context: AlphaTabApi, masterVolume?: number): number {
        if (typeof masterVolume === 'number') {
            context.masterVolume = masterVolume;
        }
        return context.masterVolume;
    }

    public metronomeVolume(_element: jQuery, context: AlphaTabApi, metronomeVolume?: number): number {
        if (typeof metronomeVolume === 'number') {
            context.metronomeVolume = metronomeVolume;
        }
        return context.metronomeVolume;
    }

    public countInVolume(_element: jQuery, context: AlphaTabApi, countInVolume?: number): number {
        if (typeof countInVolume === 'number') {
            context.countInVolume = countInVolume;
        }
        return context.countInVolume;
    }

    public midiEventsPlayedFilter(
        _element: jQuery,
        context: AlphaTabApi,
        midiEventsPlayedFilter?: MidiEventType[]
    ): MidiEventType[] {
        if (Array.isArray(midiEventsPlayedFilter)) {
            context.midiEventsPlayedFilter = midiEventsPlayedFilter;
        }
        return context.midiEventsPlayedFilter;
    }

    public playbackSpeed(_element: jQuery, context: AlphaTabApi, playbackSpeed?: number): number {
        if (typeof playbackSpeed === 'number') {
            context.playbackSpeed = playbackSpeed;
        }
        return context.playbackSpeed;
    }

    public tickPosition(_element: jQuery, context: AlphaTabApi, tickPosition?: number): number {
        if (typeof tickPosition === 'number') {
            context.tickPosition = tickPosition;
        }
        return context.tickPosition;
    }

    public timePosition(_element: jQuery, context: AlphaTabApi, timePosition?: number): number {
        if (typeof timePosition === 'number') {
            context.timePosition = timePosition;
        }
        return context.timePosition;
    }

    public loop(_element: jQuery, context: AlphaTabApi, loop?: boolean): boolean {
        if (typeof loop === 'boolean') {
            context.isLooping = loop;
        }
        return context.isLooping;
    }

    public renderer(_element: jQuery, context: AlphaTabApi): IScoreRenderer {
        return context.renderer;
    }

    public score(_element: jQuery, context: AlphaTabApi): Score | null {
        return context.score;
    }

    public settings(_element: jQuery, context: AlphaTabApi): Settings {
        return context.settings;
    }

    public tracks(_element: jQuery, context: AlphaTabApi): Track[] {
        return context.tracks;
    }

    private _initListeners: ((jq: jQuery, api: AlphaTabApi, params: any[]) => void)[] = [];

    public _oninit(listener: (jq: jQuery, api: AlphaTabApi, params: any[]) => void): void {
        this._initListeners.push(listener);
    }

    public static restore(selector: string) {
        new jQuery(selector).empty().removeData('alphaTab');
    }
}
