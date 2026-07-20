/**
 * alphaTex riff library for docs demos.
 *
 * Every riff either draws on a source melody that is unambiguously in the
 * public domain (composer died > 70 years ago, or the piece is a documented
 * traditional / anonymous work) or is an original short composition. The
 * alphaTex arrangements themselves are original — no third-party transcriptions
 * are copied.
 *
 * Design constraints — these riffs sound acceptable on the bundled Sonivox
 * SoundFont (a small GM sample set) and make musical sense as demo material:
 *
 *   1. Prefer sustained chord tones, arpeggios and chord-melody voicings
 *      over fast single-note runs.
 *   2. Favour open-position voicings; Sonivox handles the low-mid register
 *      much better than fast lines above the 12th fret.
 *   3. Include enough rhythmic and harmonic movement to be interesting, but
 *      no shreddy scale-runs (which expose the synth's limitations).
 *   4. Keep length appropriate to the demo — short (4 bars) when the audio
 *      is a bed for another feature, long (12–16 bars) when the demo itself
 *      is about scrolling / seeking / lazy loading.
 *
 * Public-domain sources cited: J.S. Bach (d. 1750), L. van Beethoven (d.
 * 1827), Pachelbel (d. 1706), John Newton (d. 1807), traditional folk
 * melodies pre-dating 1900. All other pieces are original compositions.
 */

// ─── Short-form (4 bars): swap into any generic playback demo ────────────

/**
 * Blues shuffle in A — original, 4 bars, I–IV–I–V.
 * Root/5th/6th/5th eighth-note figure per chord — the classic shuffle grip.
 * `\tf triplet8th` makes it a swing/straight A-B demo out of the box.
 */
export const BLUES_SHUFFLE_A = `\\title "Blues shuffle"
\\tempo 96
\\tf triplet8th
.
\\track "Guitar"
:8 0.5 2.4 4.4 2.4 0.5 2.4 4.4 2.4 |
:8 0.4 2.3 4.3 2.3 0.4 2.3 4.3 2.3 |
:8 0.5 2.4 4.4 2.4 0.5 2.4 4.4 2.4 |
:8 0.6 2.5 4.5 2.5 0.5 2.4 4.4 2.4 |`;

/**
 * Ode to Joy — Beethoven, Symphony No. 9, 4th mvt (1824, PD).
 * Chord-melody arrangement in G major with a walking bass under each melody
 * note. Excellent bed for SoundFont / volume / cursor / articulation demos —
 * long tones let the sample bank breathe.
 */
export const ODE_TO_JOY = `\\title "Ode to Joy"
\\tempo 92
.
\\track "Guitar"
:4 (0.2 3.6) (0.2 3.6) (1.2 3.6) (3.2 3.6) |
:4 (3.2 0.5) (1.2 0.5) (0.2 3.6) (2.3 3.6) |
:4 (0.3 3.6) (0.3 3.6) (2.3 3.6) (0.2 3.6) |
:4 (0.2 3.6) :8 (2.3 3.6) (0.3 3.6) :2 (0.3 3.6) |`;

/**
 * Amazing Grace — John Newton, 1779 (PD). 3/4 waltz arrangement in G, chord
 * melody with root bass. Slow tempo + sustained tones = kind to Sonivox.
 */
export const AMAZING_GRACE = `\\title "Amazing Grace"
\\tempo 76
\\ts 3 4
.
\\track "Guitar"
:4 (0.3 3.6) :8 (0.2 3.6) (3.2 3.6) |
:2 (0.1 3.5) :4 (3.2 3.5) |
:4 (0.2 3.5) :8 (3.2 0.4) (0.2 0.4) |
:2. (0.3 3.6) |`;

/**
 * Greensleeves — traditional English, 16th century (PD). A-minor ballad in
 * 6/8. Sustained chord tones under a stepwise melody line.
 */
export const GREENSLEEVES = `\\title "Greensleeves"
\\tempo 84
\\ts 6 8
.
\\track "Guitar"
:8 (0.5) 0.3 :4 2.2 :8 3.2 |
:4 (3.2 0.4) :8 1.2 :4 0.2 :8 0.3 |
:4 (2.3 0.4) :8 2.2 :4 0.2 :8 0.3 |
:4 (0.5) :8 3.6 :4 (0.5) |`;

/**
 * Ambient fingerpicking pattern — original, G–D–Em–C progression.
 * Travis-picking-style thumb-and-fingers pattern over open-position chords.
 * A pleasant chord-support bed that gives every plucked note somewhere to
 * sit — ideal for backend / rendering demos where the music is scenery.
 */
export const FOLK_ARPEGGIO = `\\title "Folk arpeggio"
\\tempo 84
.
\\track "Guitar"
:8 (3.6 0.3) 0.2 (0.3) 0.1 (0.3) 0.2 (0.3) 0.1 |
:8 (0.4 2.3) 3.2 (2.3) 2.1 (2.3) 3.2 (2.3) 2.1 |
:8 (0.6 0.4) 0.3 (0.4) 0.2 (0.4) 0.3 (0.4) 0.2 |
:8 (3.5 2.4) 0.3 (2.4) 1.2 (2.4) 0.3 (2.4) 1.2 |`;

/**
 * Pachelbel Canon in D (~1680, PD) — the classic 8-chord ground bass
 * (D–A–Bm–F#m–G–D–G–A) in an arpeggiated guitar voicing. Sounds recognizable
 * and periodic, which makes it a good tune for loop/scroll demos.
 */
export const PACHELBEL_CANON = `\\title "Canon in D"
\\tempo 88
.
\\track "Guitar"
:4 (2.4 3.2) (0.4 2.2) (2.4 3.2) (0.4 2.2) |
:4 (0.5 3.2) (0.5 0.2) (0.5 3.2) (0.5 0.2) |
:4 (2.5 4.4) (2.5 2.4) (2.5 4.4) (2.5 2.4) |
:4 (2.6 2.4) (2.6 0.4) (2.6 2.4) (2.6 0.4) |`;

/**
 * Steady pulse — original chord vamp with clear quarter-note stabs on every
 * beat. Perfect bed for count-in / metronome demos where the point is the
 * audible click grid, not the notes.
 */
export const STEADY_PULSE = `\\title "Steady pulse"
\\tempo 100
.
\\track "Guitar"
:4 (0.4 2.3 3.2 1.1) (0.4 2.3 3.2 1.1) (0.4 2.3 3.2 1.1) (0.4 2.3 3.2 1.1) |
:4 (3.5 5.4 5.3 3.2) (3.5 5.4 5.3 3.2) (3.5 5.4 5.3 3.2) (3.5 5.4 5.3 3.2) |
:4 (0.4 2.3 3.2 1.1) (0.4 2.3 3.2 1.1) (0.4 2.3 3.2 1.1) (0.4 2.3 3.2 1.1) |
:4 (0.5 2.4 2.3 1.2 0.1) (0.5 2.4 2.3 1.2 0.1) :2 (0.5 2.4 2.3 1.2 0.1) |`;

// ─── Long-form (12+ bars): scroll, lazy-load, seek demos ──────────────────

/**
 * Bach — Prelude in C major, BWV 846 (Well-Tempered Clavier, 1722, PD).
 * The rolling broken-chord pattern of the opening — 12 bars, harmonically
 * varied enough to be worth listening through, arpeggiated enough that
 * Sonivox handles it well. Long form for scroll / lazy-loading / seek demos.
 */
export const BACH_PRELUDE_C_LONG = `\\title "Prelude in C, BWV 846"
\\tempo 68
.
\\track "Guitar"
:8 0.5 1.3 0.2 1.1 0.2 1.3 0.5 1.3 0.2 1.1 0.2 1.3 |
:8 0.5 0.3 3.2 2.1 3.2 0.3 0.5 0.3 3.2 2.1 3.2 0.3 |
:8 3.6 0.3 3.2 2.1 3.2 0.3 3.6 0.3 3.2 2.1 3.2 0.3 |
:8 0.5 0.3 2.2 2.1 2.2 0.3 0.5 0.3 2.2 2.1 2.2 0.3 |
:8 0.5 1.3 0.2 1.1 0.2 1.3 0.5 1.3 0.2 1.1 0.2 1.3 |
:8 0.5 0.3 3.2 2.1 3.2 0.3 0.5 0.3 3.2 2.1 3.2 0.3 |
:8 3.6 0.3 3.2 2.1 3.2 0.3 3.6 0.3 3.2 2.1 3.2 0.3 |
:8 0.5 0.3 2.2 2.1 2.2 0.3 0.5 0.3 2.2 2.1 2.2 0.3 |
:8 3.6 0.3 3.2 2.1 3.2 0.3 3.6 0.3 3.2 2.1 3.2 0.3 |
:8 0.5 1.3 0.2 1.1 0.2 1.3 0.5 1.3 0.2 1.1 0.2 1.3 |
:8 3.6 0.3 3.2 2.1 3.2 0.3 3.6 0.3 3.2 2.1 3.2 0.3 |
:1 (0.5 1.3 0.2 1.1) |`;

// ─── Multi-section (8 bars, verse + chorus): loop-a-section demo ─────────

/**
 * Original 8-bar tune in A minor — two 4-bar halves with clearly distinct
 * feels so looping just the "verse" or just the "chorus" is musically
 * meaningful. Verse: arpeggiated Am–G–F–E. Chorus: chord-melody with a
 * lifted contour returning to Am. Ideal loop-a-section target.
 */
export const AM_VERSE_CHORUS = `\\title "Verse and chorus"
\\tempo 96
.
\\track "Guitar"
:8 (0.5 1.2) 0.3 2.3 0.3 (0.5 1.2) 0.3 2.3 0.3 |
:8 (3.6 0.3) 0.2 0.3 0.2 (3.6 0.3) 0.2 0.3 0.2 |
:8 (1.6 2.3) 1.2 2.3 1.2 (1.6 2.3) 1.2 2.3 1.2 |
:8 (0.6 0.4) 1.3 2.3 1.3 (0.6 0.4) 1.3 2.3 1.3 |
:4 (0.5 2.4 2.3 1.2 0.1) :8 3.2 5.2 :4 (0.5 2.4 2.3 1.2 0.1) 3.2 |
:4 (3.6 2.5 0.4 0.3 0.2 3.1) :8 3.3 5.3 :4 (3.6 2.5 0.4 0.3 0.2 3.1) 3.3 |
:4 (1.6 3.5 3.4 2.3 1.2 1.1) :8 1.3 3.3 :4 (1.6 3.5 3.4 2.3 1.2 1.1) 1.3 |
:2 (0.5 2.4 2.3 1.2 0.1) :2 (0.6 2.5 2.4 0.3 0.2 0.1) |`;

// ─── Feature-focused (small, but with the effect the doc is explaining) ──

/**
 * Melody with dynamic markings — original 4-bar phrase in C major that walks
 * pp → cresc → ff → dim → pp. For coverage-dynamics demos.
 */
export const DYNAMICS_MELODY = `\\title "Dynamic sweep"
\\tempo 88
.
\\track "Guitar"
:4 3.3 { dy pp } 5.3 7.3 8.3 { cre } |
:4 7.3 8.3 10.3 12.3 { dy ff } |
:4 12.3 { dec } 10.3 8.3 7.3 |
:4 5.3 3.3 { dy pp } :2 5.3 |`;

/**
 * Melody with ornaments — original short phrase in G major carrying a turn,
 * inverted turn, upper mordent and lower mordent on successive beats. For
 * coverage-grace-tuplets-ornaments demos.
 */
export const ORNAMENTS_MELODY = `\\title "Ornaments"
\\tempo 72
.
\\track "Guitar"
:4 0.3 { turn } 2.3 { iturn } 4.3 { umordent } 5.3 { lmordent } |
:4 7.3 5.3 :2 4.3 |
:4 5.3 { turn } 7.3 { iturn } 9.3 { umordent } 10.3 { lmordent } |
:2 12.3 :4 10.3 7.3 |`;
