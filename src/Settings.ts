import { CoreSettings } from '@src/CoreSettings';
import { DisplaySettings } from '@src/DisplaySettings';
import { ImporterSettings } from '@src/ImporterSettings';
import { FingeringMode, NotationMode, NotationSettings, NotationElement } from '@src/NotationSettings';
import { PlayerSettings } from '@src/PlayerSettings';

/**
 * This public class contains instance specific settings for alphaTab
 * @json
 */
export class Settings {
    /**
     * @target web
     */
    public static fromJson(json: any): Settings {
        // dynamically implemented via AST transformer
        return new Settings();
    }

    /**
     * @target web
     */
    public fillFromJson(json: any): void {
        // dynamically implemented via AST transformer
    }

    /**
     * @target web
     */
    public static toJson(settings: Settings): unknown {
        // dynamically implemented via AST transformer
        return null;
    }

    /**
     * @target web
     */
    public setProperty(property: string, value: any): boolean {
        // dynamically implemented via macro
        return false;
    }

    /**
     * @target web
     */
    public fillFromDataAttributes(dataAttributes: Map<string, unknown>): void {
        dataAttributes.forEach((v, k) => {
            this.setProperty(k.toLowerCase(), v);
        });
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
        this.notation.elements.set(NotationElement.ParenthesisOnTiedBends, false);
        this.notation.elements.set(NotationElement.TabNotesOnTiedBends, false);
        this.notation.elements.set(NotationElement.ZerosOnDiveWhammys, true);
    }

    public static get songBook(): Settings {
        let settings: Settings = new Settings();
        settings.setSongBookModeSettings();
        return settings;
    }
}
