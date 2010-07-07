/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.model;
import haxe.remoting.FlashJsConnection;
import net.coderline.jsgs.model.GsBeat;
import net.coderline.jsgs.model.GsDuration;
import net.coderline.jsgs.model.GsMeasure;
import net.coderline.jsgs.model.GsMeasureClef;
import net.coderline.jsgs.model.GsMeasureClefConverter;
import net.coderline.jsgs.model.GsMeasureHeader;
import net.coderline.jsgs.model.GsNoteEffect;
import net.coderline.jsgs.model.GsTriplet;
import net.coderline.jsgs.model.GsTripletFeel;
import net.coderline.jsgs.model.GsVoice;
import net.coderline.jsgs.model.GsVoiceDirection;
import net.coderline.jsgs.model.Point;
import net.coderline.jsgs.model.SongManager;
import net.coderline.jsgs.tablature.drawing.ClefPainter;
import net.coderline.jsgs.tablature.drawing.DrawingContext;
import net.coderline.jsgs.tablature.drawing.DrawingLayer;
import net.coderline.jsgs.tablature.drawing.DrawingLayers;
import net.coderline.jsgs.tablature.drawing.DrawingResources;
import net.coderline.jsgs.tablature.drawing.KeySignaturePainter;
import net.coderline.jsgs.tablature.drawing.MusicFont;
import net.coderline.jsgs.tablature.drawing.TempoPainter;
import net.coderline.jsgs.tablature.drawing.TripletFeelPainter;
import net.coderline.jsgs.tablature.TrackSpacing;
import net.coderline.jsgs.tablature.TrackSpacingPositions;
import net.coderline.jsgs.tablature.ViewLayout;
import net.coderline.jsgs.Utils;

class GsMeasureImpl extends GsMeasure
{
	public static inline var Natural:Int = 1;
	public static inline var Sharp:Int = 2;
	public static inline var Flat:Int = 3;
	
	public static var KeySignatures:Array<Array<Int>> = {
		var a:Array<Array<Int>> = new Array<Array<Int>>();
		//------------NATURAL------------------------------------
		a.push([Natural, Natural, Natural, Natural, Natural, Natural, Natural]); // NATURAL
		//------------SHARPS------------------------------------
		a.push([Natural, Natural, Natural, Sharp, Natural, Natural, Natural]); // 1 SHARP
		a.push([Sharp, Natural, Natural, Sharp, Natural, Natural, Natural]); // 2 SHARPS
		a.push([Sharp, Natural, Natural, Sharp, Sharp, Natural, Natural]); // 3 SHARPS
		a.push([Sharp, Sharp, Natural, Sharp, Sharp, Natural, Natural]); // 4 SHARPS
		a.push([Sharp, Sharp, Natural, Sharp, Sharp, Sharp, Natural]); // 5 SHARPS
		a.push([Sharp, Sharp, Sharp, Sharp, Sharp, Sharp, Natural]); // 6 SHARPS
		a.push([Sharp, Sharp, Sharp, Sharp, Sharp, Sharp, Sharp]); // 7 SHARPS
		//------------FLATS------------------------------------
		a.push([Natural, Natural, Natural, Natural, Natural, Natural, Flat]); // 1 Flat
		a.push([Natural, Natural, Flat, Natural, Natural, Natural, Flat]); // 2 FLATS
		a.push([Natural, Natural, Flat, Natural, Natural, Flat, Flat]); // 3 FLATS
		a.push([Natural, Flat, Flat, Natural, Natural, Flat, Flat]); // 4 FLATS
		a.push([Natural, Flat, Flat, Natural, Flat, Flat, Flat]); // 5 FLATS
		a.push([Flat, Flat, Flat, Natural, Flat, Flat, Flat]); // 6 FLATS
		a.push([Flat, Flat, Flat, Flat, Flat, Flat, Flat]); // 7 FLATS
		a;
	};

	public static var AccidentalSharpNotes:Array<Int> = [ 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6 ];
	public static var AccidentalFlatNotes:Array<Int> = [ 0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6 ];
	public static var AccidentalNotes:Array<Bool> = [ false, true, false, true, false, false,
													true, false, true, false, true, false];

	public static var ScoreKeyOffsets:Array<Int> = [ 30, 18, 22, 24 ];
	public static var ScoreKeySharpPositions:Array<Int> = [ 1, 4, 0, 3, 6, 2, 5 ];
	public static var ScoreKeyFlatPositions:Array<Int> = [ 5, 2, 6, 3, 0, 4, 1 ];

	private static inline var DefaultClefSpacing:Int = 40;
	private static inline var DefaultQuarterSpacing:Int = 30;
	
	private var _previousMeasure:GsMeasure;


	private var _widthBeats:Int;

	private var _voiceGroups:Array<Array<BeatGroup>>;

	private var _text:Bool;
	private var _chord:Bool;
	private var _accentuated:Bool;
	private var _harmonic:Bool;
	private var _tapping:Bool;
	private var _palmMute:Bool;
	private var _vibrato:Bool;
	private var _beatVibrato:Bool;
	private var _tupleto:Bool;
	private var _fadeIn:Bool;
	private var _bend:Bool;
	private var _letRing:Bool;
	private var _bendOverFlow:Int;

	private var _registeredAccidentals:Array<Array<Bool>>;

	public var Width:Int;
	public var DivisionLength:Int;
	public var PosX:Int;
	public var PosY:Int;
	public var QuarterSpacing:Int;
	public var Spacing:Int;
	public var IsFirstOfLine:Bool;

	
	private function GetMaxQuarterSpacing() : Int
	{
		return QuarterSpacing;
	}

	public function HeaderImpl() : GsMeasureHeaderImpl
	{
		return cast Header;
	}
	
	public function TrackImpl() : GsTrackImpl
	{
		return cast Track;
	}
	
	public function Height() : Int
	{
		return Ts.GetSize();
	}

	public var Ts:TrackSpacing ;
	public var MaxY:Int ;
	public var MinY:Int ;
	public var NotEmptyBeats:Int ;
	public var NotEmptyVoices:Int ;
	public var LyricBeatIndex:Int ;
	public var IsPaintClef:Bool ;
	public var IsPaintKeySignature:Bool ;


	
	public function new(header:GsMeasureHeader) 
	{
		super(header);
		_registeredAccidentals = new Array<Array<Bool>>();
		for (i in 0 ... 11)
		{
			var a:Array<Bool> = new Array<Bool>();
			for (j in 0 ... 7)
			{
				a.push(false);
			}
			_registeredAccidentals.push(a);
		}
		_voiceGroups = new Array<Array<BeatGroup>>();
		for (v in 0 ... GsBeat.MaxVoices)
		{
			_voiceGroups.push(new Array<BeatGroup>());
		}
	}
	
	public function Create(layout:ViewLayout) : Void
	{
		DivisionLength = SongManager.GetDivisionLength(Header);
		ResetSpacing();
		ClearRegisteredAccidentals();
		CalculateBeats(layout);
		CalculateWidth(layout);
		IsFirstOfLine = false;
	}

	public function Update(layout:ViewLayout) : Void
	{
		UpdateComponents(layout);
	}

	private function ClearRegisteredAccidentals() : Void
	{
		for (i in 0 ... 11)
		{
			for (n in 0 ... 7)
			{
				_registeredAccidentals[i][n] = false;
			}
		}
	}
	
	public function CalculateWidth(layout:ViewLayout): Void
	{
		Width = _widthBeats;
		Width += GetFirstNoteSpacing(layout);
		Width += (RepeatClose() > 0) ? 20 : 0;
		Width += HeaderImpl().GetLeftSpacing(layout);
		Width += HeaderImpl().GetRightSpacing(layout);
		HeaderImpl().NotifyWidth(Width);
	}
	
	private function CalculateBeats(layout:ViewLayout) : Void
	{
		var minDuration:GsDuration = null;
		var previousVoices:Array<GsVoiceImpl> = new Array<GsVoiceImpl>();
		var groups:Array<BeatGroup> = new Array<BeatGroup>();
		var notEmptyVoicesChecked:Array<Bool> = new Array<Bool>();
		
		for (v in 0 ... GsBeat.MaxVoices)
		{
			previousVoices.push(null);
			groups.push(null);
			notEmptyVoicesChecked.push(null);
			_voiceGroups[v] = new Array<BeatGroup>();
		}
		
		_widthBeats = 0;
		NotEmptyBeats = 0;
		NotEmptyVoices = 0;
	
		for (i in 0 ... BeatCount())
		{
			var beat:GsBeatImpl = cast Beats[i];
			beat.Reset();

			for (v in 0 ... GsBeat.MaxVoices)
			{
				var voice:GsVoiceImpl = cast beat.Voices[v];
				if (!voice.IsEmpty)
				{
					voice.Reset();
					if (minDuration == null || voice.Duration.Time() <= minDuration.Time())
					{
						minDuration = voice.Duration;
					}
					if (!notEmptyVoicesChecked[v])
					{
						notEmptyVoicesChecked[v] = true;
						NotEmptyVoices++;
					}

					for (note in voice.Notes)
					{
						var noteImpl:GsNoteImpl = cast note;
						voice.Check(noteImpl);
					}

					if (!voice.IsRestVoice())
					{
						beat.Check(voice.MinNote);
						beat.Check(voice.MaxNote);
						if ((groups[v] == null) || !CanJoin(layout.SongManager(), voice, previousVoices[v]))
						{
							groups[v] = new BeatGroup(v);
							_voiceGroups[v].push(groups[v]);
						}
						groups[v].CheckVoice(voice);
					}
					else
					{
						for (v2 in  0 ... GsBeat.MaxVoices)
						{
							if (v2 != voice.Index)
							{
								var voice2:GsVoiceImpl = beat.GetVoiceImpl(v2);
								if (!voice2.IsEmpty && voice2.Duration.Equals(voice.Duration))
								{
									if (!voice2.IsRestVoice() || !voice2.IsHiddenSilence)
									{
										voice.IsHiddenSilence = (true);
										break;
									}
								}
							}
						}
					}
					MakeVoice(layout, voice, previousVoices[v], groups[v]);
					previousVoices[v] = voice;
				}
			}
			MakeBeat(layout, beat, TrackImpl().PreviousBeat, false);
			TrackImpl().PreviousBeat = beat;
		}

		for (voiceGroup in _voiceGroups)
		{
			for (oGroup in voiceGroup)
			{
				oGroup.Finish(layout, this);
			}
		}

	}

	public function CanJoin(manager:SongManager, b1:GsVoiceImpl, b2:GsVoiceImpl) : Bool
	{
		if (b1 == null || b2 == null || b1.IsRestVoice() || b2.IsRestVoice())
		{
			return false;
		}

		var divisionLength:Int = DivisionLength;
		var start:Int = Start();
		var start1:Int = (manager.GetRealStart(this, b1.Beat.Start) - start);
		var start2:Int = (manager.GetRealStart(this, b2.Beat.Start) - start);

		if (b1.Duration.Value < GsDuration.Eighth || b2.Duration.Value < GsDuration.Eighth)
		{
			return (start1 == start2);
		}

		var p1:Int = Math.floor((divisionLength + start1) / divisionLength);
		var p2:Int = Math.floor((divisionLength + start2) / divisionLength);

		return (p1 == p2);
	}



	private static function MakeVoice(layout:ViewLayout, voice:GsVoiceImpl, previousVoice:GsVoiceImpl, group:BeatGroup) : Void
	{
		voice.Width = cast layout.GetVoiceWidth(voice);
		voice.BeatGroup = (group);

		if (previousVoice != null)
		{
			voice.PreviousBeat = (previousVoice);
			previousVoice.NextBeat = (voice);
		}
	}

	private function MakeBeat(layout:ViewLayout, beat:GsBeatImpl, previousBeat:GsBeatImpl, chordEnabled:Bool) : Void
	{
		var minimumWidth:Int = -1;
		var restBeat:Bool = true;
		for (v in 0 ... GsBeat.MaxVoices)
		{
			var voice:GsVoiceImpl = beat.GetVoiceImpl(v);
			if (!voice.IsEmpty)
			{
				if (minimumWidth < 0 || voice.Width < minimumWidth)
				{
					minimumWidth = voice.Width;
				}
				if (!voice.IsRestVoice())
				{
					restBeat = false;
				}
			}
		}

		beat.MinimumWidth = (minimumWidth);
		NotEmptyBeats += (restBeat ? 0 : 1);
		_widthBeats += beat.MinimumWidth;

		if (previousBeat != null)
		{
			beat.PreviousBeat = (previousBeat);
			previousBeat.NextBeat = (beat);

			if (chordEnabled && beat.Chord != null && previousBeat.Chord != null)
			{
				var previousWidth:Int = previousBeat.MinimumWidth;
				var chordWidth:Int = Math.floor(layout.ChordFretIndexSpacing + layout.ChordStringSpacing + (Track.StringCount()
					* layout.ChordStringSpacing));
				previousBeat.MinimumWidth = Math.round((Math.max(chordWidth, previousWidth)));
				_widthBeats -= previousWidth;
				_widthBeats += previousBeat.MinimumWidth;
			}
		}
	}

	public function CalculateMeasureChanges(layout:ViewLayout) : Void
	{
		IsPaintClef = false;
		IsPaintKeySignature = false;
		_previousMeasure = (layout.IsFirstMeasure(this) ? null : layout.SongManager().GetPreviousMeasure(this));
		if (_previousMeasure == null || Clef != _previousMeasure.Clef)
		{
			IsPaintClef = true;
			HeaderImpl().NotifyClefSpacing(Math.round(DefaultClefSpacing * layout.Scale));
		}
		if (_previousMeasure == null || KeySignature != _previousMeasure.KeySignature)
		{
			IsPaintKeySignature = true;
			HeaderImpl().NotifyKeySignatureSpacing(CalculateKeySignatureSpacing(layout));
		}
	}
	
	private function UpdateComponents(layout:ViewLayout) : Void
	{
		MaxY = 0;
		MinY = 0;

		var spacing:Int = GetFirstNoteSpacing(layout);
		var tmpX:Int = spacing;
		for (i in 0 ... BeatCount())
		{
			var beat:GsBeatImpl = cast Beats[i];			
			beat.PosX = (tmpX);
			tmpX += beat.MinimumWidth;
		
			for (v in 0 ... beat.Voices.length)
			{
				var voice:GsVoiceImpl = beat.GetVoiceImpl(v);
				if (!voice.IsEmpty)
				{
					for (note in voice.Notes)
					{
						var note2:GsNoteImpl = cast note;
						CheckEffects(layout, note2);
						note2.Update(layout);
					}

					voice.Update(layout);
					if (!_tupleto && voice.Duration.Triplet != GsTriplet.Normal)
					{
						_tupleto = true;
					}
					if (voice.MaxY > MaxY)
					{
						MaxY = voice.MaxY;
					}
					if (voice.MinY < MinY)
					{
						MinY = voice.MinY;
					}
				}
			}

			if (!_chord && beat.Chord != null)
			{
				_chord = true;
			}

			if (!_text && beat.Text != null)
			{
				_text = true;
			}
		}

		for (groups in _voiceGroups)
		{
			for (group in groups)
			{
				CheckValue(layout, group.MinNote, group.Direction);
				CheckValue(layout, group.MaxNote, group.Direction);
			}
		}
	}

	public static function GetStartPosition(measure:GsMeasure, start:Int, spacing:Int) : Int
	{
		var newStart:Float = start - measure.Start();
		var displayPosition:Float = 0.0;
		if (newStart > 0)
		{
			var position:Float = (newStart / GsDuration.QuarterTime);
			displayPosition = (position * spacing);
		}
		return cast displayPosition;
	}
	
	public function GetNoteAccidental(noteValue:Int):Int
	{
		if (noteValue >= 0 && noteValue < 128)
		{
			var key:Int = KeySignature();
			var note:Int = (noteValue % 12);
			var octave:Int = Math.round(noteValue / 12);
			var accidentalValue:Int = (key <= 7 ? Sharp : Flat);
			var accidentalNotes:Array<Int> = (key <= 7 ? AccidentalSharpNotes : AccidentalFlatNotes);
			var isAccidentalNote:Bool = AccidentalNotes[note];
			var isAccidentalKey:Bool = KeySignatures[key][accidentalNotes[note]] == accidentalValue;

			if (isAccidentalKey != isAccidentalNote && !_registeredAccidentals[octave][accidentalNotes[note]])
			{
				_registeredAccidentals[octave][accidentalNotes[note]] = true;
				return (isAccidentalNote ? accidentalValue : Natural);
			}

			if (isAccidentalKey == isAccidentalNote && _registeredAccidentals[octave][accidentalNotes[note]])
			{
				_registeredAccidentals[octave][accidentalNotes[note]] = false;
				return (isAccidentalNote ? accidentalValue : Natural);
			}
		}
		return 0;
	}


	private function CheckValue(layout:ViewLayout, note:GsNoteImpl, direction:GsVoiceDirection) : Void
	{
		var y:Int = note.ScorePosY;
		var upOffset:Float = BeatGroup.GetUpOffset(layout);
		var downOffset:Float = BeatGroup.GetDownOffset(layout);
	   
		if (direction == GsVoiceDirection.Up && y > MaxY)
		{
			MaxY = y;
		}
		else if (direction == GsVoiceDirection.Down && (y + downOffset) > MaxY)
		{
			MaxY = Math.floor(y + downOffset + 2);
		}

		if (direction == GsVoiceDirection.Up && (y - upOffset) < MinY)
		{
			MinY = Math.floor(y - upOffset - 2);
		}
		else if (direction == GsVoiceDirection.Down && y < MinY)
		{
			MinY = y;
		}
	}

	private function CheckEffects(layout:ViewLayout, note:GsNoteImpl)
	{
		var effect:GsNoteEffect = note.Effect;
		if (effect.AccentuatedNote || effect.HeavyAccentuatedNote)
		{
			_accentuated = true;
		}
		if (effect.IsHarmonic())
		{
			_harmonic = true;
		}
		if (effect.Tapping || effect.Slapping || effect.Popping)
		{
			_tapping = true;
		}
		if (effect.PalmMute)
		{
			_palmMute = true;
		}
		if (effect.FadeIn)
		{
			_fadeIn = true;
		}
		if (effect.Vibrato || effect.IsTrill())
		{
			_vibrato = true;
		}
		if (effect.BeatVibrato)
		{
			_beatVibrato = true;
		}
		if (effect.LetRing)
		{
			_letRing = true;
		}
		if (effect.IsBend())
		{
			_bend = true;
			_bendOverFlow = Math.round(Math.max(_bendOverFlow, Math.round(note.CalculateBendOverflow(layout))));
		}
	}

	private function ResetSpacing() : Void
	{
		_text = false;
		_chord = false;
		_tupleto = false;
		_accentuated = false;
		_harmonic = false;
		_tapping = false;
		_palmMute = false;
		_fadeIn = false;
		_vibrato = false;
		_beatVibrato = false;
		_letRing = false;
	}

	public function RegisterSpacing(layout:ViewLayout, spacing:TrackSpacing)
	{
		if (HasMarker())
		{
			spacing.Set(TrackSpacingPositions.Marker, cast layout.MarkerSpacing);
		}
		if (_chord)
		{
			spacing.Set(TrackSpacingPositions.Chord, cast layout.GetDefaultChordSpacing());
		}
		if (_text)
		{
			spacing.Set(TrackSpacingPositions.Text, cast layout.TextSpacing);
		}
		if (Header.RepeatAlternative > 0)
		{
			spacing.Set(TrackSpacingPositions.RepeatEnding, cast layout.RepeatEndingSpacing);
		}
		if (_tupleto)
		{
			spacing.Set(TrackSpacingPositions.Tupleto, cast layout.TupletoSpacing);
		}
		if (_accentuated)
		{
			spacing.Set(TrackSpacingPositions.AccentuatedEffect, cast layout.EffectSpacing);
		}
		if (_harmonic)
		{
			spacing.Set(TrackSpacingPositions.HarmonicEffect, cast layout.EffectSpacing);
		}
		if (_tapping)
		{
			spacing.Set(TrackSpacingPositions.TapingEffect, cast layout.EffectSpacing);
		}
		if (_palmMute)
		{
			spacing.Set(TrackSpacingPositions.PalmMuteEffect, cast layout.EffectSpacing);
		}
		if (_fadeIn)
		{
			spacing.Set(TrackSpacingPositions.FadeIn, cast layout.EffectSpacing);
		}
		if (_vibrato)
		{
			spacing.Set(TrackSpacingPositions.VibratoEffect, cast layout.EffectSpacing);
		}
		if (_beatVibrato)
		{
			spacing.Set(TrackSpacingPositions.BeatVibratoEffect, cast layout.EffectSpacing);
		}
		if (_letRing)
		{
			spacing.Set(TrackSpacingPositions.LetRingEffect, cast layout.EffectSpacing);
		}
		if (_bend)
		{
			spacing.Set(TrackSpacingPositions.Bend, _bendOverFlow);
		}
	}

	// Painting
	public function PaintMeasure(layout:ViewLayout, context:DrawingContext) : Void
	{
		var x:Int = PosX;
		var y:Int = PosY;
		layout.PaintLines(TrackImpl(), Ts, context, x, y, Width + Spacing);
		PaintTimeSignature(context, layout, x, y);
		PaintClef(layout, context, x, y);
		PaintKeySignature(layout, context, x, y);
		PaintComponents(layout, context, x, y);
		PaintMarker(context, layout);
		PaintTexts(layout, context);
		PaintTempo(context, layout);
		PaintTripletFeel(context, layout);
		PaintDivisions(layout, context);
		PaintRepeatEnding(layout, context);
	}


	public function PaintComponents(layout:ViewLayout, context:DrawingContext, fromX:Int , fromY:Int):Void
	{
		for (beat in Beats)
		{
			var impl:GsBeatImpl = cast beat;
			impl.Paint(layout, context, fromX + HeaderImpl().GetLeftSpacing(layout), fromY);
		}
	}

	// TimeSignature
	private function PaintTimeSignature(context:DrawingContext, layout:ViewLayout, fromX:Int, fromY:Int) :Void
	{
		if (HeaderImpl().ShouldPaintTimeSignature)
		{
			var scale:Float = layout.Scale;
			var leftSpacing:Int = Math.round(5.0 * scale);
			var x:Int = ((GetClefSpacing(layout) + GetKeySignatureSpacing(layout)) + HeaderImpl().GetLeftSpacing(layout)) + leftSpacing;
			var y:Int = fromY + Ts.Get(TrackSpacingPositions.ScoreMiddleLines);
			var y1:Int = 0;// layout.ScoreLineSpacing;
			var y2:Int = Math.round(2 * layout.ScoreLineSpacing);// layout.ScoreLineSpacing;
            var numerator = this.GetTimeSignature().Numerator;
			var symbol = this.GetTimeSignatureSymbol(numerator);
			if (symbol != null) {
				context.Get(DrawingLayers.MainComponents).AddMusicSymbol(symbol, fromX + x, y + y1, scale);
			}
			var denominator = this.GetTimeSignature().Denominator.Value;
			symbol = this.GetTimeSignatureSymbol(denominator);
			if (symbol != null) {
				context.Get(DrawingLayers.MainComponents).AddMusicSymbol(symbol, fromX + x, y + y2, scale);
			}
		}
	}
	
	private function GetTimeSignatureSymbol(number:Int)
	{
		switch(number) {
			case 1:  
				return MusicFont.Num1;
			case 2: 
				return MusicFont.Num2;
			case 3: 
				return MusicFont.Num3;
			case 4: 
				return MusicFont.Num4;
			case 5: 
				return MusicFont.Num5;
			case 6: 
				return MusicFont.Num6;
			case 7: 
				return MusicFont.Num7;
			case 8: 
				return MusicFont.Num8;
			case 9: 
				return MusicFont.Num9;
		}
		return null;
	}
	
	// Clef 
	private function PaintClef(layout:ViewLayout, context:DrawingContext, fromX:Int, fromY:Int) : Void
	{
		// Score
		if (IsPaintClef)
		{
			var x:Int = fromX + Math.round(14 * layout.Scale);
			var y:Int = fromY + Ts.Get(TrackSpacingPositions.ScoreMiddleLines);
			if (Clef == GsMeasureClef.Treble)
			{
				ClefPainter.PaintTreble(context, x, y, layout);
			}
			else if (Clef == GsMeasureClef.Bass)
			{
				ClefPainter.PaintBass(context, x, y, layout);
			}
			else if (Clef == GsMeasureClef.Tenor)
			{
				ClefPainter.PaintTenor(context, x, y, layout);
			}
			else if (Clef == GsMeasureClef.Alto)
			{
				ClefPainter.PaintAlto(context, x, y, layout);
			}
		}
	}
	
	// KeySignature
	private function PaintKeySignature(layout:ViewLayout, context:DrawingContext, fromX:Int, fromY:Int) :Void
	{
		if (IsPaintKeySignature)
		{
			var scale:Float = layout.ScoreLineSpacing;
			var x:Int = fromX + GetClefSpacing(layout) + 10;
			var y:Int  = fromY + Ts.Get(TrackSpacingPositions.ScoreMiddleLines);
			var currentKey:Int  = GetKeySignature();
			var previousKey:Int  = (_previousMeasure != null ? _previousMeasure.GetKeySignature() : 0);
			var offsetClef:Int  = 0;
			var clef = (Clef);
			switch (clef)
			{
				case GsMeasureClef.Treble:
					offsetClef = 0;
				case GsMeasureClef.Bass:
					offsetClef = 2;
				case GsMeasureClef.Tenor:
					offsetClef = -1;
				case GsMeasureClef.Alto:
					offsetClef = 1;
			}

			//natural
			if (previousKey >= 1 && previousKey <= 7)
			{
				var naturalFrom:Int = (currentKey >= 1 && currentKey <= 7) ? currentKey : 0;
				for (i in naturalFrom ... previousKey)
				{
					var offset:Float = ((scale / 2) * (((ScoreKeySharpPositions[i] + offsetClef) + 7) % 7))
						- (scale / 2);
					KeySignaturePainter.PaintNatural(context, x, cast (y + offset), layout);
					x += Math.floor (scale - (scale / 4));
				}
			}
			else if (previousKey >= 8 && previousKey <= 14)
			{
				var naturalFrom:Int = (currentKey >= 8 && currentKey <= 14) ? currentKey : 7;
				for (i in naturalFrom ... previousKey)
				{
					var offset:Float = ((scale / 2) * (((ScoreKeyFlatPositions[i - 7] + offsetClef) + 7) % 7))
						- (scale / 2);
					KeySignaturePainter.PaintNatural(context, x, cast (y + offset), layout);
					x += Math.floor (scale - (scale / 4));
				}
			}
			
			//sharps
			if (currentKey >= 1 && currentKey <= 7)
			{
				for (i in 0 ... currentKey)
				{
					var offset:Int = Math.floor(((scale / 2) * (((ScoreKeySharpPositions[i] + offsetClef) + 7) % 7)) - (scale / 2));

					KeySignaturePainter.PaintSharp(context, x, (y + offset), layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
			//flats
			else if (currentKey >= 8 && currentKey <= 14)
			{
				for (i in 7 ... currentKey)
				{
					var offset:Float = ((scale / 2) * (((ScoreKeyFlatPositions[i - 7] + offsetClef) + 7) % 7))
						- (scale / 2);
					KeySignaturePainter.PaintFlat(context, x, cast (y + offset), layout);
					x += Math.floor (scale - (scale / 4));
				}
			}
			
		}
	}
	
	// Marker
	private function PaintMarker(context:DrawingContext, layout:ViewLayout) :Void
	{
		if (HasMarker())
		{
			var x:Int = (PosX + HeaderImpl().GetLeftSpacing(layout) + GetFirstNoteSpacing(layout));
			var y:Int = (PosY + Ts.Get(TrackSpacingPositions.Marker));
			context.Get(DrawingLayers.Voice1).AddString(GetMarker().Title, DrawingResources.DefaultFont, x, y);
		}
	}

	//Texts
	private function PaintTexts(layout:ViewLayout, context:DrawingContext) : Void
	{
		for (beat in Beats)
		{
			if (beat.Text != null)
			{
				var text:GsBeatTextImpl = cast beat.Text;
				text.Paint(layout, context, (PosX + HeaderImpl().GetLeftSpacing(layout)), PosY);
			}
		}
	}

	// Tempo
	private function PaintTempo(context:DrawingContext, layout:ViewLayout) :Void
	{
		if (HeaderImpl().ShouldPaintTempo)
		{
			var scale:Float = 5.0 * layout.Scale;
			var x:Int = (PosX + HeaderImpl().GetLeftSpacing(layout));
			var y:Int = PosY;
			var lineSpacing:Int = Math.floor(Math.max(layout.ScoreLineSpacing, layout.StringSpacing));

			y += (Ts.Get(TrackSpacingPositions.ScoreMiddleLines) - lineSpacing);

			var imgX:Int = x;
			var imgY:Int = cast (y - (Math.round(scale * 3.5) + 2));

			TempoPainter.PaintTempo(context, imgX, imgY, scale);

			var value:String = (" = " + GetTempo().Value);
			var fontX:Int = x + Math.floor(Math.round((1.33 * scale)) + 1);
			var fontY:Int = Math.round(y - DrawingResources.DefaultFontHeight - (1.0 * layout.Scale));
			context.Get(DrawingLayers.MainComponents).AddString(value, DrawingResources.DefaultFont, fontX, fontY);
		}
	}
	
	// TripletFeel
	private function PaintTripletFeel(context:DrawingContext, layout:ViewLayout) : Void
	{
		if (HeaderImpl().ShouldPaintTripletFeel)
		{
			var lineSpacing:Int = Math.floor(Math.max(layout.ScoreLineSpacing, layout.StringSpacing));
			var scale:Float = (5.0 * layout.Scale);
			var x:Int = (PosX + HeaderImpl().GetLeftSpacing(layout) + HeaderImpl().GetTempoSpacing(layout));
			var y:Int = PosY + Ts.Get(TrackSpacingPositions.ScoreMiddleLines) - lineSpacing;

			var y1:Int = y - (Math.round((3.5 * scale)));

			// Resetting
			if (GetTripletFeel() == GsTripletFeel.None && _previousMeasure != null)
			{
				var previous:GsTripletFeel = _previousMeasure.GetTripletFeel();
				if (previous == GsTripletFeel.Eighth)
				{
					TripletFeelPainter.PaintTripletFeelNone8(context, x, y1, layout.Scale);
				}
				else if (previous == GsTripletFeel.Sixteenth)
				{
					TripletFeelPainter.PaintTripletFeelNone16(context, x, y1, layout.Scale);
				}
			}
			// Setting
			else if (GetTripletFeel() == GsTripletFeel.Eighth)
			{
				TripletFeelPainter.PaintTripletFeel8(context, x, y1, layout.Scale);
			}
			else if (GetTripletFeel() == GsTripletFeel.Sixteenth)
			{
				TripletFeelPainter.PaintTripletFeel16(context, x, y1, layout.Scale);
			}
		}
	}
	
	//Divisions
	private function PaintDivisions(layout:ViewLayout, context:DrawingContext) : Void
	{
		// Score
		var x1:Int = PosX;
		var x2:Int = PosX + Width;
		var offsetY:Int = 0;
		// Score
		var y1:Int = PosY + Ts.Get(TrackSpacingPositions.ScoreMiddleLines);
		var y2:Int = Math.floor(y1 + (layout.ScoreLineSpacing * 4));
		if (layout.IsFirstMeasure(this) || IsFirstOfLine)
		{
			offsetY = (PosY + Ts.Get(TrackSpacingPositions.Tablature)) - y2;
		}
		PaintDivisions2(layout, context, x1, y1, x2, y2, offsetY, true);
		// Tablature
		y1 = PosY + Ts.Get(TrackSpacingPositions.Tablature);
		y2 = Math.floor(y1 + ((Track.Strings.length - 1) * layout.StringSpacing));
		offsetY = 0;
		PaintDivisions2(layout, context, x1, y1, x2, y2, offsetY, false);
	}

	private function PaintDivisions2(layout:ViewLayout, context:DrawingContext, x1:Int, y1:Int, x2:Int, y2:Int, offsetY:Int, addInfo:Bool) : Void
	{
		var scale:Float = layout.Scale;
		var lineWidthSmall:Float = 1;
		var lineWidthBig:Int = Math.floor(Math.max(lineWidthSmall, Math.round(3.0 * scale)));
		var fill:DrawingLayer = context.Get(DrawingLayers.MainComponents);
		var draw:DrawingLayer = context.Get(DrawingLayers.MainComponentsDraw);
		// Numbers
		if (addInfo) 
		{
			var number:String = Utils.string(Number());
			context.Get(DrawingLayers.Red).AddString(number, DrawingResources.DefaultFont, (PosX + Math.round(scale)),
				(y1 - DrawingResources.DefaultFontHeight - Math.round(scale)));
		}

		// RepeatEndings
		if (IsRepeatOpen() || layout.IsFirstMeasure(this))
		{
			fill.MoveTo(x1, y1);
			fill.RectTo(lineWidthBig, (y2 + offsetY) - y1);

			draw.StartFigure();
			draw.MoveTo(
				Math.floor(x1 + lineWidthBig + scale + lineWidthSmall),
				y1);
			draw.LineTo(
				Math.floor(x1 + lineWidthBig + scale + lineWidthSmall),
				y2 + offsetY);

			if (IsRepeatOpen())
			{
				var size:Int = Math.round(Math.max(1, (4.0 * scale)));
				var xMove:Float = ((lineWidthBig + scale + lineWidthSmall) + (2.0 * scale));
				var yMove:Float = ((lineWidthBig + scale + lineWidthSmall) + (2.0 * scale));

				fill.MoveTo(
					Math.floor(x1 + xMove),
					Math.floor(y1 + ((y2 - y1) / 2) - (yMove + (size / 2))));
				fill.EllipseTo(size, size);
				fill.MoveTo(
					Math.floor(x1 + xMove),
					Math.floor(y1 + ((y2 - y1) / 2) + (yMove - (size / 2))));
				fill.EllipseTo(
					size,
					size);
			}
		}
		else
		{
			draw.StartFigure();
			draw.MoveTo(x1, y1);
			draw.LineTo(x1, y2 + offsetY);
		}

		//fin
		if (RepeatClose() > 0 || layout.IsLastMeasure(this))
		{
			draw.StartFigure();
			draw.MoveTo(Math.floor(x2 + Spacing - (lineWidthBig + scale + lineWidthSmall)), y1);
			draw.LineTo(Math.floor((x2 + Spacing) - (lineWidthBig + scale + lineWidthSmall)), y2);

			fill.MoveTo((x2 + Spacing) - lineWidthBig, y1);
			fill.RectTo(lineWidthBig, y2 - y1);

			if (RepeatClose() > 0)
			{
				var size:Int = Math.round(Math.max(1, (4 * scale)));
				var xMove:Float = (((lineWidthBig + scale + lineWidthSmall) + (2.0 * scale)) + size);
				var yMove:Float = ((lineWidthBig + scale + lineWidthSmall) + (2.0 * scale));

				fill.MoveTo(Math.round((x2 - xMove) + Spacing),
					Math.round(y1 + ((y2 - y1) / 2) - (yMove + (size / 2))));
				fill.EllipseTo(size, size);

				fill.MoveTo(
					Math.round((x2 - xMove) + Spacing),
					Math.round(y1 + ((y2 - y1) / 2) + (yMove - (size / 2))));
				fill.EllipseTo(size,
					size);

				if (addInfo)
				{
					var repetitions:String = ("x" + (RepeatClose() + 1));
                    var numberSize = context.Graphics.measureText(repetitions);
					fill.AddString(repetitions, DrawingResources.DefaultFont, (x2 - numberSize.width + Spacing - size),
					((y1 - DrawingResources.DefaultFontHeight) - Math.round(scale)));
				}
			}
		}
		else
		{
			draw.StartFigure();
			draw.MoveTo(x2 + Spacing, y1);
			draw.LineTo(x2 + Spacing, y2);
		}
	}
	
	// RepeatEnding
	public function PaintRepeatEnding(layout:ViewLayout, context:DrawingContext) : Void
	{
		if (Header.RepeatAlternative > 0)
		{
			var scale:Float = layout.Scale;
			var x1:Float = (PosX + HeaderImpl().GetLeftSpacing(layout) + GetFirstNoteSpacing(layout));
			var x2:Float = (PosX + Width + Spacing);
			var y1:Float = (PosY + Ts.Get(TrackSpacingPositions.RepeatEnding));
			var y2:Float = (y1 + (layout.RepeatEndingSpacing * 0.75));
			var sText:String = "";
			for (i in 0 ... 8)
			{
				if ((Header.RepeatAlternative & (1 << i)) != 0)
				{
					sText += (sText.length > 0) ? ", " + (i + 1) : Utils.string(i + 1);
				}
			}
			var layer:DrawingLayer  = context.Get(DrawingLayers.MainComponentsDraw);
			layer.StartFigure();
			layer.MoveTo(cast x1, cast y2);
			layer.LineTo(cast x1, cast y1);
			layer.LineTo(cast x2, cast y1);
			context.Get(DrawingLayers.MainComponents).AddString(sText, DrawingResources.DefaultFont,
				Math.round(x1 + (5.0 * scale)), Math.round(y1 + (2.0 * scale)));
		}
	}
	
	public function GetBeatSpacing(beat:GsBeat) : Int
	{
		return cast ((beat.Start - Start()) * Spacing / Length());
	}
	

	private function CalculateKeySignatureSpacing(layout:ViewLayout) : Int
	{
		var spacing:Int = 0;
		if (IsPaintKeySignature)
		{
		
			if (GetKeySignature() <= 7)
			{
				spacing += Math.round((6 * layout.Scale) * GetKeySignature());
			}
			else
			{
				spacing += Math.round((6 * layout.Scale) * (GetKeySignature() - 7));
			}
			if (_previousMeasure != null)
			{
				if (_previousMeasure.GetKeySignature() <= 7)
				{
					spacing += Math.round((6 * layout.Scale) * _previousMeasure.GetKeySignature());
				}
				else
				{
					spacing += Math.round((6 * layout.Scale) * (_previousMeasure.GetKeySignature() - 7));
				}
			}
		}
		return spacing;
	}

	public function GetFirstNoteSpacing(layout:ViewLayout) : Int
	{
		return HeaderImpl().GetFirstNoteSpacing(layout, this);
	}

	public function GetClefSpacing(layout:ViewLayout) : Int
	{
		return HeaderImpl().GetClefSpacing(layout, this);
	}

	public function GetKeySignatureSpacing(layout:ViewLayout) : Int
	{
		return HeaderImpl().GetKeySignatureSpacing(layout, this);
	}
}