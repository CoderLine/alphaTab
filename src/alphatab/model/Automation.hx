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
 * Automations are used to change the behaviour of a song.
 */
class Automation 
{
    public var isLinear:Bool;
    public var type:AutomationType;
    public var value:Float;
    public var ratioPosition:Float;
    public var text:String;
    
    public function new() 
    {
    }
    
    public static function builtTempoAutomation(isLinear:Bool, ratioPosition:Float, value:Float, reference:Int) : Automation
    {
        if (reference < 1 || reference > 5) reference = 2;

        var references = [1.0, 0.5, 1.0, 1.5, 2.0, 3.0];
        var automation = new Automation();
        automation.type = AutomationType.Tempo;
        automation.isLinear = isLinear;
        automation.ratioPosition = ratioPosition;
        var realValue = value * references[reference];
        automation.value = realValue;
        
        return automation;
    }
    
    public function clone() : Automation
    {
        var a = new Automation();
        a.isLinear = isLinear;
        a.type = type;
        a.value = value;
        return a;
    }
}