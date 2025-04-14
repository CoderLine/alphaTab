/**
 * Lists all directions which can be applied to a masterbar.
 */
export enum Direction {
    TargetFine = 0,
    TargetSegno = 1,
    TargetSegnoSegno = 2,
    TargetCoda = 3,
    TargetDoubleCoda = 4,

    JumpDaCapo = 5,
    JumpDaCapoAlCoda = 6,
    JumpDaCapoAlDoubleCoda = 7,
    JumpDaCapoAlFine = 8,

    JumpDalSegno = 9,
    JumpDalSegnoAlCoda = 10,
    JumpDalSegnoAlDoubleCoda = 11,
    JumpDalSegnoAlFine = 12,

    JumpDalSegnoSegno = 13,
    JumpDalSegnoSegnoAlCoda = 14,
    JumpDalSegnoSegnoAlDoubleCoda = 15,
    JumpDalSegnoSegnoAlFine = 16,

    JumpDaCoda = 17,
    JumpDaDoubleCoda = 18
}
