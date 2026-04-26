import { describe, expect, it } from 'vitest';
import { Font, FontStyle, FontWeight } from '@coderline/alphatab/model/Font';
describe('FontTests', () => {
    function parseText(text: string, expected: Font) {
        const font = Font.fromJson(text);
        expect(font!.families.join(', ')).toBe(expected.families.join(', '));
        expect(font!.isBold).toBe(expected.isBold);
        expect(font!.isItalic).toBe(expected.isItalic);
        expect(font!.size).toBe(expected.size);
        expect(font!.style).toBe(expected.style);
        expect(font!.weight).toBe(expected.weight);
    }

    it('parses-full', () => {
        parseText(
            'italic small-caps bold 12px/1.5em "Arial"',
            Font.withFamilyList(['Arial'], 12, FontStyle.Italic, FontWeight.Bold)
        );
    });

    it('parses-partial-options', () => {
        parseText(
            'italic bold 12px/1.5em "Arial", sans',
            Font.withFamilyList(['Arial', 'sans'], 12, FontStyle.Italic, FontWeight.Bold)
        );
        parseText(
            'bold italic 12px/1.5em "Arial", sans',
            Font.withFamilyList(['Arial', 'sans'], 12, FontStyle.Italic, FontWeight.Bold)
        );
        parseText(
            'bold 12px/1.5em "Arial", sans',
            Font.withFamilyList(['Arial', 'sans'], 12, FontStyle.Plain, FontWeight.Bold)
        );
        parseText('italic 12px/1.5em "Arial", sans', Font.withFamilyList(['Arial', 'sans'], 12, FontStyle.Italic));
    });

    it('parses-no-options', () => {
        parseText('12px/1.5em "Arial", sans', Font.withFamilyList(['Arial', 'sans'], 12, FontStyle.Plain));
    });

    it('parses-line-height-spaces', () => {
        parseText('12px/1.5em "Arial", sans', Font.withFamilyList(['Arial', 'sans'], 12, FontStyle.Plain));
        parseText('12px /1.5em "Arial", sans', Font.withFamilyList(['Arial', 'sans'], 12, FontStyle.Plain));
        parseText('12px / 1.5em "Arial", sans', Font.withFamilyList(['Arial', 'sans'], 12, FontStyle.Plain));
        parseText('12px  /  1.5em "Arial", sans', Font.withFamilyList(['Arial', 'sans'], 12, FontStyle.Plain));
    });

    it('parses-multiple-families', () => {
        parseText(
            '12px/1.5em Arial, Verdana, sans',
            Font.withFamilyList(['Arial', 'Verdana', 'sans'], 12, FontStyle.Plain)
        );
        parseText(
            "12px/1.5em 'Arial', 'Verdana', 'sans'",
            Font.withFamilyList(['Arial', 'Verdana', 'sans'], 12, FontStyle.Plain)
        );
        parseText(
            '12px/1.5em "Arial", "Verdana", "sans"',
            Font.withFamilyList(['Arial', 'Verdana', 'sans'], 12, FontStyle.Plain)
        );
        parseText(
            '12px/1.5em Arial, "Verdana", sans',
            Font.withFamilyList(['Arial', 'Verdana', 'sans'], 12, FontStyle.Plain)
        );
        parseText(
            '12px/1.5em Arial, \'Verdana\', "sans"',
            Font.withFamilyList(['Arial', 'Verdana', 'sans'], 12, FontStyle.Plain)
        );
    });
    it('parses-escaped-quotes', () => {
        parseText('12px/1.5em "Ari\\"al"', Font.withFamilyList(['Ari"al'], 12, FontStyle.Plain));
        parseText("12px/1.5em 'Ari\\'al'", Font.withFamilyList(["Ari'al"], 12, FontStyle.Plain));
        parseText("12px/1.5em 'Ari\\''", Font.withFamilyList(["Ari'"], 12, FontStyle.Plain));
        parseText("12px/1.5em 'Ari\\al'", Font.withFamilyList(['Ari\\al'], 12, FontStyle.Plain));
    });
    it('parses-with-spaces-and-quotes', () => {
        parseText('12px/1.5em "Times New Roman"', Font.withFamilyList(['Times New Roman'], 12, FontStyle.Plain));
        parseText(
            '12px/1.5em "Times New Roman", Arial, \'Open Sans\'',
            Font.withFamilyList(['Times New Roman', 'Arial', 'Open Sans'], 12, FontStyle.Plain)
        );
    });

    function toCssStringTest(f: Font, expected: string) {
        expect(f.toCssString()).toBe(expected);
    }

    it('css-string-tests', () => {
        toCssStringTest(Font.withFamilyList(['Arial'], 12, FontStyle.Plain), '12px Arial');
        toCssStringTest(Font.withFamilyList(['Arial'], 12, FontStyle.Italic), 'italic 12px Arial');
        toCssStringTest(
            Font.withFamilyList(['Arial'], 12, FontStyle.Italic, FontWeight.Bold),
            'bold italic 12px Arial'
        );
        toCssStringTest(Font.withFamilyList(['Times New Roman'], 12, FontStyle.Plain), '12px "Times New Roman"');
        toCssStringTest(
            Font.withFamilyList(['Times New Roman', 'Arial'], 12, FontStyle.Plain),
            '12px "Times New Roman", Arial'
        );
        toCssStringTest(
            Font.withFamilyList(["With 'SingleQuote'", 'With "DoubleQuote"', 'Arial'], 12, FontStyle.Plain),
            '12px "With \'SingleQuote\'", "With \\"DoubleQuote\\"", Arial'
        );
    });
});
