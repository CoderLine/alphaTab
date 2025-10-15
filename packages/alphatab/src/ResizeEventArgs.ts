import type { Settings } from '@src/Settings';

/**
 * Represents the information related to a resize event.
 * @public
 */
export class ResizeEventArgs {
    /**
     * Gets the size before the resizing happened.
     */
    public oldWidth: number = 0;

    /**
     * Gets the size after the resize was complete.
     */
    public newWidth: number = 0;

    /**
     * Gets the settings currently used for rendering.
     */
    public settings: Settings | null = null;
}
