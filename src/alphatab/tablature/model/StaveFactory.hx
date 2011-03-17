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
import alphatab.tablature.ViewLayout;

/**
 * This factory provides staves according to their key
 */
class StaveFactory
{
    public static function getStave(id:String, line:StaveLine, layout:ViewLayout) : Stave
    {
        switch(id)
        {
            case ScoreStave.STAVE_ID:
                return new ScoreStave(line, layout);
            case TablatureStave.STAVE_ID:
                return new TablatureStave(line, layout);
        }
        return null;
    }
    
}