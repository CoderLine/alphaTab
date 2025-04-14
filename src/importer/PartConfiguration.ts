import { GpBinaryHelpers } from '@src/importer/Gp3To5Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';
import type { Score } from '@src/model/Score';
import type { Track } from '@src/model/Track';

// PartConfiguration File Format Notes.
// Based off Guitar Pro 8
// The file contains a serialized "Score View Collection" filled like this:
// There is always 1 ScoreView holding a TrackViewGroup for each Track contained in the file. This is the multi-track layout.
// Additionally there is 1 ScoreView individually for each track with only 1 TrackViewGroup of this Group.

// The Guitar Pro UI seem to update both the multi-track and the single-track layouts when changing the displayed staves.
// But technically it would support showing alternating staves in multi-track.

// For the multi-rest flag the respective TrackViewGroups need to be respected.

// File:
//    int32 (big endian) | Number of Score Views
//    ScoreView[]        | The individual score views
//    int32 (big endian) | The index to the currently active view

// ScoreView:
//    1 byte (boolean)   | "Multi Rest" - Whether multiple bars with rests should be combined (Bar > Multi Rest option)
//    int32 (big endian) | Number of following tems
//    TrackViewGroup[]   | The individual track view groups

// TrackViewGroup:
//    1 byte             | Track View Group Type Bitflag
//                       | 0th bit: showStandardNotation
//                       | 1th bit: showTablature
//                       | 2nd bit: showSlash
//                       | 3rd bit: numberedNotation (GP8 feature - jiǎnpǔ  aka Chinese Number Notation)
//                       | if no bits set -> activate standard notation
//

class PartConfigurationScoreView {
    public isMultiRest: boolean = false;
    public trackViewGroups: PartConfigurationTrackViewGroup[] = [];
}

class PartConfigurationTrackViewGroup {
    public showNumbered: boolean = false;
    public showSlash: boolean = false;
    public showStandardNotation: boolean = false;
    public showTablature: boolean = false;
}

export class PartConfiguration {
    public scoreViews: PartConfigurationScoreView[] = [];

    public apply(score: Score): void {
        // for now we only look at the first score view which seem to hold
        // the config for all tracks.
        if (this.scoreViews.length > 0) {
            let trackIndex = 0;

            score.stylesheet.multiTrackMultiBarRest = this.scoreViews[0].isMultiRest;

            for (const trackConfig of this.scoreViews[0].trackViewGroups) {
                if (trackIndex < score.tracks.length) {
                    const track: Track = score.tracks[trackIndex];
                    for (const staff of track.staves) {
                        staff.showTablature = trackConfig.showTablature;
                        staff.showStandardNotation = trackConfig.showStandardNotation;
                        staff.showSlash = trackConfig.showSlash;
                        staff.showNumbered = trackConfig.showNumbered;
                    }
                }
                trackIndex++;
            }

            for (let scoreViewIndex = 1; scoreViewIndex < this.scoreViews.length; scoreViewIndex++) {
                if (this.scoreViews[scoreViewIndex].isMultiRest) {
                    // lazy init
                    if (!score.stylesheet.perTrackMultiBarRest) {
                        score.stylesheet.perTrackMultiBarRest = new Set<number>();
                    }

                    trackIndex = scoreViewIndex - 1;
                    score.stylesheet.perTrackMultiBarRest!.add(trackIndex);
                }
            }
        }
    }

    public constructor(partConfigurationData: Uint8Array) {
        const readable: ByteBuffer = ByteBuffer.fromBuffer(partConfigurationData);

        const scoreViewCount: number = IOHelper.readInt32BE(readable);

        for (let i: number = 0; i < scoreViewCount; i++) {
            const scoreView = new PartConfigurationScoreView();
            this.scoreViews.push(scoreView);

            scoreView.isMultiRest = GpBinaryHelpers.gpReadBool(readable);

            const trackViewGroupCount: number = IOHelper.readInt32BE(readable);
            for (let j: number = 0; j < trackViewGroupCount; j++) {
                let flags: number = readable.readByte();
                // enable at least standard notation
                if (flags === 0) {
                    flags = 1;
                }
                const trackConfiguration = new PartConfigurationTrackViewGroup();
                trackConfiguration.showStandardNotation = (flags & 0x01) !== 0;
                trackConfiguration.showTablature = (flags & 0x02) !== 0;
                trackConfiguration.showSlash = (flags & 0x04) !== 0;
                trackConfiguration.showNumbered = (flags & 0x08) !== 0;
                scoreView.trackViewGroups.push(trackConfiguration);
            }
        }
    }

    public static writeForScore(score: Score): Uint8Array {
        const writer = ByteBuffer.withCapacity(128);

        const scoreViews: PartConfigurationScoreView[] = [
            new PartConfigurationScoreView() // Multi Track Score View
        ];

        scoreViews[0].isMultiRest = score.stylesheet.multiTrackMultiBarRest;

        for (const track of score.tracks) {
            const trackConfiguration = new PartConfigurationTrackViewGroup();
            // NOTE: unclear how multi staff settings are meant in this format
            // in the Guitar Pro UI there is no individual staff config
            trackConfiguration.showStandardNotation = track.staves[0].showStandardNotation;
            trackConfiguration.showTablature = track.staves[0].showTablature;
            trackConfiguration.showSlash = track.staves[0].showSlash;
            trackConfiguration.showNumbered = track.staves[0].showNumbered;

            scoreViews[0].trackViewGroups.push(trackConfiguration);

            const singleTrackScoreView = new PartConfigurationScoreView();
            singleTrackScoreView.isMultiRest = score.stylesheet.perTrackMultiBarRest?.has(track.index) === true;
            singleTrackScoreView.trackViewGroups.push(trackConfiguration);
            scoreViews.push(singleTrackScoreView);
        }

        IOHelper.writeInt32BE(writer, scoreViews.length);
        for (const part of scoreViews) {
            writer.writeByte(part.isMultiRest ? 1 : 0);
            IOHelper.writeInt32BE(writer, part.trackViewGroups.length);
            for (const track of part.trackViewGroups) {
                let flags = 0;
                if (track.showStandardNotation) {
                    flags = flags | 0x01;
                }
                if (track.showTablature) {
                    flags = flags | 0x02;
                }
                if (track.showSlash) {
                    flags = flags | 0x04;
                }
                if (track.showNumbered) {
                    flags = flags | 0x08;
                }
                writer.writeByte(flags);
            }
        }

        IOHelper.writeInt32BE(writer, 1 /* First Single Track Layout */);

        return writer.toArray();
    }
}
