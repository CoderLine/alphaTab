using AlphaTab.Util;

namespace AlphaTab
{
    /// <summary>
    /// Lists all modes how alphaTab can scroll the container during playback. 
    /// </summary>
    [JsonSerializable]
    public enum ScrollMode
    {
        /// <summary>
        /// Do not scroll automatically
        /// </summary>
        Off,

        /// <summary>
        /// Scrolling happens as soon the offsets of the cursors change. 
        /// </summary>
        Continuous,

        /// <summary>
        /// Scrolling happens as soon the cursors exceed the displayed range. 
        /// </summary>
        OffScreen
    }
}
