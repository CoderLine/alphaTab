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
 * This class represents a predefined string tuning.
 */
class Tuning 
{
    public static var TUNING_REGEX = ~/([a-g]b?)([0-9])/i;

    private static var _sevenStrings:Array<Tuning>;
    private static var _sixStrings:Array<Tuning>;
    private static var _fiveStrings:Array<Tuning>;
    private static var _fourStrings:Array<Tuning>;
    
    /**
     * Checks if the given string is a tuning inticator.
     * @param name
     * @return
     */
    public static function isTuning(name:String) : Bool
    {
        var regex:EReg = TUNING_REGEX;
        return regex.match(name);
    }
    
    public static function getTextForTuning(tuning:Int, includeOctave:Bool)
    {
        var octave = Math.floor(tuning/12);
        var note = tuning % 12;
        var notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        var result = notes[note];
        if (includeOctave)
        {
            result += Std.string(octave);
        }
        
        return result;
    }
    
    
    public static function getTuningForText(str:String)
    {
        var base = 0;
        var regex:EReg = TUNING_REGEX;
        if (regex.match(str.toLowerCase()))
        {
            var note = regex.matched(1);
            var octave = Std.parseInt(regex.matched(2));
            if (note == "c") 
            {
                base = 0;
            }
            else if (note == "db")
            {
                base = 1;
            }
            else if (note == "d")
            {
                base = 2;
            }
            else if (note == "eb")
            {
                base = 3;
            }
            else if (note == "e") 
            {
                base = 4;
            }
            else if (note == "f")
            {
                base = 5;
            }
            else if (note == "gb") 
            {
                base = 6;
            }
            else if (note == "g")
            {
                base = 7;
            }
            else if (note == "ab")
            {
                base = 8;
            }
            else if (note == "a") 
            {
                base = 9;
            }
            else if (note == "bb")
            {
                base = 10;
            }
            else if (note == "b") 
            {
                base = 11;
            }
            else
            {
                return 0;
            }
            
            // add octaves
            base += (octave * 12);
            
        }
        else
        {
            return -1;
        }
        return base;
    }
    
    public static function getPresetsFor(strings:Int) : Array<Tuning>
    {
        if(_sevenStrings == null) 
        {
            initialize();
        }
        
        if(strings == 7) 
        {
            return _sevenStrings;
        }
        if(strings == 6) 
        {
            return _sixStrings;
        }
        if(strings == 5) 
        {
            return _fiveStrings;
        }
        if(strings == 4) 
        {
            return _fourStrings;
        }
        return new Array<Tuning>();
    }
    
    private static function initialize()
    {
        _sevenStrings = new Array<Tuning>();
        _sixStrings = new Array<Tuning>();
        _fiveStrings = new Array<Tuning>();
        _fourStrings = new Array<Tuning>();
        
        _sevenStrings.push(new Tuning("Guitar 7 strings", [64,59,55,50,45,40,35], true));

        _sixStrings.push(new Tuning("Guitar Standard Tuning", [64,59,55,50,45,40], true));
        
        _sixStrings.push(new Tuning("Guitar Tune down ½ step", [63,58,54,49,44,39], false));
        _sixStrings.push(new Tuning("Guitar Tune down 1 step", [62,57,53,48,43,38], false));
        _sixStrings.push(new Tuning("Guitar Tune down 2 step", [60,55,51,46,41,36], false));
        _sixStrings.push(new Tuning("Guitar Dropped D Tuning", [64,59,55,50,45,38], false));
        _sixStrings.push(new Tuning("Guitar Dropped D Tuning variant", [64,57,55,50,45,38], false));
        _sixStrings.push(new Tuning("Guitar Double Dropped D Tuning", [62,59,55,50,45,38], false));
        _sixStrings.push(new Tuning("Guitar Dropped E Tuning", [66,61,57,52,47,40], false));
        _sixStrings.push(new Tuning("Guitar Dropped C Tuning", [62,57,53,48,43,36], false));
        
        _sixStrings.push(new Tuning("Guitar Open C Tuning", [64,60,55,48,43,36], false));
        _sixStrings.push(new Tuning("Guitar Open Cm Tuning", [63,60,55,48,43,36], false));
        _sixStrings.push(new Tuning("Guitar Open C6 Tuning", [64,57,55,48,43,36], false));
        _sixStrings.push(new Tuning("Guitar Open Cmaj7 Tuning", [64,59,55,52,43,36], false));
        _sixStrings.push(new Tuning("Guitar Open D Tuning", [62,57,54,50,45,38], false));
        _sixStrings.push(new Tuning("Guitar Open Dm Tuning", [62,57,53,50,45,38], false));
        _sixStrings.push(new Tuning("Guitar Open D5 Tuning", [62,57,50,50,45,38], false));
        _sixStrings.push(new Tuning("Guitar Open D6 Tuning", [62,59,54,50,45,38], false));
        _sixStrings.push(new Tuning("Guitar Open Dsus4 Tuning", [62,57,55,50,45,38], false));
        _sixStrings.push(new Tuning("Guitar Open E Tuning", [64,59,56,52,47,40], false));
        _sixStrings.push(new Tuning("Guitar Open Em Tuning", [64,59,55,52,47,40], false));
        _sixStrings.push(new Tuning("Guitar Open Esus11 Tuning", [64,59,55,52,45,40], false));
        _sixStrings.push(new Tuning("Guitar Open F Tuning", [65,60,53,48,45,41], false));
        _sixStrings.push(new Tuning("Guitar Open G Tuning", [62,59,55,50,43,38], false));
        _sixStrings.push(new Tuning("Guitar Open Gm Tuning", [62,58,55,50,43,38], false));
        _sixStrings.push(new Tuning("Guitar Open G6 Tuning", [64,59,55,50,43,38], false));
        _sixStrings.push(new Tuning("Guitar Open Gsus4 Tuning", [62,60,55,50,43,38], false));
        _sixStrings.push(new Tuning("Guitar Open A Tuning", [64,61,57,52,45,40], false));
        _sixStrings.push(new Tuning("Guitar Open Am Tuning", [64,60,57,52,45,40], false));
        _sixStrings.push(new Tuning("Guitar Nashville Tuning", [64,59,67,62,57,52], false));
        _sixStrings.push(new Tuning("Bass 6 Strings Tuning", [48,43,38,33,28,23], false));
        _sixStrings.push(new Tuning("Lute or Vihuela Tuning", [64,59,54,50,45,40], false));
        
        _fiveStrings.push(new Tuning("Bass 5 Strings Tuning", [43,38,33,28,23], true));
        _fiveStrings.push(new Tuning("Banjo Dropped C Tuning", [62,59,55,48,67], false));
        _fiveStrings.push(new Tuning("Banjo Open D Tuning", [62,57,54,50,69], false));
        _fiveStrings.push(new Tuning("Banjo Open G Tuning", [62,59,55,50,67], false));
        _fiveStrings.push(new Tuning("Banjo G Minor Tuning", [62,58,55,50,67], false));
        _fiveStrings.push(new Tuning("Banjo G Modal Tuning", [62,57,55,50,67], false));
        
        _fourStrings.push(new Tuning("Bass Standard Tuning", [43,38,33,28], true));
        _fourStrings.push(new Tuning("Bass Tune down ½ step", [42,37,32,27], false));
        _fourStrings.push(new Tuning("Bass Tune down 1 step", [41,36,31,26], false));
        _fourStrings.push(new Tuning("Bass Tune down 2 step", [39,34,29,24], false));
        _fourStrings.push(new Tuning("Bass Dropped D Tuning", [43,38,33,26], false));
        _fourStrings.push(new Tuning("Ukulele C Tuning", [45,40,36,43], false));
        _fourStrings.push(new Tuning("Ukulele G Tuning", [52,47,43,38], false));
        _fourStrings.push(new Tuning("Mandolin Standard Tuning", [64,57,50,43], false));
        _fourStrings.push(new Tuning("Mandolin or Violin Tuning", [76,69,62,55], false));
        _fourStrings.push(new Tuning("Viola Tuning", [69,62,55,48], false));
        _fourStrings.push(new Tuning("Cello Tuning", [57,50,43,36], false));
    }
    
    public static function findTuning(strings:Array<GuitarString>) : Tuning
    {
        var tunings:Array<Tuning> = getPresetsFor(strings.length);
        for(tuning in tunings)
        {
            var equals:Bool = true;
            for(i in 0 ... strings.length)
            {
                if(strings[i].value != tuning.tuning[i]) 
                {
                    equals = false;
                    break;
                }
            }
            
            if(equals) 
            {
                return tuning;
            }
        }
        
        return null;
    }
    
    
    public var isStandard(default,default):Bool;
    public var name(default,default):String;
    public var tuning(default,default):Array<Int>;
    
    public function new(name:String, tuning:Array<Int>, isStandard:Bool) 
    {
        this.name = name;
        this.tuning = tuning;
        this.isStandard = isStandard;
    }
}