/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.tablature.model;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Measure;
import alphatab.model.MeasureClef;
import alphatab.model.MeasureHeader;
import alphatab.model.NoteEffect;
import alphatab.model.Tuplet;
import alphatab.model.TripletFeel;
import alphatab.model.Voice;
import alphatab.model.VoiceDirection;
import alphatab.model.Point;
import alphatab.model.SongManager;
import alphatab.tablature.drawing.ClefPainter;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayer;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.drawing.KeySignaturePainter;
import alphatab.tablature.drawing.MusicFont;
import alphatab.tablature.drawing.TempoPainter;
import alphatab.tablature.drawing.TripletFeelPainter;
import alphatab.tablature.TrackSpacing;
import alphatab.tablature.TrackSpacingPositions;
import alphatab.tablature.ViewLayout;


/**
 * This measure implementation extends the default measure with drawing and layouting features. 
 */
class MeasureImpl extends Measure
{
	public static inline var NATURAL:Int = 1;
	public static inline var SHARP:Int = 2;
	public static inline var FLAT:Int = 3;
	
	public static var KEY_SIGNATURES:Array<Array<Int>> = [
		//------------NATURAL------------------------------------
		[NATURAL, NATURAL, NATURAL, NATURAL, NATURAL, NATURAL, NATURAL], // NATURAL
		//------------SHARPS------------------------------------
		[NATURAL, NATURAL, NATURAL, SHARP, NATURAL, NATURAL, NATURAL], // 1 SHARP
		[SHARP, NATURAL, NATURAL, SHARP, NATURAL, NATURAL, NATURAL], // 2 SHARPS
		[SHARP, NATURAL, NATURAL, SHARP, SHARP, NATURAL, NATURAL], // 3 SHARPS
		[SHARP, SHARP, NATURAL, SHARP, SHARP, NATURAL, NATURAL], // 4 SHARPS
		[SHARP, SHARP, NATURAL, SHARP, SHARP, SHARP, NATURAL], // 5 SHARPS
		[SHARP, SHARP, SHARP, SHARP, SHARP, SHARP, NATURAL], // 6 SHARPS
		[SHARP, SHARP, SHARP, SHARP, SHARP, SHARP, SHARP], // 7 SHARPS
		//------------FLATS------------------------------------
		[NATURAL, NATURAL, NATURAL, NATURAL, NATURAL, NATURAL, FLAT], // 1 FLAT
		[NATURAL, NATURAL, FLAT, NATURAL, NATURAL, NATURAL, FLAT], // 2 FLATS
		[NATURAL, NATURAL, FLAT, NATURAL, NATURAL, FLAT, FLAT], // 3 FLATS
		[NATURAL, FLAT, FLAT, NATURAL, NATURAL, FLAT, FLAT], // 4 FLATS
		[NATURAL, FLAT, FLAT, NATURAL, FLAT, FLAT, FLAT], // 5 FLATS
		[FLAT, FLAT, FLAT, NATURAL, FLAT, FLAT, FLAT], // 6 FLATS
		[FLAT, FLAT, FLAT, FLAT, FLAT, FLAT, FLAT] // 7 FLATS
	];

	public static var ACCIDENTAL_SHARP_NOTES:Array<Int> = [ 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6 ];
	public static var ACCIDENTAL_FLAT_NOTES:Array<Int> = [ 0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6 ];
	public static var ACCIDENTAL_NOTES:Array<Bool> = [ false, true, false, true, false, false,
													true, false, true, false, true, false];

	public static var SCORE_KEY_OFFSETS:Array<Int> = [ 30, 18, 22, 24 ];
	public static var SCORE_KEYSHARP_POSITIONS:Array<Int> = [ 1, 4, 0, 3, 6, 2, 5 ];
	public static var SCORE_KEYFLAT_POSITIONS:Array<Int> = [ 5, 2, 6, 3, 0, 4, 1 ];

	private static inline var DEFAULT_CLEF_SPACING:Int = 40;
	private static inline var DEFAULT_QUARTER_SPACING:Int = 30;
	
	private var _previousMeasure:Measure;
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
	private var _tremoloBar:Bool;
	private var _letRing:Bool;
	private var _bendOverFlow:Int;
	private var _tremoloBarOverFlow:Int;

	private var _registeredAccidentals:Array<Array<Bool>>;

	public var width:Int;
	public var divisionLength:Int;
	public var posX:Int;
	public var posY:Int;
	public var quarterSpacing:Int;
	public var spacing:Int;
	public var isFirstOfLine:Bool;

	
	private function getMaxQuarterSpacing() : Int
	{
		return quarterSpacing;
	}

	public function headerImpl() : MeasureHeaderImpl
	{
		return cast header;
	}
	
	public function trackImpl() : TrackImpl
	{
		return cast track;
	}
	
	public function height() : Int
	{
		return ts.getSize();
	}

	public var ts:TrackSpacing ;
	public var maxY:Int ;
	public var minY:Int ;
	public var notEmptyBeats:Int;
	public var notEmptyVoices:Int;
	public var lyricBeatIndex:Int;
	public var isPaintClef:Bool;
	
	public function new(header:MeasureHeader) 
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
		for (v in 0 ... Beat.MAX_VOICES)
		{
			_voiceGroups.push(new Array<BeatGroup>());
		}
	}
	
	public function create(layout:ViewLayout) : Void
	{
		divisionLength = SongManager.getDivisionLength(header);
		resetSpacing();
		clearRegisteredAccidentals();
		calculateBeats(layout);
		calculateWidth(layout);
		isFirstOfLine = false;
	}

	public function update(layout:ViewLayout) : Void
	{
		updateComponents(layout);
	}

	private function clearRegisteredAccidentals() : Void
	{
		for (i in 0 ... 11)
		{
			for (n in 0 ... 7)
			{
				_registeredAccidentals[i][n] = false;
			}
		}
	}
	
	public function calculateWidth(layout:ViewLayout): Void
	{
		width = _widthBeats;
		width += getFirstNoteSpacing(layout);
		width += (repeatClose() > 0) ? 20 : 0;
		width += headerImpl().getLeftSpacing(layout);
		width += headerImpl().getRightSpacing(layout);
		headerImpl().notifyWidth(width);
	}
	
	private function calculateBeats(layout:ViewLayout) : Void
	{
		var minDuration:Duration = null;
		var previousVoices:Array<VoiceImpl> = new Array<VoiceImpl>();
		var groups:Array<BeatGroup> = new Array<BeatGroup>();
		var notEmptyVoicesChecked:Array<Bool> = new Array<Bool>();
		
		for (v in 0 ... Beat.MAX_VOICES)
		{
			previousVoices.push(null);
			groups.push(null);
			notEmptyVoicesChecked.push(false);
			_voiceGroups[v] = new Array<BeatGroup>();
		}
		
		_widthBeats = 0;
		notEmptyBeats = 0;
		notEmptyVoices = 0;
	
		for (i in 0 ... beatCount())
		{
			var beat:BeatImpl = cast beats[i];
			beat.reset();

			for (v in 0 ... Beat.MAX_VOICES)
			{
				var voice:VoiceImpl = cast beat.voices[v];
				if (!voice.isEmpty)
				{
					voice.reset();
					if (minDuration == null || voice.duration.time() <= minDuration.time())
					{
						minDuration = voice.duration;
					}
					if (!notEmptyVoicesChecked[v])
					{
						notEmptyVoicesChecked[v] = true;
						notEmptyVoices++;
					}

					for (note in voice.notes)
					{
						var noteImpl:NoteImpl = cast note;
						voice.check(noteImpl);
					}

					if (!voice.isRestVoice())
					{
						beat.check(voice.minNote);
						beat.check(voice.maxNote);
						if ((groups[v] == null) || !canJoin(layout.songManager(), voice, previousVoices[v]))
						{
							groups[v] = new BeatGroup(v);
							_voiceGroups[v].push(groups[v]);
						}
						groups[v].checkVoice(voice);
					}
					else
					{
						for (v2 in  0 ... Beat.MAX_VOICES)
						{
							if (v2 != voice.index)
							{
								var voice2:VoiceImpl = beat.getVoiceImpl(v2);
								if (!voice2.isEmpty && voice2.duration.equals(voice.duration))
								{
									if (!voice2.isRestVoice() || !voice2.isHiddenSilence)
									{
										voice.isHiddenSilence = (true);
										break;
									}
								}
							}
						}
					}
					makeVoice(layout, voice, previousVoices[v], groups[v]);
					previousVoices[v] = voice;
				}
			}
			makeBeat(layout, beat, trackImpl().previousBeat, false);
			trackImpl().previousBeat = beat;
		}

		for (voiceGroup in _voiceGroups)
		{
			for (group in voiceGroup)
			{
				group.finish(layout, this);
			}
		}

	}

	public function canJoin(manager:SongManager, b1:VoiceImpl, b2:VoiceImpl) : Bool
	{
		if (b1 == null || b2 == null || b1.isRestVoice() || b2.isRestVoice())
		{
			return false;
		}

		var divisionLength:Int = divisionLength;
		var start:Int = start();
		var start1:Int = (manager.getRealStart(this, b1.beat.start) - start);
		var start2:Int = (manager.getRealStart(this, b2.beat.start) - start);

		if (b1.duration.value < Duration.EIGHTH|| b2.duration.value < Duration.EIGHTH)
		{
			return (start1 == start2);
		}

		var p1:Int = Math.floor((divisionLength + start1) / divisionLength);
		var p2:Int = Math.floor((divisionLength + start2) / divisionLength);

		return (p1 == p2);
	}



	private static function makeVoice(layout:ViewLayout, voice:VoiceImpl, previousVoice:VoiceImpl, group:BeatGroup) : Void
	{
		voice.width = cast layout.getVoiceWidth(voice);
		voice.beatGroup = (group);

		if (previousVoice != null)
		{
			voice.previousBeat = (previousVoice);
			previousVoice.nextBeat = (voice);
		}
	}

	private function makeBeat(layout:ViewLayout, beat:BeatImpl, previousBeat:BeatImpl, chordEnabled:Bool) : Void
	{
		var minimumWidth:Int = -1;
		var restBeat:Bool = true;
		for (v in 0 ... Beat.MAX_VOICES)
		{
			var voice:VoiceImpl = beat.getVoiceImpl(v);
			if (!voice.isEmpty)
			{
				if (minimumWidth < 0 || voice.width < minimumWidth)
				{
					minimumWidth = voice.width;
				}
				if (!voice.isRestVoice())
				{
					restBeat = false;
				}
			}
		}

		beat.minimumWidth = (minimumWidth);
		notEmptyBeats += (restBeat ? 0 : 1);
		_widthBeats += beat.minimumWidth;

		if (previousBeat != null)
		{
			beat.previousBeat = (previousBeat);
			previousBeat.nextBeat = (beat);

			if (chordEnabled && beat.effect.chord != null && previousBeat.effect.chord != null)
			{
				var previousWidth:Int = previousBeat.minimumWidth;
				var chordWidth:Int = Math.floor(layout.chordFretIndexSpacing + layout.chordStringSpacing + (track.stringCount()
					* layout.chordStringSpacing));
				previousBeat.minimumWidth = Math.round((Math.max(chordWidth, previousWidth)));
				_widthBeats -= previousWidth;
				_widthBeats += previousBeat.minimumWidth;
			}
		}
	}

	public function calculateMeasureChanges(layout:ViewLayout) : Void
	{
		isPaintClef = false;
		_previousMeasure = (layout.isFirstMeasure(this) ? null : layout.songManager().getPreviousMeasure(this));
		if (_previousMeasure == null || clef != _previousMeasure.clef)
		{
			isPaintClef = true;
			headerImpl().notifyClefSpacing(Math.round(DEFAULT_CLEF_SPACING * layout.scale));
		}
	}
	
	private function updateComponents(layout:ViewLayout) : Void
	{
		maxY = 0;
		minY = 0;

		var spacing:Int = getFirstNoteSpacing(layout);
		var tmpX:Int = spacing;
		for (i in 0 ... beatCount())
		{
			var beat:BeatImpl = cast beats[i];			
			beat.posX = (tmpX);
			tmpX += beat.minimumWidth;
		
			for (v in 0 ... beat.voices.length)
			{
				var voice:VoiceImpl = beat.getVoiceImpl(v);
				if (!voice.isEmpty)
				{
					for (note in voice.notes)
					{
						var note2:NoteImpl = cast note;
						checkEffects(layout, note2);
						note2.update(layout);
					}

					voice.update(layout);
					if (!_tupleto && !voice.duration.tuplet.equals(Tuplet.NORMAL))
					{
						_tupleto = true;
					}
					if (voice.maxY > maxY)
					{
						maxY = voice.maxY;
					}
					if (voice.minY < minY)
					{
						minY = voice.minY;
					}
				}
			}

			if (!_chord && beat.effect.chord != null)
			{
				_chord = true;
			}

			if (!_text && beat.text != null)
			{
				_text = true;
			}
		}

		for (groups in _voiceGroups)
		{
			for (group in groups)
			{
				checkValue(layout, group.minNote, group.direction);
				checkValue(layout, group.maxNote, group.direction);
			}
		}
	}

	public static function getStartPosition(measure:Measure, start:Int, spacing:Int) : Int
	{
		var newStart:Float = start - measure.start();
		var displayPosition:Float = 0.0;
		if (newStart > 0)
		{
			var position:Float = (newStart / Duration.QUARTER_TIME);
			displayPosition = (position * spacing);
		}
		return cast displayPosition;
	}
	
	public function getNoteAccidental(noteValue:Int):Int
	{
		if (noteValue >= 0 && noteValue < 128)
		{
			var key:Int = keySignature();
			var note:Int = (noteValue % 12);
			var octave:Int = Math.round(noteValue / 12);
			var accidentalValue:Int = (key <= 7 ? SHARP : FLAT);
			var accidentalNotes:Array<Int> = (key <= 7 ? ACCIDENTAL_SHARP_NOTES : ACCIDENTAL_FLAT_NOTES);
			var isAccidentalNote:Bool = ACCIDENTAL_NOTES[note];
			var isAccidentalKey:Bool = KEY_SIGNATURES[key][accidentalNotes[note]] == accidentalValue;

			if (isAccidentalKey != isAccidentalNote && !_registeredAccidentals[octave][accidentalNotes[note]])
			{
				_registeredAccidentals[octave][accidentalNotes[note]] = true;
				return (isAccidentalNote ? accidentalValue : NATURAL);
			}

			if (isAccidentalKey == isAccidentalNote && _registeredAccidentals[octave][accidentalNotes[note]])
			{
				_registeredAccidentals[octave][accidentalNotes[note]] = false;
				return (isAccidentalNote ? accidentalValue : NATURAL);
			}
		}
		return 0;
	}


	private function checkValue(layout:ViewLayout, note:NoteImpl, direction:Int) : Void
	{
		var y:Int = note.scorePosY;
		var upOffset:Float = BeatGroup.getUpOffset(layout);
		var downOffset:Float = BeatGroup.getDownOffset(layout);
	   
		if (direction == VoiceDirection.Up && y > maxY)
		{
			maxY = y;
		}
		else if (direction == VoiceDirection.Down && (y + downOffset) > maxY)
		{
			maxY = Math.floor(y + downOffset + 2);
		}

		if (direction == VoiceDirection.Up && (y - upOffset) < minY)
		{
			minY = Math.floor(y - upOffset - 2);
		}
		else if (direction == VoiceDirection.Down && y < minY)
		{
			minY = y;
		}
	}

	private function checkEffects(layout:ViewLayout, note:NoteImpl)
	{
		var effect:NoteEffect = note.effect;
		if (effect.accentuatedNote || effect.heavyAccentuatedNote)
		{
			_accentuated = true;
		}
		if (effect.isHarmonic())
		{
			_harmonic = true;
		}
		if (note.beatImpl().effect.tapping || note.beatImpl().effect.slapping || note.beatImpl().effect.popping)
		{
			_tapping = true;
		}
		if (effect.palmMute)
		{
			_palmMute = true;
		}
		if (note.beatImpl().effect.fadeIn)
		{
			_fadeIn = true;
		}
		if (effect.vibrato || effect.isTrill())
		{
			_vibrato = true;
		}
		if (note.beatImpl().effect.vibrato)
		{
			_beatVibrato = true;
		}
		if (effect.letRing)
		{
			_letRing = true;
		}
		if (effect.isBend())
		{
			_bend = true;
			_bendOverFlow = Math.round(Math.max(_bendOverFlow, Math.round(note.calculateBendOverflow(layout))));
		}
		if (note.beatImpl().effect.isTremoloBar()) 
		{
			_tremoloBar = true;
			_tremoloBarOverFlow = Math.round(note.beatImpl().calculateTremoloBarOverflow(layout));
		}
	}

	private function resetSpacing() : Void
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
		_tremoloBar = false;
	}

	public function registerSpacing(layout:ViewLayout, spacing:TrackSpacing)
	{
		if (hasMarker())
		{
			spacing.set(TrackSpacingPositions.Marker, cast layout.markerSpacing);
		}
		if (_chord)
		{
			spacing.set(TrackSpacingPositions.Chord, cast layout.getDefaultChordSpacing());
		}
		if (_text)
		{
			spacing.set(TrackSpacingPositions.Text, cast layout.textSpacing);
		}
		if (header.repeatAlternative > 0)
		{
			spacing.set(TrackSpacingPositions.RepeatEnding, cast layout.repeatEndingSpacing);
		}
		if (_tupleto)
		{
			spacing.set(TrackSpacingPositions.Tupleto, cast layout.tupletoSpacing);
		}
		if (_accentuated)
		{
			spacing.set(TrackSpacingPositions.AccentuatedEffect, cast layout.effectSpacing);
		}
		if (_harmonic)
		{
			spacing.set(TrackSpacingPositions.HarmonicEffect, cast layout.effectSpacing);
		}
		if (_tapping)
		{
			spacing.set(TrackSpacingPositions.TapingEffect, cast layout.effectSpacing);
		}
		if (_palmMute)
		{
			spacing.set(TrackSpacingPositions.PalmMuteEffect, cast layout.effectSpacing);
		}
		if (_fadeIn)
		{
			spacing.set(TrackSpacingPositions.FadeIn, cast layout.effectSpacing);
		}
		if (_vibrato)
		{
			spacing.set(TrackSpacingPositions.VibratoEffect, cast layout.effectSpacing);
		}
		if (_beatVibrato)
		{
			spacing.set(TrackSpacingPositions.BeatVibratoEffect, cast layout.effectSpacing);
		}
		if (_letRing)
		{
			spacing.set(TrackSpacingPositions.LetRingEffect, cast layout.effectSpacing);
		}
		if (_bend)
		{
			spacing.set(TrackSpacingPositions.Bend, _bendOverFlow);
		}
		if (_tremoloBar) 
		{
			if (_tremoloBarOverFlow < 0) {
				spacing.set(TrackSpacingPositions.TremoloBarDown, Math.round(Math.abs(_tremoloBarOverFlow)));
			}
		}
	}

	// Painting
	public function paintMeasure(layout:ViewLayout, context:DrawingContext) : Void
	{
		var x:Int = posX;
		var y:Int = posY;
		layout.paintLines(trackImpl(), ts, context, x, y, width + spacing);
		paintTimeSignature(context, layout, x, y);
		paintClef(layout, context, x, y);
		paintKeySignature(layout, context, x, y);
		paintComponents(layout, context, x, y);
		paintMarker(context, layout);
		paintTexts(layout, context);
		paintTempo(context, layout);
		paintTripletFeel(context, layout);
		paintDivisions(layout, context);
		paintRepeatEnding(layout, context);
	}


	public function paintComponents(layout:ViewLayout, context:DrawingContext, fromX:Int , fromY:Int):Void
	{
		for (beat in beats)
		{
			var impl:BeatImpl = cast beat;
			impl.paint(layout, context, fromX + headerImpl().getLeftSpacing(layout), fromY);
		}
	}

	// TimeSignature
	private function paintTimeSignature(context:DrawingContext, layout:ViewLayout, fromX:Int, fromY:Int) :Void
	{
		if (headerImpl().shouldPaintTimeSignature)
		{
			var scale:Float = layout.scale;
			var leftSpacing:Int = Math.round(5.0 * scale);
			var x:Int = ((getClefSpacing(layout) + getKeySignatureSpacing(layout)) + headerImpl().getLeftSpacing(layout)) + leftSpacing;
			var y:Int = fromY + ts.get(TrackSpacingPositions.ScoreMiddleLines);
			var y1:Int = 0;// layout.scoreLineSpacing;
			var y2:Int = Math.round(2 * layout.scoreLineSpacing);// layout.scoreLineSpacing;
            var numerator = this.timeSignature().numerator;
			var symbol = this.getTimeSignatureSymbol(numerator);
			if (symbol != null) {
				context.get(DrawingLayers.MainComponents).addMusicSymbol(symbol, fromX + x, y + y1, scale);
			}
			var denominator = this.timeSignature().denominator.value;
			symbol = this.getTimeSignatureSymbol(denominator);
			if (symbol != null) {
				context.get(DrawingLayers.MainComponents).addMusicSymbol(symbol, fromX + x, y + y2, scale);
			}
		}
	}
	
	private function getTimeSignatureSymbol(number:Int)
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
	private function paintClef(layout:ViewLayout, context:DrawingContext, fromX:Int, fromY:Int) : Void
	{
		// Score
		if (isPaintClef)
		{
			var x:Int = fromX + Math.round(14 * layout.scale);
			var y:Int = fromY + ts.get(TrackSpacingPositions.ScoreMiddleLines);
			if (clef == MeasureClef.Treble)
			{
				ClefPainter.paintTreble(context, x, y, layout);
			}
			else if (clef == MeasureClef.Bass)
			{
				ClefPainter.paintBass(context, x, y, layout);
			}
			else if (clef == MeasureClef.Tenor)
			{
				ClefPainter.paintTenor(context, x, y, layout);
			}
			else if (clef == MeasureClef.Alto)
			{
				ClefPainter.paintAlto(context, x, y, layout);
			}
		}
	}
	
	// KeySignature
	private function paintKeySignature(layout:ViewLayout, context:DrawingContext, fromX:Int, fromY:Int) :Void
	{
		if (headerImpl().shouldPaintKeySignature && !track.isPercussionTrack)
		{
			var scale:Float = layout.scoreLineSpacing;
			var x:Int = fromX + getClefSpacing(layout) + 10;
			var y:Int  = fromY + ts.get(TrackSpacingPositions.ScoreMiddleLines);
			var currentKey:Int  = keySignature();
			var previousKey:Int  = (_previousMeasure != null ? _previousMeasure.keySignature() : 0);
			var offsetClef:Int  = 0;
			switch (clef)
			{
				case MeasureClef.Treble:
					offsetClef = 0;
				case MeasureClef.Bass:
					offsetClef = 2;
				case MeasureClef.Tenor:
					offsetClef = -1;
				case MeasureClef.Alto:
					offsetClef = 1;
			}

			//natural
			if (previousKey >= 1 && previousKey <= 7)
			{
				var naturalFrom:Int = (currentKey >= 1 && currentKey <= 7) ? currentKey : 0;
				for (i in naturalFrom ... previousKey)
				{
					var offset:Float = ((scale / 2) * (((SCORE_KEYSHARP_POSITIONS[i] + offsetClef) + 7) % 7))
						- (scale / 2);
						
					KeySignaturePainter.paintNatural(context, x, cast (y + offset), layout);
					x += Math.floor (scale - (scale / 4));
				}
			}
			else if (previousKey >= 8 && previousKey <= 14)
			{
				var naturalFrom:Int = (currentKey >= 8 && currentKey <= 14) ? currentKey : 7;
				for (i in naturalFrom ... previousKey)
				{
					var offset:Float = ((scale / 2) * (((SCORE_KEYFLAT_POSITIONS[i - 7] + offsetClef) + 7) % 7))
						- (scale / 2);
					KeySignaturePainter.paintNatural(context, x, cast (y + offset), layout);
					x += Math.floor (scale - (scale / 4));
				}
			}
			
			//sharps
			if (currentKey >= 1 && currentKey <= 7)
			{
				for (i in 0 ... currentKey)
				{
					var offset:Int = Math.floor(((scale / 2) * (((SCORE_KEYSHARP_POSITIONS[i] + offsetClef) + 7) % 7)) - (scale / 2));

					KeySignaturePainter.paintSharp(context, x, (y + offset), layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
			//flats
			else if (currentKey >= 8 && currentKey <= 14)
			{
				for (i in 7 ... currentKey)
				{
					var offset:Float = ((scale / 2) * (((SCORE_KEYFLAT_POSITIONS[i - 7] + offsetClef) + 7) % 7))
						- (scale / 2);
					KeySignaturePainter.paintFlat(context, x, cast (y + offset), layout);
					x += Math.floor (scale - (scale / 4));
				}
			}
			
		}
	}
	
	// Marker
	private function paintMarker(context:DrawingContext, layout:ViewLayout) :Void
	{
		if (hasMarker())
		{
			var x:Int = (posX + headerImpl().getLeftSpacing(layout) + getFirstNoteSpacing(layout));
			var y:Int = (posY + ts.get(TrackSpacingPositions.Marker));
			context.get(DrawingLayers.Voice1).addString(marker().title, DrawingResources.defaultFont, x, y);
		}
	}

	//Texts
	private function paintTexts(layout:ViewLayout, context:DrawingContext) : Void
	{
		for (beat in beats)
		{
			if (beat.text != null)
			{
				var text:BeatTextImpl = cast beat.text;
				text.paint(layout, context, (posX + headerImpl().getLeftSpacing(layout)), posY);
			}
		}
	}

	// Tempo
	private function paintTempo(context:DrawingContext, layout:ViewLayout) :Void
	{
		if (headerImpl().shouldPaintTempo)
		{
			var scale:Float = 5.0 * layout.scale;
			var x:Int = (posX + headerImpl().getLeftSpacing(layout));
			var y:Int = posY;
			var lineSpacing:Int = Math.floor(Math.max(layout.scoreLineSpacing, layout.stringSpacing));

			y += (ts.get(TrackSpacingPositions.ScoreMiddleLines) - lineSpacing);

			var imgX:Int = x;
			var imgY:Int = cast (y - (Math.round(scale * 3.5) + 2));

			TempoPainter.paintTempo(context, imgX, imgY, scale);

			var value:String = (" = " + tempo().value);
			var fontX:Int = x + Math.floor(Math.round((1.33 * scale)) + 1);
			var fontY:Int = Math.round(y - DrawingResources.defaultFontHeight - (1.0 * layout.scale));
			context.get(DrawingLayers.MainComponents).addString(value, DrawingResources.defaultFont, fontX, fontY);
		}
	}
	
	// TripletFeel
	private function paintTripletFeel(context:DrawingContext, layout:ViewLayout) : Void
	{
		if (headerImpl().shouldPaintTripletFeel)
		{
			var lineSpacing:Int = Math.floor(Math.max(layout.scoreLineSpacing, layout.stringSpacing));
			var scale:Float = (5.0 * layout.scale);
			var x:Int = (posX + headerImpl().getLeftSpacing(layout) + headerImpl().getTempoSpacing(layout));
			var y:Int = posY + ts.get(TrackSpacingPositions.ScoreMiddleLines) - lineSpacing;

			var y1:Int = y - (Math.round((3.5 * scale)));

			// Resetting
			if (tripletFeel() == TripletFeel.None && _previousMeasure != null)
			{
				var previous:Int = _previousMeasure.tripletFeel();
				if (previous == TripletFeel.Eighth)
				{
					TripletFeelPainter.paintTripletFeelNone8(context, x, y1, layout.scale);
				}
				else if (previous == TripletFeel.Sixteenth)
				{
					TripletFeelPainter.paintTripletFeelNone16(context, x, y1, layout.scale);
				}
			}
			// Setting
			else if (tripletFeel() == TripletFeel.Eighth)
			{
				TripletFeelPainter.paintTripletFeel8(context, x, y1, layout.scale);
			}
			else if (tripletFeel() == TripletFeel.Sixteenth)
			{
				TripletFeelPainter.paintTripletFeel16(context, x, y1, layout.scale);
			}
		}
	}
	
	//Divisions
	private function paintDivisions(layout:ViewLayout, context:DrawingContext) : Void
	{
		// Score
		var x1:Int = posX;
		var x2:Int = posX + width;
		var offsetY:Int = 0;
		// Score
		var y1:Int = posY + ts.get(TrackSpacingPositions.ScoreMiddleLines);
		var y2:Int = Math.floor(y1 + (layout.scoreLineSpacing * 4));
		if (layout.isFirstMeasure(this) || isFirstOfLine)
		{
			offsetY = (posY + ts.get(TrackSpacingPositions.Tablature)) - y2;
		}
		paintDivisions2(layout, context, x1, y1, x2, y2, offsetY, true);
		// Tablature
		y1 = posY + ts.get(TrackSpacingPositions.Tablature);
		y2 = Math.floor(y1 + ((track.strings.length - 1) * layout.stringSpacing));
		offsetY = 0;
		paintDivisions2(layout, context, x1, y1, x2, y2, offsetY, false);
	}

	private function paintDivisions2(layout:ViewLayout, context:DrawingContext, x1:Int, y1:Int, x2:Int, y2:Int, offsetY:Int, addInfo:Bool) : Void
	{
		var scale:Float = layout.scale;
		var lineWidthSmall:Float = 1;
		var lineWidthBig:Int = Math.floor(Math.max(lineWidthSmall, Math.round(3.0 * scale)));
		var fill:DrawingLayer = context.get(DrawingLayers.MainComponents);
		var draw:DrawingLayer = context.get(DrawingLayers.MainComponentsDraw);
		// Numbers
		if (addInfo) 
		{
			var number:String = Std.string(number());
			context.get(DrawingLayers.Red).addString(number, DrawingResources.defaultFont, (posX + Math.round(scale)),
				(y1 - DrawingResources.defaultFontHeight - Math.round(scale)));
		}

		// RepeatEndings
		if (isRepeatOpen() || layout.isFirstMeasure(this))
		{
			fill.addRect(x1,y1,lineWidthBig, (y2 + offsetY) - y1);

			draw.startFigure();
			draw.moveTo(
				Math.floor(x1 + lineWidthBig + scale + lineWidthSmall),
				y1);
			draw.lineTo(
				Math.floor(x1 + lineWidthBig + scale + lineWidthSmall),
				y2 + offsetY);

			if (isRepeatOpen())
			{
				var size:Int = Math.round(Math.max(1, (4.0 * scale)));
				var xMove:Float = ((lineWidthBig + scale + lineWidthSmall) + (2.0 * scale));
				var yMove:Float = ((lineWidthBig + scale + lineWidthSmall) + (2.0 * scale));

				fill.addCircle(
					Math.floor(x1 + xMove),
					Math.floor(y1 + ((y2 - y1) / 2) - (yMove + (size / 2))),
					size);
				fill.addCircle(
					Math.floor(x1 + xMove),
					Math.floor(y1 + ((y2 - y1) / 2) + (yMove - (size / 2))),
					size);
			}
		}
		else
		{
			draw.startFigure();
			draw.moveTo(x1, y1);
			draw.lineTo(x1, y2 + offsetY);
		}

		if (repeatClose() > 0 || layout.isLastMeasure(this))
		{
			draw.startFigure();
			draw.moveTo(Math.floor(x2 + spacing - (lineWidthBig + scale + lineWidthSmall)), y1);
			draw.lineTo(Math.floor((x2 + spacing) - (lineWidthBig + scale + lineWidthSmall)), y2);

			fill.addRect((x2 + spacing) - lineWidthBig, y1,
			             lineWidthBig, y2 - y1);

			if (repeatClose() > 0)
			{
				var size:Int = Math.round(Math.max(1, (4 * scale)));
				var xMove:Float = (((lineWidthBig + scale + lineWidthSmall) + (2.0 * scale)) + size);
				var yMove:Float = ((lineWidthBig + scale + lineWidthSmall) + (2.0 * scale));

				fill.addCircle(Math.round((x2 - xMove) + spacing),
					Math.round(y1 + ((y2 - y1) / 2) - (yMove + (size / 2))), size);

				fill.addCircle(
					Math.round((x2 - xMove) + spacing),
					Math.round(y1 + ((y2 - y1) / 2) + (yMove - (size / 2))), size);

				if (addInfo)
				{
					var repetitions:String = ("x" + (repeatClose() + 1));
                    var numberSize = context.graphics.measureText(repetitions);
					fill.addString(repetitions, DrawingResources.defaultFont, (x2 - numberSize + spacing - size),
					((y1 - DrawingResources.defaultFontHeight) - Math.round(scale)));
				}
			}
		}
		else
		{
			draw.startFigure();
			draw.moveTo(x2 + spacing, y1);
			draw.lineTo(x2 + spacing, y2);
		}
	}
	
	// RepeatEnding
	public function paintRepeatEnding(layout:ViewLayout, context:DrawingContext) : Void
	{
		if (header.repeatAlternative > 0)
		{
			var scale:Float = layout.scale;
			var x1:Float = (posX + headerImpl().getLeftSpacing(layout) + getFirstNoteSpacing(layout));
			var x2:Float = (posX + width + spacing);
			var y1:Float = (posY + ts.get(TrackSpacingPositions.RepeatEnding));
			var y2:Float = (y1 + (layout.repeatEndingSpacing * 0.75));
			var sText:String = "";
			for (i in 0 ... 8)
			{
				if ((header.repeatAlternative & (1 << i)) != 0)
				{
					sText += (sText.length > 0) ? ", " + (i + 1) : Std.string(i + 1);
				}
			}
			var layer:DrawingLayer  = context.get(DrawingLayers.MainComponentsDraw);
			layer.startFigure();
			layer.moveTo(cast x1, cast y2);
			layer.lineTo(cast x1, cast y1);
			layer.lineTo(cast x2, cast y1);
			context.get(DrawingLayers.MainComponents).addString(sText, DrawingResources.defaultFont,
				Math.round(x1 + (5.0 * scale)), Math.round(y1 + DrawingResources.defaultFontHeight));
		}
	}
	
	public function getBeatSpacing(beat:Beat) : Int
	{
		return cast ((beat.start - start()) * spacing / length());
	}
	
	public function getFirstNoteSpacing(layout:ViewLayout) : Int
	{
		return headerImpl().getFirstNoteSpacing(layout, this);
	}

	public function getClefSpacing(layout:ViewLayout) : Int
	{
		return headerImpl().getClefSpacing(layout, this);
	}

	public function getKeySignatureSpacing(layout:ViewLayout) : Int
	{
		return headerImpl().getKeySignatureSpacing(layout, this);
	}
}