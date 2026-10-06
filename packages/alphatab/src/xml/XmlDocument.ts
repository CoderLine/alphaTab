import { XmlNode, XmlNodeType } from '@coderline/alphatab/xml/XmlNode';
import { XmlParser } from '@coderline/alphatab/xml/XmlParser';
import { XmlWriter } from '@coderline/alphatab/xml/XmlWriter';

/**
 * The root of a {@link XmlNode} tree, holding the document type and the root element.
 * @internal
 */
export class XmlDocument extends XmlNode {
    public constructor() {
        super(XmlNodeType.Document);
    }

    /**
     * Parses the given XML and adds the read nodes to this document.
     * @throws {XmlError} if the XML is malformed.
     */
    public parse(xml: string) {
        XmlParser.parse(xml, this);
    }

    public override toString() {
        return this.toFormattedString();
    }

    public toFormattedString(indention: string = '', xmlHeader: boolean = false): string {
        return XmlWriter.write(this, indention, xmlHeader);
    }
}
