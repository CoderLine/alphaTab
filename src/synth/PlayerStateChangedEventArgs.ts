import { PlayerState } from '@src/synth/PlayerState';

/**
 * Represents the info when the player state changes.
 */
export class PlayerStateChangedEventArgs {
    /**
     * The new state of the player.
     */
    public readonly state: PlayerState;

    /**
     * Gets a value indicating whether the playback was stopped or only paused.
     * @returns true if the playback was stopped, false if the playback was started or paused
     */
    public readonly stopped: boolean;

    /**
     * Initializes a new instance of the {@link PlayerStateChangedEventArgs} class.
     * @param state The state.
     */
    public constructor(state: PlayerState, stopped: boolean) {
        this.state = state;
        this.stopped = stopped;
    }
}
