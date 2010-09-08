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
package net.alphatab.tablature.drawing;

/**
 * Converts a drawing layer identifier into it's associated index.
 */
class DrawingLayersConverter
{
	public static function toInt(layer:DrawingLayers) : Int
	{
		switch(layer)
		{
			case DrawingLayers.Background: return 0;
			case DrawingLayers.LayoutBackground:return  1;
			case DrawingLayers.Lines: return 2;
			case DrawingLayers.MainComponents: return 3;
			case DrawingLayers.MainComponentsDraw:return  4;
			case DrawingLayers.Voice2:return  5;
			case DrawingLayers.VoiceEffects2:return  6;
			case DrawingLayers.VoiceEffectsDraw2:return  7;
			case DrawingLayers.VoiceDraw2:return  8;
			case DrawingLayers.Voice1:return  9;
			case DrawingLayers.VoiceEffects1:return  10;
			case DrawingLayers.VoiceEffectsDraw1:return  11;
			case DrawingLayers.VoiceDraw1:return  12;
			case DrawingLayers.Red:return  13;
			default:return  0;
		}
	}
}