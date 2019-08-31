package system;

import system.reflection.PropertyInfo;

abstract CsType(Class<Dynamic>) from Class<Dynamic> to Class<Dynamic>
{
	public function new(cls : Class<Dynamic>) this = cls;
	
	public var name(get,never):CsString;
	public function get_name() : CsString 
	{
		var fullName = Type.getClassName(this);
		var i = fullName.lastIndexOf(".");
		return i >= 0 ? fullName.substring(i + 1) : fullName;
	}
    
    public var isArray(get, never):system.Boolean;
    public function get_isArray() : system.Boolean
    {    
        return false;
    }
    
    public var isClass(get, never):system.Boolean;
    public function get_isClass() : system.Boolean
    {
        // TODO: implement me
        return false;
    }
    
    public var isEnum(get, never):system.Boolean;
    public function get_isEnum() : system.Boolean
    {
        // TODO: implement me
        return false;
    }
    
    public function getProperties() : system.FixedArray<PropertyInfo>
    {        
        var rtti = haxe.rtti.Rtti.getRtti(this);
        var properties = new Array<PropertyInfo>();
        for(f in rtti.fields)
        {
            switch(f.type)
            {
                case CEnum(name, params):
                    properties.push(PropertyInfo.fromClassField(f));
                case CClass(name, params):
                    properties.push(PropertyInfo.fromClassField(f));
                case CTypedef(name, params):
                    properties.push(PropertyInfo.fromClassField(f));
                case CAbstract(name, params):
                    properties.push(PropertyInfo.fromClassField(f));
                default:
                    // no property/field                
            }
        }
        return properties;
    }
	
	@:op(A == B) public inline static function eq(lhs : CsType, rhs : CsType) : system.Boolean return Type.getClassName(lhs) == Type.getClassName(rhs);
	
    @:op(A != B) public inline static function neq(lhs : CsType, rhs : CsType) : system.Boolean return Type.getClassName(lhs) != Type.getClassName(rhs);

}