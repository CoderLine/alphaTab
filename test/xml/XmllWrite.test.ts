import { XmlDocument } from '@src/xml/XmlDocument';
import { XmlNode, XmlNodeType } from '@src/xml/XmlNode';
import { expect } from 'chai';

describe('XmlWriteTest', () => {
    it('writeSimple', () => {
        const s: string = '<root></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toFormattedString()).to.equal('<root/>');
    });

    it('writeSingleAttribute', () => {
        const s: string = '<root att="v"></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toFormattedString()).to.equal('<root att="v"/>');
    });

    it('writeMultipleAttributes', () => {
        const s: string = '<root att="v" att2="v2"></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toFormattedString()).to.equal('<root att="v" att2="v2"/>');
    });

    it('writeSimpleText', () => {
        const s: string = '<root>Text</root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toFormattedString()).to.equal(s);
    });

    it('writeSimpleTextFormatted', () => {
        const s: string = '<root>Text</root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toFormattedString('  ')).to.equal(s);
    });

    it('writeChild', () => {
        const s: string = '<root><cc></cc></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toFormattedString()).to.equal('<root><cc/></root>');
        expect(xml.toFormattedString('  ')).to.equal('<root>\n  <cc/>\n</root>');
        expect(xml.toFormattedString('    ')).to.equal('<root>\n    <cc/>\n</root>');
    });

    it('writeNumber', () => {
        const s: string = '<root><cc>0.5</cc></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toFormattedString()).to.equal('<root><cc>0.5</cc></root>');
    });

    it('writeMultiChild', () => {
        const s: string = '<root><cc></cc><cc></cc></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toFormattedString()).to.equal('<root><cc/><cc/></root>');
        expect(xml.toFormattedString('  ')).to.equal('<root>\n  <cc/>\n  <cc/>\n</root>');
        expect(xml.toFormattedString('    ')).to.equal('<root>\n    <cc/>\n    <cc/>\n</root>');
    });

    it('writeXmlHeadTest', () => {
        const s: string = '<?xml version="1.0" encoding="utf-8"?><root></root>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toFormattedString('', true)).to.equal('<?xml version="1.0" encoding="utf-8"?><root/>');
        expect(xml.toFormattedString('  ', true)).to.equal('<?xml version="1.0" encoding="utf-8"?>\n<root/>');
    });

    it('writeDoctype', () => {
        const s: string = '<!DOCTYPE html><test/>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toFormattedString()).to.equal(s);
        expect(xml.toFormattedString('  ')).to.equal('<!DOCTYPE html>\n<test/>');
    });

    it('writeEscapedAttributeValues', () => {
        const s: string = '<test/>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        xml.firstElement!.attributes.set('lt', '<');
        xml.firstElement!.attributes.set('gt', '>');
        xml.firstElement!.attributes.set('amp', '&');
        xml.firstElement!.attributes.set('apos', "'");
        xml.firstElement!.attributes.set('quot', '"');
        expect(xml.toFormattedString()).to.equal('<test lt="&lt;" gt="&gt;" amp="&amp;" apos="&apos;" quot="&quot;"/>');
    });
    it('writeComment', () => {
        const s: string = '<test/>';
        const xml: XmlDocument = new XmlDocument();
        xml.parse(s);

        xml.firstElement!.addElement('test2')

        const alphaTabComment = new XmlNode();
        alphaTabComment.nodeType = XmlNodeType.Comment;
        alphaTabComment.value = 'Written by alphaTab';
        xml.firstElement!.addChild(alphaTabComment);
        expect(xml.toFormattedString()).to.equal('<test><test2/><!-- Written by alphaTab --></test>');
    });
});
