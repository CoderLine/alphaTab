import { GpBinaryHelpers } from '@src/importer/Gp3To5Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';
import { Score } from '@src/model/Score';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';

export class TrackConfiguration {
    public showSlash: boolean = false;
    public showStandardNotation: boolean = false;
    public showTablature: boolean = false;
}

export class Part {
    public isMultiRest: boolean = false;
    public tracks: TrackConfiguration[] = [];
}

export class PartConfiguration {
    public parts: Part[] = [];
    public zoomLevel: number = 0;
    public layout: number = 0;

    public apply(score: Score): void {
        let staffIndex: number = 0;
        let trackIndex: number = 0;
        // the PartConfiguration is really twisted compared to how the score structure looks like.
        // the first part typically contains the settings for the first staff of all tracks.
        // but then there is 1 part with 1 track for each other staff of the tracks.
        // So the structure in the PartConfig appears to be:
        // Parts[0].Tracks = { Track1-Staff1, Track2-Staff1, Track3-Staff1, Track4-Staff1, .. }
        // Parts[1].Tracks = { Track1-Staff2 }
        // Parts[2].Tracks = { Track2-Staff2 }
        // Parts[3].Tracks = { Track3-Staff2 }
        // Parts[4].Tracks = { Track4-Staff2 }
        //
        // even if a track has only 1 staff, there are 2 staff configurations stored.
        // I hope Arobas never changes this in the format as the PartConfiguration is not versionized.
        for (let part of this.parts) {
            for (let trackConfig of part.tracks) {
                if (trackIndex < score.tracks.length) {
                    let track: Track = score.tracks[trackIndex];
                    if (staffIndex < track.staves.length) {
                        let staff: Staff = track.staves[staffIndex];
                        staff.showTablature = trackConfig.showTablature;
                        staff.showStandardNotation = trackConfig.showStandardNotation;
                    }
                }
                trackIndex++;
                if (trackIndex >= score.tracks.length) {
                    staffIndex++;
                    trackIndex = 0;
                }
            }
        }
    }

    public constructor(partConfigurationData: Uint8Array) {
        let readable: ByteBuffer = ByteBuffer.fromBuffer(partConfigurationData);
        let entryCount: number = IOHelper.readInt32BE(readable);

        for (let i: number = 0; i < entryCount; i++) {
            let part = new Part();
            this.parts.push(part);
            part.isMultiRest = GpBinaryHelpers.gpReadBool(readable);
            let groupCount: number = IOHelper.readInt32BE(readable);
            for (let j: number = 0; j < groupCount; j++) {
                let flags: number = readable.readByte();
                // enable at least standard notation
                if (flags === 0) {
                    flags = 1;
                }
                let trackConfiguration = new TrackConfiguration();
                trackConfiguration.showStandardNotation = (flags & 0x01) !== 0;
                trackConfiguration.showTablature = (flags & 0x02) !== 0;
                trackConfiguration.showSlash = (flags & 0x04) !== 0;
                part.tracks.push(trackConfiguration);
            }
        }
    }

    public static writeForScore(score: Score): Uint8Array {
        const writer = ByteBuffer.withCapacity(128);

        const parts: Part[] = [
            new Part() // default part always exists
        ];

        for (const track of score.tracks) {
            for (const staff of track.staves) {

                const trackConfiguration = new TrackConfiguration();
                trackConfiguration.showStandardNotation = staff.showStandardNotation;
                trackConfiguration.showTablature = staff.showTablature;

                if (staff.index === 0) {
                    parts[0].tracks.push(trackConfiguration);
                } else {
                    let part = new Part();
                    part.tracks.push(trackConfiguration);
                    parts.push(part);
                }
            }
        }

        IOHelper.writeInt32BE(writer, parts.length);
        for (const part of parts) {
            writer.writeByte(part.isMultiRest ? 1 : 0);
            IOHelper.writeInt32BE(writer, part.tracks.length);
            for(const track of part.tracks) {
                let flags = 0;
                if(track.showStandardNotation) {
                    flags |= 0x01;
                }
                if(track.showTablature) {
                    flags |= 0x02;
                }
                if(track.showSlash) {
                    flags |= 0x04;
                }
                writer.writeByte(flags);
            }
        }

        return writer.toArray();
    }
}
