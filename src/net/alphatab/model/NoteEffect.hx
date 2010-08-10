package net.alphatab.model;
import net.alphatab.model.effects.BendEffect;
import net.alphatab.model.effects.GraceEffect;
import net.alphatab.model.effects.HarmonicEffect;
import net.alphatab.model.effects.TremoloBarEffect;
import net.alphatab.model.effects.TremoloPickingEffect;
import net.alphatab.model.effects.TrillEffect;

/**
 * Contains all effects which can be applied to one note. 
 */
class NoteEffect
{
	public function new()
	{
		bend = null;
		harmonic = null;
		grace = null;
		trill = null;
		tremoloPicking = null;
		vibrato = false;
		deadNote = false;
		slide = false;
		hammer = false;
		ghostNote = false;
		accentuatedNote = false;
		heavyAccentuatedNote = false;
		palmMute = false;
		staccato = false;
		letRing = false;
		isFingering = false;
	}
	
	public var leftHandFinger:Int;
	public var rightHandFinger:Int;
	public var isFingering:Bool;


	public var bend:BendEffect;
	public function isBend() : Bool
	{
		return bend != null && bend.points.length != 0;
	}
		
	public var harmonic:HarmonicEffect;
	public function isHarmonic() : Bool
	{
		return harmonic != null;
	}
	
	public var grace:GraceEffect;
	public function isGrace() : Bool
	{
		return grace != null;	
	}
	
	public var trill:TrillEffect;
	public function isTrill() : Bool
	{
		return trill != null;
	}
	
	public var tremoloPicking:TremoloPickingEffect;
	public function isTremoloPicking() : Bool
	{
		return tremoloPicking != null;
	}
	
	public var vibrato: Bool;
	public var deadNote: Bool;
	public var slideType:SlideType;
	public var slide: Bool;
	public var hammer: Bool;
	public var ghostNote: Bool;
	public var accentuatedNote: Bool;
	public var heavyAccentuatedNote: Bool;
	public var palmMute: Bool;
	public var staccato: Bool;
	public var letRing: Bool;
	
	public function clone(factory:SongFactory) : NoteEffect
	{
		var effect:NoteEffect = factory.newNoteEffect();
		effect.vibrato = vibrato;
		effect.deadNote = deadNote;
		effect.slide = slide;
		effect.slideType = slideType;
		effect.hammer = hammer;
		effect.ghostNote = ghostNote;
		effect.accentuatedNote = accentuatedNote;
		effect.heavyAccentuatedNote = heavyAccentuatedNote;
		effect.palmMute = palmMute;
		effect.staccato = staccato;
		effect.letRing = letRing;
		effect.isFingering = isFingering;
		effect.leftHandFinger = leftHandFinger;
		effect.rightHandFinger = rightHandFinger;
		effect.bend = isBend() ? bend.clone(factory) : null;
		effect.harmonic = isHarmonic() ? harmonic.clone(factory) : null;
		effect.grace = isGrace() ? grace.clone(factory) : null;
		effect.trill = isTrill() ? trill.clone(factory) : null;
		effect.tremoloPicking = isTremoloPicking() ? tremoloPicking.clone(factory) : null;
		return effect;
	}
}