namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class CCValue
    {
        private byte _coarseValue;
        private byte _fineValue;
        private short _combined;

        public byte Coarse
        {
            get => _coarseValue;
            set
            {
                _coarseValue = value;
                UpdateCombined();
            }
        }

        public byte Fine
        {
            get => _fineValue;
            set
            {
                _fineValue = value;
                UpdateCombined();
            }
        }

        public short Combined
        {
            get => _combined;
            set
            {
                _combined = value;
                UpdateCoarseFinePair();
            }
        }

        public CCValue(byte coarse, byte fine)
        {
            _coarseValue = coarse;
            _fineValue = fine;
            _combined = 0;
            UpdateCombined();
        }

        public CCValue(short combined)
        {
            _coarseValue = 0;
            _fineValue = 0;
            _combined = combined;
            UpdateCoarseFinePair();
        }

        private void UpdateCombined()
        {
            _combined = (short)((_coarseValue << 7) | _fineValue);
        }

        private void UpdateCoarseFinePair()
        {
            _coarseValue = (byte)(_combined >> 7);
            _fineValue = (byte)(_combined & 0x7F);
        }
    }
}
