import { BarSerializer } from '@coderline/alphatab/generated/model/BarSerializer';
import { NumberedBarOverrideSerializer } from '@coderline/alphatab/generated/model/NumberedBarOverrideSerializer';
import { NumberedStaffConfigSerializer } from '@coderline/alphatab/generated/model/NumberedStaffConfigSerializer';
import { RenderStylesheetSerializer } from '@coderline/alphatab/generated/model/RenderStylesheetSerializer';
import { ScoreBarOverrideSerializer } from '@coderline/alphatab/generated/model/ScoreBarOverrideSerializer';
import { ScoreStaffConfigSerializer } from '@coderline/alphatab/generated/model/ScoreStaffConfigSerializer';
import { SlashBarOverrideSerializer } from '@coderline/alphatab/generated/model/SlashBarOverrideSerializer';
import { SlashStaffConfigSerializer } from '@coderline/alphatab/generated/model/SlashStaffConfigSerializer';
import { StaffSerializer } from '@coderline/alphatab/generated/model/StaffSerializer';
import { TabBarOverrideSerializer } from '@coderline/alphatab/generated/model/TabBarOverrideSerializer';
import { TabStaffConfigSerializer } from '@coderline/alphatab/generated/model/TabStaffConfigSerializer';
import { AlphaTex1EnumMappings } from '@coderline/alphatab/importer/alphaTex/AlphaTex1EnumMappings';
import {
    type AlphaTexMetaDataNode,
    AlphaTexNodeType,
    type AlphaTexNumberLiteral,
    type AlphaTexPropertyNode,
    type AlphaTexTextNode
} from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import {
    AlphaTexDiagnosticCode,
    AlphaTexDiagnosticsSeverity,
    AlphaTexStaffType,
    type IAlphaTexImporter
} from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { Atnf } from '@coderline/alphatab/importer/alphaTex/ATNF';
import { JsonHelper } from '@coderline/alphatab/io/JsonHelper';
import type { Bar } from '@coderline/alphatab/model/Bar';
import { StaffPlacement, SystemDisplay } from '@coderline/alphatab/model/ElementDisplay';
import { BarNumberDisplay, RenderStylesheet } from '@coderline/alphatab/model/RenderStylesheet';
import type { Staff } from '@coderline/alphatab/model/Staff';
import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';

/**
 * A staff display property, its location in the carrier JSON (setting is empty for direct values)
 * and the staff types supporting it.
 * @record
 * @internal
 */
interface AlphaTexStaffDisplayProperty {
    name: string;
    key: string;
    setting: string;
    types: AlphaTexStaffType[];
}

/**
 * Imports and exports the staff display tags (`\defaultStaffDisplay`, `\staffDisplay`, `\barDisplay`).
 * The per staff type carriers (e.g. `stylesheet.scoreConfig`, `staff.tabConfig`, `bar.slashDisplay`) share
 * their structure but not their type, hence they are accessed via their JSON serializers.
 * @internal
 */
export class AlphaTex1StaffDisplay {
    private static readonly _defaults = new RenderStylesheet();
    private static readonly _carriers = new Map<AlphaTexStaffType, string>([
        [AlphaTexStaffType.Score, 'score'],
        [AlphaTexStaffType.Tabs, 'tab'],
        [AlphaTexStaffType.Slash, 'slash'],
        [AlphaTexStaffType.Numbered, 'numbered']
    ]);

    /**
     * The properties by their lower case name.
     */
    private static readonly _properties = AlphaTex1StaffDisplay._createProperties();

    private static _createProperties() {
        const props = new Map<string, AlphaTexStaffDisplayProperty>();
        const add = (name: string, key: string, setting: string, types: AlphaTexStaffType[]) => {
            props.set(name.toLowerCase(), { name: name, key: key, setting: setting, types: types });
        };
        const all = Array.from(AlphaTex1StaffDisplay._carriers.keys());
        const elements = new Map<string, AlphaTexStaffType[]>([
            ['clef', [AlphaTexStaffType.Score, AlphaTexStaffType.Tabs]],
            ['keysignature', [AlphaTexStaffType.Score, AlphaTexStaffType.Slash]],
            ['timesignature', all],
            ['rests', [AlphaTexStaffType.Tabs]]
        ]);
        for (const [key, types] of elements) {
            const prefix = key === 'keysignature' ? 'ks' : key === 'timesignature' ? 'ts' : key;
            add(`${prefix}Visibility`, key, 'isvisible', types);
            add(`${prefix}Placement`, key, 'staffplacement', types);
            add(`${prefix}Systems`, key, 'systemdisplay', types);
        }
        add('barNumber', 'barnumber', '', all);
        add('rhythm', 'rhythm', '', [AlphaTexStaffType.Tabs]);
        return props;
    }

    /**
     * Applies the (validated) tag to the stylesheet, staff or bar. The arguments select the staff types,
     * without arguments every property applies to all staff types supporting it.
     */
    public static apply(
        importer: IAlphaTexImporter,
        metaData: AlphaTexMetaDataNode,
        isValid: (p: AlphaTexPropertyNode) => boolean,
        stylesheet: RenderStylesheet | undefined,
        staff: Staff | undefined,
        bar: Bar | undefined
    ) {
        const explicit: AlphaTexStaffType[] = [];
        if (metaData.arguments) {
            for (const a of metaData.arguments!.arguments) {
                explicit.push(AlphaTex1EnumMappings.alphaTexStaffType.get((a as AlphaTexTextNode).text.toLowerCase())!);
            }
        }

        if (!metaData.properties) {
            return;
        }
        const changes = new Map<AlphaTexStaffType, Map<string, unknown>>();
        for (const p of metaData.properties!.properties) {
            if (!isValid(p)) {
                continue;
            }
            const prop = AlphaTex1StaffDisplay._properties.get(p.property.text.toLowerCase())!;
            const supported = prop.types;
            // enum values are matched by name (case insensitive) when deserializing
            const value: unknown =
                prop.setting === 'isvisible'
                    ? AlphaTex1StaffDisplay._isTrue(p)
                    : (p.arguments!.arguments[0] as AlphaTexTextNode).text;
            for (const t of explicit.length > 0 ? explicit : supported) {
                if (supported.indexOf(t) === -1) {
                    importer.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT307,
                        message: `The property '${prop.name}' has no effect on the staff type '${AlphaTex1EnumMappings.alphaTexStaffTypeReversed.get(t)}'`,
                        severity: AlphaTexDiagnosticsSeverity.Warning,
                        start: p.start,
                        end: p.end
                    });
                    continue;
                }
                if (!changes.has(t)) {
                    changes.set(
                        t,
                        AlphaTex1StaffDisplay._read(t, stylesheet, staff, bar) ?? new Map<string, unknown>()
                    );
                }
                const json = changes.get(t)!;
                if (prop.setting.length > 0) {
                    const element =
                        (json.get(prop.key) as Map<string, unknown> | undefined) ?? new Map<string, unknown>();
                    element.set(prop.setting, value);
                    json.set(prop.key, element);
                } else {
                    json.set(prop.key, value);
                }
            }
        }

        for (const [t, json] of changes) {
            const carrier = `${AlphaTex1StaffDisplay._carriers.get(t)}${bar ? 'display' : 'config'}`;
            if (bar) {
                BarSerializer.setProperty(bar, carrier, json);
            } else if (staff) {
                StaffSerializer.setProperty(staff, carrier, json);
            } else {
                RenderStylesheetSerializer.setProperty(stylesheet!, carrier, json);
            }
        }
    }

    private static _isTrue(p: AlphaTexPropertyNode): boolean {
        if (!p.arguments || p.arguments!.arguments.length === 0) {
            return true;
        }
        const v = p.arguments!.arguments[0];
        return v.nodeType === AlphaTexNodeType.Number
            ? (v as AlphaTexNumberLiteral).value !== 0
            : (v as AlphaTexTextNode).text !== 'false';
    }

    /**
     * Builds the tags of one level (one per staff type). On score level only values differing from the defaults
     * are written, a bar number shared by all staff types is written via the existing shorthand tag.
     */
    public static buildNodes(
        nodes: AlphaTexMetaDataNode[],
        stylesheet: RenderStylesheet | undefined,
        staff: Staff | undefined,
        bar: Bar | undefined,
        impliedAllBars: boolean
    ) {
        const perType = new Map<AlphaTexStaffType, string[]>();
        for (const t of AlphaTex1StaffDisplay._carriers.keys()) {
            let skip: string[] = [];
            if (stylesheet) {
                skip = AlphaTex1StaffDisplay._texts(
                    AlphaTex1StaffDisplay._read(t, AlphaTex1StaffDisplay._defaults, undefined, undefined)
                );
            }
            if (impliedAllBars) {
                skip.push('barNumber AllBars');
            }
            const texts = AlphaTex1StaffDisplay._texts(AlphaTex1StaffDisplay._read(t, stylesheet, staff, bar));
            perType.set(t, texts.filter(p => skip.indexOf(p) === -1));
        }

        const barNumber = perType.get(AlphaTexStaffType.Score)!.find(p => p.startsWith('barNumber '));
        let shared = !staff && barNumber !== undefined;
        for (const v of perType.values()) {
            shared = shared && v.indexOf(barNumber!) !== -1;
        }
        if (shared) {
            nodes.push(Atnf.identMeta(bar ? 'barNumberDisplay' : 'defaultBarNumberDisplay', barNumber!.substring(10)));
            for (const v of perType.values()) {
                v.splice(v.indexOf(barNumber!), 1);
            }
        }

        for (const [t, texts] of perType) {
            if (texts.length > 0) {
                const props = Atnf.props([]);
                for (const p of texts) {
                    const i = p.indexOf(' ');
                    Atnf.prop(props.properties, p.substring(0, i), Atnf.identValue(p.substring(i + 1)));
                }
                const type = Atnf.identValue(AlphaTex1EnumMappings.alphaTexStaffTypeReversed.get(t)!);
                nodes.push(Atnf.meta(bar ? 'barDisplay' : staff ? 'staffDisplay' : 'defaultStaffDisplay', type, props));
            }
        }
    }

    private static _read(
        t: AlphaTexStaffType,
        stylesheet: RenderStylesheet | undefined,
        staff: Staff | undefined,
        bar: Bar | undefined
    ): Map<string, unknown> | null {
        switch (t) {
            case AlphaTexStaffType.Score:
                return bar
                    ? ScoreBarOverrideSerializer.toJson(bar.scoreDisplay)
                    : ScoreStaffConfigSerializer.toJson(staff ? staff.scoreConfig : stylesheet!.scoreConfig);
            case AlphaTexStaffType.Tabs:
                return bar
                    ? TabBarOverrideSerializer.toJson(bar.tabDisplay)
                    : TabStaffConfigSerializer.toJson(staff ? staff.tabConfig : stylesheet!.tabConfig);
            case AlphaTexStaffType.Slash:
                return bar
                    ? SlashBarOverrideSerializer.toJson(bar.slashDisplay)
                    : SlashStaffConfigSerializer.toJson(staff ? staff.slashConfig : stylesheet!.slashConfig);
            default:
                return bar
                    ? NumberedBarOverrideSerializer.toJson(bar.numberedDisplay)
                    : NumberedStaffConfigSerializer.toJson(staff ? staff.numberedConfig : stylesheet!.numberedConfig);
        }
    }

    /**
     * Lists the defined values of the JSON as `<property> <value>`.
     */
    private static _texts(json: Map<string, unknown> | null): string[] {
        const texts: string[] = [];
        if (!json) {
            return texts;
        }
        for (const prop of AlphaTex1StaffDisplay._properties.values()) {
            let v = json.get(prop.key);
            if (prop.setting.length > 0) {
                v = (v as Map<string, unknown> | undefined)?.get(prop.setting);
            }
            if (v !== undefined && v !== null) {
                texts.push(
                    `${prop.name} ${AlphaTex1StaffDisplay._text(prop.setting.length > 0 ? prop.setting : prop.key, v)}`
                );
            }
        }
        return texts;
    }

    private static _text(key: string, v: unknown): string {
        switch (key) {
            case 'isvisible':
                return (v as boolean) ? 'true' : 'false';
            case 'staffplacement':
                return StaffPlacement[JsonHelper.parseEnum<StaffPlacement>(v, StaffPlacement)!];
            case 'systemdisplay':
                return SystemDisplay[JsonHelper.parseEnum<SystemDisplay>(v, SystemDisplay)!];
            case 'barnumber':
                return BarNumberDisplay[JsonHelper.parseEnum<BarNumberDisplay>(v, BarNumberDisplay)!];
            default:
                return TabRhythmMode[JsonHelper.parseEnum<TabRhythmMode>(v, TabRhythmMode)!];
        }
    }
}
