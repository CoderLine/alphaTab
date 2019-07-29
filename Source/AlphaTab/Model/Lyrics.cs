using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// Represents the lyrics of a song. 
    /// </summary>
    public class Lyrics
    {
        private const int CharCodeLF = '\n';
        private const int CharCodeTab = '\t';
        private const int CharCodeCR = '\r';
        private const int CharCodeSpace = ' ';
        private const int CharCodeBrackedClose = ']';
        private const int CharCodeBrackedOpen = '[';
        private const int CharCodeDash = '-';

        /// <summary>
        /// Gets or sets he start bar on which the lyrics should begin. 
        /// </summary>
        public int StartBar { get; set; }

        /// <summary>
        /// Gets or sets the raw lyrics text in Guitar Pro format.
        /// (spaces split word syllables, plus merge syllables, [..] are comments) 
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Gets or sets the prepared chunks of the lyrics to apply to beats. 
        /// </summary>
        public string[] Chunks { get; set; }

        internal void Finish()
        {
            var chunks = new FastList<string>();
            Parse(Text, 0, chunks);
            Chunks = chunks.ToArray();
        }

        private void Parse(string str, int p, FastList<string> chunks)
        {
            if (string.IsNullOrEmpty(str))
            {
                return;
            }

            var state = LyricsState.Begin;
            var next = LyricsState.Begin;
            var skipSpace = false;
            var start = 0;

            while (p < str.Length)
            {
                int c = str[p];
                switch (state)
                {
                    case LyricsState.IgnoreSpaces:
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
                    case LyricsState.Begin:
                        switch (c)
                        {
                            case CharCodeBrackedOpen:
                                state = LyricsState.Comment;
                                break;
                            default:
                                start = p;
                                state = LyricsState.Text;
                                continue;
                        }

                        break;
                    case LyricsState.Comment:
                        switch (c)
                        {
                            case CharCodeBrackedClose:
                                state = LyricsState.Begin;
                                break;
                        }

                        break;

                    case LyricsState.Text:
                        switch (c)
                        {
                            case CharCodeDash:
                                state = LyricsState.Dash;
                                break;
                            case CharCodeCR:
                            case CharCodeLF:
                            case CharCodeSpace:
                                var txt = str.Substring(start, p - start);
                                chunks.Add(PrepareChunk(txt));

                                state = LyricsState.IgnoreSpaces;
                                next = LyricsState.Begin;
                                break;
                        }

                        break;

                    case LyricsState.Dash:
                        switch (c)
                        {
                            case CharCodeDash:
                                break;
                            default:
                                var txt = str.Substring(start, p - start);
                                chunks.Add(PrepareChunk(txt));

                                skipSpace = true;
                                state = LyricsState.IgnoreSpaces;
                                next = LyricsState.Begin;
                                continue;
                        }

                        break;
                }

                p++;
            }

            if (state == LyricsState.Text)
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

        private enum LyricsState
        {
            IgnoreSpaces,
            Begin,
            Text,
            Comment,
            Dash
        }
    }
}
