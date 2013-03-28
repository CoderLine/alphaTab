package alphatab.rendering;

/**
 * Lists all sizing types of the effect bar glyphs
 */
enum EffectBarGlyphSizing
{
    SinglePreBeatOnly;
    SinglePreBeatToOnBeat;
    SinglePreBeatToPostBeat;
    
    SingleOnBeatOnly;
    SingleOnBeatToPostBeat;

    SinglePostBeatOnly; 
    
    GroupedPreBeatOnly;
    GroupedPreBeatToOnBeat;
    GroupedPreBeatToPostBeat;
    
    GroupedOnBeatOnly;
    GroupedOnBeatToPostBeat;

    GroupedPostBeatOnly;
}