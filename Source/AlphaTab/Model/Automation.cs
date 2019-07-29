namespace AlphaTab.Model
{
    /// <summary>
    /// Automations are used to change the behaviour of a song.
    /// </summary>
    public class Automation
    {
        /// <summary>
        /// Gets or sets whether the automation is applied linear. 
        /// </summary>
        public bool IsLinear { get; set; }
        /// <summary>
        /// Gets or sets the type of the automation. 
        /// </summary>
        public AutomationType Type { get; set; }
        /// <summary>
        /// Gets or sets the target value of the automation. 
        /// </summary>
        public float Value { get; set; }
        /// <summary>
        /// Gets or sets the relative position of of the automation. 
        /// </summary>
        public float RatioPosition { get; set; }
        /// <summary>
        /// Gets or sets the additional text of the automation. s
        /// </summary>
        public string Text { get; set; }

        internal static Automation BuildTempoAutomation(bool isLinear, float ratioPosition, float value, int reference)
        {
            if (reference < 1 || reference > 5) reference = 2;

            var references = new[] {1f, 0.5f, 1.0f, 1.5f, 2.0f, 3.0f};
            var automation = new Automation();
            automation.Type = AutomationType.Tempo;
            automation.IsLinear = isLinear;
            automation.RatioPosition = ratioPosition;
            automation.Value = value*references[reference];
            return automation;
        }

        internal static void CopyTo(Automation src, Automation dst)
        {
            dst.IsLinear = src.IsLinear;
            dst.RatioPosition = src.RatioPosition;
            dst.Text = src.Text;
            dst.Type = src.Type;
            dst.Value = src.Value;
        }

        internal Automation Clone()
        {
            var a = new Automation();
            CopyTo(this, a);
            return a;
        }
    }
}