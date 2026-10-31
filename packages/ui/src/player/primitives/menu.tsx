import React, { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from './ui.module.scss';

interface MenuProps {
    /** Renders the trigger; spread `props` onto a button. */
    trigger: (props: { ref: React.Ref<HTMLButtonElement>; onClick: () => void; 'aria-expanded': boolean; 'aria-haspopup': 'menu'; 'aria-controls': string }) => React.ReactNode;
    align?: 'start' | 'end';
    children: (close: () => void) => React.ReactNode;
    className?: string;
}

/** A popover menu that closes on outside click, Escape and item activation. */
export const Menu: React.FC<MenuProps> = ({ trigger, align = 'start', children, className }) => {
    const [open, setOpen] = useState(false);
    const id = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) { return; }
        const onDown = (e: PointerEvent) => {
            const t = e.target as Node;
            if (popoverRef.current?.contains(t) || triggerRef.current?.contains(t)) { return; }
            setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener('pointerdown', onDown);
        document.addEventListener('keydown', onKey);
        popoverRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
        return () => {
            document.removeEventListener('pointerdown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const onPopoverKey = (e: React.KeyboardEvent) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') { return; }
        e.preventDefault();
        const items = Array.from(popoverRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
        const index = items.indexOf(document.activeElement as HTMLElement);
        const next = e.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
        items[next]?.focus();
    };

    return (
        <div className={clsx(styles.menuRoot, className)}>
            {trigger({
                ref: triggerRef,
                onClick: () => setOpen((o) => !o),
                'aria-expanded': open,
                'aria-haspopup': 'menu',
                'aria-controls': id,
            })}
            {open && (
                <div
                    ref={popoverRef}
                    id={id}
                    role="menu"
                    className={clsx(styles.menuPopover, align === 'end' && styles.menuEnd)}
                    onKeyDown={onPopoverKey}
                >
                    {children(() => setOpen(false))}
                </div>
            )}
        </div>
    );
};

interface MenuItemProps {
    onSelect: () => void;
    icon?: React.ReactNode;
    /** Secondary text, e.g. a format or shortcut. */
    detail?: React.ReactNode;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
}

export const MenuItem: React.FC<MenuItemProps> = ({ onSelect, icon, detail, active, disabled, title, children }) => (
    <button
        type="button"
        role="menuitem"
        className={clsx(styles.menuItem, active && styles.menuItemActive)}
        onClick={onSelect}
        disabled={disabled}
        title={title}
    >
        {icon && <span className={styles.menuItemIcon}>{icon}</span>}
        <span className={styles.menuItemLabel}>{children}</span>
        {detail && <span className={styles.menuItemDetail}>{detail}</span>}
    </button>
);

export const MenuLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={styles.menuLabel} role="presentation">{children}</div>
);
