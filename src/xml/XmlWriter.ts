import { XmlNode, XmlNodeType } from './XmlNode';

export class XmlWriter {
    public static write(xml: XmlNode, indention: string, xmlHeader: boolean): string {
        const writer = new XmlWriter(indention, xmlHeader);
        writer.writeNode(xml);
        return writer.toString();
    }

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
            case XmlNodeType.None:
                break;
            case XmlNodeType.Element:
                if (this._result.length > 0) {
                    this.writeLine();
                }
                this.write(`<${xml.localName}`);
                for (const [name, value] of xml.attributes) {
                    this.write(` ${name}="`);
                    this.writeAttributeValue(value);
                    this.write('"');
                }

                if (xml.childNodes.length === 0) {
                    this.write('/>');
                } else {
                    this.write('>');
                    if (xml.childNodes.length === 1 && !xml.firstElement) {
                        this.writeNode(xml.childNodes[0]);
                    } else {
                        this.indent();
                        for (const child of xml.childNodes) {
                            // skip text nodes in case of multiple children
                            if (child.nodeType === XmlNodeType.Element) {
                                this.writeNode(child);
                            }
                        }
                        this.unindend();
                        this.writeLine();
                    }
                    this.write(`</${xml.localName}>`);
                }
                break;
            case XmlNodeType.Text:
                if (xml.value) {
                    this.write(xml.value);
                }
                break;
            case XmlNodeType.CDATA:
                if (xml.value !== null) {
                    this.write(`<![CDATA[${xml.value}]]>`);
                }
                break;
            case XmlNodeType.Document:
                if (this._xmlHeader) {
                    this.write('<?xml version="1.0" encoding="utf-8"?>');
                }
                for (const child of xml.childNodes) {
                    this.writeNode(child);
                }
                break;
            case XmlNodeType.DocumentType:
                this.write(`<!DOCTYPE ${xml.value}>`);
                break;
        }
    }

    private unindend() {
        this._currentIndention = this._currentIndention.substr(
            0,
            this._currentIndention.length - this._indention.length
        );
    }
    private indent() {
        this._currentIndention += this._indention;
    }

    private writeAttributeValue(value: string) {
        for (let i = 0; i < value.length; i++) {
            const c = value.charAt(i);
            switch (c) {
                case '<':
                    this._result.push('&lt;');
                    break;
                case '>':
                    this._result.push('&gt;');
                    break;
                case '&':
                    this._result.push('&amp;');
                    break;
                case "'":
                    this._result.push('&apos;');
                    break;
                case '"':
                    this._result.push('&quot;');
                    break;
                default:
                    this._result.push(c);
                    break;
            }
        }
    }

    private write(s: string) {
        if (this._isStartOfLine) {
            this._result.push(this._currentIndention);
        }
        this._result.push(s);
        this._isStartOfLine = false;
    }

    private writeLine(s: string | null = null) {
        if (s) {
            this.write(s);
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
