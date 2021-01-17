import { IAlphaSynth } from '@src/synth/IAlphaSynth';
import { PlayerState } from '@src/synth/PlayerState';
import { Score } from '@src/model/Score';
import { Track } from '@src/model/Track';
import { AlphaTabApi } from '@src/platform/javascript/AlphaTabApi';
import { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import { Settings } from '@src/Settings';
import { Logger } from '@src/Logger';
import { MidiEventType } from '@src/midi/MidiEvent';

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
        let jElement: jQuery = new jQuery(element);
        let context: AlphaTabApi = jElement.data('alphaTab') as AlphaTabApi;
        if (method === 'destroy' && !context) {
            return null;
        }
        if (method !== 'init' && !context) {
            throw new Error('alphaTab not initialized');
        }
        let apiMethod: Function = (this as any)[method];
        if (apiMethod) {
            let realArgs: string[] = ([jElement, context] as any[]).concat(args);
            return apiMethod.apply(this, realArgs);
        } else {
            Logger.error('Api', "Method '" + method + "' does not exist on jQuery.alphaTab");
            return null;
        }
    }

    public init(element: jQuery, context: AlphaTabApi, options: any): void {
        if (!context) {
            context = new AlphaTabApi(element[0], options);
            element.data('alphaTab', context);
            for (let listener of this._initListeners) {
                listener(element, context, options);
            }
        }
    }

    public destroy(element: jQuery, context: AlphaTabApi): void {
        element.removeData('alphaTab');
        context.destroy();
    }

    public print(element: jQuery, context: AlphaTabApi, width: string, additionalSettings?: unknown): void {
        context.print(width, additionalSettings);
    }

    public load(element: jQuery, context: AlphaTabApi, data: unknown, tracks?: number[]): boolean {
        return context.load(data, tracks);
    }

    public render(element: jQuery, context: AlphaTabApi): void {
        context.render();
    }

    public renderScore(element: jQuery, context: AlphaTabApi, score: Score, tracks?: number[]): void {
        context.renderScore(score, tracks);
    }

    public renderTracks(element: jQuery, context: AlphaTabApi, tracks: Track[]): void {
        context.renderTracks(tracks);
    }

    public invalidate(element: jQuery, context: AlphaTabApi): void {
        context.render();
    }

    public tex(element: jQuery, context: AlphaTabApi, tex: string, tracks: number[]): void {
        context.tex(tex, tracks);
    }

    public muteTrack(element: jQuery, context: AlphaTabApi, tracks: Track[], mute: boolean): void {
        context.changeTrackMute(tracks, mute);
    }

    public soloTrack(element: jQuery, context: AlphaTabApi, tracks: Track[], solo: boolean): void {
        context.changeTrackSolo(tracks, solo);
    }

    public trackVolume(element: jQuery, context: AlphaTabApi, tracks: Track[], volume: number): void {
        context.changeTrackVolume(tracks, volume);
    }

    public loadSoundFont(element: jQuery, context: AlphaTabApi, value: unknown, append: boolean): void {
        context.loadSoundFont(value, append);
    }

    public resetSoundFonts(element: jQuery, context: AlphaTabApi): void {
        context.resetSoundFonts();
    }

    public pause(element: jQuery, context: AlphaTabApi): void {
        context.pause();
    }

    public play(element: jQuery, context: AlphaTabApi): boolean {
        return context.play();
    }

    public playPause(element: jQuery, context: AlphaTabApi): void {
        context.playPause();
    }

    public stop(element: jQuery, context: AlphaTabApi): void {
        context.stop();
    }

    public api(element: jQuery, context: AlphaTabApi): AlphaTabApi {
        return context;
    }

    public player(element: jQuery, context: AlphaTabApi): IAlphaSynth | null {
        return context.player;
    }

    public isReadyForPlayback(element: jQuery, context: AlphaTabApi): boolean {
        return context.isReadyForPlayback;
    }

    public playerState(element: jQuery, context: AlphaTabApi): PlayerState {
        return context.playerState;
    }

    public masterVolume(element: jQuery, context: AlphaTabApi, masterVolume?: number): number {
        if (typeof masterVolume === 'number') {
            context.masterVolume = masterVolume;
        }
        return context.masterVolume;
    }

    public metronomeVolume(element: jQuery, context: AlphaTabApi, metronomeVolume?: number): number {
        if (typeof metronomeVolume === 'number') {
            context.metronomeVolume = metronomeVolume;
        }
        return context.metronomeVolume;
    }

    public countInVolume(element: jQuery, context: AlphaTabApi, countInVolume?: number): number {
        if (typeof countInVolume === 'number') {
            context.countInVolume = countInVolume;
        }
        return context.countInVolume;
    }

    public midiEventsPlayedFilter(element: jQuery, context: AlphaTabApi, midiEventsPlayedFilter?: MidiEventType[]): MidiEventType[] {
        if (Array.isArray(midiEventsPlayedFilter)) {
            context.midiEventsPlayedFilter = midiEventsPlayedFilter;
        }
        return context.midiEventsPlayedFilter;
    }

    public playbackSpeed(element: jQuery, context: AlphaTabApi, playbackSpeed?: number): number {
        if (typeof playbackSpeed === 'number') {
            context.playbackSpeed = playbackSpeed;
        }
        return context.playbackSpeed;
    }

    public tickPosition(element: jQuery, context: AlphaTabApi, tickPosition?: number): number {
        if (typeof tickPosition === 'number') {
            context.tickPosition = tickPosition;
        }
        return context.tickPosition;
    }

    public timePosition(element: jQuery, context: AlphaTabApi, timePosition?: number): number {
        if (typeof timePosition === 'number') {
            context.timePosition = timePosition;
        }
        return context.timePosition;
    }

    public loop(element: jQuery, context: AlphaTabApi, loop?: boolean): boolean {
        if (typeof loop === 'boolean') {
            context.isLooping = loop;
        }
        return context.isLooping;
    }

    public renderer(element: jQuery, context: AlphaTabApi): IScoreRenderer {
        return context.renderer;
    }

    public score(element: jQuery, context: AlphaTabApi): Score | null {
        return context.score;
    }

    public settings(element: jQuery, context: AlphaTabApi): Settings {
        return context.settings;
    }

    public tracks(element: jQuery, context: AlphaTabApi): Track[] {
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
