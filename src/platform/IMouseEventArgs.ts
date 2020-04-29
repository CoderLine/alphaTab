import { IContainer } from '@src/platform/IContainer';

/**
 * This interface represents the information about a mouse event that occured on the UI.
 */
export interface IMouseEventArgs {
    /**
     * Gets a value indicating whether the left mouse button was pressed.
     */
    readonly isLeftMouseButton: boolean;

    /**
     * Gets the X-position of the cursor at the time of the event relative to the given UI container.
     * @param relativeTo The UI element to which the relative position should be calculated.
     * @returns The relative X-position of the cursor to the given UI container at the time the event occured.
     */
    getX(relativeTo: IContainer): number;

    /**
     * Gets the Y-position of the cursor at the time of the event relative to the given UI container.
     * @param relativeTo The UI element to which the relative position should be calculated.
     * @returns The relative Y-position of the cursor to the given UI container at the time the event occured.
     */
    getY(relativeTo: IContainer): number;

    /**
     * If called, the original mouse action is prevented and the event is flagged as handled.
     */
    preventDefault(): void;
}
