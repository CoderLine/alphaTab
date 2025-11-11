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

import type { MetadataDoc, PropertyDoc, WithDescription } from './types';

function metadata(...metadata: MetadataDoc[]) {
    return new Map<string, MetadataDoc>(metadata.map(t => [t.tag.toLowerCase(), t]));
}

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

export const durationChangeProperties = new Map<string, PropertyDoc>(
    // TODO
);

export const beatProperties = new Map<string, PropertyDoc>(
    // TODO
);

export const noteProperties = new Map<string, PropertyDoc>(
    // TODO
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
