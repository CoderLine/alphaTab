import { type HTMLAttributes, type ReactNode, useEffect } from 'react';
import { useAlphaTabContext } from './context';

/**
 * Props of {@link AlphaTabHost}. Standard HTML attributes, including `className`, `style`, `id`,
 * ARIA and event handler props, apply to the scroll element.
 */
export interface AlphaTabHostProps
    extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'dangerouslySetInnerHTML'> {
    /** Class of the element alphaTab renders into. */
    mountClassName?: string;
    /**
     * Content placed above the rendered score, in a `position: relative` wrapper that spans the
     * score, e.g. selection handles positioned in score coordinates.
     */
    overlay?: ReactNode;
}

/**
 * The DOM elements of the nearest {@link AlphaTabProvider}'s API: a scroll element containing a
 * `position: relative` wrapper with the mount element and the optional overlay. It may sit anywhere
 * below the provider; each provider takes exactly one host, and a second one logs a warning in
 * development.
 *
 * The scroll element becomes `player.scrollElement`, so give it a bounded size and `overflow: auto`
 * when the score should scroll inside it rather than with the page, or override the setting in
 * {@link AlphaTabProviderProps.configureSettings}. React renders no children into the mount element;
 * its content belongs to alphaTab.
 */
export function AlphaTabHost({ mountClassName, overlay, ...scrollProps }: AlphaTabHostProps) {
    const { setScrollElement, setMountElement, registerHost } = useAlphaTabContext('<AlphaTabHost>');
    useEffect(registerHost, [registerHost]);
    return (
        <div {...scrollProps} ref={setScrollElement}>
            <div style={{ position: 'relative' }}>
                <div ref={setMountElement} className={mountClassName} />
                {overlay}
            </div>
        </div>
    );
}
