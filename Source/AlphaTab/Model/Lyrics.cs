/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

using AlphaTab.Collections;

namespace AlphaTab.Model
{
    public class Lyrics
    {
        private const int CharCodeLF = '\n';
        private const int CharCodeTab = '\t';
        private const int CharCodeCR = '\r';
        private const int CharCodeSpace = ' ';
        private const int CharCodeBrackedClose = ']';
        private const int CharCodeBrackedOpen = '[';
        private const int CharCodeDash = '-';

        public int StartBar { get; set; }
        public string Text { get; set; }
        public string[] Chunks { get; set; }

        public void Finish()
        {
            var chunks = new FastList<string>();
            Parse(Text, 0, chunks);
            Chunks = chunks.ToArray();
        }

        private void Parse(string str, int p, FastList<string> chunks)
        {
            if (string.IsNullOrEmpty(str)) return;
            var state = LyricsState.BEGIN;
            var next = LyricsState.BEGIN;
            var skipSpace = false;
            var start = 0;

            while (p < str.Length)
            {
                int c = str[p];
                switch (state)
                {
                    case LyricsState.IGNORE_SPACES:
                        switch (c)
                        {
                            case CharCodeLF:
                            case CharCodeCR:
                            case CharCodeTab:
                                break;
                            case CharCodeSpace:
                                if (!skipSpace)
                                {
                                    state = next;
                                    continue;
                                }
                                break;
                            default:
                                skipSpace = false;
                                state = next;
                                continue;
                        }
                        break;
                    case LyricsState.BEGIN:
                        switch (c)
                        {
                            case CharCodeBrackedOpen:
                                state = LyricsState.COMMENT;
                                break;
                            default:
                                start = p;
                                state = LyricsState.TEXT;
                                continue;
                        }
                        break;
                    case LyricsState.COMMENT:
                        switch (c)
                        {
                            case CharCodeBrackedClose:
                                state = LyricsState.BEGIN;
                                break;
                        }
                        break;

                    case LyricsState.TEXT:
                        switch (c)
                        {
                            case CharCodeDash:
                                state = LyricsState.DASH;
                                break;
                            case CharCodeCR:
                            case CharCodeLF:
                            case CharCodeSpace:
                                var txt = str.Substring(start, p - start);
                                chunks.Add(PrepareChunk(txt));

                                state = LyricsState.IGNORE_SPACES;
                                next = LyricsState.BEGIN;
                                break;
                        }
                        break;

                    case LyricsState.DASH:
                        switch (c)
                        {
                            case CharCodeDash:
                                break;
                            default:
                                var txt = str.Substring(start, p - start);
                                chunks.Add(PrepareChunk(txt));

                                skipSpace = true;
                                state = LyricsState.IGNORE_SPACES;
                                next = LyricsState.BEGIN;
                                continue;
                        }
                        break;
                }

                p++;
            }

            if (state == LyricsState.TEXT)
            {
                if (p != start)
                {
                    chunks.Add(str.Substring(start, p - start));
                }
            }
        }

        private string PrepareChunk(string txt)
        {
            return txt.Replace("+", " ");
        }

        class LyricsState
        {
            public const int IGNORE_SPACES = 0;
            public const int BEGIN = 1;
            public const int TEXT = 2;
            public const int COMMENT = 3;
            public const int DASH = 4;
        }
    }
}
