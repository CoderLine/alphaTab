namespace AlphaTab.Rendering
{
    /// <summary>
    /// Lists all sizing types of the effect bar glyphs
    /// </summary>
    public enum EffectBarGlyphSizing
    {
        SinglePreBeatOnly,
        SinglePreBeatToOnBeat,
        SinglePreBeatToPostBeat,

        SingleOnBeatOnly,
        SingleOnBeatToPostBeat,

        SinglePostBeatOnly,

        GroupedPreBeatOnly,
        GroupedPreBeatToOnBeat,
        GroupedPreBeatToPostBeat,

        GroupedOnBeatOnly,
        GroupedOnBeatToPostBeat,

        GroupedPostBeatOnly
    }
}
