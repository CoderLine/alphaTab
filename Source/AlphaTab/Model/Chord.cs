using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Model
{
    /// <summary>
    /// A chord definition.
    /// </summary>
    public class Chord
    {
        [IntrinsicProperty]
        public string Name { get; set; }
        [IntrinsicProperty]
        public int FirstFret { get; set; }
        [IntrinsicProperty]
        public List<int> Strings { get; set; }

        public Chord()
        {
            Strings = new List<int>();
        }
    }
}