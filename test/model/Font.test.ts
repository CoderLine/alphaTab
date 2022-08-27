import { Font, FontStyle, FontWeight } from "@src/model/Font";

describe('FontTests', () => {
    function parseText(text: string, expected: Font) {
        const font = Font.fromJson(text);
        expect(font!.families.join(', ')).toEqual(expected.families.join(', '));
        expect(font!.isBold).toEqual(expected.isBold);
        expect(font!.isItalic).toEqual(expected.isItalic);
        expect(font!.size).toEqual(expected.size);
        expect(font!.style).toEqual(expected.style);
        expect(font!.weight).toEqual(expected.weight);
    }

    it('parses-full', function () {
        parseText('italic small-caps bold 12px/1.5em "Arial"', Font.withFamilyList(["Arial"], 12, FontStyle.Italic, FontWeight.Bold))
    });

    it('parses-partial-options', function () {
        parseText('italic bold 12px/1.5em "Arial", sans', Font.withFamilyList(["Arial", "sans"], 12, FontStyle.Italic, FontWeight.Bold))
        parseText('bold italic 12px/1.5em "Arial", sans', Font.withFamilyList(["Arial", "sans"], 12, FontStyle.Italic, FontWeight.Bold))
        parseText('bold 12px/1.5em "Arial", sans', Font.withFamilyList(["Arial", "sans"], 12, FontStyle.Plain, FontWeight.Bold))
        parseText('italic 12px/1.5em "Arial", sans', Font.withFamilyList(["Arial", "sans"], 12, FontStyle.Italic))
    });

    it('parses-no-options', function () {
        parseText('12px/1.5em "Arial", sans', Font.withFamilyList(["Arial", "sans"], 12, FontStyle.Plain))
    });

    it('parses-line-height-spaces', function () {
        parseText('12px/1.5em "Arial", sans', Font.withFamilyList(["Arial", "sans"], 12, FontStyle.Plain))
        parseText('12px /1.5em "Arial", sans', Font.withFamilyList(["Arial", "sans"], 12, FontStyle.Plain))
        parseText('12px / 1.5em "Arial", sans', Font.withFamilyList(["Arial", "sans"], 12, FontStyle.Plain))
        parseText('12px  /  1.5em "Arial", sans', Font.withFamilyList(["Arial", "sans"], 12, FontStyle.Plain))
    });

    it('parses-multiple-families', function () {
        parseText('12px/1.5em Arial, Verdana, sans', Font.withFamilyList(["Arial", "Verdana", "sans"], 12, FontStyle.Plain))
        parseText("12px/1.5em 'Arial', 'Verdana', 'sans'", Font.withFamilyList(["Arial", "Verdana", "sans"], 12, FontStyle.Plain))
        parseText('12px/1.5em "Arial", "Verdana", "sans"', Font.withFamilyList(["Arial", "Verdana", "sans"], 12, FontStyle.Plain))
        parseText('12px/1.5em Arial, "Verdana", sans', Font.withFamilyList(["Arial", "Verdana", "sans"], 12, FontStyle.Plain))
        parseText('12px/1.5em Arial, \'Verdana\', "sans"', Font.withFamilyList(["Arial", "Verdana", "sans"], 12, FontStyle.Plain))
    });
    it('parses-escaped-quotes', function () {
        parseText("12px/1.5em \"Ari\\\"al\"", Font.withFamilyList(["Ari\"al"], 12, FontStyle.Plain))
        parseText('12px/1.5em \'Ari\\\'al\'', Font.withFamilyList(["Ari'al"], 12, FontStyle.Plain))
        parseText('12px/1.5em \'Ari\\\'\'', Font.withFamilyList(['Ari\''], 12, FontStyle.Plain))
        parseText("12px/1.5em 'Ari\\al'", Font.withFamilyList(["Ari\\al"], 12, FontStyle.Plain))
    });
    it('parses-with-spaces-and-quotes', function () {
        parseText("12px/1.5em \"Times New Roman\"", Font.withFamilyList(["Times New Roman"], 12, FontStyle.Plain))
        parseText("12px/1.5em \"Times New Roman\", Arial, 'Open Sans'", Font.withFamilyList(["Times New Roman", "Arial", "Open Sans"], 12, FontStyle.Plain))
    });

    function toCssStringTest(f:Font, expected:string){
        expect(f.toCssString()).toEqual(expected)
    }

    it('css-string-tests', function () {
        toCssStringTest(Font.withFamilyList(["Arial"], 12, FontStyle.Plain), "12px Arial")
        toCssStringTest(Font.withFamilyList(["Arial"], 12, FontStyle.Italic), "italic 12px Arial")
        toCssStringTest(Font.withFamilyList(["Arial"], 12, FontStyle.Italic, FontWeight.Bold), "bold italic 12px Arial")
        toCssStringTest(Font.withFamilyList(["Times New Roman"], 12, FontStyle.Plain), "12px \"Times New Roman\"")
        toCssStringTest(Font.withFamilyList(["Times New Roman", "Arial"], 12, FontStyle.Plain), "12px \"Times New Roman\", Arial")
        toCssStringTest(Font.withFamilyList(["With 'SingleQuote'", 'With "DoubleQuote"', "Arial"], 12, FontStyle.Plain), "12px \"With 'SingleQuote'\", \"With \\\"DoubleQuote\\\"\", Arial")
    });
});