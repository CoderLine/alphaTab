import { XmlDocument } from '@src/xml/XmlDocument';

describe('XmlWriteTest', () => {
    it('writeSimple', () => {
        let s: string = '<root></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toString()).toEqual('<root/>');
    });

    it('writeSingleAttribute', () => {
        let s: string = '<root att="v"></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toString()).toEqual('<root att="v"/>');
    });

    it('writeMultipleAttributes', () => {
        let s: string = '<root att="v" att2="v2"></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toString()).toEqual('<root att="v" att2="v2"/>');
    });

    it('writeSimpleText', () => {
        let s: string = '<root>Text</root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toString()).toEqual(s);
    });

    it('writeSimpleTextFormatted', () => {
        let s: string = '<root>Text</root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toString("  ")).toEqual(s);
    });

    it('writeChild', () => {
        let s: string = '<root><cc></cc></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toString()).toEqual('<root><cc/></root>');
        expect(xml.toString("  ")).toEqual('<root>\n  <cc/>\n</root>');
        expect(xml.toString("    ")).toEqual('<root>\n    <cc/>\n</root>');
    });

    it('writeMultiChild', () => {
        let s: string = '<root><cc></cc><cc></cc></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toString()).toEqual('<root><cc/><cc/></root>');
        expect(xml.toString("  ")).toEqual('<root>\n  <cc/>\n  <cc/>\n</root>');
        expect(xml.toString("    ")).toEqual('<root>\n    <cc/>\n    <cc/>\n</root>');
    });

    it('writeXmlHeadTest', () => {
        let s: string = '<?xml version="1.0" encoding="utf-8"?><root></root>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toString(undefined, true)).toEqual('<?xml version="1.0" encoding="utf-8"?><root/>');
        expect(xml.toString("  ", true)).toEqual('<?xml version="1.0" encoding="utf-8"?>\n<root/>');
    });

    it('writeDoctype', () => {
        let s: string = '<!DOCTYPE html><test/>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        expect(xml.toString()).toEqual(s);
        expect(xml.toString("  ")).toEqual('<!DOCTYPE html>\n<test/>');
    });

    it('writeEscapedAttributeValues', () => {
        let s: string = '<test/>';
        let xml: XmlDocument = new XmlDocument();
        xml.parse(s);
        xml.documentElement!.attributes.set("lt", "<");
        xml.documentElement!.attributes.set("gt", ">");
        xml.documentElement!.attributes.set("amp", "&");
        xml.documentElement!.attributes.set("apos", "'");
        xml.documentElement!.attributes.set("quot", "\"");
        expect(xml.toString()).toEqual('<test lt="&lt;" gt="&gt;" amp="&amp;" apos="&apos;" quot="&quot;"/>');
    });

});
