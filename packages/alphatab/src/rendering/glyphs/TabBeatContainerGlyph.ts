import type { Note } from '@src/model/Note';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { TabBendGlyph } from '@src/rendering/glyphs/TabBendGlyph';
import { TabSlideLineGlyph } from '@src/rendering/glyphs/TabSlideLineGlyph';
import { TabSlurGlyph } from '@src/rendering/glyphs/TabSlurGlyph';
import { TabTieGlyph } from '@src/rendering/glyphs/TabTieGlyph';
import type { TabBarRenderer } from '@src/rendering/TabBarRenderer';
import type { BeamingHelper } from '@src/rendering/utils/BeamingHelper';

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
            const tie: TabTieGlyph = new TabTieGlyph(n, n.tieDestination!, false);
            this.addTie(tie);
        }
        if (n.isTieDestination && renderer.showTiedNotes) {
            const tie: TabTieGlyph = new TabTieGlyph(n.tieOrigin!, n, true);
            this.addTie(tie);
        }
        if (n.isLeftHandTapped && !n.isHammerPullDestination) {
            const tapSlur: TabTieGlyph = new TabTieGlyph(n, n, false);
            this.addTie(tapSlur);
        }
        // start effect slur on first beat
        if (n.isEffectSlurOrigin && n.effectSlurDestination) {
            let expanded: boolean = false;
            for (const slur of this._effectSlurs) {
                if (slur.tryExpand(n, n.effectSlurDestination, false, false)) {
                    expanded = true;
                    break;
                }
            }
            if (!expanded) {
                const effectSlur: TabSlurGlyph = new TabSlurGlyph(n, n.effectSlurDestination, false, false);
                this._effectSlurs.push(effectSlur);
                this.addTie(effectSlur);
            }
        }
        // end effect slur on last beat
        if (n.isEffectSlurDestination && n.effectSlurOrigin) {
            let expanded: boolean = false;
            for (const slur of this._effectSlurs) {
                if (slur.tryExpand(n.effectSlurOrigin, n, false, true)) {
                    expanded = true;
                    break;
                }
            }
            if (!expanded) {
                const effectSlur: TabSlurGlyph = new TabSlurGlyph(n.effectSlurOrigin, n, false, true);
                this._effectSlurs.push(effectSlur);
                this.addTie(effectSlur);
            }
        }
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
