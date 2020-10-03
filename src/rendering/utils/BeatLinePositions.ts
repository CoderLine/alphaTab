import { Note } from "@src/model/Note";

export class BeatLinePositions {
    public staffId: string = '';
    public up: number = 0;
    public down: number = 0;
    public minNote: Note | null = null;
    public maxNote: Note | null = null;
}
