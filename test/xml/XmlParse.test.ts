import { XmlDocument } from '@src/xml/XmlDocument';
import { XmlNodeType } from '@src/xml/XmlNode';
import { TestPlatform } from '@test/TestPlatform';

describe('XmlParseTest', () => {
    it('parseSimple', () => {
        let s: string = '<root></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toEqual('root');
        expect(xml.firstElement!.childNodes.length).toEqual(0);
    });

    it('parseShorthand', () => {
        let s: string = '<root />';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toEqual('root');
        expect(xml.firstElement!.childNodes.length).toEqual(0);
    });

    it('parseSingleAttribute', () => {
        let s: string = '<root att="v"></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toEqual('root');
        expect(xml.firstElement!.getAttribute('att')).toEqual('v');
        expect(xml.firstElement!.childNodes.length).toEqual(0);
    });

    it('parseMultipleAttributes', () => {
        let s: string = '<root att="v" att2="v2"></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toEqual('root');
        expect(xml.firstElement!.getAttribute('att')).toEqual('v');
        expect(xml.firstElement!.getAttribute('att2')).toEqual('v2');
        expect(xml.firstElement!.childNodes.length).toEqual(0);
    });

    it('parseSimpleText', () => {
        let s: string = '<root>Text</root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toEqual('root');
        expect(xml.firstElement!.childNodes.length).toEqual(1);
        expect(xml.firstElement!.childNodes[0].nodeType).toEqual(XmlNodeType.Text);
        expect(xml.firstElement!.childNodes[0].value).toEqual('Text');
    });

    it('parseChild', () => {
        let s: string = '<root><cc></cc></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toEqual('root');
        expect(xml.firstElement!.childNodes.length).toEqual(1);
        expect(xml.firstElement!.childNodes[0].nodeType).toEqual(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).toEqual('cc');
    });

    it('parseMultiChild', () => {
        let s: string = '<root><cc></cc><cc></cc></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toEqual('root');
        expect(xml.firstElement!.childNodes.length).toEqual(2);
        expect(xml.firstElement!.childNodes[0].nodeType).toEqual(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).toEqual('cc');
        expect(xml.firstElement!.childNodes[1].nodeType).toEqual(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[1].localName).toEqual('cc');
    });

    it('parseComments', () => {
        let s: string = '<!-- some comment --><test><cc c="d"><!-- some comment --></cc><!-- some comment --><cc>value<!-- some comment --></cc></test><!-- ending -->';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toEqual('test');
        expect(xml.firstElement!.childNodes.length).toEqual(2);
        expect(xml.firstElement!.childNodes[0].nodeType).toEqual(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).toEqual('cc');
        expect(xml.firstElement!.childNodes[0].getAttribute('c')).toEqual('d');
        expect(xml.firstElement!.childNodes[1].nodeType).toEqual(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[1].localName).toEqual('cc');
        expect(xml.firstElement!.childNodes[1].childNodes.length).toEqual(1);
        expect(xml.firstElement!.childNodes[1].childNodes[0].nodeType).toEqual(XmlNodeType.Text);
        expect(xml.firstElement!.childNodes[1].childNodes[0].value).toEqual('value');
    });

    it('parseDoctype', () => {
        let s: string = '<!DOCTYPE html><test><cc></cc><cc></cc></test>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toEqual('test');
        expect(xml.firstElement!.childNodes.length).toEqual(2);
        expect(xml.firstElement!.childNodes[0].nodeType).toEqual(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).toEqual('cc');
        expect(xml.firstElement!.childNodes[1].nodeType).toEqual(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[1].localName).toEqual('cc');
    });

    it('parseXmlHeadTest', () => {
        let s: string = '<?xml version="1.0" encoding="utf-8"`?><root></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
        expect(xml.firstElement!.localName).toEqual('root');
    });

    it('parseFull', async () => {
        const s = await TestPlatform.loadFileAsString('test-data/xml/GPIF.xml');
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).toBeTruthy();
    });
});
