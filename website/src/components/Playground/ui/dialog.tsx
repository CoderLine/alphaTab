import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { IconClose } from '@site/src/components/landing/shared/icons';
import styles from './dialog.module.scss';

interface DialogProps {
    title: string;
    onClose: () => void;
    footer?: React.ReactNode;
    wide?: boolean;
    children: React.ReactNode;
}

/** A modal `<dialog>`: focus is trapped and Escape closes it natively. Render it to open it. */
export const Dialog: React.FC<DialogProps> = ({ title, onClose, footer, wide, children }) => {
    const ref = useRef<HTMLDialogElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) { return; }
        dialog.showModal();
        const onCancel = (e: Event) => {
            e.preventDefault();
            onCloseRef.current();
        };
        dialog.addEventListener('cancel', onCancel);
        return () => {
            dialog.removeEventListener('cancel', onCancel);
            dialog.close();
        };
    }, []);

    return (
        <dialog
            ref={ref}
            className={clsx(styles.dialog, wide && styles.wide)}
            aria-label={title}
            onClick={(e) => {
                if (e.target === e.currentTarget) { onClose(); }
            }}
        >
            <div className={styles.content}>
                <header className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
                        <IconClose />
                    </button>
                </header>
                <div className={styles.body}>{children}</div>
                {footer && <footer className={styles.footer}>{footer}</footer>}
            </div>
        </dialog>
    );
};
