import type { ElementDisplay } from '@coderline/alphatab/model/ElementDisplay';
import { StaffPlacement, SystemDisplay } from '@coderline/alphatab/model/ElementDisplay';
import { Staff } from '@coderline/alphatab/model/Staff';
import { type IStaffDisplayContext, StaffDisplayResolver } from '@coderline/alphatab/rendering/staves/StaffDisplayResolver';
import { describe, expect, it } from 'vitest';

/**
 * Lightweight {@link IStaffDisplayContext} implementation used to drive
 * {@link StaffDisplayResolver} without a full render pipeline. Sibling
 * arrays are shared by reference across peers in the same group.
 * @internal
 */
class StaffDisplayContextStub implements IStaffDisplayContext {
    public modelStaff: Staff;
    public cascadePriority: number;
    public systemIndex: number;

    private _siblings: IStaffDisplayContext[] = [];
    private _cachedPrimary: boolean = false;
    private _cachedPrimaryComputed: boolean = false;

    public constructor(modelStaff: Staff, cascadePriority: number, systemIndex: number = 0) {
        this.modelStaff = modelStaff;
        this.cascadePriority = cascadePriority;
        this.systemIndex = systemIndex;
    }

    public get cascadeSiblings(): Iterable<IStaffDisplayContext> {
        return this._siblings;
    }

    public setSiblings(siblings: IStaffDisplayContext[]): void {
        this._siblings = siblings;
    }

    public get isCascadePrimary(): boolean {
        if (!this._cachedPrimaryComputed) {
            this._cachedPrimary = StaffDisplayResolver.computeCascadePrimary(this);
            this._cachedPrimaryComputed = true;
        }
        return this._cachedPrimary;
    }
}

/**
 * @internal
 */
class StaffDisplayContextSpec {
    public cascadePriority: number;
    public modelStaff: Staff;
    public systemIndex: number;

    public constructor(cascadePriority: number, modelStaff: Staff, systemIndex: number = 0) {
        this.cascadePriority = cascadePriority;
        this.modelStaff = modelStaff;
        this.systemIndex = systemIndex;
    }
}

/**
 * @internal
 */
class StaffDisplayContextFixtures {
    /**
     * Build a {@link IStaffDisplayContext}-shaped stub group. Each entry in
     * `siblings` becomes a peer sharing the same sibling array; the
     * focused stub is returned at `siblings[focusIndex]`.
     */
    public static makeGroup(focusIndex: number, siblings: StaffDisplayContextSpec[]): IStaffDisplayContext {
        const staves: StaffDisplayContextStub[] = [];
        for (const s of siblings) {
            staves.push(new StaffDisplayContextStub(s.modelStaff, s.cascadePriority, s.systemIndex));
        }
        const sharedSiblings: IStaffDisplayContext[] = [];
        for (const staff of staves) {
            sharedSiblings.push(staff);
        }
        for (const staff of staves) {
            staff.setSiblings(sharedSiblings);
        }
        return staves[focusIndex];
    }
}

describe('StaffDisplayResolver.merge', () => {
    it('returns fallback when every layer leaves all axes undefined', () => {
        const display: ElementDisplay = StaffDisplayResolver.merge(undefined, undefined, undefined);
        expect(display.isVisible).toBe(true);
        expect(display.staffPlacement).toBe(StaffPlacement.AllStaves);
        expect(display.systemDisplay).toBe(SystemDisplay.AllSystems);
    });

    it('walks per-bar → per-staff → stylesheet → fallback per-axis', () => {
        const perBar: ElementDisplay = { isVisible: false };
        const perStaff: ElementDisplay = { staffPlacement: StaffPlacement.Primary };
        const stylesheet: ElementDisplay = { systemDisplay: SystemDisplay.FirstSystemOnly };
        const display: ElementDisplay = StaffDisplayResolver.merge(perBar, perStaff, stylesheet);
        expect(display.isVisible).toBe(false);
        expect(display.staffPlacement).toBe(StaffPlacement.Primary);
        expect(display.systemDisplay).toBe(SystemDisplay.FirstSystemOnly);
    });

    it('earlier defined value wins over later layers', () => {
        const perBar: ElementDisplay = { isVisible: false };
        const perStaff: ElementDisplay = { isVisible: true, staffPlacement: StaffPlacement.Primary };
        const stylesheet: ElementDisplay = { isVisible: true, staffPlacement: StaffPlacement.AllStaves };
        const display: ElementDisplay = StaffDisplayResolver.merge(perBar, perStaff, stylesheet);
        expect(display.isVisible).toBe(false);
        expect(display.staffPlacement).toBe(StaffPlacement.Primary);
    });
});

describe('StaffDisplayResolver.isPrimaryForElement', () => {
    const modelStaffA: Staff = new Staff();
    const modelStaffB: Staff = new Staff();

    function scoreStub(focusIndex: number): IStaffDisplayContext {
        return StaffDisplayContextFixtures.makeGroup(focusIndex, [
            new StaffDisplayContextSpec(0, modelStaffA),
            new StaffDisplayContextSpec(1, modelStaffA)
        ]);
    }

    it('returns false when isVisible is false', () => {
        const staff: IStaffDisplayContext = scoreStub(0);
        const display: ElementDisplay = { isVisible: false };
        expect(StaffDisplayResolver.isPrimaryForElement(staff, display)).toBe(false);
    });

    it('suppresses paint on systems with index != 0 when systemDisplay is FirstSystemOnly', () => {
        const focus: IStaffDisplayContext = StaffDisplayContextFixtures.makeGroup(0, [
            new StaffDisplayContextSpec(0, modelStaffA, 1)
        ]);
        const display: ElementDisplay = {
            isVisible: true,
            staffPlacement: StaffPlacement.AllStaves,
            systemDisplay: SystemDisplay.FirstSystemOnly
        };
        expect(StaffDisplayResolver.isPrimaryForElement(focus, display)).toBe(false);
    });

    it('AllStaves paints on every staff regardless of cascade winner', () => {
        const display: ElementDisplay = {
            isVisible: true,
            staffPlacement: StaffPlacement.AllStaves,
            systemDisplay: SystemDisplay.AllSystems
        };
        expect(StaffDisplayResolver.isPrimaryForElement(scoreStub(0), display)).toBe(true);
        expect(StaffDisplayResolver.isPrimaryForElement(scoreStub(1), display)).toBe(true);
    });

    it('Primary paints only on the cascade winner among siblings sharing the model Staff', () => {
        const display: ElementDisplay = {
            isVisible: true,
            staffPlacement: StaffPlacement.Primary,
            systemDisplay: SystemDisplay.AllSystems
        };
        expect(StaffDisplayResolver.isPrimaryForElement(scoreStub(0), display)).toBe(true);
        expect(StaffDisplayResolver.isPrimaryForElement(scoreStub(1), display)).toBe(false);
    });

    it('cascade evaluates per model Staff — different model staves elect independent primaries', () => {
        const display: ElementDisplay = {
            isVisible: true,
            staffPlacement: StaffPlacement.Primary,
            systemDisplay: SystemDisplay.AllSystems
        };
        const group: StaffDisplayContextSpec[] = [
            new StaffDisplayContextSpec(0, modelStaffA),
            new StaffDisplayContextSpec(1, modelStaffA),
            new StaffDisplayContextSpec(0, modelStaffB),
            new StaffDisplayContextSpec(1, modelStaffB)
        ];
        expect(StaffDisplayResolver.isPrimaryForElement(StaffDisplayContextFixtures.makeGroup(0, group), display)).toBe(
            true
        );
        expect(StaffDisplayResolver.isPrimaryForElement(StaffDisplayContextFixtures.makeGroup(1, group), display)).toBe(
            false
        );
        expect(StaffDisplayResolver.isPrimaryForElement(StaffDisplayContextFixtures.makeGroup(2, group), display)).toBe(
            true
        );
        expect(StaffDisplayResolver.isPrimaryForElement(StaffDisplayContextFixtures.makeGroup(3, group), display)).toBe(
            false
        );
    });
});
