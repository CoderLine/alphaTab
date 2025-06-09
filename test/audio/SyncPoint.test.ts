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

    it('sync-point-generation-midi', () => {
        // MidiFileGenerator
        // generate midi from a song with tempo changes and sync points
        // check
        // - filled .syncPoints
    });

    it('sync-poing-generation-update', () => {
        // MidiFileGenerator
        // call generateSyncPoints
        // check
        // - it equals the point generation when creating a midi
        // - check the points in general
    });

    it('modified-tempo-lookup', () => {
        // MidiFileGenerator
        // call buildModifiedTempoLookup
        // check
        // - the correct BPM values
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
