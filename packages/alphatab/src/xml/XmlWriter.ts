import { type XmlNode, XmlNodeType } from '@coderline/alphatab/xml/XmlNode';

/**
 * @internal
 */
export class XmlWriter {
    // NOTE: we use the string.join variant rather than the
    // string concatenation for IE performnace concerns
    private _result: string[] = [];
    private _indention: string;
    private _xmlHeader: boolean;

    private _isStartOfLine: boolean;
    private _currentIndention: string;

    public constructor(indention: string, xmlHeader: boolean) {
        this._indention = indention;
        this._xmlHeader = xmlHeader;
        this._currentIndention = '';
        this._isStartOfLine = true;
    }

    public writeNode(xml: XmlNode) {
        switch (xml.nodeType) {
            case XmlNodeType.Element:
                if (this._result.length > 0) {
                    this._writeLine();
                }
                this._write(`<${xml.localName}`);
                if (xml.hasAttributes) {
                    for (const [name, value] of xml.attributes) {
                        this._write(` ${name}="`);
                        this._writeEscaped(value, true);
                        this._write('"');
                    }
                }

                const children = xml.childNodes;
                if (children.length > 0) {
                    this._write('>');
                    this._indent();
                    for (const child of children) {
                        this.writeNode(child);
                    }
                    this._unindend();
                    this._writeLine();
                    this._write(`</${xml.localName}>`);
                } else if (!xml.hasText) {
                    this._write('/>');
                } else {
                    this._write('>');
                    if (xml.isCData) {
                        this._write(`<![CDATA[${xml.innerText}]]>`);
                    } else {
                        this._writeEscaped(xml.innerText, false);
                    }
                    this._write(`</${xml.localName}>`);
                }
                break;
            case XmlNodeType.Document:
                if (this._xmlHeader) {
                    this._write('<?xml version="1.0" encoding="utf-8"?>');
                }
                for (const child of xml.childNodes) {
                    this.writeNode(child);
                }
                break;
            case XmlNodeType.DocumentType:
                this._writeLine();
                this._write(`<!DOCTYPE ${xml.innerText}>`);
                break;
            case XmlNodeType.Comment:
                this._writeLine();
                this._write(`<!-- ${xml.innerText} -->`);
                break;
        }
    }

    private _unindend() {
        this._currentIndention = this._currentIndention.substr(
            0,
            this._currentIndention.length - this._indention.length
        );
    }
    private _indent() {
        this._currentIndention += this._indention;
    }

    private _writeEscaped(value: string, isAttribute: boolean) {
        for (let i = 0; i < value.length; i++) {
            const c = value.charAt(i);
            switch (c) {
                case '<':
                    this._result.push('&lt;');
                    break;
                case '>':
                    // only required in attributes, in text it is kept as written (e.g. Guitar Pro writes <MultiVoice>1></MultiVoice>)
                    this._result.push(isAttribute ? '&gt;' : c);
                    break;
                case '&':
                    this._result.push('&amp;');
                    break;
                case "'":
                    this._result.push(isAttribute ? '&apos;' : c);
                    break;
                case '"':
                    this._result.push(isAttribute ? '&quot;' : c);
                    break;
                default:
                    this._result.push(c);
                    break;
            }
        }
    }

    public static write(xml: XmlNode, indention: string, xmlHeader: boolean): string {
        const writer = new XmlWriter(indention, xmlHeader);
        writer.writeNode(xml);
        return writer.toString();
    }

    private _write(s: string) {
        if (this._isStartOfLine) {
            this._result.push(this._currentIndention);
        }
        this._result.push(s);
        this._isStartOfLine = false;
    }

    private _writeLine(s: string | null = null) {
        if (s) {
            this._write(s);
        }
        if (this._indention.length > 0 && !this._isStartOfLine) {
            this._result.push('\n');
            this._isStartOfLine = true;
        }
    }

    public toString() {
        return this._result.join('').trimRight();
    }
}
