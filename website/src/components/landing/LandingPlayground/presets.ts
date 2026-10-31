/**
 * Editor presets for the landing alphaTex playground. Pitches come from the
 * public-domain sources documented in `src/tex-riffs.ts`; the notation is
 * written in current alphaTex syntax so each preset opens without diagnostics.
 */
export interface AlphaTexPreset {
    id: string;
    fileName: string;
    label: string;
    tex: string;
}

/** Beethoven, Symphony No. 9 Op. 125, mvt IV, theme bars 1–4 (see `ODE_TO_JOY`). */
const MELODY = `\\title "Ode to Joy"
\\subtitle "L. van Beethoven, Op. 125 (1824)"
\\tempo 92

\\track "Guitar"
:4 2.1 2.1 3.1 5.1 |
:4 5.1 3.1 2.1 0.1 |
:4 3.2 3.2 0.1 2.1 |
:4 2.1{d} :8 0.1 :2 0.1
`;

/** Bach, Prelude in C BWV 846, bars 5–8 (see `FOLK_ARPEGGIO`). */
const ARPEGGIO = `\\title "Prelude in C"
\\subtitle "J.S. Bach, BWV 846 (1722)"
\\tempo 84

\\track "Guitar"
:8 3.5 2.4 2.3 0.1 5.1 0.1 2.3 2.4 |
:8 3.5 0.4 4.4 2.3 3.2 2.3 4.4 0.4 |
:8 2.5 0.4 0.3 3.2 8.2 3.2 0.3 0.4 |
:8 2.5 3.5 2.4 0.3 1.2 0.3 2.4 3.5
`;

/** Minuet in G, BWV Anh. 114, bars 1–4, with Bach's ornament vocabulary (see `ORNAMENTS_MELODY`). */
const ORNAMENTS = `\\title "Minuet in G"
\\subtitle "J.S. Bach / attr. C. Petzold, BWV Anh. 114"
\\tempo 96
\\ts (3 4)

\\track "Guitar"
:4 10.1{umordent} :8 3.1 5.1 7.1 8.1 |
:4 10.1{iturn} 3.1 3.1 |
:4 12.1{turn} :8 8.1 10.1 12.1 14.1 |
:4 15.1{lmordent} 3.1 3.1
`;

/** Pachelbel, Canon in D, the 8-bar ground as an ensemble (see `MULTI_TRACK_ENSEMBLE`). */
const ENSEMBLE = `\\title "Canon in D"
\\subtitle "J. Pachelbel (c. 1680)"
\\tempo 72

\\track ("Lead Guitar" "Gtr")
\\instrument 24
:8 0.4 4.4 2.3 3.2 2.3 4.4 2.3 4.4 |
:8 0.5 4.5 2.4 2.3 2.4 4.5 2.4 4.5 |
:8 2.5 0.4 4.4 4.3 4.4 0.4 4.4 0.4 |
:8 4.4 2.3 2.2 7.2 2.2 2.3 2.2 2.3 |
:8 3.6 2.5 0.4 0.3 0.4 2.5 0.4 2.5 |
:8 0.4 4.4 2.3 3.2 2.3 4.4 2.3 4.4 |
:8 3.6 2.5 0.4 0.3 0.4 2.5 0.4 2.5 |
:8 0.5 4.5 2.4 2.3 2.4 4.5 2.4 4.5

\\track ("Bass Guitar" "Bass")
\\instrument 33
\\tuning (G2 D2 A1 E1)
:1 0.2 | 2.1 | 4.1 | 4.2 | 0.1 | 0.2 | 0.1 | 2.1

\\track ("Piano" "Pno")
\\staff {score}
\\tuning piano
\\instrument acousticgrandpiano
(D4 F#4 A4).1 | (C#4 E4 A4).1 | (D4 F#4 B4).1 | (A3 C#4 F#4).1 |
(G3 B3 D4).1 | (D4 F#4 A4).1 | (G3 B3 D4).1 | (C#4 E4 A4).1
\\staff {score}
\\tuning piano
\\clef F4
D2.1 | A2.1 | B2.1 | F#2.1 | G2.1 | D2.1 | G2.1 | A2.1
`;

export const PRESETS: readonly AlphaTexPreset[] = [
    { id: 'melody', fileName: 'ode-to-joy.alphatex', label: 'Melody', tex: MELODY },
    { id: 'arpeggio', fileName: 'prelude.alphatex', label: 'Arpeggio', tex: ARPEGGIO },
    { id: 'ornaments', fileName: 'minuet.alphatex', label: 'Ornaments', tex: ORNAMENTS },
    { id: 'ensemble', fileName: 'canon.alphatex', label: 'Ensemble', tex: ENSEMBLE },
];
