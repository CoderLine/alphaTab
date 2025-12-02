import { CoreSettings } from '@coderline/alphatab/CoreSettings';
import { DisplaySettings } from '@coderline/alphatab/DisplaySettings';
import { ImporterSettings } from '@coderline/alphatab/ImporterSettings';
import { FingeringMode, NotationMode, NotationSettings, NotationElement } from '@coderline/alphatab/NotationSettings';
import { PlayerMode, PlayerSettings } from '@coderline/alphatab/PlayerSettings';
import { SettingsSerializer } from '@coderline/alphatab/generated/SettingsSerializer';
import type { SettingsJson } from '@coderline/alphatab/generated/SettingsJson';
import { ExporterSettings } from '@coderline/alphatab/ExporterSettings';

/**
 * This public class contains instance specific settings for alphaTab
 * @json
 * @json_declaration
 * @public
 */
export class Settings {
    /**
     * The core settings control the general behavior of alphatab like
     * what modules are active.
     * @json_on_parent
     * @json_partial_names
     */
    public readonly core: CoreSettings = new CoreSettings();

    /**
     * The display settings control how the general layout and display of alphaTab is done.
     * @json_on_parent
     * @json_partial_names
     */
    public readonly display: DisplaySettings = new DisplaySettings();

    /**
     * The notation settings control how various music notation elements are shown and behaving.
     * @json_partial_names
     */
    public readonly notation: NotationSettings = new NotationSettings();

    /**
     * All settings related to importers that decode file formats.
     * @json_partial_names
     */
    public readonly importer: ImporterSettings = new ImporterSettings();

    /**
     * Contains all player related settings
     * @json_partial_names
     */
    public readonly player: PlayerSettings = new PlayerSettings();

    /**
     * All settings related to exporter that export file formats.
     * @json_partial_names
     */
    public readonly exporter: ExporterSettings = new ExporterSettings();

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
        const settings: Settings = new Settings();
        settings.setSongBookModeSettings();
        return settings;
    }

    /**
     * @target web
     */
    public fillFromJson(json: SettingsJson): void {
        SettingsSerializer.fromJson(this, json);
    }

    /**
     * handles backwards compatibility aspects on the settings, removed in 2.0
     * @internal
     */
    public handleBackwardsCompatibility() {
        if (this.player.playerMode === PlayerMode.Disabled && this.player.enablePlayer) {
            this.player.playerMode = PlayerMode.EnabledAutomatic;
        }
    }
}
