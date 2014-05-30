using System;
using System.Runtime.CompilerServices;
using AlphaTab.Model;

namespace AlphaTab.Audio.Generator
{
    public class MidiPlaybackController
    {
        private readonly Score _score;

        private int _lastIndex;
        private int _repeatAlternative;
        private int _repeatStart;
        private int _repeatStartIndex;
        private int _repeatNumber;
        private int _repeatEnd;
        private bool _repeatOpen;

        [IntrinsicProperty]
        public bool ShouldPlay { get; set; }
        [IntrinsicProperty]
        public int RepeatMove { get; set; }
        [IntrinsicProperty]
        public int Index { get; set; }

        public bool Finished
        {
            get
            {
                return Index >= _score.MasterBars.Count;
            }
        }

        public MidiPlaybackController(Score score)
        {
            _score = score;

            ShouldPlay = true;
            RepeatMove = 0;
            Index = 0;
        }

        public void Process()
        {
            var masterBar = _score.MasterBars[Index];
        
            // if the repeat group wasn't closed we reset the repeating 
            // on the last group opening
            if (!masterBar.RepeatGroup.IsClosed && masterBar.RepeatGroup.Openings[masterBar.RepeatGroup.Openings.Count -1] == masterBar)
            {
                _repeatStart = 0;
                _repeatNumber = 0;
                _repeatEnd = 0;
                _repeatOpen = false;
            }
        
            if (masterBar.IsRepeatStart)
            {
                _repeatStartIndex = Index;
                _repeatStart = masterBar.Start;
                _repeatOpen = true;
                if (Index > _lastIndex)
                {
                    _repeatNumber = 0;
                    _repeatAlternative = 0;
                }
            }
            else
            {
                if (_repeatAlternative == 0)
                {
                    _repeatAlternative = masterBar.AlternateEndings;
                }
                if ((_repeatOpen && (_repeatAlternative > 0)) && ((_repeatAlternative & (1 << _repeatNumber)) == 0))
                {
                    RepeatMove -= masterBar.CalculateDuration();
                    if (masterBar.RepeatCount > 0)
                    {
                        _repeatAlternative = 0;
                    }
                    ShouldPlay = false;
                    Index++;
                    return;
                }
            }
            _lastIndex = Math.Max(_lastIndex, Index);
            if (_repeatOpen && (masterBar.RepeatCount > 0))
            {
                if ((_repeatNumber < masterBar.RepeatCount) || (_repeatAlternative > 0))
                {
                    _repeatEnd = masterBar.Start + masterBar.CalculateDuration();
                    RepeatMove += _repeatEnd - _repeatStart;
                    Index = _repeatStartIndex - 1;
                    _repeatNumber++;
                }
                else
                {
                    _repeatStart = 0;
                    _repeatNumber = 0;
                    _repeatEnd = 0;
                    _repeatOpen = false;
                }
                _repeatAlternative = 0;
            }
            Index++;
        }
    }
}
