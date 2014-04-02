namespace AlphaTab.Model
{
    /// <summary>
    /// Automations are used to change the behaviour of a song.
    /// </summary>
    public class Automation
    {
        public bool IsLinear { get; set; }
        public AutomationType Type { get; set; }
        public float Value { get; set; }
        public float RatioPosition { get; set; }
        public string Text { get; set; }

        public static Automation BuildTempoAutomation(bool isLinear, float ratioPosition, float value, int reference)
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

        public Automation Clone()
        {
            var a = new Automation();
            a.IsLinear = IsLinear;
            a.Type = Type;
            a.Value = Value;
            return a;
        }
    }
}