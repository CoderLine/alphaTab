using System.Runtime.CompilerServices;

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class is used to describe the beginning of a 
    /// section within a song. It acts like a marker. 
    /// </summary>
    public class Section
    {
        [IntrinsicProperty]
        public string Marker { get; set; }
        [IntrinsicProperty]
        public string Text { get; set; }
    }
}