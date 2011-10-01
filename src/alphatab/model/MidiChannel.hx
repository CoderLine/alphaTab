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
package alphatab.model;

/**
 * A midi channel describes playing data for a track
 */
class MidiChannel
{
    public static inline var DEFAULT_PERCUSSION_CHANNEL:Int = 9;
    public static inline var DEFAULT_INSTRUMENT:Int = 25;
    public static inline var DEFAULT_VOLUME:Int = 127;
    public static inline var DEFAULT_BALANCE:Int = 64;
    public static inline var DEFAULT_CHORUS:Int = 0;
    public static inline var DEFAULT_REVERB:Int = 0;
    public static inline var DEFAULT_PHASER:Int = 0;
    public static inline var DEFAULT_TREMOLO:Int = 0;
    
    public var channel:Int;
    public var effectChannel:Int;
    
    public var volume:Int;
    public var balance:Int;
    public var chorus:Int;
    public var reverb:Int;
    public var phaser:Int;
    public var tremolo:Int;
    
    private var _instrument:Int;
    
    public function instrument(newInstrument:Int = -1) : Int
    {
        if(newInstrument != -1)
            this._instrument = newInstrument;
        return isPercussionChannel() ? 0 : _instrument;
    }
    
    public function isPercussionChannel() : Bool
    {
        return channel == DEFAULT_PERCUSSION_CHANNEL;
    }
    
    public function new()
    {
        channel = 0;
        effectChannel = 0;
        instrument(DEFAULT_INSTRUMENT);
        volume = DEFAULT_VOLUME;
        balance = DEFAULT_BALANCE;
        chorus = DEFAULT_CHORUS;
        reverb = DEFAULT_REVERB;
        phaser = DEFAULT_PHASER;
        tremolo = DEFAULT_TREMOLO;
    }

    public function copy(channel:MidiChannel) : Void
    {
        channel.channel = this.channel;
        channel.effectChannel = effectChannel;
        channel.instrument(instrument());
        channel.volume = volume;
        channel.balance = balance;
        channel.chorus = chorus;
        channel.reverb = reverb;
        channel.phaser = phaser;
        channel.tremolo = tremolo;
    }
}