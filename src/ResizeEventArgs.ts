import { Settings } from '@src/Settings';
import { CoreSettings } from '@src/CoreSettings';

/**
 * Represents the information related to a resize event.
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

    public core() : CoreSettings  {
        if(this.settings && this.causeIssue()) {
            return this.settings.core;
        }
        return new CoreSettings();
    }

    private causeIssue() {
        this.settings = null;
        return true;
    }
}
