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

import { XmlError } from '@src/xml/XmlError';
import { XmlNode, XmlNodeType } from '@src/xml/XmlNode';

enum XmlState {
    IgnoreSpaces,
    Begin,
    BeginNode,
    TagName,
    Body,
    AttribName,
    Equals,
    AttvalBegin,
    AttribVal,
    Childs,
    Close,
    WaitEnd,
    WaitEndRet,
    Pcdata,
    Header,
    Comment,
    Doctype,
    Cdata,
    Escape
}

export class XmlParser {
    public static readonly CharCodeLF: number = 10;
    public static readonly CharCodeTab: number = 9;
    public static readonly CharCodeCR: number = 13;
    public static readonly CharCodeSpace: number = 32;
    public static readonly CharCodeLowerThan: number = 60;
    public static readonly CharCodeAmp: number = 38;
    public static readonly CharCodeBrackedClose: number = 93;
    public static readonly CharCodeBrackedOpen: number = 91;
    public static readonly CharCodeGreaterThan: number = 62;
    public static readonly CharCodeExclamation: number = 33;
    public static readonly CharCodeUpperD: number = 68;
    public static readonly CharCodeLowerD: number = 100;
    public static readonly CharCodeMinus: number = 45;
    public static readonly CharCodeQuestion: number = 63;
    public static readonly CharCodeSlash: number = 47;
    public static readonly CharCodeEquals: number = 61;
    public static readonly CharCodeDoubleQuote: number = 34;
    public static readonly CharCodeSingleQuote: number = 39;
    public static readonly CharCodeSharp: number = 35;
    public static readonly CharCodeLowerX: number = 120;
    public static readonly CharCodeLowerA: number = 97;
    public static readonly CharCodeLowerZ: number = 122;
    public static readonly CharCodeUpperA: number = 65;
    public static readonly CharCodeUpperZ: number = 90;
    public static readonly CharCode0: number = 48;
    public static readonly CharCode9: number = 57;
    public static readonly CharCodeColon: number = 58;
    public static readonly CharCodeDot: number = 46;
    public static readonly CharCodeUnderscore: number = 95;
    public static readonly CharCodeSemi: number = 59;

    private static Escapes: Map<string, string> = new Map<string, string>([
        ['lt', '<'],
        ['gt', '>'],
        ['amp', '&'],
        ['quot', '"'],
        ['apos', "'"]
    ]);

    public static parse(str: string, p: number, parent: XmlNode): number {
        let c: number = str.charCodeAt(p);
        let state: XmlState = XmlState.Begin;
        let next: XmlState = XmlState.Begin;
        let start: number = 0;
        let buf: string = '';
        let escapeNext: XmlState = XmlState.Begin;
        let xml: XmlNode | null = null;
        let aname: string | null = null;

        let nbrackets: number = 0;

        let attrValQuote: number = 0;

        while (p < str.length) {
            c = str.charCodeAt(p);
            switch (state) {
                case XmlState.IgnoreSpaces:
                    switch (c) {
                        case XmlParser.CharCodeLF:
                        case XmlParser.CharCodeCR:
                        case XmlParser.CharCodeTab:
                        case XmlParser.CharCodeSpace:
                            break;
                        default:
                            state = next;
                            continue;
                    }
                    break;

                case XmlState.Begin:
                    switch (c) {
                        case XmlParser.CharCodeLowerThan:
                            state = XmlState.IgnoreSpaces;
                            next = XmlState.BeginNode;
                            break;
                        default:
                            start = p;
                            state = XmlState.Pcdata;
                            continue;
                    }
                    break;

                case XmlState.Pcdata:
                    if (c === XmlParser.CharCodeLowerThan) {
                        buf += str.substr(start, p - start);
                        let child: XmlNode = new XmlNode();
                        child.nodeType = XmlNodeType.Text;
                        child.value = buf;
                        buf = '';
                        parent.addChild(child);
                        state = XmlState.IgnoreSpaces;
                        next = XmlState.BeginNode;
                    } else if (c === XmlParser.CharCodeAmp) {
                        buf += str.substr(start, p - start);
                        state = XmlState.Escape;
                        escapeNext = XmlState.Pcdata;
                        start = p + 1;
                    }
                    break;

                case XmlState.Cdata:
                    if (
                        c === XmlParser.CharCodeBrackedClose &&
                        str.charCodeAt(p + 1) === XmlParser.CharCodeBrackedClose &&
                        str.charCodeAt(p + 2) === XmlParser.CharCodeGreaterThan
                    ) {
                        // ]]>
                        let child: XmlNode = new XmlNode();
                        child.nodeType = XmlNodeType.CDATA;
                        child.value = str.substr(start, p - start);
                        parent.addChild(child);
                        p += 2;
                        state = XmlState.Begin;
                    }
                    break;

                case XmlState.BeginNode:
                    switch (c) {
                        case XmlParser.CharCodeExclamation:
                            if (str.charCodeAt(p + 1) === XmlParser.CharCodeBrackedOpen) {
                                p += 2;
                                if (str.substr(p, 6).toUpperCase() !== 'CDATA[') {
                                    throw new XmlError('Expected <![CDATA[', str, p);
                                }
                                p += 5;
                                state = XmlState.Cdata;
                                start = p + 1;
                            } else if (
                                str.charCodeAt(p + 1) === XmlParser.CharCodeUpperD ||
                                str.charCodeAt(p + 1) === XmlParser.CharCodeLowerD
                            ) {
                                if (str.substr(p + 2, 6).toUpperCase() !== 'OCTYPE') {
                                    throw new XmlError('Expected <!DOCTYPE', str, p);
                                }
                                p += 8;
                                state = XmlState.Doctype;
                                start = p + 1;
                            } else if (
                                str.charCodeAt(p + 1) !== XmlParser.CharCodeMinus ||
                                str.charCodeAt(p + 2) !== XmlParser.CharCodeMinus
                            ) {
                                throw new XmlError('Expected <!--', str, p);
                            } else {
                                p += 2;
                                state = XmlState.Comment;
                                start = p + 1;
                            }
                            break;
                        case XmlParser.CharCodeQuestion:
                            state = XmlState.Header;
                            start = p;
                            break;
                        case XmlParser.CharCodeSlash:
                            if (!parent) {
                                throw new XmlError('Expected node name', str, p);
                            }
                            start = p + 1;
                            state = XmlState.IgnoreSpaces;
                            next = XmlState.Close;
                            break;
                        default:
                            state = XmlState.TagName;
                            start = p;
                            continue;
                    }
                    break;

                case XmlState.TagName:
                    if (!XmlParser.isValidChar(c)) {
                        if (p === start) {
                            throw new XmlError('Expected node name', str, p);
                        }
                        xml = new XmlNode();
                        xml.nodeType = XmlNodeType.Element;
                        xml.localName = str.substr(start, p - start);
                        parent.addChild(xml);
                        state = XmlState.IgnoreSpaces;
                        next = XmlState.Body;
                        continue;
                    }
                    break;

                case XmlState.Body:
                    switch (c) {
                        case XmlParser.CharCodeSlash:
                            state = XmlState.WaitEnd;
                            break;
                        case XmlParser.CharCodeGreaterThan:
                            state = XmlState.Childs;
                            break;
                        default:
                            state = XmlState.AttribName;
                            start = p;
                            continue;
                    }
                    break;

                case XmlState.AttribName:
                    if (!XmlParser.isValidChar(c)) {
                        if (start === p) {
                            throw new XmlError('Expected attribute name', str, p);
                        }
                        let tmp: string = str.substr(start, p - start);
                        aname = tmp;
                        if (xml!.attributes.has(aname)) {
                            throw new XmlError(`Duplicate attribute [${aname}]`, str, p);
                        }
                        state = XmlState.IgnoreSpaces;
                        next = XmlState.Equals;
                        continue;
                    }
                    break;

                case XmlState.Equals:
                    switch (c) {
                        case XmlParser.CharCodeEquals:
                            state = XmlState.IgnoreSpaces;
                            next = XmlState.AttvalBegin;
                            break;
                        default:
                            throw new XmlError('Expected =', str, p);
                    }
                    break;

                case XmlState.AttvalBegin:
                    switch (c) {
                        case XmlParser.CharCodeDoubleQuote:
                        case XmlParser.CharCodeSingleQuote:
                            buf = '';
                            state = XmlState.AttribVal;
                            start = p + 1;
                            attrValQuote = c;
                            break;
                    }
                    break;

                case XmlState.AttribVal:
                    switch (c) {
                        case XmlParser.CharCodeAmp:
                            buf += str.substr(start, p - start);
                            state = XmlState.Escape;
                            escapeNext = XmlState.AttribVal;
                            start = p + 1;
                            break;
                        default:
                            if (c === attrValQuote) {
                                buf += str.substr(start, p - start);
                                let val: string = buf;
                                buf = '';
                                xml!.attributes.set(aname!, val);
                                state = XmlState.IgnoreSpaces;
                                next = XmlState.Body;
                            }
                            break;
                    }
                    break;

                case XmlState.Childs:
                    p = XmlParser.parse(str, p, xml!);
                    start = p;
                    state = XmlState.Begin;
                    break;

                case XmlState.WaitEnd:
                    switch (c) {
                        case XmlParser.CharCodeGreaterThan:
                            state = XmlState.Begin;
                            break;
                        default:
                            throw new XmlError('Expected >', str, p);
                    }
                    break;

                case XmlState.WaitEndRet:
                    switch (c) {
                        case XmlParser.CharCodeGreaterThan:
                            return p;
                        default:
                            throw new XmlError('Expected >', str, p);
                    }

                case XmlState.Close:
                    if (!XmlParser.isValidChar(c)) {
                        if (start === p) {
                            throw new XmlError('Expected node name', str, p);
                        }
                        let v: string = str.substr(start, p - start);
                        if (v !== parent.localName) {
                            throw new XmlError('Expected </' + parent.localName + '>', str, p);
                        }
                        state = XmlState.IgnoreSpaces;
                        next = XmlState.WaitEndRet;
                        continue;
                    }
                    break;

                case XmlState.Comment:
                    if (
                        c === XmlParser.CharCodeMinus &&
                        str.charCodeAt(p + 1) === XmlParser.CharCodeMinus &&
                        str.charCodeAt(p + 2) === XmlParser.CharCodeGreaterThan
                    ) {
                        p += 2;
                        state = XmlState.Begin;
                    }
                    break;

                case XmlState.Doctype:
                    if (c === XmlParser.CharCodeBrackedOpen) {
                        nbrackets++;
                    } else if (c === XmlParser.CharCodeBrackedClose) {
                        nbrackets--;
                    } else if (c === XmlParser.CharCodeGreaterThan && nbrackets === 0) {
                        // >
                        let node: XmlNode = new XmlNode();
                        node.nodeType = XmlNodeType.DocumentType;
                        node.value = str.substr(start, p - start);
                        parent.addChild(node);
                        state = XmlState.Begin;
                    }
                    break;

                case XmlState.Header:
                    if (c === XmlParser.CharCodeQuestion && str.charCodeAt(p + 1) === XmlParser.CharCodeGreaterThan) {
                        p++;
                        state = XmlState.Begin;
                    }
                    break;

                case XmlState.Escape:
                    if (c === XmlParser.CharCodeSemi) {
                        let s: string = str.substr(start, p - start);
                        if (s.charCodeAt(0) === XmlParser.CharCodeSharp) {
                            let code: number =
                                s.charCodeAt(1) === XmlParser.CharCodeLowerX
                                    ? parseInt('0' + s.substr(1, s.length - 1))
                                    : parseInt(s.substr(1, s.length - 1));
                            buf += String.fromCharCode(code);
                        } else if (XmlParser.Escapes.has(s)) {
                            buf += XmlParser.Escapes.get(s);
                        } else {
                            buf += ('&' + s + ';')?.toString();
                        }
                        start = p + 1;
                        state = escapeNext;
                    } else if (!XmlParser.isValidChar(c) && c !== XmlParser.CharCodeSharp) {
                        buf += '&';
                        buf += str.substr(start, p - start);
                        p--;
                        start = p + 1;
                        state = escapeNext;
                    }
                    break;
            }

            p++;
        }

        if (state === XmlState.Begin) {
            start = p;
            state = XmlState.Pcdata;
        }

        if (state === XmlState.Pcdata) {
            if (p !== start) {
                buf += str.substr(start, p - start);
                let node: XmlNode = new XmlNode();
                node.nodeType = XmlNodeType.Text;
                node.value = buf;
                parent.addChild(node);
            }
            return p;
        }
        if (state === XmlState.Escape && escapeNext === XmlState.Pcdata) {
            buf += '&';
            buf += str.substr(start, p - start);
            let node: XmlNode = new XmlNode();
            node.nodeType = XmlNodeType.Text;
            node.value = buf;
            parent.addChild(node);
            return p;
        }
        throw new XmlError('Unexpected end', str, p);
    }

    private static isValidChar(c: number): boolean {
        return (
            (c >= XmlParser.CharCodeLowerA && c <= XmlParser.CharCodeLowerZ) ||
            (c >= XmlParser.CharCodeUpperA && c <= XmlParser.CharCodeUpperZ) ||
            (c >= XmlParser.CharCode0 && c <= XmlParser.CharCode9) ||
            c === XmlParser.CharCodeColon ||
            c === XmlParser.CharCodeDot ||
            c === XmlParser.CharCodeUnderscore ||
            c === XmlParser.CharCodeMinus
        );
    }
}
