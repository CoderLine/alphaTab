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
import alphatab.model.MeasureHeader;
import alphatab.model.SongFactory;
import alphatab.model.Track;
import alphatab.model.TripletFeel;
import alphatab.tablature.ViewLayout;

/**
 * This measureheader implementation extends the default measureherader with drawing and layouting features. 
 */
class MeasureHeaderImpl extends MeasureHeader
{
	private static inline var DEFAULT_TIME_SIGNATURE_SPACING:Int = 30;
	private static inline var DEFAULT_LEFT_SPACING:Int = 15;
	private static inline var DEFAULT_RIGHT_SPACING:Int = 15;

	private var _maxClefSpacing:Int;
	private var _maxKeySignatureSpacing:Int;
	
	public var shouldPaintTempo:Bool;
	public var shouldPaintTripletFeel:Bool;
	public var shouldPaintTimeSignature:Bool;
	public var shouldPaintKeySignature:Bool;

	public var maxQuarterSpacing:Int;
	public var maxWidth:Int;
	
	public function new(factory:SongFactory) 
	{
		super(factory);
	}
	
	public function reset() : Void
	{
		maxWidth = 0;
		maxQuarterSpacing = 0;

		shouldPaintTempo = false;
		shouldPaintTimeSignature = false;
		shouldPaintKeySignature = false;
		shouldPaintTripletFeel = false;
		_maxClefSpacing = 0;
		_maxKeySignatureSpacing = 0;
	}

	public function update(layout:ViewLayout, track:TrackImpl) : Void
	{
		reset();
		calculateMeasureChanges(layout);

		var measure:MeasureImpl = cast track.measures[number - 1];
		measure.calculateMeasureChanges(layout);
	}

	public function calculateMeasureChanges(layout:ViewLayout) : Void
	{
		var previous:MeasureHeader = layout.songManager().getPreviousMeasureHeader(this);
		if (previous == null)
		{
			shouldPaintTempo = true;
			shouldPaintTripletFeel = tripletFeel != TripletFeel.None;
			shouldPaintTimeSignature = true;
			shouldPaintKeySignature = true;
		}
		else
		{
			//Tempo
			if (tempo.value != previous.tempo.value)
			{
				shouldPaintTempo = true;
			}
			//Triplet Feel
			if (tripletFeel != previous.tripletFeel)
			{
				shouldPaintTripletFeel = true;
			}
			//Time Signature
			if (timeSignature.numerator != previous.timeSignature.numerator
				|| timeSignature.denominator.value != previous.timeSignature.denominator.value)
			{
				shouldPaintTimeSignature = true;
			}
			//Key Signature
			if (keySignature != previous.keySignature || keySignatureType != previous.keySignatureType)
			{
				shouldPaintKeySignature = true;
                notifyKeySignatureSpacing(calculateKeySignatureSpacing(cast previous, layout));
			}
		}
	}

    private function calculateKeySignatureSpacing(previous:MeasureHeaderImpl, layout:ViewLayout) : Int
	{
		var spacing:Int = 0;
        if (keySignature <= 7)
        {
            spacing += Math.round((6 * layout.scale) * keySignature);
        }
        else
        {
            spacing += Math.round((6 * layout.scale) * (keySignature - 7));
        }
        
        if (previous != null)
        {
            if (previous.keySignature <= 7)
            {
                spacing += Math.round((6 * layout.scale) * previous.keySignature);
            }
            else
            {
                spacing += Math.round((6 * layout.scale) * (previous.keySignature - 7));
            }
        }
		return spacing;
	}


	public function notifyQuarterSpacing(spacing:Int) : Void
	{
		maxQuarterSpacing = ((spacing > maxQuarterSpacing) ? spacing : maxQuarterSpacing);
	}

	public function getClefSpacing(layout:ViewLayout, measure:MeasureImpl):Int
	{
		return (!measure.isPaintClef) ? 0 : _maxClefSpacing;
	}

	public function getKeySignatureSpacing(layout:ViewLayout, measure:MeasureImpl):Int
	{
		return (!shouldPaintKeySignature || measure.track.isPercussionTrack) ? 0 : _maxKeySignatureSpacing;
	}

	public function getTempoSpacing(layout:ViewLayout):Int
	{
		return (shouldPaintTempo && number == 1 ? Math.round(45 * layout.scale) : 0);
	}

	public function getTripletFeelSpacing(layout:ViewLayout):Int
	{
		return (shouldPaintTripletFeel ? Math.round(55 * layout.scale) : 0);
	}

	public function getTimeSignatureSpacing(layout:ViewLayout):Int
	{
		return (shouldPaintTimeSignature ? Math.round(DEFAULT_TIME_SIGNATURE_SPACING * layout.scale) : 0);
	}

	public function getLeftSpacing(layout:ViewLayout):Int
	{
		return Math.round(DEFAULT_LEFT_SPACING * layout.scale);
	}

	public function getRightSpacing(layout:ViewLayout):Int
	{
		return Math.round(DEFAULT_RIGHT_SPACING * layout.scale);
	}

	public function getFirstNoteSpacing(layout:ViewLayout, measure:MeasureImpl) :Int
	{
		var iTopSpacing:Int = getTempoSpacing(layout) + getTripletFeelSpacing(layout);
		var iMiddleSpacing:Int = getClefSpacing(layout, measure) + getKeySignatureSpacing(layout, measure) + getTimeSignatureSpacing(layout);

		return Math.round(Math.max(iTopSpacing, iMiddleSpacing) + (10 * layout.scale));
	}

	public function notifyClefSpacing(spacing:Int):Void
	{
		_maxClefSpacing = ((spacing > _maxClefSpacing) ? spacing : _maxClefSpacing);
	}

	public function notifyKeySignatureSpacing(spacing:Int):Void
	{
		_maxKeySignatureSpacing = ((spacing > _maxKeySignatureSpacing) ? spacing : _maxKeySignatureSpacing);
	}

	public function notifyWidth(width:Int):Void
	{
		maxWidth = ((width > maxWidth) ? width : maxWidth);
	} 

}