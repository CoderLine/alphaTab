import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './settings.module.scss';

export const Switch: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }> = ({
    value,
    onChange,
    label,
    disabled,
}) => (
    <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={disabled}
        className={clsx(styles.switch, value && styles.switchOn)}
        onClick={() => onChange(!value)}
    >
        <span className={styles.switchKnob} />
    </button>
);

export const Select: React.FC<{
    value: number;
    options: { value: number; label: string }[];
    onChange: (v: number) => void;
    label: string;
}> = ({ value, options, onChange, label }) => (
    <select className={styles.select} value={value} aria-label={label} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((o) => (
            <option key={o.value} value={o.value}>
                {o.label}
            </option>
        ))}
    </select>
);

/** A text field that keeps its draft while focused and commits valid values on Enter or blur. */
function useDraft<T>(value: T, format: (v: T) => string, parse: (text: string) => T | null, onCommit: (v: T) => void) {
    const [draft, setDraft] = useState<string | null>(null);
    const [invalid, setInvalid] = useState(false);
    useEffect(() => {
        setDraft(null);
        setInvalid(false);
    }, [value]);
    const commit = () => {
        if (draft === null) { return; }
        const parsed = parse(draft);
        if (parsed === null) {
            setInvalid(true);
            return;
        }
        setDraft(null);
        setInvalid(false);
        if (parsed !== value) { onCommit(parsed); }
    };
    return {
        text: draft ?? format(value),
        invalid,
        inputProps: {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setDraft(e.target.value);
                setInvalid(false);
            },
            onBlur: commit,
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') { commit(); }
                if (e.key === 'Escape') {
                    setDraft(null);
                    setInvalid(false);
                }
            },
        },
    };
}

export const NumberField: React.FC<{
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label: string;
}> = ({ value, onChange, min, max, step = 1, label }) => {
    const parse = (text: string) => {
        const n = Number(text.replace(',', '.'));
        if (text.trim() === '' || !Number.isFinite(n)) { return null; }
        if ((min !== undefined && n < min) || (max !== undefined && n > max)) { return null; }
        return n;
    };
    const draft = useDraft(value, String, parse, onChange);
    const nudge = (direction: 1 | -1) => {
        const decimals = (String(step).split('.')[1] ?? '').length;
        let next = Number((value + direction * step).toFixed(decimals));
        if (min !== undefined) { next = Math.max(min, next); }
        if (max !== undefined) { next = Math.min(max, next); }
        onChange(next);
    };
    return (
        <input
            className={clsx(styles.input, styles.numberInput, draft.invalid && styles.inputInvalid)}
            inputMode="decimal"
            aria-label={label}
            aria-invalid={draft.invalid || undefined}
            title={draft.invalid ? `Enter a number${min !== undefined ? ` ≥ ${min}` : ''}${max !== undefined ? ` ≤ ${max}` : ''}` : undefined}
            value={draft.text}
            {...draft.inputProps}
            onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    nudge(e.key === 'ArrowUp' ? 1 : -1);
                    return;
                }
                draft.inputProps.onKeyDown(e);
            }}
        />
    );
};

export const FontField: React.FC<{ value: string; onChange: (v: string) => void; validate: (v: string) => boolean; label: string }> = ({
    value,
    onChange,
    validate,
    label,
}) => {
    const draft = useDraft(value, (v) => v, (text) => (validate(text) ? text : null), onChange);
    return (
        <input
            className={clsx(styles.input, styles.fontInput, draft.invalid && styles.inputInvalid)}
            aria-label={label}
            aria-invalid={draft.invalid || undefined}
            title={draft.invalid ? 'Use the CSS font shorthand, e.g. "italic bold 12px Georgia, serif"' : undefined}
            spellCheck={false}
            value={draft.text}
            {...draft.inputProps}
        />
    );
};

export const TextField: React.FC<{ value: string; onChange: (v: string) => void; label: string; placeholder?: string }> = ({
    value,
    onChange,
    label,
    placeholder,
}) => {
    const draft = useDraft(value, (v) => v, (text) => (text.trim() ? text.trim() : null), onChange);
    return (
        <input
            className={clsx(styles.input, styles.fontInput, draft.invalid && styles.inputInvalid)}
            aria-label={label}
            placeholder={placeholder}
            spellCheck={false}
            value={draft.text}
            {...draft.inputProps}
        />
    );
};
