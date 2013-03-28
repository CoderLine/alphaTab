package alphatab.rendering;
import alphatab.model.Bar;
import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.VibratoType;
import alphatab.model.Voice;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.glyphs.BeatGlyphBase;
import alphatab.rendering.glyphs.EffectLineGlyph;
import alphatab.rendering.layout.ScoreLayout;
import haxe.ds.IntMap;
import haxe.ds.StringMap;

/**
 * This enum lists and sets the order of the effects in a EffectBar
 * Each of those effects gets it's own "line" within the bar
 */
enum EffectBarEffects
{
    Tempo;
    Tuplet;
    Fermata;
    DynamicValue;
    LetRing;
    PalmMute;
    Vibrato;
    TapSlapPop;
    LeftHandFinger;
    RightHandFinger;
    FadeIn;
    Chord;
    Text;
    Marker;
}

/**
 * This renderer is responsible for displaying effects above or below the other staves
 * like the vibrato. 
 */
class EffectBarRenderer extends GroupedBarRenderer
{
    private var _beatPosition:IntMap<BeatGlyphBase>;
    private var _effectLines:StringMap<EffectLineGlyph>;

	public function new(bar:Bar) 
	{
		super(bar);
        _beatPosition = new IntMap<BeatGlyphBase>();
        _effectLines = new StringMap<EffectLineGlyph>();
	}
    
	public override function doLayout()
	{
		super.doLayout();
		height = 0;
        for (e in EffectBarEffects.createAll())
        {
            if (_effectLines.exists(Std.string(e)))
            {
                var l = _effectLines.get(Std.string(e));
                l.y = height;
                l.width = width;
                l.doLayout();
                height += l.height;
            }
        }
        if (stave.staveBottom < height)
        {
            stave.registerStaveBottom(height);
        }
	}
    
    public override function finalizeRenderer(layout:ScoreLayout):Void 
    {
        super.finalizeRenderer(layout);
        for (e in EffectBarEffects.createAll())
        {
            if (_effectLines.exists(Std.string(e)))
            {
                var l = _effectLines.get(Std.string(e));
                l.width = width;
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
			_beatPosition.set(b.index, g);
			addBeatGlyph(g); 
			
			var post = new BeatGlyphBase(b);
			addBeatGlyph(post);
            
            createEffectLines(b);
        }
    }	
    
    private function createEffectLines(b:Beat)
    {
        if (b.index == 0)
        {
            // TODO: bar and masterbar glyphs
        }
        createTupletLine(b);
        createDynamicValue(b);
        createFadeInLine(b);
        createChordLine(b);
        createTextLine(b);

        for (n in b.notes)
        {
            createLetRingLine(n);
            createPalmMuteLine(n);
            createVibratoLine(n);
            createTapSlapPopLine(n);
            createLeftHandFingerLine(n);
            createRightHandFingerLine(n);
        }
    }
    
    private function createTupletLine(b:Beat)
    {
        if (b.tupletDenominator > 0 && b.tupletNumerator > 0)
        {
            registerEffectLine(EffectBarEffects.Tempo);
        }
    }
	
    private function createDynamicValue(b:Beat)
    {
        if ( (b.previousBeat == null) || (b.previousBeat.dynamicValue != b.dynamicValue))
        {
            registerEffectLine(EffectBarEffects.DynamicValue);
        }
    }
    
    private function createLetRingLine(n:Note)
    {
        if (n.isLetRing)
        {
            registerEffectLine(EffectBarEffects.LetRing);
        }
    }
    
    private function createPalmMuteLine(n:Note)
    {
        if (n.isPalmMute)
        {
            registerEffectLine(EffectBarEffects.PalmMute);
        }
    }
    
    private function createVibratoLine(n:Note)
    {
        if (n.vibrato != VibratoType.None)
        {
            registerEffectLine(EffectBarEffects.Vibrato);
        }
    }
    
    private function createLeftHandFingerLine(n:Note)
    {
        if (n.leftHandFinger >= 0)
        {
            registerEffectLine(EffectBarEffects.LeftHandFinger);
        }
    }
    
    private function createRightHandFingerLine(n:Note)
    {
        if (n.rightHandFinger >= 0)
        {
            registerEffectLine(EffectBarEffects.LeftHandFinger);
        }
    }
    
    private function createTapSlapPopLine(n:Note)
    {
        if (n.tapping || n.beat.slap || n.beat.pop)
        {
            registerEffectLine(EffectBarEffects.TapSlapPop);
        }
    }
    
    private function createFadeInLine(b:Beat)
    {
        if (b.fadeIn)
        {
            registerEffectLine(EffectBarEffects.FadeIn);
        }
    }
    
    private function createChordLine(b:Beat)
    {
        if (b.hasChord())
        {
            registerEffectLine(EffectBarEffects.Chord);
        }
    }
    
    private function createTextLine(b:Beat)
    {
        if (b.text != null && b.text.length > 0)
        {
            registerEffectLine(EffectBarEffects.Text);
        }
    }
    
    private function registerEffectLine(effect:EffectBarEffects)
    {
        var s = Std.string(effect);
        if (!_effectLines.exists(s))
        {
            var line = new EffectLineGlyph(effect);
            line.x = 0;
            line.y = 0;
            line.renderer = this;
            _effectLines.set(s, line);
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
        for (l in _effectLines)
        {
            l.paint(cx + x, cy + y, canvas);
        }
    }
}