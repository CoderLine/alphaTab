import { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import { IMouseEventArgs } from '@src/platform/IMouseEventArgs';

/**
 * This interface represents a container control in the UI layer.
 */
export interface IContainer {
    /**
     * Gets or sets the Y-position of the control, relative to its parent.
     */
    top: number;

    /**
     * Gets or sets the X-position of the control, relative to its parent.
     */
    left: number;

    /**
     * Gets or sets the width of the control.
     */
    width: number;

    /**
     * Gets or sets the height of the control.
     */
    height: number;

    /**
     * Gets a value indicating whether the control is visible.
     */
    readonly isVisible: boolean;

    /**
     * Gets or sets the horizontal scroll offset of this control if it is scrollable.
     */
    scrollLeft: number;

    /**
     * Gets or sets the vertical scroll offset of this control if it is scrollable.
     */
    scrollTop: number;

    /**
     * Adds the given child control to this container.
     * @param child The child control to add.
     */
    appendChild(child: IContainer): void;

    /**
     * Stops the animations of this control immediately.
     */
    stopAnimation(): void;

    /**
     * Tells the control to move to the given X-position in the given time.
     * @param duration The milliseconds that should be needed to reach the new X-position
     * @param x The new X-position
     */
    transitionToX(duration: number, x: number): void;

    /**
     * Clears the container and removes all child items.
     */
    clear(): void;

    /**
     * This event occurs when the control was resized.
     */
    resize: IEventEmitter;

    /**
     * This event occurs when a mouse/finger press happened on the control.
     */
    mouseDown: IEventEmitterOfT<IMouseEventArgs>;

    /**
     * This event occurs when a mouse/finger moves on top of the control.
     */
    mouseMove: IEventEmitterOfT<IMouseEventArgs>

    /**
     * This event occurs when a mouse/finger is released from the control.
     */
    mouseUp: IEventEmitterOfT<IMouseEventArgs>
}
