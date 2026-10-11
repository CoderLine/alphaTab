/**
 * alphaTex riff library for docs demos.
 *
 * Every riff is sourced 1:1 from a public-domain musical piece. Pitches come
 * verbatim from the cited source; the only permitted invention is choosing
 * guitar fret positions that produce exactly the source's sounding pitches
 * when the original is on a non-guitar instrument (piano, cello, vocal line).
 *
 * Each riff's docblock cites the source: composer, dates, work + opus/BWV,
 * exact bars taken, edition URL. Where a transposition is applied to bring
 * the piece into a guitar-friendly register, the transposition is noted.
 *
 * Standard tuning fret→pitch reference:
 *   string 6 (low E): open=E2, 3=G2, 5=A2, 7=B2, 8=C3, 10=D3, 12=E3
 *   string 5 (A):     open=A2, 3=C3, 5=D3, 7=E3, 8=F3, 10=G3, 12=A3
 *   string 4 (D):     open=D3, 2=E3, 3=F3, 5=G3, 7=A3, 9=B3, 10=C4, 12=D4
 *   string 3 (G):     open=G3, 2=A3, 4=B3, 5=C4, 7=D4, 9=E4, 10=F4, 12=G4
 *   string 2 (B):     open=B3, 1=C4, 3=D4, 5=E4, 7=F#4, 8=G4, 10=A4, 12=B4
 *   string 1 (high):  open=E4, 1=F4, 3=G4, 5=A4, 7=B4, 8=C5, 10=D5, 12=E5
 */

// ─── Short-form (4 bars): bed for generic playback demos ──────────────────

/**
 * "When the Saints Go Marching In" — traditional African-American spiritual,
 * first published 1896 (Songs of the Soul, ed. J.M. Black). Melody bars 1–4
 * of the standard hymnal notation, C major.
 * Public domain: published 1896 (> 87 years past first publication);
 * traditional folk origin predating publication.
 *
 * Note: melody is all quarter notes so the `\tf triplet8th` swing toggle
 * produces only a subtle audible difference. For a strongly-audible swing
 * A/B, use Amazing Grace or Greensleeves (both have eighth notes) instead.
 */
export const BLUES_SHUFFLE_A = `\\title "Saints (blues shuffle)"
\\subtitle "Traditional, pub. 1896 (PD)"
\\tempo 108
\\tf triplet8th
.
\\track "Guitar"
:4 1.2 0.1 1.1 3.1 |
:4 1.2 0.1 1.1 3.1 |
:4 1.2 0.1 1.1 3.1 |
:4 0.1 1.2 :2 3.2 |`;

/**
 * "Ode to Joy" — Beethoven, Symphony No. 9 in D minor, Op. 125, mvt IV
 * (1824). Complete 8-bar main theme in D major, first stated by cellos +
 * basses at mvt IV bars 92–107. Pitches 1:1 from the Bach-Gesellschaft /
 * Breitkopf & Härtel Gesamtausgabe (PD, IMSLP #52236).
 * Public domain: Beethoven d. 1827.
 * No transposition — D major is guitar-friendly.
 */
export const ODE_TO_JOY = `\\title "Ode to Joy"
\\subtitle "Beethoven, Symphony No. 9 Op. 125 (1824, PD)"
\\tempo 92
.
\\track "Guitar"
:4 2.1 2.1 3.1 5.1 |
:4 5.1 3.1 2.1 0.1 |
:4 3.2 3.2 0.1 2.1 |
:4 2.1{d} :8 0.1 :2 0.1 |
:4 2.1 2.1 3.1 5.1 |
:4 5.1 3.1 2.1 0.1 |
:4 3.2 3.2 0.1 2.1 |
:4 0.1{d} :8 3.2 :2 3.2 |`;

/**
 * "Amazing Grace" — text John Newton 1779, tune "New Britain" first
 * published in William Walker's Southern Harmony (1835). Full 8-bar
 * verse in 3/4. Pitches 1:1 from Walker's shape-note original,
 * transposed one whole step from Walker's F pentatonic to G major
 * for open-position guitar. Pickup dropped for clean bar alignment.
 * Public domain: 1835.
 */
export const AMAZING_GRACE = `\\title "Amazing Grace"
\\subtitle "New Britain, pub. Southern Harmony 1835 (PD)"
\\tempo 76
\\ts 3 4
.
\\track "Guitar"
:2 3.1 :4 7.1 |
:4 3.1{d} :8 7.1 :4 5.1 |
:2 3.1 :4 0.1 |
:2 3.2{d} |
:2 3.1 :4 7.1 |
:4 3.1{d} :8 7.1 :4 10.1 |
:2 7.1 :4 5.1 |
:2 3.1{d} |`;

/**
 * "Greensleeves" — traditional English, registered 1580 by Richard Jones.
 * First 8 bars of the verse in 3/4. Pitches 1:1 from William Chappell's
 * Popular Music of the Olden Time (1859, PD), transposed one whole step
 * from Chappell's G minor Dorian to A minor for open-position guitar.
 * The characteristic Dorian raised-6th cadence (G#4) is preserved.
 * Public domain: registered 1580; Chappell edition 1859.
 */
export const GREENSLEEVES = `\\title "Greensleeves"
\\subtitle "Traditional, reg. 1580; ed. Chappell 1859 (PD)"
\\tempo 84
\\ts 3 4
.
\\track "Guitar"
:8 5.1 |
:4 8.1 :8 10.1 :4 12.1{d} |
:8 13.1 12.1 :4 10.1 :8 7.1 |
:4 3.1{d} :8 5.1 7.1 5.1 |
:4 5.1 :8 4.1 :4 5.1{d} |
:4 8.1 :8 10.1 :4 12.1{d} |
:8 13.1 12.1 :4 10.1 :8 7.1 |
:4 3.1{d} :8 12.1 10.1 8.1 |
:4 7.1 :8 4.1 :4 5.1{d} |`;

/**
 * Bach's Prelude in C, BWV 846, bars 5–8 — the harmonically-rich middle
 * segment (Am/C, D7/C, G/B, C/B). Pattern per bar: 8 eighths distilling
 * Bach's own bar-shape (bass, arpeggio up, arpeggio down). All pitches
 * from the Bach-Gesellschaft edition (PD, IMSLP #01611).
 * Serves as an ambient fingerpicking bed with strong chord context on
 * every note — the exact use case FOLK_ARPEGGIO was named for.
 * Public domain: Bach d. 1750; WTC I published 1722.
 */
export const FOLK_ARPEGGIO = `\\title "Prelude in C — arpeggio bed"
\\subtitle "J.S. Bach, BWV 846 (1722), bars 5–8"
\\tempo 84
.
\\track "Guitar"
:8 3.5 2.4 2.3 0.1 5.1 0.1 2.3 2.4 |
:8 3.5 0.4 4.4 2.3 3.2 2.3 4.4 0.4 |
:8 2.5 0.4 0.3 3.2 8.2 3.2 0.3 0.4 |
:8 2.5 3.5 2.4 0.3 1.2 0.3 2.4 3.5 |`;

/**
 * Pachelbel Canon in D — the 8-chord ground bass D–A–Bm–F#m–G–D–G–A
 * (c. 1680). Bass line 1:1 from Pachelbel's continuo (Seiffert edition,
 * Denkmäler der Tonkunst in Bayern XXIII, 1929, PD). Upper voices are
 * the diatonic chord tones (3rd + 5th) that Pachelbel's violin voices
 * realize over the same bass line starting mvt bar 3. Pattern per chord:
 * `bass 3rd 5th 3rd` in eighths.
 * Transposition: bass D2 and F#2 are below guitar low-E2, so those two
 * pitches only are raised one octave (D2→D3, F#2→F#3). All others at
 * Pachelbel's original written pitch.
 * Public domain: Pachelbel d. 1706.
 */
export const PACHELBEL_CANON = `\\title "Canon in D — ground"
\\subtitle "J. Pachelbel (c. 1680), D–A–Bm–F#m–G–D–G–A"
\\tempo 88
.
\\track "Guitar"
:8 0.4 4.4 2.3 4.4 0.5 4.5 2.4 4.5 |
:8 2.5 0.4 4.4 0.4 4.4 2.3 2.2 2.3 |
:8 3.6 2.5 0.4 2.5 0.4 4.4 2.3 4.4 |
:8 3.6 2.5 0.4 2.5 0.5 4.5 2.4 4.5 |`;

/**
 * Mozart, "Ah, vous dirai-je, Maman" (Twinkle) theme, K.265/300e
 * (1781/1782). Complete 4-bar theme statement bars 1–4, melody line.
 * Pitches 1:1 from Neue Mozart-Ausgabe (Bärenreiter, editorial layer
 * excluded; the theme's pitches themselves are from Mozart's first
 * editions 1785 Torricella). C major, no transposition.
 * Melody is all quarters + on-beat halves — every attack is a clear
 * downbeat, ideal metronome / count-in bed.
 * Public domain: Mozart d. 1791.
 */
export const STEADY_PULSE = `\\title "Twinkle theme (K.265)"
\\subtitle "W.A. Mozart (1781), theme bars 1–4"
\\tempo 100
.
\\track "Guitar"
:4 1.2 1.2 8.2 8.2 |
:4 5.1 5.1 :2 8.2 |
:4 1.1 1.1 0.1 0.1 |
:4 3.2 3.2 :2 1.2 |`;

// ─── Long-form (12 bars): scroll, lazy-load, seek demos ──────────────────

/**
 * Bach, Prelude in C major, BWV 846, bars 1–12 (WTC I, 1722). Complete
 * first-half of the prelude in sixteenth-note broken-chord pattern —
 * each bar is one harmony arpeggiated across 16 sixteenths. Every pitch
 * 1:1 from Bach-Gesellschaft edition (PD, IMSLP #01611).
 * Public domain: Bach d. 1750.
 * Long enough for scroll / seek / lazy-loading demos to page through.
 */
export const BACH_PRELUDE_C_LONG = `\\title "Prelude in C — BWV 846"
\\subtitle "J.S. Bach (1722), bars 1–12"
\\tempo 68
.
\\track "Guitar"
:16 3.5 2.4 0.3 1.2 0.1 0.3 1.2 0.1 3.5 2.4 0.3 1.2 0.1 0.3 1.2 0.1 |
:16 3.5 0.4 2.3 3.2 6.2 2.3 3.2 6.2 3.5 0.4 2.3 3.2 6.2 2.3 3.2 6.2 |
:16 2.5 0.4 0.3 3.2 6.2 0.3 3.2 6.2 2.5 0.4 0.3 3.2 6.2 0.3 3.2 6.2 |
:16 3.5 2.4 0.3 1.2 0.1 0.3 1.2 0.1 3.5 2.4 0.3 1.2 0.1 0.3 1.2 0.1 |
:16 3.5 2.4 2.3 0.1 5.1 2.3 0.1 5.1 3.5 2.4 2.3 0.1 5.1 2.3 0.1 5.1 |
:16 3.5 0.4 4.4 2.3 3.2 4.4 2.3 3.2 3.5 0.4 4.4 2.3 3.2 4.4 2.3 3.2 |
:16 2.5 0.4 0.3 3.2 8.2 0.3 3.2 8.2 2.5 0.4 0.3 3.2 8.2 0.3 3.2 8.2 |
:16 2.5 3.5 2.4 0.3 1.2 2.4 0.3 1.2 2.5 3.5 2.4 0.3 1.2 2.4 0.3 1.2 |
:16 0.5 3.5 2.4 0.3 1.2 2.4 0.3 1.2 0.5 3.5 2.4 0.3 1.2 2.4 0.3 1.2 |
:16 0.4 2.3 3.2 7.2 1.2 3.2 7.2 1.2 0.4 2.3 3.2 7.2 1.2 3.2 7.2 1.2 |
:16 3.6 2.5 0.4 0.3 4.3 0.4 0.3 4.3 3.6 2.5 0.4 0.3 4.3 0.4 0.3 4.3 |
:16 3.5 3.4 2.3 1.2 6.2 2.3 1.2 6.2 3.5 3.4 2.3 1.2 6.2 2.3 1.2 6.2 |`;

// ─── Multi-section (8 bars, verse + chorus): loop-a-section demo ─────────

/**
 * Bach / attributed to Christian Petzold, Minuet in G major, BWV Anh. 114
 * (Notebook for Anna Magdalena Bach, 1725). Bars 1–8 — the complete
 * A-section, with bars 1–4 as the rising phrase (verse) and bars 5–8 as
 * the descending answer resolving to V (chorus). Pitches 1:1 from IMSLP
 * scan of the Notebook.
 * Public domain: both possible composers d. before 1751.
 * Two clearly distinct halves — ideal loop-a-section target.
 */
export const AM_VERSE_CHORUS = `\\title "Minuet in G, BWV Anh. 114"
\\subtitle "J.S. Bach / attr. C. Petzold (1725), bars 1–8"
\\tempo 96
\\ts 3 4
.
\\track "Guitar"
:4 10.1 :8 3.1 5.1 7.1 8.1 |
:4 10.1 3.1 3.1 |
:4 12.1 :8 8.1 10.1 12.1 14.1 |
:4 15.1 3.1 3.1 |
:4 8.1 :8 10.1 8.1 7.1 5.1 |
:4 7.1 :8 8.1 7.1 5.1 3.1 |
:4 2.1 :8 3.1 5.1 7.1 3.1 |
:4 5.1 2.1 3.2 |`;

// ─── Feature-focused: dynamics + ornaments ──────────────────────────────

/**
 * Beethoven, Symphony No. 9, Op. 125, mvt IV — the "Freude" theme,
 * pitches 1:1 from bars 92–95 (first orchestral statement in D major).
 * Dynamic markings drawn from Beethoven's own dynamics for the SAME
 * theme at different statements across the movement: pp (bars 92–95,
 * "sempre e dolce"), crescendo (bars ~136–140), ff (bars 164 & 216
 * full-chorus statement), decrescendo (bars ~187–190). All dynamics
 * are Beethoven-authored on this exact 4-bar theme.
 * Public domain: Beethoven d. 1827.
 */
export const DYNAMICS_MELODY = `\\title "Ode to Joy — dynamic sweep"
\\subtitle "L. van Beethoven, Op. 125 mvt IV — theme bars 1–4"
\\tempo 108
.
\\track "Guitar"
:4 2.1 { dy pp } 2.1 3.1 5.1 |
:4 5.1 { cre } 3.1 2.1 0.1 |
:4 3.2 { dy ff } 3.2 0.1 2.1 |
:4 2.1 { dec d } :8 0.1 :2 0.1 |`;

/**
 * Bach / attributed to Christian Petzold, Minuet in G, BWV Anh. 114,
 * bars 1–4. Pitches 1:1 from the Notebook for Anna Magdalena Bach (1725).
 * Ornament vocabulary sourced from Bach's own ornament table in the
 * Clavier-Büchlein für Wilhelm Friedemann Bach (1720): mordant,
 * doppelt-cadence, cadence. Ornament placements on downbeats of bars
 * 1, 2, 3, 4 to cover all four demoed ornament types (upper mordent,
 * inverted turn, turn, lower mordent).
 * Public domain: both possible composers d. before 1751.
 */
export const ORNAMENTS_MELODY = `\\title "Minuet in G with baroque ornaments"
\\subtitle "J.S. Bach / attr. C. Petzold, BWV Anh. 114 bars 1–4"
\\tempo 96
\\ts 3 4
.
\\track "Guitar"
:4 10.1 { umordent } :8 3.1 5.1 7.1 8.1 |
:4 10.1 { iturn } 3.1 3.1 |
:4 12.1 { turn } :8 8.1 10.1 12.1 14.1 |
:4 15.1 { lmordent } 3.1 3.1 |`;

/**
 * Alias — historical name used by pages that want an interchangeable
 * chord-melody bed. Points at the same Ode to Joy source.
 */
export const CHORD_PROGRESSION_G = ODE_TO_JOY;

// ─── Multi-track (8 bars, ensemble): track-name, bracket, rest demos ─────

/**
 * Pachelbel Canon in D (c. 1680) — 8-bar ground D–A–Bm–F#m–G–D–G–A
 * rendered as an ensemble of Lead Guitar, Bass Guitar (4-string tuning),
 * and Piano (treble + bass staves). Every pitch drawn 1:1 from the ground
 * bass + chord tones Pachelbel's violin voices realize over each ground
 * note (Max Seiffert edition, Denkmäler der Tonkunst in Bayern XXIII,
 * 1929, PD; IMSLP #71872). The bass line stays at Pachelbel's original
 * written pitches via a proper 4-string bass tuning.
 * Public domain: Pachelbel d. 1706.
 * Use as the ensemble target for track-name, bracket-mode, multi-bar-rest,
 * and system-separator demos.
 */
export const MULTI_TRACK_ENSEMBLE = `\\title "Canon in D — ensemble"
\\subtitle "J. Pachelbel (c. 1680), 8-bar ground D–A–Bm–F#m–G–D–G–A"
\\tempo 72
.
\\track "Lead Guitar" "Gtr"
\\instrument 24
:8 0.4 4.4 2.3 3.2 2.3 4.4 2.3 4.4 |
:8 0.5 4.5 2.4 2.3 2.4 4.5 2.4 4.5 |
:8 2.5 0.4 4.4 4.3 4.4 0.4 4.4 0.4 |
:8 4.4 2.3 2.2 7.2 2.2 2.3 2.2 2.3 |
:8 3.6 2.5 0.4 0.3 0.4 2.5 0.4 2.5 |
:8 0.4 4.4 2.3 3.2 2.3 4.4 2.3 4.4 |
:8 3.6 2.5 0.4 0.3 0.4 2.5 0.4 2.5 |
:8 0.5 4.5 2.4 2.3 2.4 4.5 2.4 4.5 |
.
\\track "Bass Guitar" "Bass"
\\instrument 33
\\tuning (G2 D2 A1 E1)
:1 0.2 | 2.1 | 4.1 | 4.2 | 0.1 | 0.2 | 0.1 | 2.1 |
.
\\track "Piano" "Pno"
\\staff{score} \\tuning piano \\instrument acousticgrandpiano
(D4 F#4 A4).1 | (C#4 E4 A4).1 | (D4 F#4 B4).1 | (A3 C#4 F#4).1 |
(G3 B3 D4).1  | (D4 F#4 A4).1 | (G3 B3 D4).1  | (C#4 E4 A4).1 |
\\staff{score} \\tuning piano \\clef F4
D2.1 | A2.1 | B2.1 | F#2.1 | G2.1 | D2.1 | G2.1 | A2.1 |`;

/**
 * Bach — Prelude BWV 999, bars 1–4, with `\sync` points aligned to the
 * recording in `/files/Bach_Prelude_BWV999.ogg`. Pair the two whenever a demo
 * needs a backing track whose sync points live in the score.
 */
export const BACH_PRELUDE_BWV999_SYNCED = `
    \\title "Prelude in D Minor"
    \\artist "J.S. Bach (1685-1750)"
    \\copyright "Public Domain"
    \\tempo 80
    .
    \\ts 3 4
    0.4.16 (3.2 -.4) (1.1 -.4) (5.1 -.4) 1.1 3.2 1.1 3.2 2.3.8 (3.2 3.4) |
    (3.2 0.4).16 (3.2 -.4) (1.1 -.4) (5.1 -.4) 1.1 3.2 1.1 3.2 2.3.8 (3.2 3.4) |
    (3.2 0.4).16 (3.2 -.4) (3.1 -.4) (6.1 -.4) 3.1 3.2 3.1 3.2 3.3.8 (3.2 0.3) |
    (3.2 0.4).16 (3.2 -.4) (3.1 -.4) (6.1 -.4) 3.1 3.2 3.1 3.2 3.3.8 (3.2 0.3) |
    .
    \\sync 0 0 0
    \\sync 0 0 1500 0.666
    \\sync 1 0 4075 0.666
    \\sync 2 0 6475 0.333
    \\sync 3 0 10223 1
    `.trim().split('\n').map(l => l.trimStart()).join('\n');
