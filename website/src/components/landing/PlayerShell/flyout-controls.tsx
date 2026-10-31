import React from 'react';
import clsx from 'clsx';
import styles from './flyout-controls.module.scss';

interface FlyoutGroupProps {
  title?: string;
  last?: boolean;
  children: React.ReactNode;
}

export const FlyoutGroup: React.FC<FlyoutGroupProps> = ({ title, last, children }) => (
  <div className={clsx(styles.group, last && styles.groupLast)}>
    {title && <div className={styles.groupTitle}>{title}</div>}
    <div className={styles.groupBody}>{children}</div>
  </div>
);

interface FlyoutRowProps {
  label: string;
  children: React.ReactNode;
}

export const FlyoutRow: React.FC<FlyoutRowProps> = ({ label, children }) => (
  <div className={styles.row}>
    <span className={styles.rowLabel}>{label}</span>
    {children}
  </div>
);

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  bipolar?: boolean;
  label?: string;
  /** Reason the control currently has no effect; disables it and is shown as tooltip. */
  disabledReason?: string | null;
  /** Formats the value label; defaults to the value with `unit`. */
  format?: (v: number) => string;
}

function decimalsOf(step: number): number {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  bipolar = false,
  label,
  disabledReason,
  format,
}) => {
  const disabled = !!disabledReason;
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [drag, setDrag] = React.useState(false);
  const range = max - min;
  const pct = Math.min(Math.max(((value - min) / range) * 100, 0), 100);
  const decimals = decimalsOf(step);
  const commit = React.useCallback(
    (raw: number) => {
      const stepped = Number((Math.round((raw - min) / step) * step + min).toFixed(decimals));
      onChange(Math.min(Math.max(stepped, min), max));
    },
    [min, max, step, decimals, onChange],
  );

  const seek = React.useCallback(
    (clientX: number) => {
      const node = trackRef.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - r.left, 0), r.width);
      commit(min + (x / r.width) * range);
    },
    [min, range, commit],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const big = Math.max(step, range / 10);
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowUp' ? value + step :
      e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? value - step :
      e.key === 'PageUp' ? value + big :
      e.key === 'PageDown' ? value - big :
      e.key === 'Home' ? min :
      e.key === 'End' ? max :
      null;
    if (next === null) return;
    e.preventDefault();
    commit(next);
  };

  React.useEffect(() => {
    if (!drag || disabled) return;
    const move = (e: PointerEvent) => seek(e.clientX);
    const up = () => setDrag(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag, disabled, seek]);

  const shown = value.toFixed(decimals);
  const labelVal = format ? format(value) : bipolar && value > 0 ? `+${shown}${unit}` : `${shown}${unit}`;

  return (
    <div className={clsx(styles.slider, disabled && styles.disabled)} title={disabledReason ?? undefined}>
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={labelVal}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={styles.sliderTrack}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          if (disabled) return;
          e.preventDefault();
          (e.currentTarget as HTMLElement).focus();
          setDrag(true);
          seek(e.clientX);
        }}
      >
        <div className={styles.sliderBar}>
          {bipolar ? (
            <span
              className={styles.sliderFillBipolar}
              style={{
                left: value < 0 ? `${pct}%` : '50%',
                right: value > 0 ? `${100 - pct}%` : '50%',
              }}
            />
          ) : (
            <span className={styles.sliderFill} style={{ width: `${pct}%` }} />
          )}
          {bipolar && <span className={styles.sliderMidline} />}
        </div>
        <span className={styles.sliderHandle} style={{ left: `${pct}%` }} />
      </div>
      <span className={styles.sliderValue}>{labelVal}</span>
    </div>
  );
};

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: React.ReactNode;
  /** Reason the control currently has no effect; disables it and is shown as tooltip. */
  disabledReason?: string | null;
}

export const Toggle: React.FC<ToggleProps> = ({ label, value, onChange, hint, disabledReason }) => (
  <div className={clsx(styles.toggle, disabledReason && styles.disabled)} title={disabledReason ?? undefined}>
    <span className={styles.toggleLabel}>{label}</span>
    {hint && <span className={styles.toggleHint}>{hint}</span>}
    <button
      type="button"
      onClick={() => onChange(!value)}
      disabled={!!disabledReason}
      className={clsx(styles.toggleBtn, value && styles.toggleBtnActive)}
      aria-pressed={value}
      aria-label={label}
    >
      <span className={styles.toggleKnob} />
    </button>
  </div>
);
