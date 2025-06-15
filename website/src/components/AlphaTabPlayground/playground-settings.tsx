'use client';

import * as alphaTab from '@coderline/alphatab';
import type React from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import { createContext, useContext, useEffect, useId, useState } from 'react';
import Chrome from '@uiw/react-color-chrome';
import { useDebounce } from '@uidotdev/usehooks';
import { rgbaToHexa } from '@uiw/react-color';
import { downloadFile } from '@site/src/utils';

type SettingsContextProps = {
    api: alphaTab.AlphaTabApi;
    onSettingsUpdated(): void;
};

const SettingsContext = createContext<SettingsContextProps>(null!);

type TypeScriptEnum = { [key: number | string]: number | string };

type ValueAccessor = {
    getValue(context: SettingsContextProps): any;
    setValue(context: SettingsContextProps, value: any): void;
};
type ControlProps = ValueAccessor & { inputId: string };

type ButtonGroupButtonSchema = { label: string; value: any };

type ButtonGroupSchema = { type: 'button-group'; buttons: ButtonGroupButtonSchema[] };
type NumberInputSchema = { type: 'number-input'; min?: number; max?: number; step?: number };
type BooleanToggleSchema = { type: 'boolean-toggle' };
type NumberRangeSchema = { type: 'number-range'; min: number; max: number; step: number };
type EnumDropDownSchema = { type: 'enum-dropdown'; enumType: TypeScriptEnum };
type ColorPickerSchema = { type: 'color-picker' };
type FontPickerSchema = { type: 'font-picker' };

type SettingSchema = {
    label: string;
    control:
        | ButtonGroupSchema
        | EnumDropDownSchema
        | NumberRangeSchema
        | NumberInputSchema
        | BooleanToggleSchema
        | ColorPickerSchema
        | FontPickerSchema;
    prepareValue?(value: any): any;
} & ValueAccessor;
type SettingsGroupSchema = { title: string; settings: SettingSchema[] };

type UpdateSettingsOptions = {
    prepareValue?: (value: any) => any;
    afterUpdate?: (context: SettingsContextProps) => any;
    callRender?: boolean;
    callUpdateSettings?: boolean;
};

function updateSettings(
    context: SettingsContextProps,
    update: (settings: alphaTab.Settings) => void,
    options?: UpdateSettingsOptions
) {
    const api = context.api;
    update(api.settings);
    if (options?.callUpdateSettings ?? true) {
        api.updateSettings();
    }
    if (options?.callRender ?? true) {
        api.render();
    }
    context.onSettingsUpdated();
    options?.afterUpdate?.(context);
}

const factory = {
    settingAccessors(setting: string, updateOptions?: UpdateSettingsOptions) {
        const parts = setting.split('.');
        return {
            getValue(context: SettingsContextProps) {
                let setting: any = context.api.settings;
                for (let i = 0; i < parts.length - 1; i++) {
                    setting = setting[parts[i]];
                }
                return setting[parts[parts.length - 1]];
            },
            setValue(context: SettingsContextProps, value) {
                updateSettings(
                    context,
                    s => {
                        for (let i = 0; i < parts.length - 1; i++) {
                            s = s[parts[i]];
                        }
                        if (updateOptions?.prepareValue) {
                            value = updateOptions?.prepareValue(value);
                        }
                        s[parts[parts.length - 1]] = value;
                    },
                    updateOptions
                );
            }
        };
    },
    apiAccessors(setting: string) {
        return {
            getValue(context: SettingsContextProps) {
                return context.api[setting];
            },
            setValue(context: SettingsContextProps, value) {
                context.api[setting] = value;
                context.onSettingsUpdated();
            }
        };
    },
    stylesheetAccessors(setting: string) {
        return {
            getValue(context: SettingsContextProps) {
                return context.api.score!.stylesheet[setting];
            },
            setValue(context: SettingsContextProps, value) {
                context.api.score!.stylesheet[setting] = value;
                context.onSettingsUpdated();
                context.api.render();
            }
        };
    },

    numberRange(
        label: string,
        setting: string,
        min: number,
        max: number,
        step: number,
        updateOptions?: UpdateSettingsOptions
    ): SettingSchema {
        return {
            label: label,
            ...factory.settingAccessors(setting, updateOptions),
            control: { type: 'number-range', min, max, step }
        };
    },

    numberRangeNegativeDisabled(
        label: string,
        setting: string,
        min: number,
        max: number,
        step: number,
        updateOptions?: UpdateSettingsOptions
    ): SettingSchema {
        return {
            label: label,
            ...factory.settingAccessors(setting, {
                callRender: updateOptions?.callRender,
                callUpdateSettings: updateOptions?.callUpdateSettings,
                prepareValue(value: any) {
                    if (updateOptions?.prepareValue) {
                        value = updateOptions.prepareValue(value);
                    }
                    return value < 0 ? value : value + 1;
                }
            }),
            control: { type: 'number-range', min, max, step }
        };
    },

    numberInput(
        label: string,
        setting: string,
        min?: number,
        max?: number,
        step?: number,
        updateOptions?: UpdateSettingsOptions
    ): SettingSchema {
        return {
            label: label,
            ...factory.settingAccessors(setting, updateOptions),
            control: { type: 'number-input', min, max, step }
        };
    },

    toggle(label: string, setting: string, updateOptions?: UpdateSettingsOptions): SettingSchema {
        return {
            label: label,
            ...factory.settingAccessors(setting, updateOptions),
            control: { type: 'boolean-toggle' }
        };
    },

    colorPicker(label: string, setting: string, updateOptions?: UpdateSettingsOptions): SettingSchema {
        return {
            label: label,
            ...factory.settingAccessors(setting, updateOptions),
            control: { type: 'color-picker' }
        };
    },

    fontPicker(label: string, setting: string, updateOptions?: UpdateSettingsOptions): SettingSchema {
        return {
            label: label,
            ...factory.settingAccessors(setting, updateOptions),
            control: { type: 'font-picker' }
        };
    },

    enumDropDown(
        label: string,
        setting: string,
        enumType: TypeScriptEnum,
        updateOptions?: UpdateSettingsOptions
    ): SettingSchema {
        return {
            label: label,
            ...factory.settingAccessors(setting, updateOptions),
            control: { type: 'enum-dropdown', enumType }
        };
    },

    buttonGroup(
        label: string,
        setting: string,
        buttons: [string, string][],
        updateOptions?: UpdateSettingsOptions
    ): SettingSchema {
        return {
            label: label,
            ...factory.settingAccessors(setting, updateOptions),
            control: { type: 'button-group', buttons: buttons.map(b => ({ label: b[0], value: b[1] })) }
        };
    }
};

// maybe we can auto-generate this for all settings?
function buildSettingsGroups(): SettingsGroupSchema[] {
    const noRerender: UpdateSettingsOptions = {
        callRender: false,
        callUpdateSettings: true
    };
    const withMidiGenerate: UpdateSettingsOptions = {
        callRender: false,
        callUpdateSettings: false,
        afterUpdate(context) {
            context.api.loadMidiForScore();
        }
    };
    return [
        {
            title: 'Display ▸ General',
            settings: [
                factory.buttonGroup('Render Engine', 'core.engine', [
                    ['SVG', 'svg'],
                    ['HTML5', 'html5']
                ]),
                factory.numberRange('Scale', 'display.scale', 0.25, 2, 0.25),
                factory.numberRange('Stretch', 'display.stretchForce', 0.25, 2, 0.25),
                factory.enumDropDown('Layout', 'display.layoutMode', alphaTab.LayoutMode),
                factory.numberRangeNegativeDisabled('Bars per System', 'display.barsPerRow', -1, 20, 1),
                factory.numberInput('Start Bar', 'display.startBar', 1, undefined, 1),
                factory.numberInput('Bar Count', 'display.barCount', -1, undefined, 1),
                factory.toggle('Justify Last System', 'display.justifyLastSystem'),
                factory.enumDropDown('Systems Layout Mode', 'display.systemsLayoutMode', alphaTab.SystemsLayoutMode)
            ]
        },
        {
            title: 'Display ▸ Colors',
            settings: [
                factory.colorPicker('Staff Line', 'display.resources.staffLineColor'),
                factory.colorPicker('Bar Separator', 'display.resources.barSeparatorColor'),
                factory.colorPicker('Bar Number', 'display.resources.barNumberColor'),
                factory.colorPicker('Main Glyphs', 'display.resources.mainGlyphColor'),
                factory.colorPicker('Secondary Glyphs', 'display.resources.secondaryGlyphColor'),
                factory.colorPicker('Score Info', 'display.resources.scoreInfoColor')
                // TODO: advanced coloring
            ]
        },
        {
            title: 'Display ▸ Fonts',
            settings: [
                factory.fontPicker('Copyright', 'display.resources.copyrightFont'),
                factory.fontPicker('Title', 'display.resources.titleFont'),
                factory.fontPicker('Subtitle', 'display.resources.subTitleFont'),
                factory.fontPicker('Words', 'display.resources.wordsFont'),
                factory.fontPicker('Effects', 'display.resources.effectFont'),
                factory.fontPicker('Timer', 'display.resources.timerFont'),
                factory.fontPicker('Directions', 'display.resources.directionsFont'),
                factory.fontPicker('Fretboard Numbers', 'display.resources.fretboardNumberFont'),
                factory.fontPicker('Numbered Notation', 'display.resources.numberedNotationFont'),
                factory.fontPicker('Guitar Tabs', 'display.resources.tablatureFont'),
                factory.fontPicker('Grace Notes', 'display.resources.graceFont'),
                factory.fontPicker('Bar Numbers', 'display.resources.barNumberFont'),
                factory.fontPicker('Inline Fingering', 'display.resources.inlineFingeringFont'),
                factory.fontPicker('Markers', 'display.resources.markerFont')
            ]
        },
        {
            title: 'Display ▸ Paddings',
            settings: [
                {
                    label: 'Horizontal',
                    getValue(context: SettingsContextProps) {
                        return context.api.settings.display.padding[0];
                    },
                    setValue(context: SettingsContextProps, value) {
                        updateSettings(context, s => {
                            s.display.padding[0] = value;
                        });
                    },
                    control: { type: 'number-input', min: 0, step: 1 }
                },
                {
                    label: 'Vertical',
                    getValue(context: SettingsContextProps) {
                        return context.api.settings.display.padding[1];
                    },
                    setValue(context: SettingsContextProps, value) {
                        updateSettings(context, s => {
                            s.display.padding[1] = value;
                        });
                    },
                    control: { type: 'number-input', min: 0, step: 1 }
                },
                factory.numberInput('First System Top', 'display.firstSystemPaddingTop', 0),
                factory.numberInput('Other Systems Top', 'display.systemPaddingTop', 0),
                factory.numberInput('Last System Bottom', 'display.lastSystemPaddingBottom', 0),
                factory.numberInput('Other Systems Bottom', 'display.systemPaddingBottom', 0),
                factory.numberInput('System Label Left', 'display.systemLabelPaddingLeft', 0),
                factory.numberInput('System Label Right', 'display.systemLabelPaddingRight', 0),
                factory.numberInput('Accolade Bar Right', 'display.accoladeBarPaddingRight', 0),
                factory.numberInput('Notation Staff Top', 'display.notationStaffPaddingTop', 0),
                factory.numberInput('Notation Staff Bottom', 'display.notationStaffPaddingBottom', 0),
                factory.numberInput('Effect Staff Top', 'display.effectStaffPaddingTop', 0),
                factory.numberInput('Effect Staff Bottom', 'display.effectStaffPaddingBottom', 0),
                factory.numberInput('First Staff Left', 'display.firstStaffPaddingLeft', 0),
                factory.numberInput('Other Staves Left', 'display.staffPaddingLeft', 0)
            ]
        },
        {
            title: 'Notation',
            settings: [
                factory.enumDropDown('Fingering', 'notation.fingeringMode', alphaTab.FingeringMode),
                // TODO: elements
                factory.enumDropDown('Tab Rhythm Stems', 'notation.rhythmMode', alphaTab.TabRhythmMode),
                factory.numberInput('⤷ Height', 'notation.rhythmHeight', 1),
                factory.toggle('Small Grace Notes in Tabs', 'notation.smallGraceTabNotes'),
                factory.toggle('Extend Bend Arrows on Tied Notes', 'notation.extendBendArrowsOnTiedNotes'),
                factory.toggle('Extend Line Effects to Beat End', 'notation.extendLineEffectsToBeatEnd'),
                factory.numberInput('Slur Height', 'notation.slurHeight', 1)
            ]
        },
        {
            title: 'Player',
            settings: [
                {
                    label: 'Volume',
                    ...factory.apiAccessors('masterVolume'),
                    control: { type: 'number-range', min: 0, max: 1, step: 0.1 }
                },
                {
                    label: 'Metronome Volume',
                    ...factory.apiAccessors('metronomeVolume'),
                    control: { type: 'number-range', min: 0, max: 1, step: 0.1 }
                },
                {
                    label: 'Count-In Volume',
                    ...factory.apiAccessors('countInVolume'),
                    control: { type: 'number-range', min: 0, max: 1, step: 0.1 }
                },
                {
                    label: 'Playback Speed',
                    ...factory.apiAccessors('playbackSpeed'),
                    control: { type: 'number-range', min: 0.1, max: 3, step: 0.1 }
                },
                {
                    label: 'Looping',
                    ...factory.apiAccessors('looping'),
                    control: { type: 'boolean-toggle' }
                },
                factory.enumDropDown('Player Mode', 'player.playerMode', alphaTab.PlayerMode, noRerender),
                factory.toggle('Show Cursors', 'player.enableCursor', noRerender),
                factory.toggle('Animated Beat Cursor', 'player.enableAnimatedBeatCursor', noRerender),
                factory.toggle('Highlight Notes', 'player.enableElementHighlighting', noRerender),
                factory.toggle('Enable User Interaction', 'player.enableUserInteraction', noRerender),
                factory.numberInput(
                    'Scroll Offset X',
                    'player.scrollOffsetX',
                    undefined,
                    undefined,
                    undefined,
                    noRerender
                ),
                factory.numberInput(
                    'Scroll Offset Y',
                    'player.scrollOffsetY',
                    undefined,
                    undefined,
                    undefined,
                    noRerender
                ),
                factory.enumDropDown('Scroll Mode', 'player.scrollMode', alphaTab.ScrollMode, noRerender),
                factory.numberInput(
                    'Song-Book Bend Duration',
                    'player.songBookBendDuration',
                    0.1,
                    undefined,
                    0.1,
                    withMidiGenerate
                ),
                factory.numberInput(
                    'Song-Book Dip Duration',
                    'player.songBookDipDuration',
                    0.1,
                    undefined,
                    0.1,
                    withMidiGenerate
                ),
                factory.numberInput(
                    'Vibrato Note Wide Length',
                    'player.vibrato.noteWideLength',
                    0.1,
                    undefined,
                    0.1,
                    withMidiGenerate
                ),
                factory.numberInput(
                    'Vibrato Note Wide Amplitude',
                    'player.vibrato.noteWideAmplitude',
                    0.1,
                    undefined,
                    0.1,
                    withMidiGenerate
                ),
                factory.numberInput(
                    'Vibrato Note Slight Length',
                    'player.vibrato.noteSlightLength',
                    0.1,
                    undefined,
                    0.1,
                    withMidiGenerate
                ),
                factory.numberInput(
                    'Vibrato Note Slight Amplitude',
                    'player.vibrato.noteSlightAmplitude',
                    0.1,
                    undefined,
                    0.1,
                    withMidiGenerate
                ),
                factory.numberInput('Vibrato Beat Wide Length', 'player.vibrato.beatWideLength', 0.1, undefined, 0.1),
                factory.numberInput(
                    'Vibrato Beat Wide Amplitude',
                    'player.vibrato.beatWideAmplitude',
                    0.1,
                    undefined,
                    0.1,
                    withMidiGenerate
                ),
                factory.numberInput(
                    'Vibrato Beat Slight Length',
                    'player.vibrato.beatSlightLength',
                    0.1,
                    undefined,
                    0.1,
                    withMidiGenerate
                ),
                factory.numberInput(
                    'Vibrato Beat Slight Amplitude',
                    'player.vibrato.beatSlightAmplitude',
                    0.1,
                    undefined,
                    0.1,
                    withMidiGenerate
                ),
                factory.numberInput('Slide Simple Pitch Offset', 'player.slide.simpleSlidePitchOffset', 1),
                factory.numberInput(
                    'Slide Simple Duration Ratio',
                    'player.slide.simpleSlidePitchOffset',
                    0.1,
                    1,
                    0.1,
                    withMidiGenerate
                ),
                factory.numberInput(
                    'Slide Shift Duration Ratio',
                    'player.slide.shiftSlideDurationRatio',
                    0.1,
                    1,
                    0.1,
                    withMidiGenerate
                ),
                factory.toggle('Play Swing', 'player.playTripletFeel', withMidiGenerate)
            ]
        },
        {
            title: 'Stylesheet',
            settings: [
                {
                    label: 'Hide Dynamics',
                    ...factory.stylesheetAccessors('hideDynamics'),
                    control: { type: 'boolean-toggle' }
                },
                {
                    label: 'Bracket Extend Mode',
                    ...factory.stylesheetAccessors('bracketExtendMode'),
                    control: { type: 'enum-dropdown', enumType: alphaTab.model.BracketExtendMode }
                },
                {
                    label: 'System Sign Separator',
                    ...factory.stylesheetAccessors('useSystemSignSeparator'),
                    control: { type: 'boolean-toggle' }
                },
                {
                    label: 'Show Guitar Tuning',
                    ...factory.stylesheetAccessors('globalDisplayTuning'),
                    control: { type: 'boolean-toggle' }
                },
                {
                    label: 'Show Chord Diagrams',
                    ...factory.stylesheetAccessors('globalDisplayChordDiagramsOnTop'),
                    control: { type: 'boolean-toggle' }
                },
                {
                    label: 'Single-Track Name Policy',
                    ...factory.stylesheetAccessors('singleTrackTrackNamePolicy'),
                    control: { type: 'enum-dropdown', enumType: alphaTab.model.TrackNamePolicy }
                },
                {
                    label: 'Multi-Track Name Policy',
                    ...factory.stylesheetAccessors('multiTrackTrackNamePolicy'),
                    control: { type: 'enum-dropdown', enumType: alphaTab.model.TrackNamePolicy }
                },
                {
                    label: 'First System Track Name Format',
                    ...factory.stylesheetAccessors('firstSystemTrackNameMode'),
                    control: { type: 'enum-dropdown', enumType: alphaTab.model.TrackNameMode }
                },
                {
                    label: 'First System Track Name Orientation',
                    ...factory.stylesheetAccessors('firstSystemTrackNameOrientation'),
                    control: { type: 'enum-dropdown', enumType: alphaTab.model.TrackNameOrientation }
                },
                {
                    label: 'Other Systems Track Name Format',
                    ...factory.stylesheetAccessors('otherSystemsTrackNameMode'),
                    control: { type: 'enum-dropdown', enumType: alphaTab.model.TrackNameMode }
                },
                {
                    label: 'Other Systems Track Name Orientation',
                    ...factory.stylesheetAccessors('otherSystemsTrackNameOrientation'),
                    control: { type: 'enum-dropdown', enumType: alphaTab.model.TrackNameMode }
                },
                {
                    label: 'Multi-Bar Rests (on Multi-Track)',
                    ...factory.stylesheetAccessors('otherSystemsTrackNameOrientation'),
                    control: { type: 'enum-dropdown', enumType: alphaTab.model.TrackNameMode }
                },
                {
                    label: 'Multi-Bar Rests',
                    getValue(context: SettingsContextProps) {
                        return context.api.score!.stylesheet.multiTrackMultiBarRest;
                    },
                    setValue(context: SettingsContextProps, value) {
                        context.api.score!.stylesheet.multiTrackMultiBarRest = value;
                        if (value) {
                            context.api.score!.stylesheet.perTrackMultiBarRest = new Set(
                                context.api.score!.tracks.map(t => t.index)
                            );
                        } else {
                            context.api.score!.stylesheet.perTrackMultiBarRest = null;
                        }
                        context.onSettingsUpdated();
                        context.api.render();
                    },
                    control: { type: 'boolean-toggle' }
                }
            ]
        }
    ];
}

const EnumDropDown: React.FC<EnumDropDownSchema & ControlProps> = ({ enumType, inputId, getValue, setValue }) => {
    const settings = useContext(SettingsContext)!;
    const enumValues: { value: number; label: string }[] = [];
    for (const value of Object.values(enumType)) {
        if (typeof value === 'string') {
            const key = enumType[value] as number;
            enumValues.push({ value: key, label: value });
        }
    }

    return (
        <div className={styles.select}>
            <select
                id={inputId}
                onChange={e => {
                    console.log('enum change', e.target.value);
                    setValue(settings, Number.parseInt(e.target.value));
                }}
                defaultValue={getValue(settings)}>
                {enumValues.map(v => (
                    <option key={v.value} value={v.value}>
                        {v.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

const NumberRange: React.FC<NumberRangeSchema & ControlProps> = ({ min, max, step, inputId, getValue, setValue }) => {
    const settings = useContext(SettingsContext)!;
    const value = getValue(settings);
    return (
        <div
            className={styles.slider}
            data-tooltip-id="tooltip-playground"
            data-tooltip-place="left"
            data-tooltip-content={value}>
            <input
                type="range"
                id={inputId}
                min={min}
                max={max}
                step={step}
                defaultValue={value}
                onInput={e => setValue(settings, (e.target as HTMLInputElement).valueAsNumber)}
                onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
        </div>
    );
};

const NumberInput: React.FC<NumberInputSchema & ControlProps> = ({ min, max, step, inputId, getValue, setValue }) => {
    const settings = useContext(SettingsContext)!;
    return (
        <input
            type="number"
            id={inputId}
            min={min}
            max={max}
            step={step}
            defaultValue={getValue(settings)}
            onInput={e => setValue(settings, (e.target as HTMLInputElement).valueAsNumber)}
            onClick={e => {
                e.preventDefault();
                e.stopPropagation();
            }}
        />
    );
};

const ColorPicker: React.FC<ColorPickerSchema & ControlProps> = ({ inputId, getValue, setValue }) => {
    const [isOpen, setOpen] = useState(false);
    const settings = useContext(SettingsContext)!;
    const [color, setColor] = useState(getValue(settings) as alphaTab.model.Color);

    const debouncedColor = useDebounce(color, 300);

    function dismissDropdown(e: MouseEvent) {
        const isInDropDown = (e.target as HTMLElement).closest('.dropdown__menu');
        if (!isInDropDown) {
            setOpen(false);
        }
    }

    useEffect(() => {
        setValue(settings, color);
    }, [debouncedColor]);

    useEffect(() => {
        document.addEventListener('click', dismissDropdown);
        return () => {
            document.removeEventListener('click', dismissDropdown);
        };
    }, []);

    return (
        <div className={styles['color-picker']}>
            <div className={`dropdown dropdown--right ${isOpen ? 'dropdown--show' : ''}`}>
                <button
                    type="button"
                    className={`button button--secondary ${isOpen ? 'button--active' : ''}`}
                    data-toggle="dropdown"
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen(o => {
                            return !o;
                        });
                    }}>
                    {color.rgba}
                </button>
                <ul className={`dropdown__menu ${isOpen ? 'dropdown--show' : ''}`}>
                    <li>
                        <Chrome
                            id={inputId}
                            color={rgbaToHexa({r: color.r, g: color.g, b: color.b, a: color.a / 255})}
                            showTriangle={false}
                            onChange={color => {
                                setColor(
                                    new alphaTab.model.Color(
                                        color.rgba.r,
                                        color.rgba.g,
                                        color.rgba.b,
                                        color.rgba.a * 255
                                    )
                                );
                            }}
                        />
                    </li>
                </ul>
            </div>
        </div>
    );
};

const FontPicker: React.FC<FontPickerSchema & ControlProps> = ({ inputId, getValue, setValue }) => {
    const settings = useContext(SettingsContext)!;
    return (
        <input
            type="text"
            id={inputId}
            defaultValue={(getValue(settings) as alphaTab.model.Font).toCssString()}
            onBlur={e => {
                const c = alphaTab.model.Font.fromJson((e.target as HTMLInputElement).value);
                if (c) {
                    setValue(settings, c);
                }
            }}
        />
    );
};

const BooleanToggle: React.FC<BooleanToggleSchema & ControlProps> = ({ inputId, getValue, setValue }) => {
    const settings = useContext(SettingsContext)!;
    return (
        <>
            <label className={styles.toggle}>
                <input
                    id={inputId}
                    type="checkbox"
                    checked={getValue(settings)}
                    onChange={e => {
                        console.log('toggle');
                        setValue(settings, (e.target as HTMLInputElement).checked);
                    }}
                />
                <span />
            </label>
        </>
    );
};

const ButtonGroupButton: React.FC<ButtonGroupButtonSchema & ControlProps> = ({ label, value, getValue, setValue }) => {
    const settings = useContext(SettingsContext)!;
    return (
        <button
            type="button"
            className={`button button--sm ${getValue(settings) === value ? 'button--primary' : 'button--secondary button--outline'}`}
            onClick={() => {
                setValue(settings, value);
            }}>
            {label}
        </button>
    );
};

const ButtonGroup: React.FC<ButtonGroupSchema & ControlProps> = ({ inputId, buttons, getValue, setValue }) => {
    return (
        <div className={`${styles['button-group']}`}>
            {buttons.map(b => (
                <ButtonGroupButton inputId={inputId} key={b.label} {...b} getValue={getValue} setValue={setValue} />
            ))}
        </div>
    );
};

const Setting: React.FC<SettingSchema> = ({ label, control, getValue, setValue }) => {
    const id = useId();
    const renderControl = () => {
        switch (control.type) {
            case 'button-group':
                return <ButtonGroup inputId={id} {...control} getValue={getValue} setValue={setValue} />;
            case 'enum-dropdown':
                return <EnumDropDown inputId={id} {...control} getValue={getValue} setValue={setValue} />;
            case 'number-range':
                return <NumberRange inputId={id} {...control} getValue={getValue} setValue={setValue} />;
            case 'number-input':
                return <NumberInput inputId={id} {...control} getValue={getValue} setValue={setValue} />;
            case 'boolean-toggle':
                return <BooleanToggle inputId={id} {...control} getValue={getValue} setValue={setValue} />;
            case 'color-picker':
                return <ColorPicker inputId={id} {...control} getValue={getValue} setValue={setValue} />;
            case 'font-picker':
                return <FontPicker inputId={id} {...control} getValue={getValue} setValue={setValue} />;
        }
    };

    return (
        <div className={`${styles['settings-item']}`}>
            <label className={`${styles['settings-item-label']}`} htmlFor={id}>
                {label}
            </label>
            <div className={`${styles['settings-item-control']}`}>{renderControl()}</div>
        </div>
    );
};

const SettingsGroup: React.FC<SettingsGroupSchema> = ({ title, settings }) => {
    return (
        <div className={styles['at-settings-group']} key={title}>
            <h4>{title}</h4>
            {settings.map(s => (
                <Setting key={s.label} {...s} />
            ))}
        </div>
    );
};

export interface PlaygroundSettingsProps {
    api: alphaTab.AlphaTabApi;
    isOpen: boolean;
    onClose: () => void;
}

export const PlaygroundSettings: React.FC<PlaygroundSettingsProps> = ({ api, isOpen: areSettingsOpen, onClose }) => {
    const [settingsVersion, setSettingsVersion] = useState(0);
    const settingsGroups = buildSettingsGroups();

    return (
        <SettingsContext.Provider
            value={{
                api,
                onSettingsUpdated() {
                    setSettingsVersion(v => v + 1);
                }
            }}>
            <div
                className={`${styles['at-settings']} shadow--tl ${areSettingsOpen ? styles.open : ''}`}
                data-version={settingsVersion}>
                <button
                    type="button"
                    onClick={() => onClose()}
                    className={`button button--sm button--primary button--outline ${styles['at-settings-close']}`}>
                    <FontAwesomeIcon icon={solid.faClose} />
                </button>

                {settingsGroups.map(g => (
                    <SettingsGroup key={g.title} {...g} />
                ))}

                <div className={styles['at-settings-group']}>
                    <h4>Tools</h4>

                    <button
                        type="button"
                        onClick={() => {
                            api.downloadMidi();
                        }}
                        className="button button--sm button--secondary">
                        Export MIDI
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            downloadFile();
                        }}
                        className="button button--sm button--secondary">
                        Export Guitar Pro
                    </button>
                </div>
            </div>
        </SettingsContext.Provider>
    );
};
