import { describe, expect, it } from 'vitest';
import type { Staff } from '@coderline/alphatab/model/Staff';
import { StaffPlacement, SystemDisplay } from '@coderline/alphatab/model/ElementDisplay';
import { StaffDisplayResolver } from '@coderline/alphatab/rendering/staves/StaffDisplayResolver';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import type { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';
import type { StaffTrackGroup } from '@coderline/alphatab/rendering/staves/StaffTrackGroup';

/**
 * Build a {@link RenderStaff}-shaped stub. Each siblings entry becomes
 * a peer in the same {@link StaffTrackGroup}; the focused stub is at
 * `siblings[focusIndex]`.
 * @internal
 */
function makeGroup(
    focusIndex: number,
    siblings: Array<{ cascadePriority: number; modelStaff: Staff; systemIndex?: number }>
): RenderStaff {
    const group = { staves: [] as RenderStaff[] } as unknown as StaffTrackGroup;
    const staves: RenderStaff[] = siblings.map(s => {
        let cachedPrimary: boolean | null = null;
        const stub = {
            modelStaff: s.modelStaff,
            cascadePriority: s.cascadePriority,
            staffTrackGroup: group,
            system: { index: s.systemIndex ?? 0 } as unknown as StaffSystem,
            get isCascadePrimary(): boolean {
                if (cachedPrimary === null) {
                    cachedPrimary = StaffDisplayResolver.computeCascadePrimary(stub);
                }
                return cachedPrimary;
            }
        } as unknown as RenderStaff;
        return stub;
    });
    (group as { staves: RenderStaff[] }).staves = staves;
    return staves[focusIndex];
}

describe('StaffDisplayResolver.merge', () => {
    it('returns fallback when every layer leaves all axes undefined', () => {
        const display = StaffDisplayResolver.merge(undefined, undefined, undefined);
        expect(display.isVisible).toBe(true);
        expect(display.staffPlacement).toBe(StaffPlacement.AllStaves);
        expect(display.systemDisplay).toBe(SystemDisplay.AllSystems);
    });

    it('walks per-bar → per-staff → stylesheet → fallback per-axis', () => {
        const display = StaffDisplayResolver.merge(
            { isVisible: false },
            { staffPlacement: StaffPlacement.Primary },
            { systemDisplay: SystemDisplay.FirstSystemOnly }
        );
        expect(display.isVisible).toBe(false);
        expect(display.staffPlacement).toBe(StaffPlacement.Primary);
        expect(display.systemDisplay).toBe(SystemDisplay.FirstSystemOnly);
    });

    it('earlier defined value wins over later layers', () => {
        const display = StaffDisplayResolver.merge(
            { isVisible: false },
            { isVisible: true, staffPlacement: StaffPlacement.Primary },
            { isVisible: true, staffPlacement: StaffPlacement.AllStaves }
        );
        expect(display.isVisible).toBe(false);
        expect(display.staffPlacement).toBe(StaffPlacement.Primary);
    });
});

describe('StaffDisplayResolver.isPrimaryForElement', () => {
    const modelStaffA = {} as Staff;
    const modelStaffB = {} as Staff;
    const scoreStub = (focusIndex: number) =>
        makeGroup(focusIndex, [
            { cascadePriority: 0, modelStaff: modelStaffA },
            { cascadePriority: 1, modelStaff: modelStaffA }
        ]);

    it('returns false when isVisible is false', () => {
        const staff = scoreStub(0);
        expect(StaffDisplayResolver.isPrimaryForElement(staff, { isVisible: false })).toBe(false);
    });

    it('suppresses paint on systems with index != 0 when systemDisplay is FirstSystemOnly', () => {
        const focus = makeGroup(0, [{ cascadePriority: 0, modelStaff: modelStaffA, systemIndex: 1 }]);
        expect(
            StaffDisplayResolver.isPrimaryForElement(focus, {
                isVisible: true,
                staffPlacement: StaffPlacement.AllStaves,
                systemDisplay: SystemDisplay.FirstSystemOnly
            })
        ).toBe(false);
    });

    it('AllStaves paints on every staff regardless of cascade winner', () => {
        const display = {
            isVisible: true,
            staffPlacement: StaffPlacement.AllStaves,
            systemDisplay: SystemDisplay.AllSystems
        };
        expect(StaffDisplayResolver.isPrimaryForElement(scoreStub(0), display)).toBe(true);
        expect(StaffDisplayResolver.isPrimaryForElement(scoreStub(1), display)).toBe(true);
    });

    it('Primary paints only on the cascade winner among siblings sharing the model Staff', () => {
        const display = {
            isVisible: true,
            staffPlacement: StaffPlacement.Primary,
            systemDisplay: SystemDisplay.AllSystems
        };
        expect(StaffDisplayResolver.isPrimaryForElement(scoreStub(0), display)).toBe(true);
        expect(StaffDisplayResolver.isPrimaryForElement(scoreStub(1), display)).toBe(false);
    });

    it('cascade evaluates per model Staff — different model staves elect independent primaries', () => {
        const display = {
            isVisible: true,
            staffPlacement: StaffPlacement.Primary,
            systemDisplay: SystemDisplay.AllSystems
        };
        const group = [
            { cascadePriority: 0, modelStaff: modelStaffA },
            { cascadePriority: 1, modelStaff: modelStaffA },
            { cascadePriority: 0, modelStaff: modelStaffB },
            { cascadePriority: 1, modelStaff: modelStaffB }
        ];
        expect(StaffDisplayResolver.isPrimaryForElement(makeGroup(0, group), display)).toBe(true);
        expect(StaffDisplayResolver.isPrimaryForElement(makeGroup(1, group), display)).toBe(false);
        expect(StaffDisplayResolver.isPrimaryForElement(makeGroup(2, group), display)).toBe(true);
        expect(StaffDisplayResolver.isPrimaryForElement(makeGroup(3, group), display)).toBe(false);
    });
});
