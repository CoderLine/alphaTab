import type { AlphaTabApi, Settings } from '@coderline/alphatab';
import {
    AlphaTabHost,
    AlphaTabProvider,
    type AlphaTabProviderHandle,
    type AlphaTabProviderProps,
    useAlphaTabApi,
    useAlphaTabElements,
    useAlphaTabEvent,
    useAlphaTabEventValue
} from '@coderline/alphatab-react';
import { act, cleanup, render } from '@testing-library/react';
import { createRef, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface FakeEmitter {
    readonly listeners: Set<(arg?: unknown) => void>;
    onCalls: number;
    trigger(arg?: unknown): void;
}

interface FakeApi {
    readonly id: number;
    readonly element: HTMLElement;
    readonly settings: FakeSettings;
    /** The settings passed to the constructor, without `player.scrollElement`. */
    readonly initialSettings: unknown;
    /** The mount element's text at construction. */
    readonly initialText: string;
    destroyed: boolean;
    score: { tracks: unknown[] } | null;
    playerState: number;
    readyForPlayback: boolean;
    readonly scoreLoaded: FakeEmitter;
    readonly playerReady: FakeEmitter;
    readonly playerStateChanged: FakeEmitter;
    readonly renderStarted: FakeEmitter;
    readonly updateSettings: ReturnType<typeof vi.fn>;
    readonly render: ReturnType<typeof vi.fn>;
}

interface FakeSettings {
    core: { file: string | null; tex: boolean; tracks: unknown };
    player: { scrollElement: unknown; scrollMode: number };
    display: { scale: number };
    readonly patches: unknown[];
}

const fake = vi.hoisted(() => {
    const state = {
        log: [] as string[],
        apis: [] as FakeApi[]
    };
    return state;
});

vi.mock('@coderline/alphatab', () => {
    const noArg = Symbol('no argument');

    /**
     * Like alphaTab's emitters, `replay` yields what a new listener receives right away: `null` for
     * nothing, `noArg` for a call without argument.
     */
    class EventEmitter {
        public readonly listeners = new Set<(arg?: unknown) => void>();
        public onCalls = 0;
        public constructor(private readonly _replay?: () => unknown) {}
        public on(listener: (arg?: unknown) => void) {
            this.onCalls++;
            this.listeners.add(listener);
            const replayed = this._replay?.() ?? null;
            if (replayed !== null) {
                listener(replayed === noArg ? undefined : replayed);
            }
            return () => {
                this.listeners.delete(listener);
            };
        }
        public off(listener: (arg?: unknown) => void) {
            this.listeners.delete(listener);
        }
        public trigger(arg?: unknown) {
            for (const listener of [...this.listeners]) {
                listener(arg);
            }
        }
    }

    function merge(target: Record<string, unknown>, patch: Record<string, unknown>) {
        for (const [key, value] of Object.entries(patch)) {
            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Map)) {
                target[key] ??= {};
                merge(target[key] as Record<string, unknown>, value as Record<string, unknown>);
            } else {
                target[key] = value;
            }
        }
    }

    class Settings {
        public core = { file: null as string | null, tex: false, tracks: null as unknown };
        public player = { scrollElement: 'html,body' as unknown, scrollMode: 0 };
        public display = { scale: 1 };
        public readonly patches: unknown[] = [];
        public fillFromJson(json: Record<string, unknown>) {
            this.patches.push(json);
            merge(this as unknown as Record<string, unknown>, json);
        }
    }

    class AlphaTabApi {
        public readonly id: number;
        public readonly initialSettings: unknown;
        public readonly initialText: string;
        public destroyed = false;
        public score: { tracks: unknown[] } | null = null;
        public playerState = 0;
        public readyForPlayback = false;
        public midiInfo: unknown = null;
        public readonly scoreLoaded = new EventEmitter(() => this.score);
        public readonly midiLoaded = new EventEmitter(() => this.midiInfo);
        public readonly playerReady = new EventEmitter(() => (this.readyForPlayback ? noArg : null));
        public readonly playerStateChanged = new EventEmitter(() => ({ state: this.playerState, stopped: false }));
        public readonly playerPositionChanged = new EventEmitter(() => ({ currentTime: 0, endTime: 0 }));
        public readonly renderStarted = new EventEmitter();
        public readonly renderFinished = new EventEmitter();
        public readonly error = new EventEmitter();
        public readonly updateSettings = vi.fn(() => fake.log.push(`updateSettings ${this.id}`));
        public readonly render = vi.fn(() => fake.log.push(`render ${this.id}`));

        public constructor(
            public readonly element: HTMLElement,
            public readonly settings: Settings
        ) {
            this.id = fake.apis.length + 1;
            this.initialSettings = JSON.parse(
                JSON.stringify({ ...settings, player: { ...settings.player, scrollElement: undefined } })
            );
            this.initialText = element.textContent ?? '';
            fake.apis.push(this as unknown as FakeApi);
            fake.log.push(`construct ${this.id}`);
        }

        public destroy() {
            this.destroyed = true;
            fake.log.push(`destroy ${this.id}`);
        }
    }

    return { AlphaTabApi, Settings };
});

function liveApis(): FakeApi[] {
    return fake.apis.filter(api => !api.destroyed);
}

function nextFrame() {
    return act(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
}

function asFake(api: AlphaTabApi | null): FakeApi | null {
    return api as unknown as FakeApi | null;
}

function Player(props: AlphaTabProviderProps & { hostKey?: string }) {
    const { hostKey, children, ...providerProps } = props;
    return (
        <StrictMode>
            <AlphaTabProvider {...providerProps}>
                <AlphaTabHost key={hostKey} className="scroll" mountClassName="mount" />
                {children}
            </AlphaTabProvider>
        </StrictMode>
    );
}

beforeEach(() => {
    fake.log.length = 0;
    fake.apis.length = 0;
});

afterEach(() => {
    cleanup();
});

describe('AlphaTabProvider', () => {
    it('keeps exactly one live API under StrictMode and provides it', () => {
        const seen: (FakeApi | null)[] = [];
        function Probe() {
            seen.push(asFake(useAlphaTabApi()));
            return null;
        }
        render(
            <Player>
                <Probe />
            </Player>
        );

        // The host's elements arrive after StrictMode's mount/unmount/mount cycle, so it creates one instance.
        expect(fake.apis).toHaveLength(1);
        expect(liveApis()).toHaveLength(1);
        const live = liveApis()[0];
        expect(seen[seen.length - 1]).toBe(live);
        expect(live.element.className).toBe('mount');
        expect(live.element.closest('.scroll')).not.toBeNull();
    });

    it('runs the onApi cleanup before destroying the API', () => {
        const onApi = vi.fn((api: AlphaTabApi) => {
            const id = asFake(api)!.id;
            fake.log.push(`onApi ${id}`);
            return () => {
                fake.log.push(`cleanup ${id} destroyed=${asFake(api)!.destroyed}`);
            };
        });
        const { unmount } = render(<Player onApi={onApi} />);
        const live = liveApis()[0];
        unmount();

        expect(liveApis()).toHaveLength(0);
        expect(fake.log.slice(-3)).toEqual([
            `onApi ${live.id}`,
            `cleanup ${live.id} destroyed=false`,
            `destroy ${live.id}`
        ]);
        for (const api of fake.apis) {
            const cleanupAt = fake.log.indexOf(`cleanup ${api.id} destroyed=false`);
            expect(cleanupAt).toBeGreaterThan(fake.log.indexOf(`onApi ${api.id}`));
            expect(cleanupAt).toBeLessThan(fake.log.indexOf(`destroy ${api.id}`));
        }
    });

    it('applies creation-time sources, configureSettings and settings in order', () => {
        let scrollElementSeen: unknown;
        const configureSettings = (settings: Settings) => {
            scrollElementSeen = settings.player.scrollElement;
            settings.display.scale = 2;
            settings.player.scrollMode = 1;
        };
        render(
            <Player
                file="song.gp"
                tracks={[0, 2]}
                configureSettings={configureSettings}
                settings={{ display: { scale: 3 } }}
            />
        );

        const live = liveApis()[0];
        expect(scrollElementSeen).toBe(live.element.closest('.scroll'));
        expect(live.settings.player.scrollElement).toBe(scrollElementSeen);
        expect(live.initialSettings).toMatchObject({
            core: { file: 'song.gp', tex: false, tracks: [0, 2] },
            player: { scrollMode: 1 },
            display: { scale: 3 }
        });
    });

    it('places tex into the mount element before construction', () => {
        render(<Player tex="\title Test ." />);
        const live = liveApis()[0];
        expect(live.settings.core.tex).toBe(true);
        expect(live.initialText).toBe('\\title Test .');
    });

    it('patches changed settings without recreating the API', async () => {
        const { rerender } = render(<Player settings={{ display: { scale: 1.5 } }} />);
        const live = liveApis()[0];
        const constructed = fake.apis.length;
        live.score = { tracks: [] };

        rerender(<Player settings={{ display: { scale: 1.5 } }} />);
        await nextFrame();
        expect(live.updateSettings).not.toHaveBeenCalled();

        rerender(<Player settings={{ display: { scale: 2 } }} />);
        rerender(<Player settings={{ display: { scale: 2.5 } }} />);
        await nextFrame();

        expect(fake.apis).toHaveLength(constructed);
        expect(liveApis()).toEqual([live]);
        expect(live.settings.display.scale).toBe(2.5);
        expect(live.updateSettings).toHaveBeenCalledTimes(1);
        expect(live.render).toHaveBeenCalledTimes(1);
    });

    it('applies only the changed settings and keeps runtime changes to the others', async () => {
        const element = document.createElement('div');
        const elements = new Map([['a', true]]);
        const props = (scale: number, map: Map<string, boolean>) => ({
            settings: {
                display: { scale },
                player: { scrollMode: 1, scrollElement: element },
                notation: { elements: map }
            } as AlphaTabProviderProps['settings']
        });
        const { rerender } = render(<Player {...props(1, elements)} />);
        const live = liveApis()[0];
        live.score = { tracks: [] };
        live.settings.player.scrollMode = 2;
        const patches = live.settings.patches.length;

        rerender(<Player {...props(1, new Map(elements))} />);
        await nextFrame();
        expect(live.settings.patches).toHaveLength(patches);
        expect(live.updateSettings).not.toHaveBeenCalled();

        rerender(<Player {...props(2, new Map([['a', false]]))} />);
        await nextFrame();
        expect(live.settings.patches.slice(patches)).toEqual([
            { display: { scale: 2 }, notation: { elements: new Map([['a', false]]) } }
        ]);
        expect(live.settings.player.scrollMode).toBe(2);
        expect(live.updateSettings).toHaveBeenCalledTimes(1);
        expect(live.render).toHaveBeenCalledTimes(1);
    });

    it('applies settings changed before the API exists at construction', () => {
        function Late({ scale, withHost }: { scale: number; withHost: boolean }) {
            return (
                <StrictMode>
                    <AlphaTabProvider settings={{ display: { scale } }}>
                        {withHost && <AlphaTabHost />}
                    </AlphaTabProvider>
                </StrictMode>
            );
        }
        const { rerender } = render(<Late scale={1} withHost={false} />);
        rerender(<Late scale={2} withHost={false} />);
        rerender(<Late scale={2} withHost={true} />);
        const live = liveApis()[0];
        expect(live.initialSettings).toMatchObject({ display: { scale: 2 } });
        expect(live.settings.patches).toEqual([{ display: { scale: 2 } }]);
    });

    it('updates settings without rendering while no score is loaded', async () => {
        const { rerender } = render(<Player settings={{ display: { scale: 1 } }} />);
        const live = liveApis()[0];
        rerender(<Player settings={{ display: { scale: 2 } }} />);
        await nextFrame();
        expect(live.updateSettings).toHaveBeenCalledTimes(1);
        expect(live.render).not.toHaveBeenCalled();
    });

    it('recreates the API when the host element changes', () => {
        const { rerender } = render(<Player hostKey="a" />);
        const first = liveApis()[0];

        rerender(<Player hostKey="b" />);

        expect(first.destroyed).toBe(true);
        expect(liveApis()).toHaveLength(1);
        const second = liveApis()[0];
        expect(second).not.toBe(first);
        expect(second.element.isConnected).toBe(true);
        expect(first.element.isConnected).toBe(false);
    });

    it('destroys the API on unmount and exposes it through the ref until then', () => {
        const ref = createRef<AlphaTabProviderHandle>();
        const { unmount } = render(
            <StrictMode>
                <AlphaTabProvider ref={ref}>
                    <AlphaTabHost />
                </AlphaTabProvider>
            </StrictMode>
        );
        const live = liveApis()[0];
        expect(asFake(ref.current!.api)).toBe(live);

        unmount();

        expect(live.destroyed).toBe(true);
        expect(liveApis()).toHaveLength(0);
    });

    it('accepts the host deep in the tree and exposes its elements', () => {
        let elements: ReturnType<typeof useAlphaTabElements> | undefined;
        function Probe() {
            elements = useAlphaTabElements();
            return null;
        }
        render(
            <StrictMode>
                <AlphaTabProvider>
                    <section>
                        <div>
                            <AlphaTabHost className="scroll" overlay={<Probe />} />
                        </div>
                    </section>
                </AlphaTabProvider>
            </StrictMode>
        );
        const live = liveApis()[0];
        expect(elements!.mountElement).toBe(live.element);
        expect(elements!.scrollElement).toBe(live.element.closest('.scroll'));
    });

    it('renders on the server without creating an API', () => {
        const html = renderToString(
            <AlphaTabProvider tex="\title Test .">
                <AlphaTabHost className="scroll" />
            </AlphaTabProvider>
        );
        expect(html).toContain('class="scroll"');
        expect(fake.apis).toHaveLength(0);
    });
});

describe('useAlphaTabEvent', () => {
    function Listener({ onScore }: { onScore: (score: unknown) => void }) {
        useAlphaTabEvent('scoreLoaded', score => onScore(score));
        return null;
    }

    it('calls the latest handler without resubscribing', () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = render(
            <Player>
                <Listener onScore={first} />
            </Player>
        );
        const live = liveApis()[0];
        const subscriptions = live.scoreLoaded.onCalls;
        expect(live.scoreLoaded.listeners.size).toBe(1);

        rerender(
            <Player>
                <Listener onScore={second} />
            </Player>
        );
        live.scoreLoaded.trigger('score');

        expect(live.scoreLoaded.onCalls).toBe(subscriptions);
        expect(live.scoreLoaded.listeners.size).toBe(1);
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledWith('score');
    });

    it('unsubscribes on unmount', () => {
        const { unmount } = render(
            <Player>
                <Listener onScore={() => {}} />
            </Player>
        );
        const live = liveApis()[0];
        unmount();
        expect(live.scoreLoaded.listeners.size).toBe(0);
    });

    it('subscribes to an explicit API outside a provider', () => {
        const handler = vi.fn();
        let api: FakeApi | null = null;
        function Capture() {
            api = asFake(useAlphaTabApi());
            return null;
        }
        function Outside({ target }: { target: FakeApi | null }) {
            useAlphaTabEvent(target as unknown as AlphaTabApi | null, 'scoreLoaded', handler);
            return null;
        }
        const { rerender } = render(
            <>
                <Player>
                    <Capture />
                </Player>
                <Outside target={null} />
            </>
        );
        rerender(
            <>
                <Player>
                    <Capture />
                </Player>
                <Outside target={api} />
            </>
        );
        api!.scoreLoaded.trigger('score');
        expect(handler).toHaveBeenCalledWith('score');
    });

    it('requires a provider for the context form', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<Listener onScore={() => {}} />)).toThrow(/inside <AlphaTabProvider>/);
        vi.mocked(console.error).mockRestore();
    });
});

describe('useAlphaTabEventValue', () => {
    it('reads the initial value and follows the event', () => {
        const values: (number | undefined)[] = [];
        function State() {
            const api = useAlphaTabApi();
            values.push(
                useAlphaTabEventValue(
                    api,
                    'playerStateChanged',
                    e => e.state,
                    a => a.playerState
                )
            );
            return null;
        }
        render(
            <Player>
                <State />
            </Player>
        );
        const live = liveApis()[0];
        expect(values[0]).toBeUndefined();
        expect(values[values.length - 1]).toBe(0);

        act(() => live.playerStateChanged.trigger({ state: 1 }));
        expect(values[values.length - 1]).toBe(1);
    });

    it('returns undefined on the server', () => {
        function State() {
            const value = useAlphaTabEventValue(
                null,
                'playerStateChanged',
                e => e.state,
                a => a.playerState
            );
            return <span>{String(value)}</span>;
        }
        expect(renderToString(<State />)).toContain('undefined');
    });
});
