/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;
import net.coderline.jsgs.model.effects.GsBendEffect;
import net.coderline.jsgs.model.effects.GsGraceEffect;
import net.coderline.jsgs.model.effects.GsHarmonicEffect;
import net.coderline.jsgs.model.effects.GsTremoloBarEffect;
import net.coderline.jsgs.model.effects.GsTremoloPickingEffect;
import net.coderline.jsgs.model.effects.GsTrillEffect;
	
class GsNoteEffect
{
	public function new()
	{
		this.Bend = null;
		this.TremoloBar = null;
		this.Harmonic = null;
		this.Grace = null;
		this.Trill = null;
		this.TremoloPicking = null;
		this.Vibrato = false;
		this.DeadNote = false;
		this.Slide = false;
		this.Hammer = false;
		this.GhostNote = false;
		this.AccentuatedNote = false;
		this.HeavyAccentuatedNote = false;
		this.PalmMute = false;
		this.Staccato = false;
		this.Tapping = false;
		this.Slapping = false;
		this.Popping = false;
		this.FadeIn = false;
		this.LetRing = false;
	}

	public var Bend:GsBendEffect;
	public function IsBend() : Bool
	{
		return this.Bend != null && this.Bend.Points.length != 0;
	}
	
	public var TremoloBar:GsTremoloBarEffect;
	public function IsTremoloBar() : Bool
	{
		return this.TremoloBar != null;
	}
	
	public var Harmonic:GsHarmonicEffect;
	public function IsHarmonic() : Bool
	{
		return this.Harmonic != null;
	}
	
	public var Grace:GsGraceEffect;
	public function IsGrace() : Bool
	{
		return this.Grace != null;	
	}
	
	public var Trill:GsTrillEffect;
	public function IsTrill() : Bool
	{
		return this.Trill != null;
	}
	
	public var TremoloPicking:GsTremoloPickingEffect;
	public function IsTremoloPicking() : Bool
	{
		return this.TremoloPicking != null;
	}
	
	public var Vibrato: Bool;
	public var DeadNote: Bool;
	public var SlideType:GsSlideType;
	public var Slide: Bool;
	public var Hammer: Bool;
	public var GhostNote: Bool;
	public var AccentuatedNote: Bool;
	public var HeavyAccentuatedNote: Bool;
	public var PalmMute: Bool;
	public var Staccato: Bool;
	public var Tapping: Bool;
	public var Slapping: Bool;
	public var Popping: Bool;
	public var FadeIn: Bool;
	public var LetRing: Bool;
	
	public function Clone(factory:GsSongFactory) : GsNoteEffect
	{
		var effect:GsNoteEffect = factory.NewEffect();
		effect.Vibrato = this.Vibrato;
		effect.DeadNote = this.DeadNote;
		effect.Slide = this.Slide;
		effect.SlideType = this.SlideType;
		effect.Hammer = this.Hammer;
		effect.GhostNote = this.GhostNote;
		effect.AccentuatedNote = this.AccentuatedNote;
		effect.HeavyAccentuatedNote = this.HeavyAccentuatedNote;
		effect.PalmMute = this.PalmMute;
		effect.Staccato = this.Staccato;
		effect.Tapping = this.Tapping;
		effect.Slapping = this.Slapping;
		effect.Popping = this.Popping;
		effect.FadeIn = this.FadeIn;
		effect.LetRing = this.LetRing;
		effect.Bend = IsBend() ? this.Bend.Clone(factory) : null;
		effect.TremoloBar = IsTremoloBar() ? this.TremoloBar.Clone(factory) : null;
		effect.Harmonic = IsHarmonic() ? this.Harmonic.Clone(factory) : null;
		effect.Grace = IsGrace() ? this.Grace.Clone(factory) : null;
		effect.Trill = IsTrill() ? this.Trill.Clone(factory) : null;
		effect.TremoloPicking = IsTremoloPicking() ? this.TremoloPicking.Clone(factory) : null;
		return effect;
	}
}