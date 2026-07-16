import React from 'react';
import clsx from 'clsx';
import styles from './flyout-controls.module.scss';

interface FlyoutGroupProps {
  title: string;
  last?: boolean;
  children: React.ReactNode;
}

export const FlyoutGroup: React.FC<FlyoutGroupProps> = ({ title, last, children }) => (
  <div className={clsx(styles.group, last && styles.groupLast)}>
    <div className={styles.groupTitle}>{title}</div>
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

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { v: T; l: string }[];
}

export function Segmented<T extends string>({ value, onChange, options }: SegmentedProps<T>) {
  return (
    <div className={styles.segmented}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={clsx(styles.segmentBtn, value === o.v && styles.segmentBtnActive)}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  bipolar?: boolean;
  label?: string;
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
}) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [drag, setDrag] = React.useState(false);
  const range = max - min;
  const pct = ((value - min) / range) * 100;

  const seek = React.useCallback(
    (clientX: number) => {
      const node = trackRef.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - r.left, 0), r.width);
      const raw = min + (x / r.width) * range;
      const stepped = Math.round(raw / step) * step;
      onChange(Math.min(Math.max(stepped, min), max));
    },
    [min, max, range, step, onChange],
  );

  React.useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => seek(e.clientX);
    const up = () => setDrag(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag, seek]);

  const labelVal = bipolar && value > 0 ? `+${value}${unit}` : `${value}${unit}`;

  return (
    <div className={styles.slider}>
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        className={styles.sliderTrack}
        onPointerDown={(e) => {
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
}

export const Toggle: React.FC<ToggleProps> = ({ label, value, onChange, hint }) => (
  <div className={styles.toggle}>
    <span className={styles.toggleLabel}>{label}</span>
    {hint && <span className={styles.toggleHint}>{hint}</span>}
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={clsx(styles.toggleBtn, value && styles.toggleBtnActive)}
      aria-pressed={value}
      aria-label={label}
    >
      <span className={styles.toggleKnob} />
    </button>
  </div>
);
