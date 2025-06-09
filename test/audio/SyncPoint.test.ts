import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { MidiFileGenerator } from '@src/midi/MidiFileGenerator';
import { Settings } from '@src/Settings';
import { FlatMidiEventGenerator } from '@test/audio/FlatMidiEventGenerator';
import { expect } from 'chai';

describe('SyncPointTests', () => {
    it('sync-point-update', () => {
        // MidiFileSequencer
        // sync points and tempo changes -> expect interpolation
    });

    it('backing-track-time-mapping', () => {
        // MidiFileSequencer
        // do a variety of lookups along the time axis.
        // - sequentially (playback)
        // - jumps (seeks back and forth)
        // check
        // - updated syncPointIndex
        // - interpolated time
        // - reverse lookup with mainTimePositionToBackingTrack
    });

    function syncPointTestScore() {
        const settings = new Settings();
        const importer = new AlphaTexImporter();

        // Tempo 120:  2000ms per bar
        // Tempo 60:   4000ms per bar
        // Tempo 80:   3000ms per bar

        importer.initFromString(
            `
            .
            \\tempo 120

            C4 * 4 |
            C4 * 4 |
            C4 * 4 |
            C4 * 4 |

            \\tempo 60
            C4 * 4 |
            C4 * 4 |
            C4 * 4 |
            C4 * 4 |

            \\tempo 80
            \\ro 
            C4 * 4 |
            C4 * 4 |
            C4 * 4 |
            \\rc 2
            C4 * 4 |

            .

            \\sync 0  0 0     
            \\sync 2  0 8000  // 00:08 instead of 00:04 -> should give half BPM of 60 
                              
            \\sync 4  0 10000  // restore tempo 60 at 00:10  
            \\sync 5  0 14000  // 00:14 

            \\sync 8  0 26000 // 00:26 on first occurence speed up to 120bpm 
            \\sync 9  0 28000 // 00:28 
            
            \\sync 9  1 36000 // 00:36 on second occurence of bar 9 restore tempo 80 until end
            \\sync 10 1 39000 // 00:39
            
        `,
            settings
        );
        const score = importer.readScore();

        return score;
    }

    it('sync-point-generation', () => {
        const score = syncPointTestScore();

        const handler = new FlatMidiEventGenerator();
        const generator = new MidiFileGenerator(score, new Settings(), handler);
        generator.generate();

        expect(generator.syncPoints).toMatchSnapshot();

        const update = MidiFileGenerator.generateSyncPoints(score);

        expect(generator.syncPoints.length).to.equal(update.length);
        for (let i = 0; i < generator.syncPoints.length; i++) {
            expect(update[i].masterBarIndex).to.equal(generator.syncPoints[i].masterBarIndex);
            expect(update[i].masterBarOccurence).to.equal(generator.syncPoints[i].masterBarOccurence);
            expect(update[i].syncBpm).to.equal(generator.syncPoints[i].syncBpm);
            expect(update[i].syncTime).to.equal(generator.syncPoints[i].syncTime);
            expect(update[i].synthBpm).to.equal(generator.syncPoints[i].synthBpm);
            expect(update[i].synthTick).to.equal(generator.syncPoints[i].synthTick);
            expect(update[i].synthTime).to.equal(generator.syncPoints[i].synthTime);
        }
    });

    it('modified-tempo-lookup', () => {
        const score = syncPointTestScore();
        expect(MidiFileGenerator.buildModifiedTempoLookup(score)).toMatchSnapshot();
    });

    it('playback-normal-backing-track', () => {
        // BackingTrackPlayer
        // play a variety of songs artificially
        // check
        // - the positionChanged event list provided
    });

    it('playback-slow-backing-track', () => {
        // BackingTrackPlayer
        // play a variety of songs artificially (other 0.5 speed)
        // check
        // - the positionChanged event list provided
    });

    it('seek-normal-backing-track', () => {
        // BackingTrackPlayer
        // seek to a given position
        // check
        // - the positionChanged event list provided
    });

    it('seek-slow-backing-track', () => {
        // BackingTrackPlayer
        // seek to a given position (playbackSpeed 0.5)
        // check
        // - the positionChanged event list provided
    });

    it('playback-normal-external-media', () => {
        // ExternalMediaPlayer
        // play a variety of songs artificially
        // check
        // - the positionChanged event list provided
    });

    it('playback-slow-external-media', () => {
        // ExternalMediaPlayer
        // play a variety of songs artificially (other 0.5 speed)
        // check
        // - the positionChanged event list provided
    });

    it('seek-normal-external-media', () => {
        // ExternalMediaPlayer
        // seek to a given position
        // check
        // - the positionChanged event list provided
    });

    it('seek-slow-external-media', () => {
        // ExternalMediaPlayer
        // seek to a given position (playbackSpeed 0.5)
        // check
        // - the positionChanged event list provided
    });
});
