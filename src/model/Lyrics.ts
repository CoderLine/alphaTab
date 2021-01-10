enum LyricsState {
    IgnoreSpaces,
    Begin,
    Text,
    Comment,
    Dash
}

/**
 * Represents the lyrics of a song.
 */
export class Lyrics {
    private static readonly CharCodeLF: number = 10;
    private static readonly CharCodeTab: number = 9;
    private static readonly CharCodeCR: number = 13;
    private static readonly CharCodeSpace: number = 32;
    private static readonly CharCodeBrackedClose: number = 93;
    private static readonly CharCodeBrackedOpen: number = 91;
    private static readonly CharCodeDash: number = 45;

    /**
     * Gets or sets he start bar on which the lyrics should begin.
     */
    public startBar: number = 0;

    /**
     * Gets or sets the raw lyrics text in Guitar Pro format.
     * (spaces split word syllables, plus merge syllables, [..] are comments)
     */
    public text: string = '';

    /**
     * Gets or sets the prepared chunks of the lyrics to apply to beats.
     */
    public chunks!: string[];

    public finish(skipEmptyEntries: boolean = false): void {
        this.chunks = [];
        this.parse(this.text, 0, this.chunks, skipEmptyEntries);
    }

    private parse(str: string, p: number, chunks: string[], skipEmptyEntries: boolean): void {
        if (!str) {
            return;
        }

        let state: LyricsState = LyricsState.Begin;
        let next: LyricsState = LyricsState.Begin;
        let skipSpace: boolean = false;
        let start: number = 0;

        while (p < str.length) {
            let c: number = str.charCodeAt(p);
            switch (state) {
                case LyricsState.IgnoreSpaces:
                    switch (c) {
                        case Lyrics.CharCodeLF:
                        case Lyrics.CharCodeCR:
                        case Lyrics.CharCodeTab:
                            break;
                        case Lyrics.CharCodeSpace:
                            if (!skipSpace) {
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
                    switch (c) {
                        case Lyrics.CharCodeBrackedOpen:
                            state = LyricsState.Comment;
                            break;
                        default:
                            start = p;
                            state = LyricsState.Text;
                            continue;
                    }
                    break;
                case LyricsState.Comment:
                    switch (c) {
                        case Lyrics.CharCodeBrackedClose:
                            state = LyricsState.Begin;
                            break;
                    }
                    break;
                case LyricsState.Text:
                    switch (c) {
                        case Lyrics.CharCodeDash:
                            state = LyricsState.Dash;
                            break;
                        case Lyrics.CharCodeCR:
                        case Lyrics.CharCodeLF:
                        case Lyrics.CharCodeSpace:
                            let txt: string = str.substr(start, p - start);
                            this.addChunk(txt, skipEmptyEntries);
                            state = LyricsState.IgnoreSpaces;
                            next = LyricsState.Begin;
                            break;
                    }
                    break;
                case LyricsState.Dash:
                    switch (c) {
                        case Lyrics.CharCodeDash:
                            break;
                        default:
                            let txt: string = str.substr(start, p - start);
                            this.addChunk(txt, skipEmptyEntries);
                            skipSpace = true;
                            state = LyricsState.IgnoreSpaces;
                            next = LyricsState.Begin;
                            continue;
                    }
                    break;
            }
            p++;
        }

        if (state === LyricsState.Text) {
            if (p !== start) {
                this.addChunk(str.substr(start, p - start), skipEmptyEntries);
            }
        }
    }
    private addChunk(txt: string, skipEmptyEntries: boolean) {
        txt = this.prepareChunk(txt);
        if (!skipEmptyEntries || (txt.length > 0 && txt !== '-')) {
            this.chunks.push(txt);
        }
    }

    private prepareChunk(txt: string): string {
        let chunk = txt.split('+').join(' ');

        // trim off trailing _ like "You____" becomes "You"
        let endLength = chunk.length;
        while (endLength > 0 && chunk.charAt(endLength - 1) === '_') {
            endLength--;
        }

        return endLength !== chunk.length ? chunk.substr(0, endLength) : chunk;
    }
}
