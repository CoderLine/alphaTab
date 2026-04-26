import { describe, expect, it } from 'vitest';
import { XmlDocument } from '@coderline/alphatab/xml/XmlDocument';
import { XmlNodeType } from '@coderline/alphatab/xml/XmlNode';
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
        expect(xml.firstElement!.childNodes.length).toBe(1);
        expect(xml.firstElement!.childNodes[0].nodeType).toBe(XmlNodeType.Text);
        expect(xml.firstElement!.childNodes[0].value).toBe('Text');
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
        expect(xml.firstElement!.childNodes[1].childNodes.length).toBe(1);
        expect(xml.firstElement!.childNodes[1].childNodes[0].nodeType).toBe(XmlNodeType.Text);
        expect(xml.firstElement!.childNodes[1].childNodes[0].value).toBe('value');
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

    it('parseFull', async () => {
        const s = await TestPlatform.loadFileAsString('test-data/xml/GPIF.xml');
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
    });
});
