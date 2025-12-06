import type { Note } from '@coderline/alphatab/model/Note';
import { SlideInType } from '@coderline/alphatab/model/SlideInType';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import { BeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { TabBendGlyph } from '@coderline/alphatab/rendering/glyphs/TabBendGlyph';
import { TabSlideLineGlyph } from '@coderline/alphatab/rendering/glyphs/TabSlideLineGlyph';
import { TabSlurGlyph } from '@coderline/alphatab/rendering/glyphs/TabSlurGlyph';
import { TabTieGlyph } from '@coderline/alphatab/rendering/glyphs/TabTieGlyph';
import type { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';

/**
 * @internal
 */
export class TabBeatContainerGlyph extends BeatContainerGlyph {
    private _bend: TabBendGlyph | null = null;
    private _effectSlurs: TabSlurGlyph[] = [];

    protected override drawBeamHelperAsFlags(helper: BeamingHelper): boolean {
        return helper.hasFlag((this.renderer as TabBarRenderer).drawBeamHelperAsFlags(helper), this.beat);
    }

    public override doLayout(): void {
        this._effectSlurs = [];
        super.doLayout();
        if (this._bend) {
            this._bend.renderer = this.renderer;
            this._bend.doLayout();
            this.updateWidth();
        }
    }

    protected override createTies(n: Note): void {
        if (!n.isVisible) {
            return;
        }
        const renderer: TabBarRenderer = this.renderer as TabBarRenderer;
        if (n.isTieOrigin && renderer.showTiedNotes && n.tieDestination!.isVisible) {
            const tie: TabTieGlyph = new TabTieGlyph(n, n.tieDestination!);
            this.addTie(tie);
        }
        // TODO multi-system slurs
        // if (n.isTieDestination && renderer.showTiedNotes) {
        //     const tie: TabTieGlyph = new TabTieGlyph(n.tieOrigin!, n, true);
        //     this.addTie(tie);
        // }
        if (n.isLeftHandTapped && !n.isHammerPullDestination) {
            const tapSlur: TabTieGlyph = new TabTieGlyph(n, n);
            this.addTie(tapSlur);
        }
        // start effect slur on first beat
        if (n.isEffectSlurOrigin && n.effectSlurDestination) {
            // TODO: ensure we have only one effect slur per start<->destination beat. 
            let expanded: boolean = false;
            for (const slur of this._effectSlurs) {
                if (slur.tryExpand(n, n.effectSlurDestination, false)) {
                    expanded = true;
                    break;
                }
            }
            if (!expanded) {
                const effectSlur: TabSlurGlyph = new TabSlurGlyph(n, n.effectSlurDestination, false);
                this._effectSlurs.push(effectSlur);
                this.addTie(effectSlur);
            }
        }
        // TODO: multisystem slurs 
        // // end effect slur on last beat
        // if (n.isEffectSlurDestination && n.effectSlurOrigin) {
        //     let expanded: boolean = false;
        //     for (const slur of this._effectSlurs) {
        //         if (slur.tryExpand(n.effectSlurOrigin, n, false, true)) {
        //             expanded = true;
        //             break;
        //         }
        //     }
        //     if (!expanded) {
        //         const effectSlur: TabSlurGlyph = new TabSlurGlyph(n.effectSlurOrigin, n, false, true);
        //         this._effectSlurs.push(effectSlur);
        //         this.addTie(effectSlur);
        //     }
        // }
        if (n.slideInType !== SlideInType.None || n.slideOutType !== SlideOutType.None) {
            const l: TabSlideLineGlyph = new TabSlideLineGlyph(n.slideInType, n.slideOutType, n, this);
            this.addTie(l);
        }
        if (n.hasBend) {
            if (!this._bend) {
                const bend = new TabBendGlyph();
                this._bend = bend;
                bend.renderer = this.renderer;
                this.addTie(bend);
            }
            this._bend.addBends(n);
        }
    }
}
