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
import alphatab.model.Measure;
import alphatab.model.MeasureHeader;
import alphatab.model.SongFactory;

/**
 * This measure header implements layouting functionalities for later drawing on staves.
 */
class MeasureHeaderDrawing extends MeasureHeader
{

	public function new(factory:SongFactory)
	{
        super(factory);
    }
    
    public function shouldPaintKeySignature(measure:MeasureDrawing) : Bool
    {
        // don't draw keysignature on percusson tracks and only if a change 
        // was made
        
        if (measure.getPreviousMeasure() == null && keySignature == 0) // don't draw default keysignature
        {
            return false;
        }
        else if (measure.track.isPercussionTrack) // don't draw on percussion tracks
        {
            return false;
        }
        else if (measure.getPreviousMeasure() != null && measure.getPreviousMeasure().header.keySignature == keySignature &&
                    measure.getPreviousMeasure().header.keySignatureType == keySignatureType) // don't draw if no change was made
        {
            return false;
        }
        
        return true;
    }
    
    public function shouldPaintTimeSignature(measure:MeasureDrawing) : Bool
    {
        // do we have a new timesignature?
        var previous = measure.getPreviousMeasure();
        return (previous == null || previous.header.timeSignature.numerator != timeSignature.numerator ||
                    previous.header.timeSignature.denominator.value != timeSignature.denominator.value);
    }
    
}