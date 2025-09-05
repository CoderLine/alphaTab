import { DynamicValue } from '@src/model/DynamicValue';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class DynamicsGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, dynamics: DynamicValue) {
        super(x, y, 1, DynamicsGlyph.getSymbol(dynamics));
    }

    public override doLayout(): void {
        super.doLayout();
        this.center = true;
        // align all to baseline of Forte
        this.height = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.DynamicForte)!;
        const forteBaseLine = this.renderer.smuflMetrics.glyphTop.get(MusicFontSymbol.DynamicForte)!
        this.offsetY = forteBaseLine;
    }

    private static getSymbol(dynamics: DynamicValue): MusicFontSymbol {
        switch (dynamics) {
            case DynamicValue.PPP:
                return MusicFontSymbol.DynamicPPP;
            case DynamicValue.PP:
                return MusicFontSymbol.DynamicPP;
            case DynamicValue.P:
                return MusicFontSymbol.DynamicPiano;
            case DynamicValue.MP:
                return MusicFontSymbol.DynamicMP;
            case DynamicValue.MF:
                return MusicFontSymbol.DynamicMF;
            case DynamicValue.F:
                return MusicFontSymbol.DynamicForte;
            case DynamicValue.FF:
                return MusicFontSymbol.DynamicFF;
            case DynamicValue.FFF:
                return MusicFontSymbol.DynamicFFF;
            case DynamicValue.PPPP:
                return MusicFontSymbol.DynamicPPPP;
            case DynamicValue.PPPPP:
                return MusicFontSymbol.DynamicPPPPP;
            case DynamicValue.PPPPPP:
                return MusicFontSymbol.DynamicPPPPP;
            case DynamicValue.FFFF:
                return MusicFontSymbol.DynamicFFFF;
            case DynamicValue.FFFFF:
                return MusicFontSymbol.DynamicFFFFF;
            case DynamicValue.FFFFFF:
                return MusicFontSymbol.DynamicFFFFFF;
            case DynamicValue.SF:
                return MusicFontSymbol.DynamicSforzando1;
            case DynamicValue.SFP:
                return MusicFontSymbol.DynamicSforzandoPiano;
            case DynamicValue.SFPP:
                return MusicFontSymbol.DynamicSforzandoPianissimo;
            case DynamicValue.FP:
                return MusicFontSymbol.DynamicFortePiano;
            case DynamicValue.RF:
                return MusicFontSymbol.DynamicRinforzando1;
            case DynamicValue.RFZ:
                return MusicFontSymbol.DynamicRinforzando2;
            case DynamicValue.SFZ:
                return MusicFontSymbol.DynamicSforzato;
            case DynamicValue.SFFZ:
                return MusicFontSymbol.DynamicSforzatoFF;
            case DynamicValue.FZ:
                return MusicFontSymbol.DynamicForzando;
            case DynamicValue.N:
                return MusicFontSymbol.DynamicNiente;
            case DynamicValue.PF:
                return MusicFontSymbol.DynamicPF;
            case DynamicValue.SFZP:
                return MusicFontSymbol.DynamicSforzatoPiano;
            default:
                return MusicFontSymbol.None;
        }
    }
}
