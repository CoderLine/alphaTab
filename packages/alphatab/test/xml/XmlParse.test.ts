import { describe, expect, it } from 'vitest';
import { XmlDocument } from '@coderline/alphatab/xml/XmlDocument';
import { XmlNodeType } from '@coderline/alphatab/xml/XmlNode';
import { XmlError } from '@coderline/alphatab/xml/XmlError';
import { TestPlatform } from 'test/TestPlatform';
describe('XmlParseTest', () => {
    it('parseSimple', () => {
        const s: string = '<root></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toBe('root');
        expect(xml.firstElement!.childNodes.length).toBe(0);
    });

    it('parseShorthand', () => {
        const s: string = '<root />';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toBe('root');
        expect(xml.firstElement!.childNodes.length).toBe(0);
    });

    it('parseSingleAttribute', () => {
        const s: string = '<root att="v"></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toBe('root');
        expect(xml.firstElement!.getAttribute('att')).toBe('v');
        expect(xml.firstElement!.childNodes.length).toBe(0);
    });

    it('parseMultipleAttributes', () => {
        const s: string = '<root att="v" att2="v2"></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toBe('root');
        expect(xml.firstElement!.getAttribute('att')).toBe('v');
        expect(xml.firstElement!.getAttribute('att2')).toBe('v2');
        expect(xml.firstElement!.childNodes.length).toBe(0);
    });

    it('parseSimpleText', () => {
        const s: string = '<root>Text</root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toBe('root');
        expect(xml.firstElement!.childNodes.length).toBe(0);
        expect(xml.firstElement!.innerText).toBe('Text');
    });

    it('parseChild', () => {
        const s: string = '<root><cc></cc></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toBe('root');
        expect(xml.firstElement!.childNodes.length).toBe(1);
        expect(xml.firstElement!.childNodes[0].nodeType).toBe(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).toBe('cc');
    });

    it('parseMultiChild', () => {
        const s: string = '<root><cc></cc><cc></cc></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toBe('root');
        expect(xml.firstElement!.childNodes.length).toBe(2);
        expect(xml.firstElement!.childNodes[0].nodeType).toBe(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).toBe('cc');
        expect(xml.firstElement!.childNodes[1].nodeType).toBe(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[1].localName).toBe('cc');
    });

    it('parseComments', () => {
        const s: string =
            '<!-- some comment --><test><cc c="d"><!-- some comment --></cc><!-- some comment --><cc>value<!-- some comment --></cc></test><!-- ending -->';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toBe('test');
        expect(xml.firstElement!.childNodes.length).toBe(2);
        expect(xml.firstElement!.childNodes[0].nodeType).toBe(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).toBe('cc');
        expect(xml.firstElement!.childNodes[0].getAttribute('c')).toBe('d');
        expect(xml.firstElement!.childNodes[1].nodeType).toBe(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[1].localName).toBe('cc');
        expect(xml.firstElement!.childNodes[1].childNodes.length).toBe(0);
        expect(xml.firstElement!.childNodes[1].innerText).toBe('value');
    });

    it('parseDoctype', () => {
        const s: string = '<!DOCTYPE html><test><cc></cc><cc></cc></test>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toBe('test');
        expect(xml.firstElement!.childNodes.length).toBe(2);
        expect(xml.firstElement!.childNodes[0].nodeType).toBe(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).toBe('cc');
        expect(xml.firstElement!.childNodes[1].nodeType).toBe(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[1].localName).toBe('cc');
    });

    it('parseXmlHeadTest', () => {
        const s: string = '<?xml version="1.0" encoding="utf-8"`?><root></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toBe('root');
    });

    it('parseEntities', () => {
        const xml = new XmlDocument();
        xml.parse(
            '<root a="&lt;&quot;&apos;&gt;&amp;" b=\'1 &#65;&#x42;\'>&lt;a&gt; &amp; &#x1F3B8; &unknown; &amp</root>'
        );
        expect(xml.firstElement!.getAttribute('a')).toBe('<"\'>&');
        expect(xml.firstElement!.getAttribute('b')).toBe('1 AB');
        expect(xml.firstElement!.innerText).toBe(`<a> & ${String.fromCodePoint(0x1f3b8)} &unknown; &amp`);
    });

    it('parseWhitespace', () => {
        const xml = new XmlDocument();
        xml.parse('<root>\n  <a>  text  </a>\n  <b>  </b>\r\n\t<c>&#32;x&#32;</c>\n</root>');
        const root = xml.firstElement!;
        expect(root.hasText).toBe(false);
        expect(root.childNodes.length).toBe(3);
        expect(root.childElements()[0].innerText).toBe('text');
        expect(root.childElements()[1].innerText).toBe('');
        // character references are not formatting whitespace
        expect(root.childElements()[2].innerText).toBe(' x ');
    });

    it('parseCData', () => {
        const xml = new XmlDocument();
        xml.parse('<root>\n  <a><![CDATA[ <b>&amp; ]]></a>\n  <c>x</c></root>');
        const a = xml.firstElement!.findChildElement('a')!;
        expect(a.isCData).toBe(true);
        expect(a.innerText).toBe(' <b>&amp; ');
        expect(a.childNodes.length).toBe(0);
        expect(xml.firstElement!.findChildElement('c')!.isCData).toBe(false);
    });

    it('parseProcessingInstructions', () => {
        const xml = new XmlDocument();
        xml.parse('\uFEFF<?xml version="1.0"?><root><?GP <root><a/></root>?><a>1</a></root>');
        expect(xml.firstElement!.localName).toBe('root');
        expect(xml.firstElement!.childNodes.length).toBe(1);
        expect(xml.firstElement!.firstElement!.innerText).toBe('1');
    });

    it('parseDoctypeInternalSubset', () => {
        const xml = new XmlDocument();
        xml.parse('<!DOCTYPE score-partwise [ <!ENTITY a "b"> ]>\n<score-partwise/>');
        expect(xml.childNodes.length).toBe(2);
        expect(xml.childNodes[0].nodeType).toBe(XmlNodeType.DocumentType);
        expect(xml.childNodes[0].innerText).toBe('score-partwise [ <!ENTITY a "b"> ]');
        expect(xml.childElements().length).toBe(1);
        expect(xml.firstElement!.localName).toBe('score-partwise');
    });

    it('parseFirstElement', () => {
        const xml = new XmlDocument();
        xml.parse('<root><a/><b/></root>');
        expect(xml.firstElement!.firstElement!.localName).toBe('a');
    });

    it('parseErrors', () => {
        const parse = (s: string) => () => new XmlDocument().parse(s);
        expect(parse('<root><a></root>')).toThrow(XmlError);
        expect(parse('<root>')).toThrow(XmlError);
        expect(parse('<root></root></root>')).toThrow(XmlError);
        expect(parse('<root><!-- </root>')).toThrow(XmlError);
        expect(parse('<root a=1/>')).toThrow(XmlError);
        expect(parse('<root a="1/>')).toThrow(XmlError);
        expect(parse('< root/>')).toThrow(XmlError);
    });

    it('parseFull', async () => {
        const s = await TestPlatform.loadFileAsString('test-data/xml/GPIF.xml');
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
    });
});
