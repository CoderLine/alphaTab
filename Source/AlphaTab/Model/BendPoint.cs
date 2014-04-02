namespace AlphaTab.Model
{
    /// <summary>
    /// A single point of a bending graph. Used to 
    /// describe WhammyBar and String Bending effects.
    /// </summary>
    public class BendPoint
    {
        public const int MaxPosition = 60;
        public const int MaxValue = 12;

        public int Offset { get; set; }
        public int Value { get; set; }

        public BendPoint(int offset = 0, int value = 0)
        { 
            Offset = offset;
            Value = value;
        }

        public BendPoint Clone()
        {
            var point = new BendPoint();
            point.Offset = Offset;
            point.Value = Value;
            return point;
        }
    }
}