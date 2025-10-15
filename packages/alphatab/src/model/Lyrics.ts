/**
 * @internal
 */
enum LyricsState {
    IgnoreSpaces = 0,
    Begin = 1,
    Text = 2,
    Comment = 3,
    Dash = 4
}

/**
 * Represents the lyrics of a song.
 * @public
 */
export class Lyrics {
    private static readonly _charCodeLF: number = 10;
    private static readonly _charCodeTab: number = 9;
    private static readonly _charCodeCR: number = 13;
    private static readonly _charCodeSpace: number = 32;
    private static readonly _charCodeBrackedClose: number = 93;
    private static readonly _charCodeBrackedOpen: number = 91;
    private static readonly _charCodeDash: number = 45;

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
        this._parse(this.text, 0, this.chunks, skipEmptyEntries);
    }

    private _parse(str: string, p: number, _chunks: string[], skipEmptyEntries: boolean): void {
        if (!str) {
            return;
        }

        let state: LyricsState = LyricsState.Begin;
        let next: LyricsState = LyricsState.Begin;
        let skipSpace: boolean = false;
        let start: number = 0;

        while (p < str.length) {
            const c: number = str.charCodeAt(p);
            switch (state) {
                case LyricsState.IgnoreSpaces:
                    switch (c) {
                        case Lyrics._charCodeLF:
                        case Lyrics._charCodeCR:
                        case Lyrics._charCodeTab:
                            break;
                        case Lyrics._charCodeSpace:
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
                        case Lyrics._charCodeBrackedOpen:
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
                        case Lyrics._charCodeBrackedClose:
                            state = LyricsState.Begin;
                            break;
                    }
                    break;
                case LyricsState.Text:
                    switch (c) {
                        case Lyrics._charCodeDash:
                            state = LyricsState.Dash;
                            break;
                        case Lyrics._charCodeCR:
                        case Lyrics._charCodeLF:
                        case Lyrics._charCodeSpace:
                            const txt: string = str.substr(start, p - start);
                            this._addChunk(txt, skipEmptyEntries);
                            state = LyricsState.IgnoreSpaces;
                            next = LyricsState.Begin;
                            break;
                    }
                    break;
                case LyricsState.Dash:
                    switch (c) {
                        case Lyrics._charCodeDash:
                            break;
                        default:
                            const txt: string = str.substr(start, p - start);
                            this._addChunk(txt, skipEmptyEntries);
                            skipSpace = true;
                            state = LyricsState.IgnoreSpaces;
                            next = LyricsState.Begin;
                            continue;
                    }
                    break;
            }
            p += 1;
        }

        if (state === LyricsState.Text) {
            if (p !== start) {
                this._addChunk(str.substr(start, p - start), skipEmptyEntries);
            }
        }
    }
    private _addChunk(txt: string, skipEmptyEntries: boolean) {
        txt = this._prepareChunk(txt);
        if (!skipEmptyEntries || (txt.length > 0 && txt !== '-')) {
            this.chunks.push(txt);
        }
    }

    private _prepareChunk(txt: string): string {
        const chunk = txt.split('+').join(' ');

        // trim off trailing _ like "You____" becomes "You"
        let endLength = chunk.length;
        while (endLength > 0 && chunk.charAt(endLength - 1) === '_') {
            endLength--;
        }

        return endLength !== chunk.length ? chunk.substr(0, endLength) : chunk;
    }
}
