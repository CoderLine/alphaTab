/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using System;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Util;

namespace AlphaTab.Platform.JavaScript
{
    class AlphaSynthWorkerSynthOutput : ISynthOutput
    {
        public const string CmdOutputPrefix = AlphaSynthWebWorker.CmdPrefix + "output.";

        // Worker -> Output
        public const string CmdOutputSequencerFinished = CmdOutputPrefix + "sequencerFinished";
        public const string CmdOutputAddSamples = CmdOutputPrefix + "addSamples";
        public const string CmdOutputPlay = CmdOutputPrefix + "play";
        public const string CmdOutputPause = CmdOutputPrefix + "pause";
        public const string CmdOutputResetSamples = CmdOutputPrefix + "resetSamples";

        // Output -> Worker
        public const string CmdOutputSampleRequest = CmdOutputPrefix + "sampleRequest";
        public const string CmdOutputFinished = CmdOutputPrefix + "finished";
        public const string CmdOutputSamplesPlayed = CmdOutputPrefix + "samplesPlayed";


        // this value is initialized by the alphaSynth WebWorker wrapper 
        // that also includes the alphaSynth library into the worker. 
        public static int PreferredSampleRate { get; set; }

        private DedicatedWorkerGlobalScope _worker;

        public int SampleRate
        {
            get { return PreferredSampleRate; }
        }

        public void Open()
        {
            Logger.Debug("AlphaSynth", "Initializing webworker worker");
            _worker = Lib.Global;
            _worker.AddEventListener("message", (Action<MessageEvent>)HandleMessage);
            Ready();
        }

        private void HandleMessage(MessageEvent e)
        {
            var data = e.Data;
            var cmd = data.cmd;
            switch (cmd)
            {
                case CmdOutputSampleRequest:
                    SampleRequest();
                    break;
                case CmdOutputFinished:
                    Finished();
                    break;
                case CmdOutputSamplesPlayed:
                    SamplesPlayed(data.samples);
                    break;
            }
        }


        public event Action Ready;
        public event Action<int> SamplesPlayed;
        public event Action SampleRequest;
        public event Action Finished;

        public void SequencerFinished()
        {
            _worker.PostMessage(new { cmd = CmdOutputSequencerFinished });
        }

        public void AddSamples(SampleArray samples)
        {
            _worker.PostMessage(new { cmd = CmdOutputAddSamples, samples = samples });
        }

        public void Play()
        {
            _worker.PostMessage(new { cmd = CmdOutputPlay });
        }

        public void Pause()
        {
            _worker.PostMessage(new { cmd = CmdOutputPause });
        }

        public void ResetSamples()
        {
            _worker.PostMessage(new { cmd = CmdOutputResetSamples });
        }

        public void Activate()
        {
        }
    }
}
