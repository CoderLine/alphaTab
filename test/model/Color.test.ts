import { Color } from "@src/model/Color";

describe('ColorTests', () => {
  it('fromJson rgb', () => {
    const color = Color.fromJson('rgb(0,0,0)');

    expect(color!.rgba).toEqual('#000000');
  });
});
