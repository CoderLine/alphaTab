
namespace AlphaTab.Model
{
    /// <summary>
    /// A single point of a bending graph. Used to 
    /// describe WhammyBar and String Bending effects.
    /// </summary>
    public class BendPoint
    {
        /// <summary>
        /// The maximum offset for points
        /// </summary>
        public const int MaxPosition = 60;
        /// <summary>
        /// The maximum value for points. 
        /// </summary>
        public const int MaxValue = 12;

        /// <summary>
        /// Gets or sets offset of the point relative to the note duration (0-60)
        /// </summary>
        public int Offset { get; set; }
        /// <summary>
        /// Gets or sets the 1/4 note value offsets for the bend. 
        /// </summary>
        public int Value { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="BendPoint"/> class.
        /// </summary>
        /// <param name="offset">The offset.</param>
        /// <param name="value">The value.</param>
        public BendPoint(int offset = 0, int value = 0)
        { 
            Offset = offset;
            Value = value;
        }

        internal static void CopyTo(BendPoint src, BendPoint dst)
        {
            dst.Offset = src.Offset;
            dst.Value = src.Value;
        }

        internal BendPoint Clone()
        {
            var point = new BendPoint();
            CopyTo(this, point);
            return point;
        }
    }
}