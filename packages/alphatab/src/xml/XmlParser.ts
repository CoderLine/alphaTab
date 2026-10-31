import { XmlError } from '@coderline/alphatab/xml/XmlError';
import { XmlNode, XmlNodeType } from '@coderline/alphatab/xml/XmlNode';

/**
 * A non-validating XML parser building a {@link XmlNode} tree in a single forward pass.
 *
 * It covers what the XML based file formats need: elements, attributes, character data with
 * the predefined entities and character references, CDATA sections and the document type declaration.
 * Comments and processing instructions are skipped, other entities are kept as written.
 * See {@link XmlNode} on how character data is represented.
 * @internal
 */
export class XmlParser {
    private static readonly _charTab = 0x09;
    private static readonly _charLineFeed = 0x0a;
    private static readonly _charCarriageReturn = 0x0d;
    private static readonly _charSpace = 0x20;
    private static readonly _charExclamation = 0x21;
    private static readonly _charDoubleQuote = 0x22;
    private static readonly _charHash = 0x23;
    private static readonly _charAmpersand = 0x26;
    private static readonly _charSingleQuote = 0x27;
    private static readonly _charSlash = 0x2f;
    private static readonly _charSemicolon = 0x3b;
    private static readonly _charLessThan = 0x3c;
    private static readonly _charEquals = 0x3d;
    private static readonly _charGreaterThan = 0x3e;
    private static readonly _charQuestion = 0x3f;
    private static readonly _charBracketOpen = 0x5b;
    private static readonly _charBracketClose = 0x5d;
    private static readonly _charLowerX = 0x78;
    private static readonly _charByteOrderMark = 0xfeff;

    // longest entity reference we resolve (e.g. &#x10FFFF;) to avoid scanning far on stray ampersands
    private static readonly _maxEntityLength = 10;

    private readonly _xml: string;
    private readonly _length: number;
    private _pos: number = 0;
    // the ancestors of the element currently being filled
    private readonly _openElements: XmlNode[] = [];

    private constructor(xml: string) {
        this._xml = xml;
        this._length = xml.length;
    }

    /**
     * Parses the given XML and adds the read nodes to the given document.
     * @throws {XmlError} if the XML is malformed.
     */
    public static parse(xml: string, document: XmlNode): void {
        new XmlParser(xml)._parseDocument(document);
    }

    private _parseDocument(document: XmlNode) {
        const xml = this._xml;
        if (this._length > 0 && xml.charCodeAt(0) === XmlParser._charByteOrderMark) {
            this._pos = 1;
        }

        let current = document;
        while (this._pos < this._length) {
            if (xml.charCodeAt(this._pos) !== XmlParser._charLessThan) {
                this._readCharacterData(current);
                continue;
            }

            switch (xml.charCodeAt(this._pos + 1)) {
                case XmlParser._charSlash:
                    current = this._readEndTag(current);
                    break;
                case XmlParser._charQuestion:
                    this._pos = this._indexAfter('?>', this._pos + 2, 'processing instruction');
                    break;
                case XmlParser._charExclamation:
                    this._readDeclaration(current);
                    break;
                default:
                    current = this._readStartTag(current);
                    break;
            }
        }

        if (current !== document) {
            throw new XmlError(`Unexpected end of document, missing </${current.localName}>`, xml, this._pos);
        }
    }

    /**
     * Reads a run of character data up to the next markup.
     */
    private _readCharacterData(current: XmlNode) {
        const xml = this._xml;
        let firstContent = -1;
        let lastContent = -1;
        let hasReference = false;

        let p = this._pos;
        while (p < this._length) {
            const c = xml.charCodeAt(p);
            if (c === XmlParser._charLessThan) {
                break;
            }
            if (!XmlParser._isWhitespace(c)) {
                if (firstContent === -1) {
                    firstContent = p;
                }
                lastContent = p;
                if (c === XmlParser._charAmpersand) {
                    hasReference = true;
                }
            }
            p++;
        }
        this._pos = p;

        // formatting whitespace and character data outside the root element is not relevant
        if (firstContent === -1 || current.nodeType !== XmlNodeType.Element) {
            return;
        }

        const text = hasReference
            ? this._decode(firstContent, lastContent + 1)
            : xml.substring(firstContent, lastContent + 1);
        current.appendText(text, false);
    }

    /**
     * Reads a start tag (or empty element tag) including its attributes.
     * @returns The element which receives the following content.
     */
    private _readStartTag(parent: XmlNode): XmlNode {
        const xml = this._xml;
        this._pos++; // <
        const element = new XmlNode(XmlNodeType.Element, this._readName('element name'));
        parent.addChild(element);

        while (true) {
            this._skipWhitespace();
            if (this._pos >= this._length) {
                break;
            }

            const c = xml.charCodeAt(this._pos);
            if (c === XmlParser._charGreaterThan) {
                this._pos++;
                this._openElements.push(parent);
                return element;
            }

            if (c === XmlParser._charSlash) {
                this._expect(this._pos + 1, XmlParser._charGreaterThan, "'>' after '/'");
                this._pos += 2;
                return parent;
            }

            const name = this._readName('attribute name');
            this._skipWhitespace();
            this._expect(this._pos, XmlParser._charEquals, `'=' after attribute ${name}`);
            this._pos++;
            this._skipWhitespace();
            element.attributes.set(name, this._readAttributeValue(name));
        }

        throw new XmlError(`Unexpected end of document in tag <${element.localName}>`, xml, this._pos);
    }

    private _readAttributeValue(name: string): string {
        const xml = this._xml;
        const quote = this._pos < this._length ? xml.charCodeAt(this._pos) : 0;
        if (quote !== XmlParser._charDoubleQuote && quote !== XmlParser._charSingleQuote) {
            throw new XmlError(`Expected quoted value for attribute ${name}`, xml, this._pos);
        }

        const start = this._pos + 1;
        let hasReference = false;
        let p = start;
        while (p < this._length) {
            const c = xml.charCodeAt(p);
            if (c === quote) {
                this._pos = p + 1;
                return hasReference ? this._decode(start, p) : xml.substring(start, p);
            }
            if (c === XmlParser._charAmpersand) {
                hasReference = true;
            }
            p++;
        }

        throw new XmlError(`Unterminated value for attribute ${name}`, xml, start);
    }

    /**
     * Reads an end tag and checks that it closes the current element.
     * @returns The parent of the closed element.
     */
    private _readEndTag(current: XmlNode): XmlNode {
        const xml = this._xml;
        const nameStart = this._pos + 2; // </
        let p = nameStart;
        while (p < this._length && !XmlParser._isNameEnd(xml.charCodeAt(p))) {
            p++;
        }

        // compare in place to avoid allocating the name of every end tag
        const name = current.localName;
        let matches = current.nodeType === XmlNodeType.Element && p - nameStart === name.length;
        for (let i = 0; matches && i < name.length; i++) {
            matches = xml.charCodeAt(nameStart + i) === name.charCodeAt(i);
        }
        if (!matches) {
            const expected = current.nodeType === XmlNodeType.Element ? `</${name}>` : 'no end tag';
            throw new XmlError(`Unexpected </${xml.substring(nameStart, p)}>, expected ${expected}`, xml, this._pos);
        }

        this._pos = p;
        this._skipWhitespace();
        this._expect(this._pos, XmlParser._charGreaterThan, `'>' to end </${name}>`);
        this._pos++;
        return this._openElements.pop()!;
    }

    /**
     * Reads the markup starting with '<!': comments, CDATA sections and the document type declaration.
     */
    private _readDeclaration(current: XmlNode) {
        const xml = this._xml;
        if (this._isAt('<!--', false)) {
            this._pos = this._indexAfter('-->', this._pos + 4, 'comment');
        } else if (this._isAt('<![CDATA[', false)) {
            const start = this._pos + 9;
            this._pos = this._indexAfter(']]>', start, 'CDATA section');
            if (current.nodeType === XmlNodeType.Element) {
                current.appendText(xml.substring(start, this._pos - 3), true);
            }
        } else if (this._isAt('<!DOCTYPE', true)) {
            this._pos += 9;
            this._skipWhitespace();
            const start = this._pos;
            // the internal subset in brackets can contain '>'
            let depth = 0;
            while (this._pos < this._length) {
                const c = xml.charCodeAt(this._pos);
                if (c === XmlParser._charBracketOpen) {
                    depth++;
                } else if (c === XmlParser._charBracketClose) {
                    depth--;
                } else if (c === XmlParser._charGreaterThan && depth <= 0) {
                    break;
                }
                this._pos++;
            }
            if (this._pos >= this._length) {
                throw new XmlError('Unterminated document type declaration', xml, start);
            }

            if (current.nodeType === XmlNodeType.Document) {
                const docType = new XmlNode(XmlNodeType.DocumentType);
                docType.innerText = xml.substring(start, this._pos).trim();
                current.addChild(docType);
            }
            this._pos++;
        } else {
            throw new XmlError('Unsupported markup declaration', xml, this._pos);
        }
    }

    /**
     * Decodes the character data in the given range resolving entity and character references.
     */
    private _decode(start: number, end: number): string {
        const xml = this._xml;
        let result = '';
        let segmentStart = start;
        let p = start;
        while (p < end) {
            if (xml.charCodeAt(p) !== XmlParser._charAmpersand) {
                p++;
                continue;
            }

            const nameStart = p + 1;
            let semicolon = nameStart;
            const maxEnd = Math.min(end, nameStart + XmlParser._maxEntityLength);
            while (semicolon < maxEnd && xml.charCodeAt(semicolon) !== XmlParser._charSemicolon) {
                semicolon++;
            }

            const resolved =
                semicolon < maxEnd ? XmlParser._resolveReference(xml.substring(nameStart, semicolon)) : null;
            if (resolved === null) {
                // keep unknown references as written
                p++;
                continue;
            }

            result += xml.substring(segmentStart, p);
            result += resolved;
            p = semicolon + 1;
            segmentStart = p;
        }

        return result + xml.substring(segmentStart, end);
    }

    private static _resolveReference(name: string): string | null {
        switch (name) {
            case 'lt':
                return '<';
            case 'gt':
                return '>';
            case 'amp':
                return '&';
            case 'quot':
                return '"';
            case 'apos':
                return "'";
        }

        if (name.length < 2 || name.charCodeAt(0) !== XmlParser._charHash) {
            return null;
        }

        const isHex = name.charCodeAt(1) === XmlParser._charLowerX;
        const digits = name.substring(isHex ? 2 : 1);
        const codePoint = Number.parseInt(digits, isHex ? 16 : 10);
        if (Number.isNaN(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
            return null;
        }
        return String.fromCodePoint(codePoint);
    }

    private _readName(kind: string): string {
        const xml = this._xml;
        const start = this._pos;
        while (this._pos < this._length && !XmlParser._isNameEnd(xml.charCodeAt(this._pos))) {
            this._pos++;
        }
        if (this._pos === start) {
            throw new XmlError(`Expected ${kind}`, xml, start);
        }
        return xml.substring(start, this._pos);
    }

    /**
     * Finds the given terminator starting at the given position.
     * @returns The position after the terminator.
     */
    private _indexAfter(terminator: string, from: number, construct: string): number {
        const index = this._xml.indexOf(terminator, from);
        if (index === -1) {
            throw new XmlError(`Unterminated ${construct}`, this._xml, this._pos);
        }
        return index + terminator.length;
    }

    private _isAt(text: string, ignoreCase: boolean): boolean {
        const xml = this._xml;
        if (this._pos + text.length > this._length) {
            return false;
        }
        for (let i = 0; i < text.length; i++) {
            let actual = xml.charCodeAt(this._pos + i);
            let expected = text.charCodeAt(i);
            if (ignoreCase) {
                actual = XmlParser._toUpperAscii(actual);
                expected = XmlParser._toUpperAscii(expected);
            }
            if (actual !== expected) {
                return false;
            }
        }
        return true;
    }

    private _expect(position: number, expected: number, description: string) {
        if (position >= this._length || this._xml.charCodeAt(position) !== expected) {
            throw new XmlError(`Expected ${description}`, this._xml, position);
        }
    }

    private _skipWhitespace() {
        const xml = this._xml;
        while (this._pos < this._length && XmlParser._isWhitespace(xml.charCodeAt(this._pos))) {
            this._pos++;
        }
    }

    private static _toUpperAscii(c: number): number {
        return c >= 0x61 && c <= 0x7a ? c - 0x20 : c;
    }

    private static _isWhitespace(c: number): boolean {
        return (
            c === XmlParser._charSpace ||
            c === XmlParser._charLineFeed ||
            c === XmlParser._charCarriageReturn ||
            c === XmlParser._charTab
        );
    }

    private static _isNameEnd(c: number): boolean {
        return (
            XmlParser._isWhitespace(c) ||
            c === XmlParser._charGreaterThan ||
            c === XmlParser._charSlash ||
            c === XmlParser._charEquals ||
            c === XmlParser._charLessThan
        );
    }
}
