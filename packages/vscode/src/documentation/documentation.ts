import { album } from './metadata/album';
import { artist } from './metadata/artist';
import { bracketExtendMode } from './metadata/bracketextendmode';
import { copyright } from './metadata/copyright';
import { copyright2 } from './metadata/copyright2';
import { defaultSystemsLayout } from './metadata/defaultsystemslayout';
import { firstSystemTrackNameMode } from './metadata/firstsystemtracknamemode';
import { firstSystemTrackNameOrientation } from './metadata/firstsystemtracknameorientation';
import { hideDynamics } from './metadata/hidedynamics';
import { instructions } from './metadata/instructions';
import { multiBarRest } from './metadata/multibarrest';
import { multiTrackTrackNamePolicy } from './metadata/multitracktracknamepolicy';
import { music } from './metadata/music';
import { notices } from './metadata/notices';
import { otherSystemsTrackNameMode } from './metadata/othersystemtracknamemode';
import { otherSystemsTrackNameOrientation } from './metadata/othersystemtracknameorientation';
import { showDynamics } from './metadata/showdynamics';
import { singleTrackTrackNamePolicy } from './metadata/singletracktracknamepolicy';
import { staff } from './metadata/staff';
import { subtitle } from './metadata/subtitle';
import { systemsLayout } from './metadata/systemslayout';
import { tab } from './metadata/tab';
import { title } from './metadata/title';
import { track } from './metadata/track';
import { useSystemSignSeparator } from './metadata/usesystemsignseparator';
import { voice } from './metadata/voice';
import { words } from './metadata/words';
import { wordsAndMusic } from './metadata/wordsandmusic';
import type { MetadataDoc, PropertyDoc, WithDescription } from './types';

export const structuralMetaData = new Map<string, MetadataDoc>(
    [track, staff, voice].map(t => [t.tag.toLowerCase(), t])
);
export const scoreMetaData = new Map<string, MetadataDoc>(
    [
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
    ].map(t => [t.tag.toLowerCase(), t])
);

export const staffMetaData = new Map<string, MetadataDoc>(
    // TODO
);

export const barMetaData = new Map<string, MetadataDoc>(
    // TODO
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
    const txt = item.description;
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
        item.description = trimmed.join('\n');
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
