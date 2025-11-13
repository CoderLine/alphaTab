import { tu } from './properties/beat/tu';
import { ac } from './metadata/bar/ac';
import { accidentals } from './metadata/bar/accidentals';
import { ae } from './metadata/bar/ae';
import { barlineLeft } from './metadata/bar/barlineleft';
import { barlineRight } from './metadata/bar/barlineright';
import { clef } from './metadata/bar/clef';
import { ft } from './metadata/bar/ft';
import { jump } from './metadata/bar/jump';
import { ks } from './metadata/bar/ks';
import { ottava } from './metadata/bar/ottava';
import { rc } from './metadata/bar/rc';
import { ro } from './metadata/bar/ro';
import { scale } from './metadata/bar/scale';
import { section } from './metadata/bar/section';
import { simile } from './metadata/bar/simile';
import { spd } from './metadata/bar/spd';
import { sph } from './metadata/bar/sph';
import { spu } from './metadata/bar/spu';
import { sync } from './metadata/bar/sync';
import { tempo } from './metadata/bar/tempo';
import { tf } from './metadata/bar/tf';
import { ts } from './metadata/bar/ts';
import { width } from './metadata/bar/width';

import { album } from './metadata/score/album';
import { artist } from './metadata/score/artist';
import { bracketExtendMode } from './metadata/score/bracketextendmode';
import { copyright } from './metadata/score/copyright';
import { copyright2 } from './metadata/score/copyright2';
import { defaultSystemsLayout } from './metadata/score/defaultsystemslayout';
import { firstSystemTrackNameMode } from './metadata/score/firstsystemtracknamemode';
import { firstSystemTrackNameOrientation } from './metadata/score/firstsystemtracknameorientation';
import { hideDynamics } from './metadata/score/hidedynamics';
import { instructions } from './metadata/score/instructions';
import { multiBarRest } from './metadata/score/multibarrest';
import { multiTrackTrackNamePolicy } from './metadata/score/multitracktracknamepolicy';
import { music } from './metadata/score/music';
import { notices } from './metadata/score/notices';
import { otherSystemsTrackNameMode } from './metadata/score/othersystemtracknamemode';
import { otherSystemsTrackNameOrientation } from './metadata/score/othersystemtracknameorientation';
import { showDynamics } from './metadata/score/showdynamics';
import { singleTrackTrackNamePolicy } from './metadata/score/singletracktracknamepolicy';
import { subtitle } from './metadata/score/subtitle';
import { systemsLayout } from './metadata/score/systemslayout';
import { tab } from './metadata/score/tab';
import { title } from './metadata/score/title';
import { useSystemSignSeparator } from './metadata/score/usesystemsignseparator';
import { words } from './metadata/score/words';
import { wordsAndMusic } from './metadata/score/wordsandmusic';

import { articulation } from './metadata/staff/articulation';
import { capo } from './metadata/staff/capo';
import { chord } from './metadata/staff/chord';
import { displayTranspose } from './metadata/staff/displaytranspose';
import { lyrics } from './metadata/staff/lyrics';
import { transpose } from './metadata/staff/transpose';
import { tuning } from './metadata/staff/tuning';

import { staff } from './metadata/structural/staff';
import { track } from './metadata/structural/track';
import { voice } from './metadata/structural/voice';

import { metadata, properties, type MetadataDoc, type WithDescription } from './types';
import { f } from './properties/beat/f';
import { fo } from './properties/beat/fo';
import { vs } from './properties/beat/vs';
import { v } from './properties/beat/v';
import { vw } from './properties/beat/vw';
import { s } from './properties/beat/s';
import { p } from './properties/beat/p';
import { tt } from './properties/beat/tt';
import { d } from './properties/beat/d';
import { dd } from './properties/beat/dd';
import { su } from './properties/beat/su';
import { sd } from './properties/beat/sd';
import { cre } from './properties/beat/cre';
import { dec } from './properties/beat/dec';
import { beatSpd } from './properties/beat/spd';
import { beatSph } from './properties/beat/sph';
import { beatSpu } from './properties/beat/spu';
import { beatSpe } from './properties/beat/spe';
import { slashed } from './properties/beat/slashed';
import { ds } from './properties/beat/ds';
import { glpf } from './properties/beat/glpf';
import { glpt } from './properties/beat/glpt';
import { waho } from './properties/beat/waho';
import { wahc } from './properties/beat/wahc';
import { legatoOrigin } from './properties/beat/legatoOrigin';
import { timer } from './properties/beat/timer';
import { txt } from './properties/beat/txt';
import { tb } from './properties/beat/tb';
import { tbe } from './properties/beat/tbe';
import { beatLyrics } from './properties/beat/lyrics';
import { bu } from './properties/beat/bu';
import { bd } from './properties/beat/bd';
import { au } from './properties/beat/au';
import { ad } from './properties/beat/ad';
import { ch } from './properties/beat/ch';
import { gr } from './properties/beat/gr';
import { dy } from './properties/beat/dy';
import { beatTempo } from './properties/beat/tempo';
import { volume } from './properties/beat/volume';
import { balance } from './properties/beat/balance';
import { tp } from './properties/beat/tp';
import { barre } from './properties/beat/barre';
import { rasg } from './properties/beat/rasg';
import { ot } from './properties/beat/ot';
import { instrument } from './properties/beat/instrument';
import { bank } from './properties/beat/bank';
import { fermata } from './properties/beat/fermata';
import { beam } from './properties/beat/beam';
import { nh } from './properties/note/nh';
import { ah } from './properties/note/ah';
import { th } from './properties/note/th';
import { ph } from './properties/note/ph';
import { sh } from './properties/note/sh';
import { fh } from './properties/note/fh';
import { noteVibrato } from './properties/note/v';
import { noteVibratoWide } from './properties/note/vw';
import { sl } from './properties/note/sl';
import { ss } from './properties/note/ss';
import { sib } from './properties/note/sib';
import { sia } from './properties/note/sia';
import { sou } from './properties/note/sou';
import { sod } from './properties/note/sod';
import { psu } from './properties/note/psu';
import { psd } from './properties/note/psd';
import { h } from './properties/note/h';
import { lht } from './properties/note/lht';
import { g } from './properties/note/g';
import { hac } from './properties/note/hac';
import { ten } from './properties/note/ten';
import { noteAccentuation } from './properties/note/ac';
import { tr } from './properties/note/tr';
import { pm } from './properties/note/pm';
import { st } from './properties/note/st';
import { lr } from './properties/note/lr';
import { x } from './properties/note/x';
import { t } from './properties/note/t';
import { turn } from './properties/note/turn';
import { iturn } from './properties/note/iturn';
import { umordent } from './properties/note/umordent';
import { lmordent } from './properties/note/lmordent';
import { string } from './properties/note/string';
import { hide } from './properties/note/hide';
import { b } from './properties/note/b';
import { be } from './properties/note/be';
import { lf } from './properties/note/lf';
import { rf } from './properties/note/rf';
import { acc } from './properties/note/acc';
import { slur } from './properties/note/slur';

export const structuralMetaData = metadata(track, staff, voice);
export const scoreMetaData = metadata(
    title,
    subtitle,
    artist,
    album,
    words,
    music,
    wordsAndMusic,
    copyright,
    copyright2,
    instructions,
    notices,
    tab,
    systemsLayout,
    defaultSystemsLayout,
    showDynamics,
    hideDynamics,
    useSystemSignSeparator,
    multiBarRest,
    bracketExtendMode,
    singleTrackTrackNamePolicy,
    multiTrackTrackNamePolicy,
    firstSystemTrackNameMode,
    otherSystemsTrackNameMode,
    firstSystemTrackNameOrientation,
    otherSystemsTrackNameOrientation
);

export const staffMetaData = metadata(tuning, chord, capo, lyrics, articulation, displayTranspose, transpose);

export const barMetaData = metadata(
    ts,
    ro,
    rc,
    ae,
    ks,
    clef,
    ottava,
    tempo,
    tf,
    ac,
    section,
    jump,
    ft,
    simile,
    barlineLeft,
    barlineRight,
    scale,
    width,
    sync,
    accidentals,
    spd,
    sph,
    spu
);

export const allMetadata = new Map<string, MetadataDoc>([
    ...structuralMetaData.entries(),
    ...scoreMetaData.entries(),
    ...staffMetaData.entries(),
    ...barMetaData.entries()
]);

export const durationChangeProperties = properties(tu);

export const beatProperties = properties(
    f,
    fo,
    vs,
    v,
    vw,
    s,
    p,
    tt,
    d,
    dd,
    su,
    sd,
    cre,
    dec,
    beatSpd,
    beatSph,
    beatSpu,
    beatSpe,
    slashed,
    ds,
    glpf,
    glpt,
    waho,
    wahc,
    legatoOrigin,
    timer,
    tu,
    txt,
    beatLyrics,
    tb,
    tbe,
    bu,
    bd,
    au,
    ad,
    ch,
    gr,
    dy,
    beatTempo,
    volume,
    balance,
    tp,
    barre,
    rasg,
    ot,
    instrument,
    bank,
    fermata,
    beam
);

export const noteProperties = properties(
    nh,
    ah,
    th,
    ph,
    sh,
    fh,
    noteVibrato,
    noteVibratoWide,
    sl,
    ss,
    sib,
    sia,
    sou,
    sod,
    psu,
    psd,
    h,
    lht,
    g,
    noteAccentuation,
    hac,
    ten,
    tr,
    pm,
    st,
    lr,
    x,
    t,
    turn,
    iturn,
    umordent,
    lmordent,
    string,
    hide,
    b,
    be,
    lf,
    rf,
    acc,
    slur
);

const spaces = /^([ ]+)/;

function prepareDescription(item: WithDescription) {
    const txt = item.longDescription;
    if (txt === undefined) {
        return;
    }

    const lines = txt.split('\n');
    if (lines[0].trim() === '') {
        lines.splice(0, 1);
    }

    const space = spaces.exec(lines[0]);
    if (space) {
        const trimmed = lines.map(l => l.substring(space[0].length));
        item.longDescription = trimmed.join('\n');
        if (!item.shortDescription) {
            item.shortDescription = trimmed[0].substring(0, 100);
        }
    } else if (!item.shortDescription) {
        item.shortDescription = lines[0].substring(0, 100);
    }
}

for (const d of allMetadata.values()) {
    prepareDescription(d);
    for (const v of d.values) {
        prepareDescription(v);
    }
    if (d.properties) {
        for (const p of d.properties.values()) {
            prepareDescription(p);
            for (const v of p.values) {
                prepareDescription(v);
            }
        }
    }
}
