import { Color } from '@src/model/Color';

describe('ColorTests', () => {
    it('fromJson-number', () => {
        const color = Color.fromJson(-635386);

        expect(color!.rgba).toEqual('#f64e06');
    });

    it('fromJson-#RGB', () => {
        const color = Color.fromJson('#0f0');

        expect(color!.rgba).toEqual('#00ff00');
    });

    it('fromJson-#RGBA', () => {
        const color = Color.fromJson('#0f09');

        expect(color!.rgba).toEqual('rgba(0,255,0,0.6)');
    });

    it('fromJson-#RRGGBB', () => {
        const color = Color.fromJson('#f64e06');

        expect(color!.rgba).toEqual('#f64e06');
    });

    it('fromJson-#RRGGBBAA', () => {
        const color = Color.fromJson('#f64e0680');

        expect(color!.rgba).toEqual('rgba(246,78,6,0.5)');
    });

    it('fromJson-rgb', () => {
        const color = Color.fromJson('rgb(246,78,6)');

        expect(color!.rgba).toEqual('#f64e06');
    });

    it('fromJson-rgba', () => {
        const color = Color.fromJson('rgba(246,78,6,128)');

        expect(color!.rgba).toEqual('rgba(246,78,6,0.5)');
    });
});
