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
package alphatab.model.effects;

import alphatab.model.Duration;
import alphatab.model.Velocities;
import alphatab.model.SongFactory;

/**
 * A grace note effect.
 */
class GraceEffect
{
    /**
     * Whether the grace note is a dead note
     */
    public var isDead(default,default):Bool;
    /**
     * The duration of the note effect
     */
    public var duration(default,default):Int;
    /**
     * The velocity of the note effect
     * @see Velocities
     */
    public var velocity(default,default):Int;
    /**
     * The fret of the grace note
     */
    public var fret(default,default):Int;
    /**
     * Whether the grace note is on played on beat or before
     */
    public var isOnBeat(default,default):Bool;
    /**
     * The Transition between the grace note and the real note
     * @see GraceNoteTransition
     */
    public var transition(default,default):Int;
    
    /**
     * Gets the duration of the effect. 
     */
    public function durationTime() : Int 
    {
        return Math.floor((Duration.QUARTER_TIME / 16.00) * duration);    
    }
    
    /**
     * Initializes a new instance of the GraceEffect class. 
     */
    public function new()
    {
        fret = 0;
        duration = 1;
        velocity = Velocities.DEFAULT;
        transition = GraceEffectTransition.None;
        isOnBeat = false;
        isDead = false;
    }

    /**
     * Creates a clone of the current GraceEffect instance.
     * @param factory the factory for creating new instances
     * @return a duplicate of the current instance
     */
    public function clone(factory : SongFactory) : GraceEffect 
    {
        var effect:GraceEffect = factory.newGraceEffect();
        effect.fret = fret;
        effect.duration = duration;
        effect.velocity= velocity;
        effect.transition = transition;
        effect.isOnBeat = isOnBeat;
        effect.isDead = isDead;
        return effect;
    }
}
