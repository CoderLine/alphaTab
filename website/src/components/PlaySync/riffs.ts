/**
 * alphaTex riff library for feature demos.
 *
 * Every riff either draws on a source melody that is unambiguously in the
 * public domain (composer died > 70 years ago, or the piece is a documented
 * traditional / anonymous work) or is an original short composition. The
 * alphaTex arrangements themselves are original — no third-party transcriptions
 * are copied.
 *
 * Design constraints — these riffs sound acceptable on the bundled Sonivox
 * SoundFont (a small GM sample set):
 *   1. Prefer sustained chord tones and arpeggios over fast single-note runs.
 *   2. Favour open-position voicings; sonivox handles the low-mid register best.
 *   3. Keep length short (4–8 bars) so demos loop cleanly.
 *   4. Include enough rhythmic and harmonic movement to be interesting, but no
 *      shreddy scale-runs (which expose the synth's limitations).
 *
 * Sourced from: J.S. Bach (d. 1750), L. van Beethoven (d. 1827), traditional
 * folk melodies pre-dating 1900, and original compositions.
 */

/**
 * Blues shuffle in A — original 12-bar-blues-derived pattern.
 * Root/5th/6th/5th eighth-note figure per chord (A / D / A / E) — the classic
 * shuffle grip. With `\tf triplet8th` set, the swing/straight A/B is audible on
 * every pair of eighth notes.
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
 * Chord-melody arrangement in G major with a walking bass note under each
 * melody note. Chord support helps single-note melodies sit better in the mix.
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
 * Bach — Prelude in C major, BWV 846 (Well-Tempered Clavier, 1722, PD).
 * Broken-chord (arpeggio) opening — the pattern that plays continuously through
 * the whole prelude. Each bar is one chord voiced as a rolling arpeggio.
 */
export const BACH_PRELUDE_C = `\\title "Prelude in C"
\\tempo 68
.
\\track "Guitar"
:8 0.5 1.3 0.2 1.1 0.2 1.3 0.5 1.3 0.2 1.1 0.2 1.3 |
:8 0.5 0.3 3.2 2.1 3.2 0.3 0.5 0.3 3.2 2.1 3.2 0.3 |
:8 3.6 0.3 3.2 2.1 3.2 0.3 3.6 0.3 3.2 2.1 3.2 0.3 |
:8 0.5 0.3 2.2 2.1 2.2 0.3 0.5 0.3 2.2 2.1 2.2 0.3 |`;

/**
 * Greensleeves — traditional English, 16th century (PD).
 * A-minor melody with sustained chord support on the low strings. Ballad-tempo
 * so Sonivox's vibrato/sustain has time to breathe.
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
 * Amazing Grace — John Newton, 1779 (PD). Traditional hymn arrangement in G,
 * chord-melody with root bass. The 3/4 waltz feel and long sustained tones let
 * Sonivox's samples ring out cleanly.
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
 * Jazz walking bass line — original composition, 8 bars in A minor.
 * Quarter-note walking bass with occasional chromatic passing tones. Sounds
 * good on Sonivox's acoustic-bass sample; also sensible as a swing showcase.
 */
export const WALKING_BASS_AM = `\\title "Walking bass"
\\tempo 120
\\tf triplet8th
.
\\track "Bass" \\instrument acousticBass
:4 0.5 2.5 3.5 4.5 |
:4 0.4 2.4 3.4 4.4 |
:4 0.5 3.5 2.5 0.5 |
:4 0.6 3.6 2.6 3.6 |`;

/**
 * Ambient fingerpicking pattern — original arpeggio in D major.
 * Travis-picking-style thumb-and-fingers pattern over G–D–Em–C. Chord support
 * gives every note somewhere to sit; the rolling right-hand keeps momentum
 * without needing fast scale runs.
 */
export const FOLK_ARPEGGIO_GDEmC = `\\title "Folk arpeggio"
\\tempo 84
.
\\track "Guitar"
:8 (3.6 0.3) 0.2 (0.3) 0.1 (0.3) 0.2 (0.3) 0.1 |
:8 (0.4 2.3) 3.2 (2.3) 2.1 (2.3) 3.2 (2.3) 2.1 |
:8 (0.6 0.4) 0.3 (0.4) 0.2 (0.4) 0.3 (0.4) 0.2 |
:8 (3.5 2.4) 0.3 (2.4) 1.2 (2.4) 0.3 (2.4) 1.2 |`;

/**
 * Ideal target when you want to show timbre differences (SoundFont swaps,
 * volume mixing, EQ). Chord-heavy, mid-tempo, sustained — differences in the
 * sample bank are much more audible than on scale runs.
 */
export const CHORD_PROGRESSION_G = ODE_TO_JOY;
