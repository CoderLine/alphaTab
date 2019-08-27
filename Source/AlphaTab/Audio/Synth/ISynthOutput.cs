using System;
using AlphaTab.Audio.Synth.Ds;

namespace AlphaTab.Audio.Synth
{
    /// <summary>
    /// This is the base interface for output devices which can
    /// request and playback audio samples.
    /// </summary>
    public interface ISynthOutput
    {
        /// <summary>
        /// Gets the sample rate required by the output.
        /// </summary>
        int SampleRate { get; }

        /// <summary>
        /// Called when the output should be opened.
        /// </summary>
        void Open();

        /// <summary>
        /// Called when the sequencer finished the playback.
        /// This tells the output not to request any samples anymore after the existing buffers are finished.
        /// </summary>
        void SequencerFinished();

        /// <summary>
        /// Called when the output should start the playback.
        /// </summary>
        void Play();

        /// <summary>
        /// Called when the output should stop the playback.
        /// </summary>
        void Pause();

        /// <summary>
        /// Called when samples have been synthesized and should be added to the playback buffer.
        /// </summary>
        /// <param name="samples"></param>
        void AddSamples(float[] samples);

        /// <summary>
        /// Called when the samples in the output buffer should be reset. This is neeed for instance when seeking to another position.
        /// </summary>
        void ResetSamples();

        /// <summary>
        /// Fired when the output has been successfully opened and is ready to play samples.
        /// </summary>
        event Action Ready;

        /// <summary>
        /// Fired when a certain number of samples have been played.
        /// </summary>
        event Action<int> SamplesPlayed;

        /// <summary>
        /// Fired when the output needs more samples to be played.
        /// </summary>
        event Action SampleRequest;

        /// <summary>
        /// Fired when the last samples after calling SequencerFinished have been played.
        /// </summary>
        event Action Finished;

        /// <summary>
        /// Activates the output component.
        /// </summary>
        void Activate();
    }
}
