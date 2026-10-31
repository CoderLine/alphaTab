import type { AlphaTabApi } from '@coderline/alphatab';

interface RetiredApi {
    readonly api: AlphaTabApi;
    readonly mountElement: HTMLElement;
    readonly detach: (() => void) | undefined;
}

/**
 * The instances of one provider: the live one, and the retired ones that wait for their destruction
 * until the effects using them have been cleaned up.
 * @internal
 */
export class ApiLifecycle {
    private _live: AlphaTabApi | null = null;
    private _retired: RetiredApi[] = [];
    private _frame = 0;

    /** The instance the provider currently owns and has not retired. */
    public get live(): AlphaTabApi | null {
        return this._live;
    }

    public activate(api: AlphaTabApi): void {
        this._live = api;
    }

    /**
     * Runs `action` in the next animation frame unless a frame is already pending. Retiring the live
     * instance drops the pending frame.
     */
    public requestFrame(action: () => void): void {
        if (this._frame) {
            return;
        }
        this._frame = requestAnimationFrame(() => {
            this._frame = 0;
            action();
        });
    }

    /** Takes `api` out of service; it stays alive until {@link destroyRetired} selects it. */
    public retire(api: AlphaTabApi, mountElement: HTMLElement, detach: (() => void) | undefined): void {
        if (this._frame) {
            cancelAnimationFrame(this._frame);
            this._frame = 0;
        }
        if (this._live === api) {
            this._live = null;
        }
        this._retired.push({ api, mountElement, detach });
    }

    /**
     * Calls the `onApi` cleanup of each retired instance `which` selects, all by default, and destroys
     * it. Every selected instance is destroyed even when a cleanup throws; the first error is rethrown.
     */
    public destroyRetired(which?: (api: AlphaTabApi, mountElement: HTMLElement) => boolean): void {
        const due: RetiredApi[] = [];
        const kept: RetiredApi[] = [];
        for (const retired of this._retired) {
            (!which || which(retired.api, retired.mountElement) ? due : kept).push(retired);
        }
        this._retired = kept;

        let failure: { error: unknown } | undefined;
        for (const { api, detach } of due) {
            try {
                detach?.();
            } catch (error) {
                failure ??= { error };
            }
            try {
                api.destroy();
            } catch (error) {
                failure ??= { error };
            }
        }
        if (failure) {
            throw failure.error;
        }
    }
}
