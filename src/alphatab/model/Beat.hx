package alphatab.model;

/**
 * A beat is a single block within a bar. A beat is a combination
 * of several notes played at the same time. 
 */
class Beat 
{
    public var previousBeat:Beat;
    public var nextBeat:Beat;
    public var index:Int;
    
    public var voice:Voice;
    public var notes:Array<Note>;
    public var duration:Duration;
    
    public var automations:Array<Automation>;
    
    public function isRest():Bool 
    {
        return notes.length == 0;
    }

    // effects
    public var dots:Int;
    public var fadeIn:Bool;
    public var lyrics:Array<String>;
    public var pop:Bool;
    public var hasRasgueado:Bool;
    public var slap:Bool;
    public var text:String;
    
    public var brushType:BrushType;
    public var brushDuration:Int;
    
    public var tupletDenominator:Int;
    public var tupletNumerator:Int;
    
    public var whammyBarPoints:Array<BendPoint>;
    public inline function hasWhammyBar():Bool { return whammyBarPoints.length > 0; }
    
    public var vibrato:VibratoType;
    public var chord:Chord;
    public inline function hasChord():Bool { return chord != null; }
    public var graceType:GraceType;
    public var pickStroke:PickStrokeType;
    
    public inline function isTremolo():Bool { return tremoloSpeed >= 0; }
    public var tremoloSpeed:Int;
    
    public function new() 
    {
        whammyBarPoints = new Array<BendPoint>();
        notes = new Array<Note>();
        brushType = BrushType.None;
        vibrato = VibratoType.None;
        graceType = GraceType.None;
        pickStroke = PickStrokeType.None;
        duration = Duration.Quarter;
        tremoloSpeed = -1;
        automations = new Array<Automation>();
    }
    
    public function addNote(note:Note) : Void
    {
        note.beat = this;
        notes.push(note);
    }
    
    public function getAutomation(type:AutomationType) : Automation
    {
        for (a in automations)
        {
            if (a.type == type)
            {
                return a;
            }
        }
        return null;
    }
    
    public function getNoteOnString(string:Int) : Note
    {
        for (n in notes)
        {
            if (n.string == string)
            {
                return n;
            }
        }
        return null;
    }
}