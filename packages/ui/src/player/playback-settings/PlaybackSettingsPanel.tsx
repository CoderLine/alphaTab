import React from 'react';
import { soundFontLibrary, useSoundFontLibrary } from '../../state/playback';
import { PlaybackSourceToggle } from './PlaybackSourceToggle';
import { SoundFontList } from './SoundFontList';
import panelStyles from './panel.module.scss';

interface PlaybackSettingsPanelProps {
    /** Show the action that removes all persisted SoundFonts. */
    showRemoveDownloads?: boolean;
}

/** The site-wide playback settings; the same panel in the navbar menu and in player settings. */
export function PlaybackSettingsPanel({ showRemoveDownloads = true }: PlaybackSettingsPanelProps): React.ReactElement {
    const library = useSoundFontLibrary();
    const anyStored = Object.values(library).some((s) => s.status === 'stored');

    return (
        <div className={panelStyles.panel}>
            <section className={panelStyles.section}>
                <h3 className={panelStyles.title}>Playback source</h3>
                <PlaybackSourceToggle />
                <p className={panelStyles.hint}>Applies to every player on this site. Some demos use a fixed source.</p>
            </section>
            <section className={panelStyles.section}>
                <h3 className={panelStyles.title}>Synthesizer SoundFont</h3>
                <SoundFontList />
            </section>
            {showRemoveDownloads && (
                <footer className={panelStyles.footer}>
                    <button
                        type="button"
                        className={panelStyles.clear}
                        disabled={!anyStored}
                        onClick={() => void soundFontLibrary.clearStored()}
                    >
                        Remove downloaded SoundFonts
                    </button>
                </footer>
            )}
        </div>
    );
}
