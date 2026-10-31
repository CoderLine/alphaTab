import React from 'react';
import clsx from 'clsx';
import { useSoundFontLibrary } from '@site/src/alphatab-react';
import { PlaybackSettingsPanel } from '@site/src/components/PlaybackSettings';
import { IconHeadphones } from '@site/src/components/landing/shared/icons';
import styles from './PlaybackSettingsNavbarItem.module.scss';

interface Props {
  mobile?: boolean;
  className?: string;
}

export default function PlaybackSettingsNavbarItem({ mobile, className }: Props): React.ReactElement {
  const library = useSoundFontLibrary();
  const downloading = Object.values(library).some((s) => s.status === 'downloading');
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) { return; }
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) { setOpen(false); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (mobile) {
    return (
      <li className={clsx('menu__list-item', styles.mobileItem)}>
        <div className={styles.mobileTitle}>
          <IconHeadphones size={14} aria-hidden="true" /> Playback
        </div>
        <PlaybackSettingsPanel />
      </li>
    );
  }

  return (
    <div ref={rootRef} className={clsx(styles.root, className)}>
      <button
        type="button"
        className={clsx(styles.trigger, open && styles.triggerOpen)}
        onClick={() => setOpen((v) => !v)}
        aria-label="Playback settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Playback settings"
      >
        <IconHeadphones size={17} aria-hidden="true" />
        {downloading && <span className={styles.activityDot} aria-hidden="true" />}
      </button>
      {open && (
        <div className={styles.popover} role="dialog" aria-label="Playback settings">
          <PlaybackSettingsPanel />
        </div>
      )}
    </div>
  );
}
