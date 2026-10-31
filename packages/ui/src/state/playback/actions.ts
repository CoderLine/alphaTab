import { playbackPreferences } from './preferences';
import { soundFontLibrary } from './soundfont-library';
import type { SoundFontId } from './soundfont-registry';

/** Makes `id` the site-wide SoundFont and starts its download right away, even with no synthesizer on the page. */
export function selectSoundFont(id: SoundFontId): void {
    playbackPreferences.setSoundFont(id);
    soundFontLibrary.load(id).catch(() => {
        // Failure is reported through the library's per-SoundFont status.
    });
}
