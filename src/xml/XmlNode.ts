// This XML parser is based on the XML Parser of the Haxe Standard Library (MIT)
/*
 * Copyright (C)2005-2019 Haxe Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

export enum XmlNodeType {
    None,
    Element,
    Attribute,
    Text,
    CDATA,
    EntityReference,
    Entity,
    ProcessingInstruction,
    Comment,
    Document,
    DocumentType,
    DocumentFragment,
    Notation,
    Whitespace,
    SignificantWhitespace,
    EndElement,
    EndEntity,
    XmlDeclaration
}

export class XmlNode {
    public nodeType: XmlNodeType = XmlNodeType.None;
    public localName: string | null = null;
    public value: string | null = null;
    public childNodes: XmlNode[] = [];
    public attributes: Map<string, string> = new Map<string, string>();
    public firstChild: XmlNode | null = null;
    public firstElement: XmlNode | null = null;

    public addChild(node: XmlNode): void {
        this.childNodes.push(node);
        this.firstChild = node;
        if (node.nodeType === XmlNodeType.Element) {
            this.firstElement = node;
        }
    }

    public getAttribute(name: string): string {
        if (this.attributes.has(name)) {
            return this.attributes.get(name)!;
        }
        return '';
    }

    public getElementsByTagName(name: string, recursive: boolean = false): XmlNode[] {
        let tags: XmlNode[] = [];
        this.searchElementsByTagName(this.childNodes, tags, name, recursive);
        return tags.splice(0) as any;
    }

    private searchElementsByTagName(all: XmlNode[], result: XmlNode[], name: string, recursive: boolean = false): void {
        for (let c of all) {
            if (c && c.nodeType === XmlNodeType.Element && c.localName === name) {
                result.push(c);
            }
            if (recursive) {
                this.searchElementsByTagName(c.childNodes, result, name, true);
            }
        }
    }

    public findChildElement(name: string): XmlNode | null {
        for (let c of this.childNodes) {
            if (c && c.nodeType === XmlNodeType.Element && c.localName === name) {
                return c;
            }
        }
        return null;
    }

    public get innerText(): string {
        if (this.nodeType === XmlNodeType.Element || this.nodeType === XmlNodeType.Document) {
            let txt: string = '';
            for (let c of this.childNodes) {
                txt += c.innerText?.toString();
            }
            let s: string = txt;
            return s.trim();
        }
        return this.value ?? '';
    }
}
