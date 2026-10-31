import type React from 'react';
import { useSoundFontLibrary, useUiEnvironment } from '../../environment';
import { PlaybackSourceToggle } from './PlaybackSourceToggle';
import { SoundFontList } from './SoundFontList';
import panelStyles from './panel.module.scss';

interface PlaybackSettingsPanelProps {
    /** Show the action that removes all persisted SoundFonts. */
    showRemoveDownloads?: boolean;
}

/** The playback preferences of the environment; the SoundFont sections need a SoundFont provider. */
export function PlaybackSettingsPanel({ showRemoveDownloads = true }: PlaybackSettingsPanelProps): React.ReactElement {
    const { soundFonts } = useUiEnvironment();
    const library = useSoundFontLibrary();
    const anyStored = Object.values(library).some((s) => s.status === 'stored');

    return (
        <div className={panelStyles.panel}>
            <section className={panelStyles.section}>
                <h3 className={panelStyles.title}>Playback source</h3>
                <PlaybackSourceToggle />
                <p className={panelStyles.hint}>Applies to every player on this site. Some demos use a fixed source.</p>
            </section>
            {soundFonts && (
                <section className={panelStyles.section}>
                    <h3 className={panelStyles.title}>Synthesizer SoundFont</h3>
                    <SoundFontList />
                </section>
            )}
            {soundFonts && showRemoveDownloads && (
                <footer className={panelStyles.footer}>
                    <button
                        type="button"
                        className={panelStyles.clear}
                        disabled={!anyStored}
                        onClick={() => void soundFonts?.clearStored()}
                    >
                        Remove downloaded SoundFonts
                    </button>
                </footer>
            )}
        </div>
    );
}
