/**
 * Lists all directions which can be applied to a masterbar.
 */
export enum Direction {
    TargetFine,
    TargetSegno,
    TargetSegnoSegno,
    TargetCoda,
    TargetDoubleCoda,

    JumpDaCapo,
    JumpDaCapoAlCoda,
    JumpDaCapoAlDoubleCoda,
    JumpDaCapoAlFine,

    JumpDalSegno,
    JumpDalSegnoAlCoda,
    JumpDalSegnoAlDoubleCoda,
    JumpDalSegnoAlFine,

    JumpDalSegnoSegno,
    JumpDalSegnoSegnoAlCoda,
    JumpDalSegnoSegnoAlDoubleCoda,
    JumpDalSegnoSegnoAlFine,

    JumpDaCoda,
    JumpDaDoubleCoda
}
