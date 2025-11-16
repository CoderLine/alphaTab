import { ac } from '@src/documentation/metadata/bar/ac';
import { accidentals } from '@src/documentation/metadata/bar/accidentals';
import { ae } from '@src/documentation/metadata/bar/ae';
import { barlineLeft } from '@src/documentation/metadata/bar/barlineleft';
import { barlineRight } from '@src/documentation/metadata/bar/barlineright';
import { clef } from '@src/documentation/metadata/bar/clef';
import { ft } from '@src/documentation/metadata/bar/ft';
import { jump } from '@src/documentation/metadata/bar/jump';
import { ks } from '@src/documentation/metadata/bar/ks';
import { ottava } from '@src/documentation/metadata/bar/ottava';
import { rc } from '@src/documentation/metadata/bar/rc';
import { ro } from '@src/documentation/metadata/bar/ro';
import { scale } from '@src/documentation/metadata/bar/scale';
import { section } from '@src/documentation/metadata/bar/section';
import { simile } from '@src/documentation/metadata/bar/simile';
import { spd } from '@src/documentation/metadata/bar/spd';
import { sph } from '@src/documentation/metadata/bar/sph';
import { spu } from '@src/documentation/metadata/bar/spu';
import { sync } from '@src/documentation/metadata/bar/sync';
import { tempo } from '@src/documentation/metadata/bar/tempo';
import { tf } from '@src/documentation/metadata/bar/tf';
import { ts } from '@src/documentation/metadata/bar/ts';
import { width } from '@src/documentation/metadata/bar/width';
import { album } from '@src/documentation/metadata/score/album';
import { artist } from '@src/documentation/metadata/score/artist';
import { bracketExtendMode } from '@src/documentation/metadata/score/bracketextendmode';
import { copyright } from '@src/documentation/metadata/score/copyright';
import { copyright2 } from '@src/documentation/metadata/score/copyright2';
import { defaultSystemsLayout } from '@src/documentation/metadata/score/defaultsystemslayout';
import { firstSystemTrackNameMode } from '@src/documentation/metadata/score/firstsystemtracknamemode';
import { firstSystemTrackNameOrientation } from '@src/documentation/metadata/score/firstsystemtracknameorientation';
import { hideDynamics } from '@src/documentation/metadata/score/hidedynamics';
import { instructions } from '@src/documentation/metadata/score/instructions';
import { multiBarRest } from '@src/documentation/metadata/score/multibarrest';
import { multiTrackTrackNamePolicy } from '@src/documentation/metadata/score/multitracktracknamepolicy';
import { music } from '@src/documentation/metadata/score/music';
import { notices } from '@src/documentation/metadata/score/notices';
import { otherSystemsTrackNameMode } from '@src/documentation/metadata/score/othersystemtracknamemode';
import { otherSystemsTrackNameOrientation } from '@src/documentation/metadata/score/othersystemtracknameorientation';
import { showDynamics } from '@src/documentation/metadata/score/showdynamics';
import { singleTrackTrackNamePolicy } from '@src/documentation/metadata/score/singletracktracknamepolicy';
import { subtitle } from '@src/documentation/metadata/score/subtitle';
import { systemsLayout } from '@src/documentation/metadata/score/systemslayout';
import { tab } from '@src/documentation/metadata/score/tab';
import { title } from '@src/documentation/metadata/score/title';
import { useSystemSignSeparator } from '@src/documentation/metadata/score/usesystemsignseparator';
import { words } from '@src/documentation/metadata/score/words';
import { wordsAndMusic } from '@src/documentation/metadata/score/wordsandmusic';
import { articulation } from '@src/documentation/metadata/staff/articulation';
import { capo } from '@src/documentation/metadata/staff/capo';
import { chord } from '@src/documentation/metadata/staff/chord';
import { displayTranspose } from '@src/documentation/metadata/staff/displaytranspose';
import { lyrics } from '@src/documentation/metadata/staff/lyrics';
import { transpose } from '@src/documentation/metadata/staff/transpose';
import { tuning } from '@src/documentation/metadata/staff/tuning';
import { staff } from '@src/documentation/metadata/structural/staff';
import { track } from '@src/documentation/metadata/structural/track';
import { voice } from '@src/documentation/metadata/structural/voice';
import { ad } from '@src/documentation/properties/beat/ad';
import { au } from '@src/documentation/properties/beat/au';
import { balance } from '@src/documentation/properties/beat/balance';
import { bank } from '@src/documentation/properties/beat/bank';
import { barre } from '@src/documentation/properties/beat/barre';
import { bd } from '@src/documentation/properties/beat/bd';
import { beam } from '@src/documentation/properties/beat/beam';
import { bu } from '@src/documentation/properties/beat/bu';
import { ch } from '@src/documentation/properties/beat/ch';
import { cre } from '@src/documentation/properties/beat/cre';
import { d } from '@src/documentation/properties/beat/d';
import { dd } from '@src/documentation/properties/beat/dd';
import { dec } from '@src/documentation/properties/beat/dec';
import { ds } from '@src/documentation/properties/beat/ds';
import { dy } from '@src/documentation/properties/beat/dy';
import { f } from '@src/documentation/properties/beat/f';
import { fermata } from '@src/documentation/properties/beat/fermata';
import { fo } from '@src/documentation/properties/beat/fo';
import { glpf } from '@src/documentation/properties/beat/glpf';
import { glpt } from '@src/documentation/properties/beat/glpt';
import { gr } from '@src/documentation/properties/beat/gr';
import { instrument } from '@src/documentation/properties/beat/instrument';
import { legatoOrigin } from '@src/documentation/properties/beat/legatoOrigin';
import { beatLyrics } from '@src/documentation/properties/beat/lyrics';
import { ot } from '@src/documentation/properties/beat/ot';
import { p } from '@src/documentation/properties/beat/p';
import { rasg } from '@src/documentation/properties/beat/rasg';
import { s } from '@src/documentation/properties/beat/s';
import { sd } from '@src/documentation/properties/beat/sd';
import { slashed } from '@src/documentation/properties/beat/slashed';
import { beatSpd } from '@src/documentation/properties/beat/spd';
import { beatSpe } from '@src/documentation/properties/beat/spe';
import { beatSph } from '@src/documentation/properties/beat/sph';
import { beatSpu } from '@src/documentation/properties/beat/spu';
import { su } from '@src/documentation/properties/beat/su';
import { tb } from '@src/documentation/properties/beat/tb';
import { tbe } from '@src/documentation/properties/beat/tbe';
import { beatTempo } from '@src/documentation/properties/beat/tempo';
import { timer } from '@src/documentation/properties/beat/timer';
import { tp } from '@src/documentation/properties/beat/tp';
import { tt } from '@src/documentation/properties/beat/tt';
import { tu } from '@src/documentation/properties/beat/tu';
import { txt } from '@src/documentation/properties/beat/txt';
import { v } from '@src/documentation/properties/beat/v';
import { volume } from '@src/documentation/properties/beat/volume';
import { vs } from '@src/documentation/properties/beat/vs';
import { vw } from '@src/documentation/properties/beat/vw';
import { wahc } from '@src/documentation/properties/beat/wahc';
import { waho } from '@src/documentation/properties/beat/waho';
import { noteAccentuation } from '@src/documentation/properties/note/ac';
import { acc } from '@src/documentation/properties/note/acc';
import { ah } from '@src/documentation/properties/note/ah';
import { b } from '@src/documentation/properties/note/b';
import { be } from '@src/documentation/properties/note/be';
import { fh } from '@src/documentation/properties/note/fh';
import { g } from '@src/documentation/properties/note/g';
import { h } from '@src/documentation/properties/note/h';
import { hac } from '@src/documentation/properties/note/hac';
import { hide } from '@src/documentation/properties/note/hide';
import { iturn } from '@src/documentation/properties/note/iturn';
import { lf } from '@src/documentation/properties/note/lf';
import { lht } from '@src/documentation/properties/note/lht';
import { lmordent } from '@src/documentation/properties/note/lmordent';
import { lr } from '@src/documentation/properties/note/lr';
import { nh } from '@src/documentation/properties/note/nh';
import { ph } from '@src/documentation/properties/note/ph';
import { pm } from '@src/documentation/properties/note/pm';
import { psd } from '@src/documentation/properties/note/psd';
import { psu } from '@src/documentation/properties/note/psu';
import { rf } from '@src/documentation/properties/note/rf';
import { sh } from '@src/documentation/properties/note/sh';
import { sia } from '@src/documentation/properties/note/sia';
import { sib } from '@src/documentation/properties/note/sib';
import { sl } from '@src/documentation/properties/note/sl';
import { slur } from '@src/documentation/properties/note/slur';
import { sod } from '@src/documentation/properties/note/sod';
import { sou } from '@src/documentation/properties/note/sou';
import { ss } from '@src/documentation/properties/note/ss';
import { st } from '@src/documentation/properties/note/st';
import { string } from '@src/documentation/properties/note/string';
import { t } from '@src/documentation/properties/note/t';
import { ten } from '@src/documentation/properties/note/ten';
import { th } from '@src/documentation/properties/note/th';
import { tr } from '@src/documentation/properties/note/tr';
import { turn } from '@src/documentation/properties/note/turn';
import { umordent } from '@src/documentation/properties/note/umordent';
import { noteVibrato } from '@src/documentation/properties/note/v';
import { noteVibratoWide } from '@src/documentation/properties/note/vw';
import { x } from '@src/documentation/properties/note/x';
import { type MetadataDoc, metadata, properties, type WithDescription } from '@src/documentation/types';

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

for (const d of beatProperties.values()) {
    prepareDescription(d);
    for (const v of d.values) {
        prepareDescription(v);
    }
}

for (const d of noteProperties.values()) {
    prepareDescription(d);
    for (const v of d.values) {
        prepareDescription(v);
    }
}
