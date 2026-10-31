import React from 'react';
import clsx from 'clsx';
import styles from './ui.module.scss';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Accessible name and tooltip. */
    label: string;
    /** Shown next to the icon from tablet width up. */
    text?: string;
    active?: boolean;
    variant?: 'ghost' | 'outline' | 'primary';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ label, text, active = false, variant = 'ghost', className, children, ...rest }, ref) => (
        <button
            ref={ref}
            type="button"
            aria-label={text ? undefined : label}
            title={label}
            className={clsx(styles.iconBtn, styles[variant], active && styles.active, text && styles.withText, className)}
            {...rest}
        >
            {children}
            {text && <span className={styles.iconBtnText}>{text}</span>}
        </button>
    ),
);
IconButton.displayName = 'IconButton';
