import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { expect } from 'chai';

describe('KeySignatureUtilsTests', () => {
    it('sharp key signatures apply accidentals in F C G D A E B order', () => {
        const ksG = KeySignature.G; // 1 sharp -> F#
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksG, 3)).to.equal(1); // F
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksG, 0)).to.equal(0); // C
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksG, 6)).to.equal(0); // B

        const ksD = KeySignature.D; // 2 sharps -> F#, C#
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksD, 3)).to.equal(1); // F
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksD, 0)).to.equal(1); // C
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksD, 4)).to.equal(0); // G
    });

    it('flat key signatures apply accidentals in B E A D G C F order', () => {
        const ksF = KeySignature.F; // 1 flat -> Bb
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksF, 6)).to.equal(-1); // B
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksF, 2)).to.equal(0); // E

        const ksBb = KeySignature.Bb; // 2 flats -> Bb, Eb
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksBb, 6)).to.equal(-1); // B
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksBb, 2)).to.equal(-1); // E
        expect(ModelUtils.getKeySignatureAccidentalOffset(ksBb, 5)).to.equal(0); // A
    });

    it('major tonic degree matches expected scale degree', () => {
        expect(ModelUtils.getKeySignatureTonicDegree(KeySignature.C, KeySignatureType.Major)).to.equal(0); // C
        expect(ModelUtils.getKeySignatureTonicDegree(KeySignature.G, KeySignatureType.Major)).to.equal(4); // G
        expect(ModelUtils.getKeySignatureTonicDegree(KeySignature.Eb, KeySignatureType.Major)).to.equal(2); // Eb
    });

    it('minor tonic degree matches expected scale degree', () => {
        expect(ModelUtils.getKeySignatureTonicDegree(KeySignature.C, KeySignatureType.Minor)).to.equal(5); // A
        expect(ModelUtils.getKeySignatureTonicDegree(KeySignature.G, KeySignatureType.Minor)).to.equal(2); // E
        expect(ModelUtils.getKeySignatureTonicDegree(KeySignature.Bb, KeySignatureType.Minor)).to.equal(4); // G (relative minor)
    });
});