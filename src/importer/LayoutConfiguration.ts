import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';
import type { Score } from '@src/model/Score';
import type { PartConfiguration } from '@src/importer/PartConfiguration';

// PartConfiguration File Format Notes.
// Based off Guitar Pro 8
// The LayoutConfiguration is aligned with the data in the PartConfiguration.
// We haven't fully deciphered how they handle everything but its enough for our needs.

// File:
//    int32 (big endian) | Zoom Level encoded
//                       |   25% - 00 00 00 00
//                       |   50% - 00 00 00 01
//                       |   75% - 00 00 00 02
//                       |   90% - 00 00 00 03
//                       |   100% - 00 00 00 04
//                       |   110% - 00 00 00 05
//                       |   125% - 00 00 00 06
//                       |   150% - 00 00 00 07
//                       |   200% - 00 00 00 08
//                       |   300% - 00 00 00 08 (same as 200% -> strange)
//                       |   400% - 00 00 00 09
//                       |   800% - 00 00 00 0A
//                       |   Custom 69% - 00 00 00 02 (same as 75% -> closest match on 25% steps?)
//                       |   Custom 113% - 00 00 00 05 (same as 110%  -> closest match on 25% steps?)
//                       |   Fit To Page- 00 00 00 08 (same as 200% -> strange)
//                       |   Fit To width- 00 00 00 08 (same as 200% -> strange)
//    1 byte (enum)      | The main score view to use.
//                       |   0x00 -> Page - Vertical,
//                       |   0x01 -> Page - Grid,
//                       |   0x02 -> Page - Parchment,
//                       |   0x03 -> Screen - Vertical,
//                       |   0x04 -> Screen - Horizontal,
//                       |   0x05 -> Page - Horizontal
//    1 byte (bool)      | MultiVoice Cursor (CTRL+M)
//    ScoreView[]        | Data for all score views (number is aligned with PartConfiguration)

// ScoreView:
//    TrackViewGroup[]   | The individual track view groups (number is aligned with PartConfiguration)

// TrackViewGroup:
//    1 byte (bool)      | isVisible (true -> 0xFF, false -> 0x00)

class LayoutConfigurationScoreView {
    public trackViewGroups: LayoutConfigurationTrackViewGroup[] = [];
}

class LayoutConfigurationTrackViewGroup {
    public isVisible: boolean = false;
}

enum GuitarProView {
    PageVertical = 0x00,
    PageGrid = 0x01,
    PageParchment = 0x02,
    ScreenVertical = 0x03,
    ScreenHorizontal = 0x04,
    PageHorizontal = 0x05
}

export class LayoutConfiguration {
    public zoomLevel: number = 4;
    public view: GuitarProView = GuitarProView.PageVertical;
    public muiltiVoiceCursor: boolean = false;
    public scoreViews: LayoutConfigurationScoreView[] = [];

    public constructor(partConfiguration: PartConfiguration, layoutConfigurationData: Uint8Array) {
        const readable: ByteBuffer = ByteBuffer.fromBuffer(layoutConfigurationData);

        this.zoomLevel = IOHelper.readInt32BE(readable);
        this.view = readable.readByte() as GuitarProView;
        this.muiltiVoiceCursor = readable.readByte() !== 0;

        const scoreViewCount: number = partConfiguration.scoreViews.length;

        for (let i: number = 0; i < scoreViewCount; i++) {
            const scoreView = new LayoutConfigurationScoreView();
            this.scoreViews.push(scoreView);

            const partScoreView = partConfiguration.scoreViews[i];

            for (let j: number = 0; j < partScoreView.trackViewGroups.length; j++) {
                const trackViewGroup = new LayoutConfigurationTrackViewGroup();
                trackViewGroup.isVisible = readable.readByte() !== 0;

                scoreView.trackViewGroups.push(trackViewGroup);
            }
        }
    }

    public apply(score: Score): void {
        if (this.scoreViews.length > 0) {
            let trackIndex = 0;
            for (const trackConfig of this.scoreViews[0].trackViewGroups) {
                if (trackIndex < score.tracks.length) {
                    const track = score.tracks[trackIndex];
                    track.isVisibleOnMultiTrack = trackConfig.isVisible;
                }
                trackIndex++;
            }
        }
    }

    public static writeForScore(score: Score): Uint8Array {
        const writer = ByteBuffer.withCapacity(128);

        IOHelper.writeInt32BE(writer, 4); // 100% Zoom
        writer.writeByte(0x00); // Page - Vertical

        const isMultiVoice = score.tracks.length > 0 && score.tracks[0].staves[0].bars[0].isMultiVoice;
        writer.writeByte(isMultiVoice ? 0xff : 0x00);

        // ScoreView[0] => Multi Track Score View
        for (const track of score.tracks) {
            writer.writeByte(track.isVisibleOnMultiTrack ? 0xff : 0x00);
        }

        // Single Track Views for each track
        for (const _track of score.tracks) {
            writer.writeByte(0xff);
        }

        return writer.toArray();
    }
}
