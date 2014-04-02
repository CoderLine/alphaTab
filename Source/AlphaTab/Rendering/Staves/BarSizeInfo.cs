using System.Collections.Generic;

namespace AlphaTab.Rendering.Staves
{
    /// <summary>
    /// This public class stores size information about a stave. 
    /// It is used by the layout engine to collect the sizes of score parts
    /// to align the parts across multiple staves.
    /// </summary>
    public class BarSizeInfo
    {
        public int FullWidth { get; set; }
        public Dictionary<string, int> Sizes { get; set; }

        public Dictionary<int, int> PreNoteSizes { get; set; }
        public Dictionary<int, int> OnNoteSizes { get; set; }
        public Dictionary<int, int> PostNoteSizes { get; set; }

        public BarSizeInfo()
        {
            Sizes = new Dictionary<string, int>();
            PreNoteSizes = new Dictionary<int, int>();
            OnNoteSizes = new Dictionary<int, int>();
            PostNoteSizes = new Dictionary<int, int>();
            FullWidth = 0;
        }

        public void SetSize(string key, int size)
        {
            Sizes[key] = size;
        }

        public int GetSize(string key)
        {
            if (Sizes.ContainsKey(key))
            {
                return Sizes[key];
            }
            return 0;
        }

        public int GetPreNoteSize(int beat)
        {
            if (PreNoteSizes.ContainsKey(beat))
            {
                return PreNoteSizes[beat];
            }
            return 0;
        }

        public int GetOnNoteSize(int beat)
        {
            if (OnNoteSizes.ContainsKey(beat))
            {
                return OnNoteSizes[beat];
            }
            return 0;
        }

        public int GetPostNoteSize(int beat)
        {
            if (PostNoteSizes.ContainsKey(beat))
            {
                return PostNoteSizes[beat];
            }
            return 0;
        }

        public void SetPreNoteSize(int beat, int size)
        {
            PreNoteSizes[beat] = size;
        }

        public void SetOnNoteSize(int beat, int size)
        {
            OnNoteSizes[beat] = size;
        }

        public void SetPostNoteSize(int beat, int size)
        {
            PostNoteSizes[beat] = size;
        }
    }
}
