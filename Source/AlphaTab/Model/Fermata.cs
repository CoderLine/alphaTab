namespace AlphaTab.Model
{
    /// <summary>
    /// Represents a fermata. 
    /// </summary>
    public class Fermata
    {
        /// <summary>
        /// Gets or sets the type of fermata. 
        /// </summary>
        public FermataType Type { get; set; }

        /// <summary>
        /// Gets or sets the actual lenght of the fermata. 
        /// </summary>
        public float Length { get; set; }

        internal static void CopyTo(Fermata src, Fermata dst)
        {
            dst.Type = src.Type;
            dst.Length = src.Length;
        }
    }
}
