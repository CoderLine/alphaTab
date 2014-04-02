using System.Collections.Generic;

namespace AlphaTab.Model
{
    /// <summary>
    /// A chord definition.
    /// </summary>
    public class Chord
    {
        public string Name { get; set; }
        public int FirstFret { get; set; }
        public List<int> Strings { get; set; }

        public Chord()
        {
            Strings = new List<int>();
        }
    }
}