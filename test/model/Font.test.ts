import { Font, FontStyle } from "@src/model/Font";

describe('FontTests', () => {
    function parseText(text: string, expected: Font) {
        const font = Font.fromJson(text);
        expect(font!.family).toEqual(expected.family);
        expect(font!.isBold).toEqual(expected.isBold);
        expect(font!.isItalic).toEqual(expected.isItalic);
        expect(font!.size).toEqual(expected.size);
        expect(font!.style).toEqual(expected.style);
    }

    it('parses-full', function () {
        parseText('italic small-caps bold 12px/1.5em "Arial"', new Font("Arial", 12, FontStyle.Italic | FontStyle.Bold))
    });

    it('parses-partial-options', function () {
        parseText('italic bold 12px/1.5em "Arial", sans', new Font("Arial", 12, FontStyle.Italic | FontStyle.Bold))
        parseText('bold italic 12px/1.5em "Arial", sans', new Font("Arial", 12, FontStyle.Italic | FontStyle.Bold))
        parseText('bold 12px/1.5em "Arial", sans', new Font("Arial", 12, FontStyle.Bold))
        parseText('italic 12px/1.5em "Arial", sans', new Font("Arial", 12, FontStyle.Italic))
    });

    it('parses-no-options', function () {
        parseText('12px/1.5em "Arial", sans', new Font("Arial", 12, FontStyle.Plain))
    });

    it('parses-line-height-spaces', function () {
        parseText('12px/1.5em "Arial", sans', new Font("Arial", 12, FontStyle.Plain))
        parseText('12px /1.5em "Arial", sans', new Font("Arial", 12, FontStyle.Plain))
        parseText('12px / 1.5em "Arial", sans', new Font("Arial", 12, FontStyle.Plain))
        parseText('12px  /  1.5em "Arial", sans', new Font("Arial", 12, FontStyle.Plain))
    });

    it('parses-multiple-families', function () {
        parseText('12px/1.5em Arial, Verdana, sans', new Font("Arial", 12, FontStyle.Plain))
        parseText("12px/1.5em 'Arial', 'Verdana', 'sans'", new Font("Arial", 12, FontStyle.Plain))
        parseText('12px/1.5em "Arial", "Verdana", "sans"', new Font("Arial", 12, FontStyle.Plain))
        parseText('12px/1.5em Arial, "Verdana", sans', new Font("Arial", 12, FontStyle.Plain))
        parseText('12px/1.5em Arial, \'Verdana\', "sans"', new Font("Arial", 12, FontStyle.Plain))
    });
    it('parses-escaped-quotes', function () {
        parseText("12px/1.5em \"Ari\\\"al\"", new Font("Ari\"al", 12, FontStyle.Plain))
        parseText('12px/1.5em \'Ari\\\'al\'', new Font("Ari'al", 12, FontStyle.Plain))
        parseText('12px/1.5em \'Ari\\\'\'', new Font('Ari\'', 12, FontStyle.Plain))
        parseText("12px/1.5em 'Ari\\al'", new Font("Ari\\al", 12, FontStyle.Plain))
    });
});