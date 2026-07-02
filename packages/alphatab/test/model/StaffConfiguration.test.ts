import { describe, expect, it } from 'vitest';
import { BarSerializer } from '@coderline/alphatab/generated/model/BarSerializer';
import { RenderStylesheetSerializer } from '@coderline/alphatab/generated/model/RenderStylesheetSerializer';
import { StaffSerializer } from '@coderline/alphatab/generated/model/StaffSerializer';
import { Bar } from '@coderline/alphatab/model/Bar';
import type { ElementDisplay } from '@coderline/alphatab/model/ElementDisplay';
import { BarNumberDisplay, RenderStylesheet } from '@coderline/alphatab/model/RenderStylesheet';
import { Staff } from '@coderline/alphatab/model/Staff';
import { StaffPlacement, SystemDisplay } from '@coderline/alphatab/model/ElementDisplay';

import { TabRhythmMode } from '@coderline/alphatab/NotationSettings';

/**
 * @internal
 */
function expectElementDisplay(
    actual: ElementDisplay | undefined,
    isVisible: boolean | undefined,
    staffPlacement: StaffPlacement | undefined,
    systemDisplay: SystemDisplay | undefined
): void {
    expect(actual).not.toBeUndefined();
    expect(actual!.isVisible).toBe(isVisible);
    expect(actual!.staffPlacement).toBe(staffPlacement);
    expect(actual!.systemDisplay).toBe(systemDisplay);
}

describe('RenderStylesheet L3 historical defaults', () => {
    it('scoreConfig defaults', () => {
        const rs = new RenderStylesheet();
        expectElementDisplay(rs.scoreConfig.clef, true, StaffPlacement.AllStaves, SystemDisplay.AllSystems);
        expectElementDisplay(rs.scoreConfig.keySignature, true, StaffPlacement.AllStaves, SystemDisplay.AllSystems);
        expectElementDisplay(rs.scoreConfig.timeSignature, true, StaffPlacement.AllStaves, SystemDisplay.AllSystems);
        expect(rs.scoreConfig.barNumber).toBe(BarNumberDisplay.AllBars);
    });

    it('tabConfig defaults', () => {
        const rs = new RenderStylesheet();
        expectElementDisplay(rs.tabConfig.clef, true, StaffPlacement.AllStaves, SystemDisplay.AllSystems);
        expectElementDisplay(rs.tabConfig.timeSignature, true, StaffPlacement.Primary, SystemDisplay.AllSystems);
        expect(rs.tabConfig.barNumber).toBe(BarNumberDisplay.AllBars);
        expect(rs.tabConfig.rhythm).toBe(TabRhythmMode.Automatic);
        expectElementDisplay(rs.tabConfig.rests, true, StaffPlacement.Primary, undefined);
    });

    it('slashConfig defaults', () => {
        const rs = new RenderStylesheet();
        expectElementDisplay(rs.slashConfig.keySignature, false, undefined, undefined);
        expectElementDisplay(rs.slashConfig.timeSignature, true, StaffPlacement.Primary, SystemDisplay.AllSystems);
        expect(rs.slashConfig.barNumber).toBe(BarNumberDisplay.AllBars);
    });

    it('numberedConfig defaults', () => {
        const rs = new RenderStylesheet();
        expectElementDisplay(rs.numberedConfig.timeSignature, true, StaffPlacement.Primary, SystemDisplay.AllSystems);
        expect(rs.numberedConfig.barNumber).toBe(BarNumberDisplay.AllBars);
    });
});

describe('Staff L2 fields default to undefined', () => {
    it('all four *Config fields are undefined on a fresh Staff', () => {
        const staff = new Staff();
        expect(staff.scoreConfig).toBeUndefined();
        expect(staff.tabConfig).toBeUndefined();
        expect(staff.slashConfig).toBeUndefined();
        expect(staff.numberedConfig).toBeUndefined();
    });
});

describe('Bar L1 fields default to undefined', () => {
    it('all four *Display fields are undefined on a fresh Bar', () => {
        const bar = new Bar();
        expect(bar.scoreDisplay).toBeUndefined();
        expect(bar.tabDisplay).toBeUndefined();
        expect(bar.slashDisplay).toBeUndefined();
        expect(bar.numberedDisplay).toBeUndefined();
    });
});

describe('RenderStylesheet.barNumberDisplay shim (ADR-006 §1)', () => {
    it('getter reads from scoreConfig.barNumber', () => {
        const rs = new RenderStylesheet();
        expect(rs.barNumberDisplay).toBe(BarNumberDisplay.AllBars);
        rs.scoreConfig.barNumber = BarNumberDisplay.Hide;
        expect(rs.barNumberDisplay).toBe(BarNumberDisplay.Hide);
    });

    it('setter broadcasts to all four staff-type L3 entries', () => {
        const rs = new RenderStylesheet();
        rs.barNumberDisplay = BarNumberDisplay.FirstOfSystem;
        expect(rs.scoreConfig.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
        expect(rs.tabConfig.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
        expect(rs.slashConfig.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
        expect(rs.numberedConfig.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
    });
});

describe('Bar.barNumberDisplay shim (ADR-006 §2)', () => {
    it('getter returns undefined when no scoreDisplay override exists', () => {
        const bar = new Bar();
        expect(bar.barNumberDisplay).toBeUndefined();
    });

    it('getter returns scoreDisplay.barNumber when present', () => {
        const bar = new Bar();
        bar.scoreDisplay = { barNumber: BarNumberDisplay.Hide };
        expect(bar.barNumberDisplay).toBe(BarNumberDisplay.Hide);
    });

    it('setter with concrete value lazy-creates each *Display bag and broadcasts', () => {
        const bar = new Bar();
        bar.barNumberDisplay = BarNumberDisplay.FirstOfSystem;
        expect(bar.scoreDisplay).not.toBeUndefined();
        expect(bar.scoreDisplay!.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
        expect(bar.tabDisplay).not.toBeUndefined();
        expect(bar.tabDisplay!.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
        expect(bar.slashDisplay).not.toBeUndefined();
        expect(bar.slashDisplay!.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
        expect(bar.numberedDisplay).not.toBeUndefined();
        expect(bar.numberedDisplay!.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
    });

    it('setter with undefined clears barNumber on each existing bag without deleting the bag', () => {
        const bar = new Bar();
        bar.barNumberDisplay = BarNumberDisplay.Hide;
        bar.barNumberDisplay = undefined;
        expect(bar.scoreDisplay).not.toBeUndefined();
        expect(bar.scoreDisplay!.barNumber).toBeUndefined();
        expect(bar.tabDisplay).not.toBeUndefined();
        expect(bar.tabDisplay!.barNumber).toBeUndefined();
        expect(bar.slashDisplay).not.toBeUndefined();
        expect(bar.slashDisplay!.barNumber).toBeUndefined();
        expect(bar.numberedDisplay).not.toBeUndefined();
        expect(bar.numberedDisplay!.barNumber).toBeUndefined();
    });

    it('setter with undefined preserves other L1 element overrides on the same bag', () => {
        const bar = new Bar();
        bar.scoreDisplay = { timeSignature: { isVisible: false } };
        bar.barNumberDisplay = BarNumberDisplay.AllBars;
        bar.barNumberDisplay = undefined;
        expect(bar.scoreDisplay).not.toBeUndefined();
        expect(bar.scoreDisplay!.barNumber).toBeUndefined();
        expectElementDisplay(bar.scoreDisplay!.timeSignature, false, undefined, undefined);
    });
});

describe('JSON round-trip for the new staff-config surface', () => {
    function roundtripStylesheet(rs: RenderStylesheet): RenderStylesheet {
        const out = RenderStylesheetSerializer.toJson(rs)!;
        const result = new RenderStylesheet();
        RenderStylesheetSerializer.fromJson(result, out);
        return result;
    }

    function roundtripStaff(staff: Staff): Staff {
        const out = StaffSerializer.toJson(staff)!;
        const result = new Staff();
        StaffSerializer.fromJson(result, out);
        return result;
    }

    function roundtripBar(bar: Bar): Bar {
        const out = BarSerializer.toJson(bar)!;
        const result = new Bar();
        BarSerializer.fromJson(result, out);
        return result;
    }

    it('preserves RenderStylesheet L3 historical defaults', () => {
        const rs = roundtripStylesheet(new RenderStylesheet());
        expectElementDisplay(rs.scoreConfig.clef, true, StaffPlacement.AllStaves, SystemDisplay.AllSystems);
        expect(rs.tabConfig.rhythm).toBe(TabRhythmMode.Automatic);
        expectElementDisplay(rs.tabConfig.rests, true, StaffPlacement.Primary, undefined);
        expectElementDisplay(rs.numberedConfig.timeSignature, true, StaffPlacement.Primary, SystemDisplay.AllSystems);
        expect(rs.scoreConfig.barNumber).toBe(BarNumberDisplay.AllBars);
    });

    it('preserves RenderStylesheet L3 author overrides', () => {
        const rs = new RenderStylesheet();
        rs.tabConfig = {
            clef: { isVisible: false },
            timeSignature: { systemDisplay: SystemDisplay.FirstSystemOnly },
            barNumber: BarNumberDisplay.FirstOfSystem,
            rhythm: TabRhythmMode.ShowWithBeams,
            rests: { isVisible: false }
        };
        const out = roundtripStylesheet(rs);
        expectElementDisplay(out.tabConfig.clef, false, undefined, undefined);
        expectElementDisplay(out.tabConfig.timeSignature, undefined, undefined, SystemDisplay.FirstSystemOnly);
        expect(out.tabConfig.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
        expect(out.tabConfig.rhythm).toBe(TabRhythmMode.ShowWithBeams);
        expectElementDisplay(out.tabConfig.rests, false, undefined, undefined);
    });

    it('preserves Staff L2 overrides; undefined L2 stays undefined', () => {
        const staff = new Staff();
        staff.tabConfig = { clef: { isVisible: false } };
        const out = roundtripStaff(staff);
        expect(out.tabConfig).not.toBeUndefined();
        expectElementDisplay(out.tabConfig!.clef, false, undefined, undefined);
        expect(out.scoreConfig).toBeUndefined();
        expect(out.slashConfig).toBeUndefined();
        expect(out.numberedConfig).toBeUndefined();
    });

    it('preserves Bar L1 overrides; undefined L1 stays undefined', () => {
        const bar = new Bar();
        bar.scoreDisplay = { timeSignature: { isVisible: false } };
        const out = roundtripBar(bar);
        expect(out.scoreDisplay).not.toBeUndefined();
        expectElementDisplay(out.scoreDisplay!.timeSignature, false, undefined, undefined);
        expect(out.tabDisplay).toBeUndefined();
        expect(out.slashDisplay).toBeUndefined();
        expect(out.numberedDisplay).toBeUndefined();
    });

    it('preserves per-axis sparseness in ElementDisplay', () => {
        const rs = new RenderStylesheet();
        rs.scoreConfig.clef = { isVisible: true };
        const out = roundtripStylesheet(rs);
        expectElementDisplay(out.scoreConfig.clef, true, undefined, undefined);
    });

    it('preserves RenderStylesheet.barNumberDisplay shim through round-trip', () => {
        const rs = new RenderStylesheet();
        rs.barNumberDisplay = BarNumberDisplay.FirstOfSystem;
        const out = roundtripStylesheet(rs);
        expect(out.barNumberDisplay).toBe(BarNumberDisplay.FirstOfSystem);
        expect(out.scoreConfig.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
        expect(out.tabConfig.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
        expect(out.slashConfig.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
        expect(out.numberedConfig.barNumber).toBe(BarNumberDisplay.FirstOfSystem);
    });

    it('preserves Bar.barNumberDisplay shim through round-trip', () => {
        const bar = new Bar();
        bar.barNumberDisplay = BarNumberDisplay.Hide;
        const out = roundtripBar(bar);
        expect(out.barNumberDisplay).toBe(BarNumberDisplay.Hide);
        expect(out.scoreDisplay!.barNumber).toBe(BarNumberDisplay.Hide);
        expect(out.tabDisplay!.barNumber).toBe(BarNumberDisplay.Hide);
        expect(out.slashDisplay!.barNumber).toBe(BarNumberDisplay.Hide);
        expect(out.numberedDisplay!.barNumber).toBe(BarNumberDisplay.Hide);
    });
});
