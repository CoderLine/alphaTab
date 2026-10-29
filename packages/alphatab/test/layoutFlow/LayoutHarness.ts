/** @target web */
// Environment registers the layouts and must load before them (ScoreLayout <-> Environment cycle).
import '@coderline/alphatab/Environment';

import fs from 'node:fs';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { Logger } from '@coderline/alphatab/Logger';
import { LogLevel } from '@coderline/alphatab/LogLevel';
import type { Score } from '@coderline/alphatab/model/Score';
import type { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { Settings } from '@coderline/alphatab/Settings';

function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) | 0;
        return (state >>> 8) / 16777216;
    };
}

/**
 * One painted system partial as observed through the renderer events.
 * @internal
 */
export interface CapturedSystem {
    id: string;
    firstBar: number;
    lastBar: number;
    y: number;
    height: number;
    width: number;
    barWidths: number[];
    svg: string;
}

/**
 * The observable result of one layout pass (render or resize).
 * @internal
 */
export interface CapturedPass {
    systems: CapturedSystem[];
    otherPartials: string[];
    totalHeight: number;
}

/**
 * Drives a {@link ScoreRenderer} in node with the svg engine and captures the system partials
 * (break positions, geometry and painted SVG) of every render and resize pass.
 * @internal
 */
export class LayoutHarness {
    public readonly renderer: ScoreRenderer;
    public readonly settings: Settings;

    /** Whether {@link render} and {@link resize} paint every partial after the layout pass. */
    public paint: boolean = true;

    private _current: CapturedPass | null = null;
    private _byId = new Map<string, CapturedSystem>();
    private _args = new Map<CapturedSystem, RenderFinishedEventArgs>();
    private _ids: string[] = [];
    private _error: Error | null = null;

    public constructor(settings?: Settings) {
        this.settings = settings ?? new Settings();
        this.settings.core.engine = 'svg';
        this.settings.core.enableLazyLoading = true;
        this.settings.core.logLevel = LogLevel.None;
        Logger.logLevel = LogLevel.None;
        this.renderer = new ScoreRenderer(this.settings);
        this.renderer.partialLayoutFinished.on(e => this._onLayout(e));
        this.renderer.partialRenderFinished.on(e => this._onRender(e));
        // the renderer reports layout exceptions only through this event
        this.renderer.error.on(e => {
            this._error ??= e;
        });
        this.renderer.renderFinished.on(e => {
            if (this._current) {
                this._current.totalHeight = e.totalHeight;
            }
        });
    }

    /** The ids of the partials registered by the last render or resize. */
    public get partialIds(): readonly string[] {
        return this._ids;
    }

    public static loadScore(path: string, settings: Settings): Score {
        return ScoreLoader.loadScoreFromBytes(new Uint8Array(fs.readFileSync(path)), settings);
    }

    public static breaksOf(pass: CapturedPass): string {
        return pass.systems.map(s => `${s.firstBar}-${s.lastBar}`).join(',');
    }

    public render(score: Score, tracks: number[] | null, width: number): CapturedPass {
        this._begin();
        this.renderer.width = width;
        this.renderer.renderScore(score, tracks ?? score.tracks.map(t => t.index));
        this._throwRenderError();
        return this._end();
    }

    public resize(width: number): CapturedPass {
        this._begin();
        this.renderer.width = width;
        this.renderer.resizeRender();
        this._throwRenderError();
        return this._end();
    }

    private _throwRenderError(): void {
        const error = this._error;
        if (error) {
            this._error = null;
            this._current = null;
            throw error;
        }
    }

    private _onLayout(e: RenderFinishedEventArgs) {
        if (!this._current) {
            return;
        }
        this._ids.push(e.id);
        if (e.firstMasterBarIndex >= 0) {
            const s: CapturedSystem = {
                id: e.id,
                firstBar: e.firstMasterBarIndex,
                lastBar: e.lastMasterBarIndex,
                y: e.y,
                height: e.height,
                width: 0,
                barWidths: [],
                svg: ''
            };
            this._current.systems.push(s);
            this._byId.set(e.id, s);
            this._args.set(s, e);
        }
    }

    private _onRender(e: RenderFinishedEventArgs) {
        if (!this._current) {
            return;
        }
        const s = this._byId.get(e.id);
        if (s) {
            s.svg = String(e.renderResult);
        } else {
            this._current.otherPartials.push(String(e.renderResult));
        }
    }

    private _begin() {
        this._current = { systems: [], otherPartials: [], totalHeight: 0 };
        this._byId.clear();
        this._ids = [];
    }

    /**
     * Paints the partial with a fixed random seed: the attribution glyph scrambles its path
     * commands through `Math.random`, which would otherwise make equal layouts paint differently.
     */
    private _paintPartial(id: string) {
        const random = Math.random;
        Math.random = seededRandom(0x2545f491);
        try {
            this.renderer.renderResult(id);
        } finally {
            Math.random = random;
        }
    }

    private _end(): CapturedPass {
        const pass = this._current!;
        if (this.paint) {
            for (const id of this._ids) {
                this._paintPartial(id);
            }
        }
        for (const s of pass.systems) {
            // positions can be corrected after the layout event
            s.y = this._args.get(s)!.y;
        }
        this._args.clear();
        pass.systems.sort((a, b) => a.firstBar - b.firstBar);
        const layoutSystems = this.renderer.layout!.systems;
        for (let i = 0; i < pass.systems.length && i < layoutSystems.length; i++) {
            const ls = layoutSystems[i];
            pass.systems[i].width = ls.width;
            pass.systems[i].barWidths = ls.allStaves[0].barRenderers.map(r => r.width);
        }
        this._current = null;
        return pass;
    }
}
