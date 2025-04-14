import { XmlDocument } from '@src/xml/XmlDocument';
import { XmlNodeType } from '@src/xml/XmlNode';
import { TestPlatform } from '@test/TestPlatform';
import { expect } from 'chai';

describe('XmlParseTest', () => {
    it('parseSimple', () => {
        const s: string = '<root></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
        expect(xml.firstElement!.localName).to.equal('root');
        expect(xml.firstElement!.childNodes.length).to.equal(0);
    });

    it('parseShorthand', () => {
        const s: string = '<root />';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
        expect(xml.firstElement!.localName).to.equal('root');
        expect(xml.firstElement!.childNodes.length).to.equal(0);
    });

    it('parseSingleAttribute', () => {
        const s: string = '<root att="v"></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
        expect(xml.firstElement!.localName).to.equal('root');
        expect(xml.firstElement!.getAttribute('att')).to.equal('v');
        expect(xml.firstElement!.childNodes.length).to.equal(0);
    });

    it('parseMultipleAttributes', () => {
        const s: string = '<root att="v" att2="v2"></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
        expect(xml.firstElement!.localName).to.equal('root');
        expect(xml.firstElement!.getAttribute('att')).to.equal('v');
        expect(xml.firstElement!.getAttribute('att2')).to.equal('v2');
        expect(xml.firstElement!.childNodes.length).to.equal(0);
    });

    it('parseSimpleText', () => {
        const s: string = '<root>Text</root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
        expect(xml.firstElement!.localName).to.equal('root');
        expect(xml.firstElement!.childNodes.length).to.equal(1);
        expect(xml.firstElement!.childNodes[0].nodeType).to.equal(XmlNodeType.Text);
        expect(xml.firstElement!.childNodes[0].value).to.equal('Text');
    });

    it('parseChild', () => {
        const s: string = '<root><cc></cc></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
        expect(xml.firstElement!.localName).to.equal('root');
        expect(xml.firstElement!.childNodes.length).to.equal(1);
        expect(xml.firstElement!.childNodes[0].nodeType).to.equal(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).to.equal('cc');
    });

    it('parseMultiChild', () => {
        const s: string = '<root><cc></cc><cc></cc></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
        expect(xml.firstElement!.localName).to.equal('root');
        expect(xml.firstElement!.childNodes.length).to.equal(2);
        expect(xml.firstElement!.childNodes[0].nodeType).to.equal(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).to.equal('cc');
        expect(xml.firstElement!.childNodes[1].nodeType).to.equal(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[1].localName).to.equal('cc');
    });

    it('parseComments', () => {
        const s: string =
            '<!-- some comment --><test><cc c="d"><!-- some comment --></cc><!-- some comment --><cc>value<!-- some comment --></cc></test><!-- ending -->';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
        expect(xml.firstElement!.localName).to.equal('test');
        expect(xml.firstElement!.childNodes.length).to.equal(2);
        expect(xml.firstElement!.childNodes[0].nodeType).to.equal(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).to.equal('cc');
        expect(xml.firstElement!.childNodes[0].getAttribute('c')).to.equal('d');
        expect(xml.firstElement!.childNodes[1].nodeType).to.equal(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[1].localName).to.equal('cc');
        expect(xml.firstElement!.childNodes[1].childNodes.length).to.equal(1);
        expect(xml.firstElement!.childNodes[1].childNodes[0].nodeType).to.equal(XmlNodeType.Text);
        expect(xml.firstElement!.childNodes[1].childNodes[0].value).to.equal('value');
    });

    it('parseDoctype', () => {
        const s: string = '<!DOCTYPE html><test><cc></cc><cc></cc></test>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
        expect(xml.firstElement!.localName).to.equal('test');
        expect(xml.firstElement!.childNodes.length).to.equal(2);
        expect(xml.firstElement!.childNodes[0].nodeType).to.equal(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[0].localName).to.equal('cc');
        expect(xml.firstElement!.childNodes[1].nodeType).to.equal(XmlNodeType.Element);
        expect(xml.firstElement!.childNodes[1].localName).to.equal('cc');
    });

    it('parseXmlHeadTest', () => {
        const s: string = '<?xml version="1.0" encoding="utf-8"`?><root></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
        expect(xml.firstElement!.localName).to.equal('root');
    });

    it('parseFull', async () => {
        const s = await TestPlatform.loadFileAsString('test-data/xml/GPIF.xml');
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.firstElement).to.be.ok;
    });
});
