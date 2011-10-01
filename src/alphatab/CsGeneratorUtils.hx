package alphatab;

class CsGeneratorUtils {
    public static function getClass( c : Dynamic ) : Class<Dynamic> {
        return Type.getClass(c);        
    }
    public static function getClassName( c : Dynamic ) : String {
        return Type.getClassName(Type.getClass(c));        
    }
}
