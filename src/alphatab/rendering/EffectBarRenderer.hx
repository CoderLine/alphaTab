package alphatab.rendering;
import alphatab.model.Bar;
import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.VibratoType;
import alphatab.model.Voice;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.glyphs.BeatGlyphBase;
import alphatab.rendering.glyphs.IMultiBeatEffectGlyph;
import alphatab.rendering.layout.ScoreLayout;
import haxe.ds.IntMap;
import haxe.ds.ObjectMap;
import haxe.ds.StringMap;
import js.html.svg.AnimatedBoolean;

/**
 * This renderer is responsible for displaying effects above or below the other staves
 * like the vibrato. 
 */
class EffectBarRenderer extends GroupedBarRenderer
{
    private var _info:IEffectBarRendererInfo;
    private var _uniqueEffectGlyphs:Array<Glyph>;
    private var _effectGlyphs:IntMap<Glyph>;
    private var _lastBeat:Beat;
    
	public function new(bar:Bar, info:IEffectBarRendererInfo) 
	{
		super(bar);
        _info = info;
        _uniqueEffectGlyphs = new Array<Glyph>();
        _effectGlyphs = new IntMap<Glyph>();
	}
    
	public override function doLayout()
	{
		super.doLayout();
        if (index == 0)
        {
            stave.topSpacing = 5;
            stave.bottomSpacing = 5;
        }
        height = _info.getHeight(this);
    }
    
    public override function finalizeRenderer(layout:ScoreLayout):Void 
    {
        super.finalizeRenderer(layout);
        // after all layouting and sizing place and size the effect glyphs
        isEmpty = true;
        var prevGlyph:Glyph = null;
        if (index > 0)
        {
            // check if previous renderer had an effect on his last beat
            // and use this as merging element
            var prevRenderer = cast(stave.barRenderers[index - 1], EffectBarRenderer);
            if (prevRenderer._lastBeat != null)
            {
                prevGlyph = prevRenderer._effectGlyphs.get(prevRenderer._lastBeat.index);
            }
        }
        for (beatIndex in _effectGlyphs.keys())
        {
            var effect:Glyph = _effectGlyphs.get(beatIndex);
            
            alignGlyph(_info.getSizingMode(), beatIndex, 0, prevGlyph);
            
            prevGlyph = effect;
            isEmpty = false;
        }
    }
    
    private function alignGlyph(sizing:EffectBarGlyphSizing, beatIndex:Int, voiceIndex:Int, prevGlyph:Glyph)
    {
        var g:Glyph = _effectGlyphs.get(beatIndex); 
        var pos:Glyph; 
        switch(sizing)
        {
            case SinglePreBeatOnly:
                pos = getPreBeatPosition(voiceIndex, beatIndex);
                g.x = pos.x;
                g.width = pos.width;
                
            case SinglePreBeatToOnBeat:
                pos = getPreBeatPosition(voiceIndex, beatIndex);
                g.x = pos.x;
                pos = getOnBeatPosition(voiceIndex, beatIndex);
                g.width = (pos.x + pos.width) - g.x;
                
            case SinglePreBeatToPostBeat:
                pos = getPreBeatPosition(voiceIndex, beatIndex);
                g.x = pos.x;
                pos = getPostBeatPosition(voiceIndex, beatIndex);
                g.width = (pos.x + pos.width) - g.x;

        
            case SingleOnBeatOnly:
                pos = getOnBeatPosition(voiceIndex, beatIndex);
                g.x = pos.x;
                g.width = pos.width;

            case SingleOnBeatToPostBeat:
                pos = getOnBeatPosition(voiceIndex, beatIndex);
                g.x = pos.x;
                pos = getPostBeatPosition(voiceIndex, beatIndex);
                g.width = (pos.x + pos.width) - g.x;

            case SinglePostBeatOnly:
                pos = getPostBeatPosition(voiceIndex, beatIndex);
                g.x = pos.x;
                g.width = pos.width;

            case GroupedPreBeatOnly:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.SinglePreBeatOnly, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = getPreBeatPosition(voiceIndex, beatIndex);
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(cast(getOnBeatPosition(voiceIndex, beatIndex), BeatGlyphBase).beat);
                }
                
            case GroupedPreBeatToOnBeat:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.SinglePreBeatToOnBeat, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = getOnBeatPosition(voiceIndex, beatIndex);
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(cast(getOnBeatPosition(voiceIndex, beatIndex), BeatGlyphBase).beat);
                }
            
            case GroupedPreBeatToPostBeat:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.SinglePreBeatToPostBeat, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = getPostBeatPosition(voiceIndex, beatIndex);
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(cast(getOnBeatPosition(voiceIndex, beatIndex), BeatGlyphBase).beat);
                }
                
            case GroupedOnBeatOnly:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.SingleOnBeatOnly, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = getOnBeatPosition(voiceIndex, beatIndex);
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(cast(getOnBeatPosition(voiceIndex, beatIndex), BeatGlyphBase).beat);
                }
                
            case GroupedOnBeatToPostBeat:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.SingleOnBeatToPostBeat, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = getPostBeatPosition(voiceIndex, beatIndex);
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(cast(getOnBeatPosition(voiceIndex, beatIndex), BeatGlyphBase).beat);
                }
                
            case GroupedPostBeatOnly:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.GroupedPostBeatOnly, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = getPostBeatPosition(voiceIndex, beatIndex);
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(cast(getOnBeatPosition(voiceIndex, beatIndex), BeatGlyphBase).beat);
                }
        }
    }
	
	private override function createPreBeatGlyphs():Void 
	{
	}

	private override function createBeatGlyphs():Void 
	{
        // TODO: Render all voices
        createVoiceGlyphs(_bar.voices[0]);
	}
    
    private function createVoiceGlyphs(v:Voice)
    {
        for (b in v.beats)
        {            
            // we create empty glyphs as alignment references and to get the 
            // effect bar sized
			var pre = new BeatGlyphBase(b);
			addBeatGlyph(pre);
			
			var g = new BeatGlyphBase(b);
			addBeatGlyph(g); 
			
			var post = new BeatGlyphBase(b);
			addBeatGlyph(post);
            
            registerBeatPositions(b, pre, g, post);
            
            if (_info.shouldCreateGlyph(this, b))
            {
                createOrResizeGlyph(_info.getSizingMode(), b);
            }
            
            _lastBeat = b;
        }
    }	
    
    private function createOrResizeGlyph(sizing:EffectBarGlyphSizing, b:Beat)
    {
        switch(sizing)
        {
            case SinglePreBeatOnly, SinglePreBeatToOnBeat, SinglePreBeatToPostBeat, 
                 SingleOnBeatOnly, SingleOnBeatToPostBeat, SinglePostBeatOnly:
                var g = _info.createNewGlyph(this, b);
                g.renderer = this;
                g.doLayout();
                _effectGlyphs.set(b.index, g);
                _uniqueEffectGlyphs.push(g);
                
            case GroupedPreBeatOnly, GroupedPreBeatToOnBeat, GroupedPreBeatToPostBeat,
                 GroupedOnBeatOnly, GroupedOnBeatToPostBeat, GroupedPostBeatOnly:
                if (b.index > 0 || index > 0)
                {
                    // check if the previous beat also had this effect
                    var prevBeat:Beat = b.previousBeat; 
                    if (_info.shouldCreateGlyph(this, prevBeat))
                    {
                        // expand the previous effect
                        var prevEffect:Glyph;
                        if (b.index > 0)
                        {
                            prevEffect = _effectGlyphs.get(prevBeat.index);
                            _effectGlyphs.set(b.index, prevEffect);
                        }
                        else 
                        {
                            prevEffect = cast(stave.barRenderers[index - 1], EffectBarRenderer)._effectGlyphs.get(prevBeat.index);
                        }
                        _effectGlyphs.set(b.index, prevEffect);
                    }
                    else
                    {
                        createOrResizeGlyph(EffectBarGlyphSizing.SinglePreBeatOnly, b);
                    }
                }
                else
                {
                    createOrResizeGlyph(EffectBarGlyphSizing.SinglePreBeatOnly, b);
                }
        }
    }
    
	private override function createPostBeatGlyphs():Void 
	{
	}
	
	public override function getTopPadding():Int 
	{
		return 0;
	}	
	
	public override function getBottomPadding():Int 
	{
		return 0;
	}
	
	public override function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
	{
        
	}
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        super.paint(cx, cy, canvas);
        
        // canvas.setColor(new Color(0, 0, 200, 100));
        // canvas.fillRect(cx + x, cy + y, width, height);
        
        var glyphStart = getBeatGlyphsStart();
        
        for (g in _uniqueEffectGlyphs)
        {
            if (g.renderer == this)
            {
                g.paint(cx + x + glyphStart, cy + y, canvas);             
            }
        }
    }
}   