import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { TabBendGlyph } from '@src/rendering/glyphs/TabBendGlyph';
import { TabSlideLineGlyph } from '@src/rendering/glyphs/TabSlideLineGlyph';
import { TabSlurGlyph } from '@src/rendering/glyphs/TabSlurGlyph';
import { TabTieGlyph } from '@src/rendering/glyphs/TabTieGlyph';
import { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import { TabBarRenderer } from '@src/rendering/TabBarRenderer';

export class TabBeatContainerGlyph extends BeatContainerGlyph {
    private _bend: TabBendGlyph | null = null;
    private _effectSlurs: TabSlurGlyph[] = [];

    public constructor(beat: Beat, voiceContainer: VoiceContainerGlyph) {
        super(beat, voiceContainer);
    }

    public doLayout(): void {
        this._effectSlurs = [];
        super.doLayout();
        if (this._bend) {
            this._bend.renderer = this.renderer;
            this._bend.doLayout();
            this.updateWidth();
        }
    }

    protected createTies(n: Note): void {
        if (!n.isVisible) {
            return;
        }
        let renderer: TabBarRenderer = this.renderer as TabBarRenderer;
        if (n.isTieOrigin && renderer.showTiedNotes && n.tieDestination!.isVisible) {
            let tie: TabTieGlyph = new TabTieGlyph(n, n.tieDestination!, false);
            this.ties.push(tie);
        }
        if (n.isTieDestination && renderer.showTiedNotes) {
            let tie: TabTieGlyph = new TabTieGlyph(n.tieOrigin!, n, true);
            this.ties.push(tie);
        }
        if (n.isLeftHandTapped && !n.isHammerPullDestination) {
            let tapSlur: TabTieGlyph = new TabTieGlyph(n, n, false);
            this.ties.push(tapSlur);
        }
        // start effect slur on first beat
        if (n.isEffectSlurOrigin && n.effectSlurDestination) {
            let expanded: boolean = false;
            for (let slur of this._effectSlurs) {
                if (slur.tryExpand(n, n.effectSlurDestination, false, false)) {
                    expanded = true;
                    break;
                }
            }
            if (!expanded) {
                let effectSlur: TabSlurGlyph = new TabSlurGlyph(n, n.effectSlurDestination, false, false);
                this._effectSlurs.push(effectSlur);
                this.ties.push(effectSlur);
            }
        }
        // end effect slur on last beat
        if (n.isEffectSlurDestination && n.effectSlurOrigin) {
            let expanded: boolean = false;
            for (let slur of this._effectSlurs) {
                if (slur.tryExpand(n.effectSlurOrigin, n, false, true)) {
                    expanded = true;
                    break;
                }
            }
            if (!expanded) {
                let effectSlur: TabSlurGlyph = new TabSlurGlyph(n.effectSlurOrigin, n, false, true);
                this._effectSlurs.push(effectSlur);
                this.ties.push(effectSlur);
            }
        }
        if (n.slideInType !== SlideInType.None || n.slideOutType !== SlideOutType.None) {
            let l: TabSlideLineGlyph = new TabSlideLineGlyph(n.slideInType, n.slideOutType, n, this);
            this.ties.push(l);
        }
        if (n.hasBend) {
            if (!this._bend) {
                this._bend = new TabBendGlyph();
                this._bend.renderer = this.renderer;
                this.ties.push(this._bend);
            }
            this._bend.addBends(n);
        }
    }
}
