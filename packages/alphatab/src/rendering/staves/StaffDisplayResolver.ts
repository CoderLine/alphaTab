import type { ElementDisplay } from '@coderline/alphatab/model/ElementDisplay';
import { StaffPlacement, SystemDisplay } from '@coderline/alphatab/model/ElementDisplay';
import type { Staff } from '@coderline/alphatab/model/Staff';

/**
 * Per-staff view required by {@link StaffDisplayResolver} to evaluate
 * placement decisions. Exposed as an interface so unit tests can supply
 * lightweight stand-ins without instantiating a full render pipeline.
 * {@link RenderStaff} implements this directly.
 * @internal
 */
export interface IStaffDisplayContext {
    readonly modelStaff: Staff;
    readonly cascadePriority: number;
    readonly systemIndex: number;
    readonly isCascadePrimary: boolean;
    readonly cascadeSiblings: Iterable<IStaffDisplayContext>;
}

/**
 * Helpers for the staff-placement cascade and the per-axis
 * {@link ElementDisplay} merge. Per-element resolution lives on the
 * renderer subclasses themselves.
 * @internal
 */
export class StaffDisplayResolver {
    private static readonly _fallback: ElementDisplay = {
        isVisible: true,
        staffPlacement: StaffPlacement.AllStaves,
        systemDisplay: SystemDisplay.AllSystems
    };

    /**
     * Per-axis fall-through: first defined value walking
     * per-bar → per-staff → score-wide → {@link _fallback}.
     */
    public static merge(
        perBar: ElementDisplay | undefined,
        perStaff: ElementDisplay | undefined,
        stylesheet: ElementDisplay | undefined
    ): ElementDisplay {
        const fallback = StaffDisplayResolver._fallback;
        return {
            isVisible:
                perBar?.isVisible ?? perStaff?.isVisible ?? stylesheet?.isVisible ?? fallback.isVisible,
            staffPlacement:
                perBar?.staffPlacement ??
                perStaff?.staffPlacement ??
                stylesheet?.staffPlacement ??
                fallback.staffPlacement,
            systemDisplay:
                perBar?.systemDisplay ??
                perStaff?.systemDisplay ??
                stylesheet?.systemDisplay ??
                fallback.systemDisplay
        };
    }

    public static isPrimaryForElement(staff: IStaffDisplayContext, display: ElementDisplay): boolean {
        if (display.isVisible === false) {
            return false;
        }
        if (display.systemDisplay === SystemDisplay.FirstSystemOnly && staff.systemIndex !== 0) {
            return false;
        }
        switch (display.staffPlacement) {
            case StaffPlacement.AllStaves:
                return true;
            case StaffPlacement.Primary:
                return staff.isCascadePrimary;
        }
        return true;
    }

    public static computeCascadePrimary(staff: IStaffDisplayContext): boolean {
        const modelStaff = staff.modelStaff;
        let primary = staff;
        for (const sibling of staff.cascadeSiblings) {
            if (sibling === staff || sibling.modelStaff !== modelStaff) {
                continue;
            }
            if (sibling.cascadePriority < primary.cascadePriority) {
                primary = sibling;
            }
        }
        return primary === staff;
    }
}
