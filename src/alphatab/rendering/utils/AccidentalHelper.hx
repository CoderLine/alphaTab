package alphatab.rendering.utils;
import alphatab.model.AccidentalType;
import alphatab.model.Note;
import haxe.ds.IntMap;

/**
 * This small utilty class allows the assignment of accidentals within a 
 * desired scope. 
 */
class AccidentalHelper 
{
    /**
     * stores which notes in an octave get an accidental in the case of different key signatures. 
     * it's the easiest way to store them as an array like that, than calculate all the stuff. 
     * ( or at least I am missing some knowledge )
     */
    private static var AccidentalNotes : Array< Array<AccidentalType> > = 
    [
        // Flats
        [Natural, None, Natural, None, Natural, Natural, None, Natural, None, Natural, None, Natural ], // 7 Flats
        [Natural, None, Natural, None, Natural, None, None, Natural, None, Natural, None, Natural], // 6 Flats
        [None, None, Natural, None, Natural, None, None, Natural, None, Natural, None, Natural], // 5 Flats
        [None, None, Natural, None, Natural, None, Flat, Natural, None, Natural, None, Natural], // 4 Flats
        [None, Flat, Natural, None, Natural, None, Flat, Natural, None, Natural, None, Natural], // 3 Flats
        [None, Flat, Natural, None, Natural, None, Flat, Natural, Flat, Natural, None, Natural],  // 2 Flats
        [None, Flat, Natural, Flat, Natural, None, Flat, Natural, Flat, Natural, None, Natural],  // 1 Flat
        // Natural
        [None, Sharp, None, Sharp, None, None, Sharp, None, Sharp, None, Sharp, None],  
        // Sharps
        [None, Sharp, None, Sharp, None, Natural, Sharp, None, Sharp, None, Sharp, None],  // 1 Sharp
        [Natural, Sharp, None, Sharp, None, Natural, Sharp, None, Sharp, None, Sharp, None],  // 2 Sharps
        [Natural, Sharp, None, Sharp, None, Natural, Sharp, Natural, Sharp, None, Sharp, None],  // 3 Sharps
        [Natural, Sharp, Natural, Sharp, None, Natural, Sharp, Natural, Sharp, None, Sharp, None],  // 4 Sharps
        [Natural, Sharp, Natural, Sharp, None, Natural, Sharp, Natural, Sharp, Natural, Sharp, None],  // 5 Sharps
        [Natural, Sharp, Natural, Sharp, Natural, Natural, Sharp, Natural, Sharp, Natural, Sharp, None],  // 6 Sharps
        [Natural, Sharp, Natural, Sharp, Natural, Natural, Sharp, Natural, Sharp, Natural, Sharp, Natural],  // 7 Sharps
    ];

    /**
     * this int-hash stores the registered accidentals for
     * all octaves and notes within an octave. 
     */
    private var _registeredAccidentals:IntMap<AccidentalType>;
                                                       
    public function new() 
    {
        _registeredAccidentals = new IntMap<AccidentalType>();
    }
    
    /**
     * Calculates the accidental for the given note and assignes the value to it. 
     * The new accidental type is also registered within the current scope
     */
    public function applyAccidental(note:Note, noteLine:Int) : AccidentalType
    {
        // TODO: we need to check for note.swapAccidentals 
        var noteValue = note.realValue();
        var ks = note.beat.voice.bar.getMasterBar().keySignature;
        var ksi = getKeySignatureIndex(ks);
        var index = (noteValue % 12);
        var octave = Std.int(noteValue / 12);
        
        var accidentalToSet:AccidentalType = AccidentalNotes[ksi][index];
        
        // if there is already an accidental registered, we check if we 
        // have a new accidental
        var updateAccidental = true;
        if (_registeredAccidentals.exists(noteLine))
        {
            var registeredAccidental = _registeredAccidentals.get(noteLine);
            
            // we only need to do anything if we are changing the accidental
            if (registeredAccidental == accidentalToSet)
            {
                 // we set the accidental to none, as the accidental is already set by a previous note
                accidentalToSet = AccidentalType.None;
                updateAccidental = false;
            }
            // check if we need naturalizing
            else if (accidentalToSet == None)
            {
                accidentalToSet = AccidentalType.Natural;
            }
        }
        
        if (updateAccidental)
        {
            if ((accidentalToSet == None || accidentalToSet == Natural))
            {
                _registeredAccidentals.remove(noteLine);
            }
            else
            {
                _registeredAccidentals.set(noteLine, accidentalToSet); 
            }
        }
        
        return accidentalToSet;
    }
    
    private inline function getKeySignatureIndex(ks:Int)
    {
        return (ks + 7);
    }
}