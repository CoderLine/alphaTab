using System.Collections.Generic;
using System.Runtime.CompilerServices;
using AlphaTab.Collections;

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
        public FastList<int> Strings { get; set; }

        public Chord()
        {
            Strings = new FastList<int>();
        }
    }
}