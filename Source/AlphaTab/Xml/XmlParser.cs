// This XML parser is based on the XML Parser of the Haxe Standard Library (MIT)
/*
 * Copyright (C)2005-2017 Haxe Foundation
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
using AlphaTab.Collections;
using AlphaTab.Platform;

namespace AlphaTab.Xml
{
    public class XmlParser
    {
        public const int CharCodeLF = '\n';
        public const int CharCodeTab = '\t';
        public const int CharCodeCR = '\r';
        public const int CharCodeSpace = ' ';
        public const int CharCodeLowerThan = '<';
        public const int CharCodeAmp = '&';
        public const int CharCodeBrackedClose = ']';
        public const int CharCodeBrackedOpen = '[';
        public const int CharCodeGreaterThan = '>';
        public const int CharCodeExclamation = '!';
        public const int CharCodeUpperD = 'D';
        public const int CharCodeLowerD = 'd';
        public const int CharCodeMinus = '-';
        public const int CharCodeQuestion = '?';
        public const int CharCodeSlash = '/';
        public const int CharCodeEquals = '=';
        public const int CharCodeDoubleQuote = '"';
        public const int CharCodeSingleQuote = '\'';
        public const int CharCodeSharp = '#';
        public const int CharCodeLowerX = 'x';
        public const int CharCodeLowerA = 'a';
        public const int CharCodeLowerZ = 'z';
        public const int CharCodeUpperA = 'A';
        public const int CharCodeUpperZ = 'Z';
        public const int CharCode0 = '0';
        public const int CharCode9 = '0';
        public const int CharCodeColon = ':';
        public const int CharCodeDot = '.';
        public const int CharCodeUnderscore = '_';

        private static readonly FastDictionary<string, string> Escapes;

        static XmlParser()
        {
            Escapes = new FastDictionary<string, string>();
            Escapes["lt"] = "<";
            Escapes["gt"] = ">";
            Escapes["amp"] = "&";
            Escapes["quot"] = "\"";
            Escapes["apos"] = "'";
        }

        public static int Parse(string str, int p, XmlNode parent)
        {
            int c = str[p];
            var state = XmlState.BEGIN;
            var next = XmlState.BEGIN;
            var start = 0;
            var buf = new StringBuilder();
            var escapeNext = XmlState.BEGIN;
            XmlNode xml = null;
            string aname = null;

            int nbrackets = 0;

            int attrValQuote = 0;

            while (p < str.Length)
            {
                c = str[p];
                switch (state)
                {
                    case XmlState.IGNORE_SPACES:
                        // IGNORE_SPACES
                        switch (c)
                        {
                            case CharCodeLF:
                            case CharCodeCR:
                            case CharCodeTab:
                            case CharCodeSpace:
                                break;
                            default:
                                state = next;
                                continue;
                        }
                        break;

                    case XmlState.BEGIN:
                        // BEGIN
                        switch (c)
                        {
                            case CharCodeLowerThan:
                                // <
                                state = XmlState.IGNORE_SPACES;
                                next = XmlState.BEGIN_NODE;
                                break;
                            default:
                                start = p;
                                state = XmlState.PCDATA;
                                continue;
                        }
                        break;

                    case XmlState.PCDATA:
                        // PCDATA
                        if (c == CharCodeLowerThan)
                        {
                            // <
                            buf.Append(str.Substring(start, p - start));
                            var child = new XmlNode();
                            child.NodeType = XmlNodeType.Text;
                            child.Value = buf.ToString();
                            buf = new StringBuilder();
                            parent.AddChild(child);
                            state = XmlState.IGNORE_SPACES;
                            next = XmlState.BEGIN_NODE;
                        }
                        else if (c == CharCodeAmp)
                        {
                            // &
                            buf.Append(str.Substring(start, p - start));
                            state = XmlState.ESCAPE;
                            escapeNext = XmlState.PCDATA;
                            start = p + 1;
                        }
                        break;

                    case XmlState.CDATA:
                        // CDATA
                        if (c == CharCodeBrackedClose && str[p + 1] == CharCodeBrackedClose && str[p + 2] == CharCodeGreaterThan)
                        {
                            // ]]>
                            var child = new XmlNode();
                            child.NodeType = XmlNodeType.CDATA;
                            child.Value = str.Substring(start, p - start);
                            parent.AddChild(child);
                            p += 2;
                            state = XmlState.BEGIN;
                        }
                        break;

                    case XmlState.BEGIN_NODE:
                        // BEGIN_NODE
                        switch (c)
                        {
                            case CharCodeExclamation:
                                // !
                                if (str[p + 1] == CharCodeBrackedOpen)
                                {
                                    // ]
                                    p += 2;
                                    if (str.Substring(p, 6).ToUpper() != "CDATA[")
                                    {
                                        throw new XmlException("Expected <![CDATA[", str, p);
                                    }
                                    p += 5;
                                    state = XmlState.CDATA;
                                    start = p + 1;
                                }
                                else if (str[p + 1] == CharCodeUpperD || str[p + 1] == CharCodeLowerD)
                                {
                                    // D
                                    if (str.Substring(p + 2, 6).ToUpper() != "OCTYPE")
                                    {
                                        throw new XmlException("Expected <!DOCTYPE", str, p);
                                    }
                                    p += 8;
                                    state = XmlState.DOCTYPE;
                                    start = p + 1;
                                }
                                else if (str[p + 1] != CharCodeMinus || str[p + 2] != CharCodeMinus)
                                {
                                    // --
                                    throw new XmlException("Expected <!--", str, p);
                                }
                                else
                                {
                                    p += 2;
                                    state = XmlState.COMMENT;
                                    start = p + 1;
                                }
                                break;
                            case CharCodeQuestion:
                                // ?
                                state = XmlState.HEADER;
                                start = p;
                                break;
                            case CharCodeSlash:
                                // /
                                if (parent == null)
                                {
                                    throw new XmlException("Expected node name", str, p);
                                }
                                start = p + 1;
                                state = XmlState.IGNORE_SPACES;
                                next = XmlState.CLOSE;
                                break;
                            default:
                                state = XmlState.TAG_NAME;
                                start = p;
                                continue;
                        }
                        break;

                    case XmlState.TAG_NAME:
                        // TAG_NAME
                        if (!IsValidChar(c))
                        {
                            if (p == start)
                            {
                                throw new XmlException("Expected node name", str, p);
                            }
                            xml = new XmlNode();
                            xml.NodeType = XmlNodeType.Element;
                            xml.LocalName = str.Substring(start, p - start);
                            parent.AddChild(xml);
                            state = XmlState.IGNORE_SPACES;
                            next = XmlState.BODY;
                            continue;
                        }
                        break;

                    case XmlState.BODY:
                        // BODY
                        switch (c)
                        {
                            case CharCodeSlash:
                                // /
                                state = XmlState.WAIT_END;
                                break;
                            case CharCodeGreaterThan:
                                // >
                                state = XmlState.CHILDS;
                                break;
                            default:
                                state = XmlState.ATTRIB_NAME;
                                start = p;
                                continue;
                        }
                        break;

                    case XmlState.ATTRIB_NAME:
                        // ATTRIB_NAME
                        if (!IsValidChar(c))
                        {
                            if (start == p)
                            {
                                throw new XmlException("Expected attribute name", str, p);
                            }
                            var tmp = str.Substring(start, p - start);
                            aname = tmp;
                            if (xml.Attributes.ContainsKey(aname))
                            {
                                throw new XmlException("Duplicate attribute [" + aname + "]", str, p);
                            }
                            state = XmlState.IGNORE_SPACES;
                            next = XmlState.EQUALS;
                            continue;
                        }
                        break;

                    case XmlState.EQUALS:
                        // EQUALS
                        switch (c)
                        {
                            case CharCodeEquals:
                                // =
                                state = XmlState.IGNORE_SPACES;
                                next = XmlState.ATTVAL_BEGIN;
                                break;
                            default:
                                throw new XmlException("Expected =", str, p);
                        }
                        break;

                    case XmlState.ATTVAL_BEGIN:
                        // ATTVAL_BEGIN
                        switch (c)
                        {
                            case CharCodeDoubleQuote:
                            case CharCodeSingleQuote:
                                // " '
                                buf = new StringBuilder();
                                state = XmlState.ATTRIB_VAL;
                                start = p + 1;
                                attrValQuote = c;
                                break;
                        }
                        break;

                    case XmlState.ATTRIB_VAL:
                        // ATTRIB_VAL
                        switch (c)
                        {
                            case CharCodeAmp:
                                // &
                                buf.Append(str.Substring(start, p - start));
                                state = XmlState.ESCAPE;
                                escapeNext = XmlState.ATTRIB_VAL;
                                start = p + 1;
                                break;
                            default:
                                if (c == attrValQuote)
                                {
                                    buf.Append(str.Substring(start, p - start));
                                    var val = buf.ToString();
                                    buf = new StringBuilder();
                                    xml.Attributes[aname] = val;
                                    state = XmlState.IGNORE_SPACES;
                                    next = XmlState.BODY;
                                }
                                break;
                        }
                        break;

                    case XmlState.CHILDS:
                        // CHILDS
                        p = Parse(str, p, xml);
                        start = p;
                        state = XmlState.BEGIN;
                        break;

                    case XmlState.WAIT_END:
                        // WAIT_END
                        switch (c)
                        {
                            case CharCodeGreaterThan:
                                // >
                                state = XmlState.BEGIN;
                                break;
                            default:
                                throw new XmlException("Expected >", str, p);
                        }
                        break;
                    case XmlState.WAIT_END_RET:
                        // WAIT_END_RET
                        switch (c)
                        {
                            case CharCodeGreaterThan:
                                // >
                                return p;
                            default:
                                throw new XmlException("Expected >", str, p);
                        }
                    case XmlState.CLOSE:
                        // CLOSE
                        if (!IsValidChar(c))
                        {
                            if (start == p)
                            {
                                throw new XmlException("Expected node name", str, p);
                            }

                            var v = str.Substring(start, p - start);
                            if (v != parent.LocalName)
                            {
                                throw new XmlException("Expected </" + parent.LocalName + ">", str, p);
                            }

                            state = XmlState.IGNORE_SPACES;
                            next = XmlState.WAIT_END_RET;
                            continue;
                        }
                        break;

                    case XmlState.COMMENT:
                        // COMMENT
                        if (c == CharCodeMinus && str[p + 1] == CharCodeMinus && str[p + 2] == CharCodeGreaterThan)
                        {
                            // -->
                            //var comment = new XmlNode();
                            //comment.NodeType = XmlNodeType.Comment;
                            //comment.Value = str.Substring(start, p - start);
                            //parent.AddChild(comment);
                            p += 2;
                            state = XmlState.BEGIN;
                        }
                        break;

                    case XmlState.DOCTYPE:
                        // DOCTYPE
                        if (c == CharCodeBrackedOpen)
                        {
                            // [
                            nbrackets++;
                        }
                        else if (c == CharCodeBrackedClose)
                        {
                            // ]
                            nbrackets--;
                        }
                        else if (c == CharCodeGreaterThan && nbrackets == 0)
                        {
                            // >
                            var node = new XmlNode();
                            node.NodeType = XmlNodeType.DocumentType;
                            node.Value = str.Substring(start, p - start);
                            parent.AddChild(node);
                            state = XmlState.BEGIN;
                        }
                        break;

                    case XmlState.HEADER:
                        // HEADER
                        if (c == CharCodeQuestion && str[p + 1] == CharCodeGreaterThan)
                        {
                            // ?>
                            p++;
                            // skip
                            state = XmlState.BEGIN;
                        }
                        break;

                    case XmlState.ESCAPE:
                        // ESCAPE
                        if (c == (int)';')
                        {
                            // ;
                            var s = str.Substring(start, p - start);
                            if (s[0] == CharCodeSharp)
                            {
                                // #
                                var code = s[1] == CharCodeLowerX
                                    ? Platform.Platform.ParseInt("0" + s.Substring(1, s.Length - 1))
                                    : Platform.Platform.ParseInt(s.Substring(1, s.Length - 1));
                                buf.AppendChar(code);
                            }
                            else if (Escapes.ContainsKey(s))
                            {
                                buf.Append(Escapes[s]);
                            }
                            else
                            {
                                buf.Append("&" + s + ";");
                            }

                            start = p + 1;
                            state = escapeNext;
                        }
                        else if (!IsValidChar(c) && c != CharCodeSharp)
                        {
                            // #
                            buf.Append("&");
                            buf.Append(str.Substring(start, p - start));
                            p--;
                            start = p + 1;
                            state = escapeNext;
                        }
                        break;
                }

                p++;
            }

            if (state == XmlState.BEGIN)
            {
                start = p;
                state = XmlState.PCDATA;
            }

            if (state == XmlState.PCDATA)
            {
                if (p != start)
                {
                    buf.Append(str.Substring(start, p - start));
                    var node = new XmlNode();
                    node.NodeType = XmlNodeType.Text;
                    node.Value = buf.ToString();
                    parent.AddChild(node);
                }
                return p;
            }

            if (state == XmlState.ESCAPE && escapeNext == XmlState.PCDATA)
            {
                buf.Append("&");
                buf.Append(str.Substring(start, p - start));
                var node = new XmlNode();
                node.NodeType = XmlNodeType.Text;
                node.Value = buf.ToString();
                parent.AddChild(node);
                return p;
            }

            throw new XmlException("Unexpected end", str, p);
        }


        private static bool IsValidChar(int c)
        {
            return (c >= CharCodeLowerA && c <= CharCodeLowerZ) || (c >= CharCodeUpperA && c <= CharCodeUpperZ) ||
                   (c >= CharCode0 && c <= CharCode9) || c == CharCodeColon || c == CharCodeDot || c == CharCodeUnderscore ||
                   c == CharCodeMinus;
        }

        /// <summary>
        /// faster than enum
        /// </summary>
        class XmlState
        {
            public const int IGNORE_SPACES = 0;
            public const int BEGIN = 1;
            public const int BEGIN_NODE = 2;
            public const int TAG_NAME = 3;
            public const int BODY = 4;
            public const int ATTRIB_NAME = 5;
            public const int EQUALS = 6;
            public const int ATTVAL_BEGIN = 7;
            public const int ATTRIB_VAL = 8;
            public const int CHILDS = 9;
            public const int CLOSE = 10;
            public const int WAIT_END = 11;
            public const int WAIT_END_RET = 12;
            public const int PCDATA = 13;
            public const int HEADER = 14;
            public const int COMMENT = 15;
            public const int DOCTYPE = 16;
            public const int CDATA = 17;
            public const int ESCAPE = 18;
        }
    }
}
