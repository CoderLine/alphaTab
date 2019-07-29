using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class VoiceNode
    {
        public Voice Value { get; set; }
        public VoiceNode Next { get; set; }
    }

    internal class VoiceManager
    {
        private Voice[] _voicePool;
        private LinkedList<VoiceNode> _vNodes;

        public int Polyphony { get; set; }
        public LinkedList<Voice> FreeVoices { get; set; }
        public LinkedList<Voice> ActiveVoices { get; set; }
        public VoiceNode[][] Registry { get; set; }

        public VoiceManager(int voiceCount)
        {
            Polyphony = voiceCount;

            _voicePool = new Voice[voiceCount];
            _vNodes = new LinkedList<VoiceNode>();
            FreeVoices = new LinkedList<Voice>();
            ActiveVoices = new LinkedList<Voice>();

            for (var i = 0; i < voiceCount; i++)
            {
                var v = new Voice();
                _voicePool[i] = v;
                _vNodes.AddLast(new VoiceNode());
                FreeVoices.AddLast(v);
            }

            Registry = new VoiceNode[SynthConstants.DefaultChannelCount][];
            for (var i = 0; i < Registry.Length; i++)
            {
                Registry[i] = new VoiceNode[SynthConstants.DefaultKeyCount];
            }
        }

        public Voice GetFreeVoice()
        {
            if (FreeVoices.Length > 0)
            {
                var voice = FreeVoices.First.Value;
                FreeVoices.RemoveFirst();
                return voice;
            }

            return StealQuietestVoice();
        }

        public void AddToRegistry(Voice voice)
        {
            var node = _vNodes.RemoveLast();
            node.Value = voice;
            node.Next = Registry[voice.VoiceParams.Channel][voice.VoiceParams.Note];
            Registry[voice.VoiceParams.Channel][voice.VoiceParams.Note] = node;
        }

        public void RemoveFromRegistry(int channel, int note)
        {
            var node = Registry[channel][note];
            while (node != null)
            {
                _vNodes.AddLast(node);
                node = node.Next;
            }

            Registry[channel][note] = null;
        }

        public void RemoveVoiceFromRegistry(Voice voice)
        {
            var node = Registry[voice.VoiceParams.Channel][voice.VoiceParams.Note];
            if (node == null)
            {
                return;
            }

            if (node.Value == voice)
            {
                Registry[voice.VoiceParams.Channel][voice.VoiceParams.Note] = node.Next;
                _vNodes.AddLast(node);
            }
            else
            {
                var node2 = node;
                node = node.Next;
                while (node != null)
                {
                    if (node.Value == voice)
                    {
                        node2.Next = node.Next;
                        _vNodes.AddLast(node);
                        return;
                    }

                    node2 = node;
                    node = node.Next;
                }
            }
        }

        public void ClearRegistry()
        {
            var node = ActiveVoices.First;
            while (node != null)
            {
                var vnode = Registry[node.Value.VoiceParams.Channel][node.Value.VoiceParams.Note];
                while (vnode != null)
                {
                    _vNodes.AddLast(vnode);
                    vnode = vnode.Next;
                }

                Registry[node.Value.VoiceParams.Channel][node.Value.VoiceParams.Note] = null;
                node = node.Next;
            }
        }

        public void UnloadPatches()
        {
            foreach (var v in _voicePool)
            {
                v.Configure(0, 0, 0, null, null);
                var current = _vNodes.First;
                while (current != null)
                {
                    current.Value.Value = null;
                    current = current.Next;
                }
            }
        }

        private Voice StealQuietestVoice()
        {
            var voiceVolume = 1000.0;
            LinkedListNode<Voice> quietest = null;
            var node = ActiveVoices.First;
            while (node != null)
            {
                if (node.Value.VoiceParams.State != VoiceStateEnum.Playing)
                {
                    var volume = node.Value.VoiceParams.CombinedVolume;
                    if (volume < voiceVolume)
                    {
                        quietest = node;
                        voiceVolume = volume;
                    }
                }

                node = node.Next;
            }

            if (quietest == null)
            {
                quietest = ActiveVoices.First;
            }

            //check and remove from registry
            RemoveVoiceFromRegistry(quietest.Value);
            ActiveVoices.Remove(quietest);
            //stop voice if it is not already
            quietest.Value.VoiceParams.State = VoiceStateEnum.Stopped;
            return quietest.Value;
        }
    }
}
