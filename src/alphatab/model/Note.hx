package alphatab.model;

/**
 * ...
 */
class Note 
{
    public var accentuated:AccentuationType;
    public var bendPoints:Array<BendPoint>;
    public inline function hasBend():Bool { return bendPoints.length > 0; }
    public var fret:Int;
    public var isGhost:Bool;
    public var string:Int;
    public var isHammerPullDestination:Bool;
    public var isHammerPullOrigin:Bool;
    public var harmonicValue:Float;
    public var harmonicType:HarmonicType;
    public var isLetRing:Bool;
    public var isPalmMute:Bool;
    public var isDead:Bool;
    public var slideType:SlideType;
    public var vibrato:VibratoType;
    public var isStaccato:Bool;
    public var tapping:Bool;
    public var isTieOrigin:Bool;
    public var isTieDestination:Bool;
    
    public var leftHandFinger:Int;
    public var rightHandFinger:Int;
    public var isFingering:Bool;
    
    
    public var trillFret:Int;
    public inline function isTrill():Bool { return trillFret >= 0; }
    public var trillSpeed:Int;
    public var durationPercent:Float;
    
    public var beat:Beat;
    public var dynamicValue:DynamicValue;

    public function new() 
    {
        bendPoints = new Array<BendPoint>();
        trillFret = -1;
        dynamicValue = DynamicValue.F;
        
        accentuated = AccentuationType.None;
        fret = -1;
        isGhost = false;
        string = 0;
        isHammerPullDestination = false;
        isHammerPullOrigin = false;
        harmonicValue = 0;
        harmonicType = HarmonicType.None;
        isLetRing = false;
        isPalmMute = false;
        isDead = false;
        slideType = SlideType.None;
        vibrato = VibratoType.None;
        isStaccato = false;
        tapping = false;
        isTieOrigin = false;
        isTieDestination = false;
        
        leftHandFinger = -1;
        rightHandFinger = -1;
        isFingering = false;
        
        trillFret = -1;
        trillSpeed = 0;
        durationPercent = 1;
    }
}