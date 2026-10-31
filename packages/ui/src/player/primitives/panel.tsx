import type React from 'react';
import clsx from 'clsx';
import { IconClose } from '../icons';
import styles from './ui.module.scss';

interface PanelProps {
    title: string;
    icon?: React.ReactNode;
    /** Controls placed in the header, before the close button. */
    actions?: React.ReactNode;
    onClose?: () => void;
    footer?: React.ReactNode;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
    children: React.ReactNode;
}

/** A titled side panel of the Playground workspace. */
export const Panel: React.FC<PanelProps> = ({ title, icon, actions, onClose, footer, className, headerClassName, bodyClassName, children }) => (
    <section className={clsx(styles.panel, className)} aria-label={title}>
        <header className={clsx(styles.panelHeader, headerClassName)}>
            {icon && <span className={styles.panelIcon}>{icon}</span>}
            <h2 className={styles.panelTitle}>{title}</h2>
            <span className={styles.spacer} />
            {actions}
            {onClose && (
                <button type="button" className={styles.panelClose} onClick={onClose} aria-label={`Close ${title}`}>
                    <IconClose />
                </button>
            )}
        </header>
        <div className={clsx(styles.panelBody, bodyClassName)}>{children}</div>
        {footer && <footer className={styles.panelFooter}>{footer}</footer>}
    </section>
);
