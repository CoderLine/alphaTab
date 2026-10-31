/**
 * Type-level contract of the public API. The assertions are checked by `npm run typecheck`; at runtime
 * only the trivial test below executes.
 */
import type { AlphaTabApi, model, rendering, synth } from '@coderline/alphatab';
import type {
    AlphaTabEventArgs,
    AlphaTabEventHandler,
    AlphaTabEventName,
    AlphaTabHostProps,
    AlphaTabProviderHandle,
    AlphaTabProviderProps
} from '@coderline/alphatab-react';
import { describe, expectTypeOf, it } from 'vitest';

declare const bindings: typeof import('@coderline/alphatab-react');

// never called: the calls only need to type-check
function signatures(api: AlphaTabApi | null) {
    bindings.useAlphaTabEvent('scoreLoaded', score => expectTypeOf(score).toEqualTypeOf<model.Score>());
    bindings.useAlphaTabEvent(api, 'playerStateChanged', e =>
        expectTypeOf(e).toEqualTypeOf<synth.PlayerStateChangedEventArgs>()
    );
    bindings.useAlphaTabEvent('postRenderFinished', () => {});
    // @ts-expect-error not an event of the API
    bindings.useAlphaTabEvent('playPause', () => {});
    // @ts-expect-error the handler receives the event's argument type
    bindings.useAlphaTabEvent('scoreLoaded', (score: string) => score);

    expectTypeOf(bindings.useAlphaTabEventValue('playerStateChanged', e => e.state)).toEqualTypeOf<
        synth.PlayerStateChangedEventArgs['state'] | undefined
    >();
    expectTypeOf(
        bindings.useAlphaTabEventValue(
            api,
            'playerPositionChanged',
            e => e.currentTime,
            a => a.timePosition
        )
    ).toEqualTypeOf<number | undefined>();
    // @ts-expect-error read must yield the value type of select
    bindings.useAlphaTabEventValue(
        'scoreLoaded',
        s => s.title,
        a => a.tracks
    );
}

describe('public types', () => {
    it('are checked by the compiler', () => {
        expectTypeOf(signatures).toBeFunction();

        expectTypeOf<'scoreLoaded'>().toExtend<AlphaTabEventName>();
        expectTypeOf<'renderFinished'>().toExtend<AlphaTabEventName>();
        expectTypeOf<'playerReady'>().toExtend<AlphaTabEventName>();
        expectTypeOf<'playPause'>().not.toExtend<AlphaTabEventName>();
        expectTypeOf<'settings'>().not.toExtend<AlphaTabEventName>();

        expectTypeOf<AlphaTabEventArgs<'scoreLoaded'>>().toEqualTypeOf<model.Score>();
        expectTypeOf<AlphaTabEventArgs<'renderFinished'>>().toEqualTypeOf<rendering.RenderFinishedEventArgs>();
        expectTypeOf<AlphaTabEventArgs<'midiLoaded'>>().toEqualTypeOf<synth.PositionChangedEventArgs>();
        expectTypeOf<AlphaTabEventArgs<'playerReady'>>().toBeNever();

        expectTypeOf<AlphaTabEventHandler<'scoreLoaded'>>().toEqualTypeOf<(arg: model.Score) => void>();
        expectTypeOf<() => void>().toExtend<AlphaTabEventHandler<'playerReady'>>();

        expectTypeOf<AlphaTabProviderHandle['api']>().toEqualTypeOf<AlphaTabApi | null>();
        expectTypeOf<AlphaTabProviderProps['tracks']>().toEqualTypeOf<number | number[] | 'all' | undefined>();
        expectTypeOf<AlphaTabHostProps>().toHaveProperty('style');
        expectTypeOf<AlphaTabHostProps>().not.toHaveProperty('children');
    });
});
