import { CoreSettings } from '@src/CoreSettings';
import { DisplaySettings } from '@src/DisplaySettings';
import { ImporterSettings } from '@src/ImporterSettings';
import { FingeringMode, NotationMode, NotationSettings } from '@src/NotationSettings';
import { PlayerSettings } from '@src/PlayerSettings';

/**
 * This public class contains instance specific settings for alphaTab
 * @json
 */
export class Settings {
    public static fromJson(json: any): Settings {
        // dynamically implemented via AST transformer
        return new Settings();
    }

    public fillFromJson(json: any): void {
        // dynamically implemented via AST transformer
    }

    public static toJson(settings: Settings): unknown {
        // dynamically implemented via AST transformer
        return null;
    }

    public setProperty(property: string, value: any): boolean {
        // dynamically implemented via macro
        return false;
    }

    public fillFromDataAttributes(dataAttributes: Map<string, unknown>): void {
        for (let kvp of dataAttributes) {
            this.setProperty(kvp[0].toLowerCase(), kvp[1]);
        }
    }

    /**
     * The core settings control the general behavior of alphatab like
     * what modules are active.
     * @json_on_parent
     */
    public readonly core: CoreSettings = new CoreSettings();

    /**
     * The display settings control how the general layout and display of alphaTab is done.
     * @json_on_parent
     */
    public readonly display: DisplaySettings = new DisplaySettings();

    /**
     * The notation settings control how various music notation elements are shown and behaving.
     */
    public readonly notation: NotationSettings = new NotationSettings();

    /**
     * All settings related to importers that decode file formats.
     */
    public readonly importer: ImporterSettings = new ImporterSettings();

    /**
     * Contains all player related settings
     */
    public readonly player: PlayerSettings = new PlayerSettings();

    public setSongBookModeSettings(): void {
        this.notation.notationMode = NotationMode.SongBook;
        this.notation.smallGraceTabNotes = false;
        this.notation.fingeringMode = FingeringMode.SingleNoteEffectBand;
        this.notation.extendBendArrowsOnTiedNotes = false;
        this.notation.showParenthesisForTiedBends = false;
        this.notation.showTabNoteOnTiedBend = false;
        this.notation.showZeroOnDiveWhammy = true;
    }

    public static get songBook(): Settings {
        let settings: Settings = new Settings();
        settings.setSongBookModeSettings();
        return settings;
    }
}
