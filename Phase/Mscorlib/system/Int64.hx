package system;	

// TODO: actual 64bit support
abstract Int64(Int) from Int
{
	public inline function new(i:Int) this = i;
	
	public inline function toHaxeInt(): Int return this;	
	public inline function toString() : system.CsString return Std.string(this);
	
	@:from public static inline function fromByte(c:Byte) : Int64 return new Int64(c.toHaxeInt());
	@:from public static inline function fromInt16(c:Int16) : Int64 return new Int64(c.toHaxeInt());
	@:from public static inline function fromInt32(c:Int32) : Int64 return new Int64(c.toHaxeInt());
	
	public inline function toBoolean_IFormatProvider(provider:IFormatProvider) : system.Boolean return system.Convert.toBoolean_Int64(this);
	public inline function toChar_IFormatProvider(provider:IFormatProvider) : system.Char return system.Convert.toChar_Int64(this);
	public inline function toSByte_IFormatProvider(provider:IFormatProvider) : system.SByte return system.Convert.toSByte_Int64(this);
	public inline function toByte_IFormatProvider(provider:IFormatProvider) : system.Byte return system.Convert.toByte_Int64(this);
	public inline function toInt16_IFormatProvider(provider:IFormatProvider) : system.Int16 return system.Convert.toInt16_Int64(this);
	public inline function toUInt16_IFormatProvider(provider:IFormatProvider) : system.UInt16 return system.Convert.toUInt16_Int64(this);
	public inline function toInt32_IFormatProvider(provider:IFormatProvider) : system.Int32 return system.Convert.toInt32_Int64(this);
	public inline function toUInt32_IFormatProvider(provider:IFormatProvider) : system.UInt32 return system.Convert.toUInt32_Int64(this);
	public inline function toInt64_IFormatProvider(provider:IFormatProvider) : system.Int64 return system.Convert.toInt64_Int64(this);
	public inline function toUInt64_IFormatProvider(provider:IFormatProvider) : system.UInt64 return system.Convert.toUInt64_Int64(this);
	public inline function toSingle_IFormatProvider(provider:IFormatProvider) : system.Single return system.Convert.toSingle_Int64(this);
	public inline function toDouble_IFormatProvider(provider:IFormatProvider) : system.Double return system.Convert.toDouble_Int64(this);
	
	public inline function getHashCode() : system.Int32 return this;
	
	@:op(-A) public inline function neg() : system.Int64 return -this;

    @:op(~A) public inline function not() : system.Int64 return ~this;

    @:op(A++) public inline function postinc() : system.Int64 return this++;
    @:op(++A) public inline function preinc() : system.Int64 return ++this;

    @:op(A--) public inline function postdec() : system.Int64 return this--;
    @:op(--A) public inline function predec() : system.Int64 return --this;
	
	@:op(A * B) public static function mul1(lhs : system.Int64, rhs : Int) : system.Int64;
    @:op(A * B) public static function mul2(lhs : Int, rhs : system.Int64) : system.Int64;
    @:op(A * B) public static function mul3(lhs : system.Int64, rhs : Float) : system.Double;
    @:op(A * B) public static function mul4(lhs : Float, rhs : system.Int64) : system.Double;
	
	@:op(A * B) public static function mul5(lhs : system.Int64, rhs : system.Char) : system.Int64;
	@:op(A * B) public static function mul6(lhs : system.Int64, rhs : system.Byte) : system.Int64;
    @:op(A * B) public static function mul7(lhs : system.Int64, rhs : system.Int16) : system.Int64;
    @:op(A * B) public static function mul8(lhs : system.Int64, rhs : system.Int32) : system.Int64;
    @:op(A * B) public static function mul9(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A * B) public static function mul10(lhs : system.Int64, rhs : system.SByte) : system.Int64;
    @:op(A * B) public static function mul11(lhs : system.Int64, rhs : system.UInt16) : system.Int64;
    @:op(A * B) public static function mul12(lhs : system.Int64, rhs : system.UInt32) : system.Int64;
    // @:op(A * B) public static function mul13(lhs : system.Int64, rhs : system.UInt64) : system.UInt64;	
    @:op(A * B) public static function mul14(lhs : system.Int64, rhs : system.Single) : system.Single;	
    @:op(A * B) public static function mul15(lhs : system.Int64, rhs : system.Double) : system.Double;	

	
    @:op(A / B) public static inline function div0(lhs : system.Int64, rhs : system.Int64) : system.Int64 return Std.int(lhs.toHaxeInt() / rhs.toHaxeInt());
    @:op(A / B) public static inline function div1(lhs : system.Int64, rhs : Int) : system.Int64 return Std.int(lhs.toHaxeInt() / rhs);
    @:op(A / B) public static inline function div2(lhs : Int, rhs : system.Int64) : system.Int64 return Std.int(lhs / rhs.toHaxeInt());
    @:op(A / B) public static function div3(lhs : system.Int64, rhs : Float) : system.Double;
    @:op(A / B) public static function div4(lhs : Float, rhs : system.Int64) : system.Double;
	
	@:op(A / B) public static function div5(lhs : system.Int64, rhs : system.Char) : system.Int64;
	@:op(A / B) public static function div6(lhs : system.Int64, rhs : system.Byte) : system.Int64;
    @:op(A / B) public static function div7(lhs : system.Int64, rhs : system.Int16) : system.Int64;
    @:op(A / B) public static function div8(lhs : system.Int64, rhs : system.Int32) : system.Int64;
    @:op(A / B) public static function div9(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A / B) public static function div10(lhs : system.Int64, rhs : system.SByte) : system.Int64;
    @:op(A / B) public static function div11(lhs : system.Int64, rhs : system.UInt16) : system.Int64;
    @:op(A / B) public static function div12(lhs : system.Int64, rhs : system.UInt32) : system.Int64;
    // @:op(A / B) public static function div13(lhs : system.Int64, rhs : system.UInt64) : system.UInt64;	
    @:op(A / B) public static function div14(lhs : system.Int64, rhs : system.Single) : system.Single;	
    @:op(A / B) public static function div15(lhs : system.Int64, rhs : system.Double) : system.Double;	


    @:op(A % B) public static function mod0(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A % B) public static function mod1(lhs : system.Int64, rhs : Int) : system.Int64;
    @:op(A % B) public static function mod2(lhs : Int, rhs : system.Int64) : system.Int64;
    @:op(A % B) public static function mod3(lhs : system.Int64, rhs : Float) : system.Double;
    @:op(A % B) public static function mod4(lhs : Float, rhs : system.Int64) : system.Double;
                              		
	@:op(A % B) public static function mod5(lhs : system.Int64, rhs : system.Char) : system.Int64;
	@:op(A % B) public static function mod6(lhs : system.Int64, rhs : system.Byte) : system.Int64;
    @:op(A % B) public static function mod7(lhs : system.Int64, rhs : system.Int16) : system.Int64;
    @:op(A % B) public static function mod8(lhs : system.Int64, rhs : system.Int32) : system.Int64;
    @:op(A % B) public static function mod9(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A % B) public static function mod10(lhs : system.Int64, rhs : system.SByte) : system.Int64;
    @:op(A % B) public static function mod11(lhs : system.Int64, rhs : system.UInt16) : system.Int64;
    @:op(A % B) public static function mod12(lhs : system.Int64, rhs : system.UInt32) : system.Int64;
    // @:op(A % B) public static function mod13(lhs : system.Int64, rhs : system.UInt64) : system.Int64;	
	@:op(A % B) public static function mod14(lhs : system.Int64, rhs : system.Single) : system.Single;	
    @:op(A % B) public static function mod15(lhs : system.Int64, rhs : system.Double) : system.Double;	

                              
    @:op(A + B) public static function add0(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A + B) public static function add1(lhs : system.Int64, rhs : Int) : system.Int64;
    @:op(A + B) public static function add2(lhs : Int, rhs : system.Int64) : system.Int64;
    @:op(A + B) public static function add3(lhs : system.Int64, rhs : Float) : system.Double;
    @:op(A + B) public static function add4(lhs : Float, rhs : system.Int64) : system.Double;
		                              		
	@:op(A + B) public static function add5(lhs : system.Int64, rhs : system.Char) : system.Int64;
	@:op(A + B) public static function add6(lhs : system.Int64, rhs : system.Byte) : system.Int64;
    @:op(A + B) public static function add7(lhs : system.Int64, rhs : system.Int16) : system.Int64;
    @:op(A + B) public static function add8(lhs : system.Int64, rhs : system.Int32) : system.Int64;
    @:op(A + B) public static function add9(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A + B) public static function add10(lhs : system.Int64, rhs : system.SByte) : system.Int64;
    @:op(A + B) public static function add11(lhs : system.Int64, rhs : system.UInt16) : system.Int64;
    @:op(A + B) public static function add12(lhs : system.Int64, rhs : system.UInt32) : system.Int64;
    // @:op(A + B) public static function add13(lhs : system.Int64, rhs : system.UInt64) : system.Int64;	
    @:op(A + B) public static function add14(lhs : system.Int64, rhs : system.Single) : system.Single;	
    @:op(A + B) public static function add15(lhs : system.Int64, rhs : system.Double) : system.Double;	
    @:op(A + B) public static inline function add16(lhs : system.Int64, rhs : system.CsString) : system.CsString return lhs.toString() + rhs;
    @:op(A + B) public static inline function add17(lhs : system.Int64, rhs : String) : system.CsString return lhs.toString() + rhs;

                              
    @:op(A - B) public static function sub0(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A - B) public static function sub1(lhs : system.Int64, rhs : Int) : system.Int64;
    @:op(A - B) public static function sub2(lhs : Int, rhs : system.Int64) : system.Int64;
    @:op(A - B) public static function sub3(lhs : system.Int64, rhs : Float) : system.Double;
    @:op(A - B) public static function sub4(lhs : Float, rhs : system.Int64) : system.Double;
	
	@:op(A - B) public static function sub5(lhs : system.Int64, rhs : system.Char) : system.Int64;
	@:op(A - B) public static function sub6(lhs : system.Int64, rhs : system.Byte) : system.Int64;
    @:op(A - B) public static function sub7(lhs : system.Int64, rhs : system.Int16) : system.Int64;
    @:op(A - B) public static function sub8(lhs : system.Int64, rhs : system.Int32) : system.Int64;
    @:op(A - B) public static function sub9(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A - B) public static function sub10(lhs : system.Int64, rhs : system.SByte) : system.Int64;
    @:op(A - B) public static function sub11(lhs : system.Int64, rhs : system.UInt16) : system.Int64;
    @:op(A - B) public static function sub12(lhs : system.Int64, rhs : system.UInt32) : system.Int64;
    // @:op-A - B) public static function sub13(lhs : system.Int64, rhs : system.UInt64) : system.Int64;	
	@:op(A - B) public static function sub14(lhs : system.Int64, rhs : system.Single) : system.Single;	
    @:op(A - B) public static function sub15(lhs : system.Int64, rhs : system.Double) : system.Double;	


    @:op(A << B) public static function shl0(lhs :system.Int64, rhs :system.Int64) :system.Int64;
    @:op(A << B) public static function shl1(lhs :system.Int64, rhs : Int) :system.Int64;
    @:op(A << B) public static function shl2(lhs : Int, rhs :system.Int64) :system.Int64;
		
	@:op(A << B) public static function shl5(lhs : system.Int64, rhs : system.Char) : system.Int64;
	@:op(A << B) public static function shl6(lhs : system.Int64, rhs : system.Byte) : system.Int64;
    @:op(A << B) public static function shl7(lhs : system.Int64, rhs : system.Int16) : system.Int64;
    @:op(A << B) public static function shl8(lhs : system.Int64, rhs : system.Int32) : system.Int64;
    // @:op(A << B) public static function shl9(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A << B) public static function shl10(lhs : system.Int64, rhs : system.SByte) : system.Int64;
    @:op(A << B) public static function shl11(lhs : system.Int64, rhs : system.UInt16) : system.Int64;
    // @:op(A << B) public static function shl12(lhs : system.Int64, rhs : system.UInt32) : system.Int64;
    // @:op-A << B) public static function shl13(lhs : system.Int64, rhs : system.UInt64) : system.Int64;	


    @:op(A >> B) public static function shr0(lhs :system.Int64, rhs :system.Int64) :system.Int64;
    @:op(A >> B) public static function shr1(lhs :system.Int64, rhs : Int) :system.Int64;
    @:op(A >> B) public static function shr2(lhs : Int, rhs :system.Int64) :system.Int64;
	
	@:op(A >> B) public static function shr5(lhs : system.Int64, rhs : system.Char) : system.Int64;
	@:op(A >> B) public static function shr6(lhs : system.Int64, rhs : system.Byte) : system.Int64;
    @:op(A >> B) public static function shr7(lhs : system.Int64, rhs : system.Int16) : system.Int64;
    @:op(A >> B) public static function shr8(lhs : system.Int64, rhs : system.Int32) : system.Int64;
    // @:op(A >> B) public static function shr9(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A >> B) public static function shr10(lhs : system.Int64, rhs : system.SByte) : system.Int64;
    @:op(A >> B) public static function shr11(lhs : system.Int64, rhs : system.UInt16) : system.Int64;
    // @:op(A >> B) public static function shr12(lhs : system.Int64, rhs : system.UInt32) : system.Int64;
    // @:op-A >> B) public static function shr13(lhs : system.Int64, rhs : system.UInt64) : system.Int64;	
	
	
    @:op(A > B) public static function gt0(lhs :system.Int64, rhs : system.Int64) : system.Boolean;
    @:op(A > B) public static function gt1(lhs :system.Int64, rhs : Int) : system.Boolean;
    @:op(A > B) public static function gt2(lhs : Int, rhs :system.Int64) : system.Boolean;
    @:op(A > B) public static function gt3(lhs :system.Int64, rhs : Float) : system.Boolean;
    @:op(A > B) public static function gt4(lhs : Float, rhs :system.Int64) : system.Boolean;
		
	@:op(A > B) public static function gt5(lhs : system.Int64, rhs : system.Char) : system.Boolean;
	@:op(A > B) public static function gt6(lhs : system.Int64, rhs : system.Byte) : system.Boolean;
    @:op(A > B) public static function gt7(lhs : system.Int64, rhs : system.Int16) : system.Boolean;
    @:op(A > B) public static function gt8(lhs : system.Int64, rhs : system.Int32) : system.Boolean;
    @:op(A > B) public static function gt9(lhs : system.Int64, rhs : system.Int64) : system.Boolean;
    @:op(A > B) public static function gt10(lhs : system.Int64, rhs : system.SByte) : system.Boolean;
    @:op(A > B) public static function gt11(lhs : system.Int64, rhs : system.UInt16) : system.Boolean;
    @:op(A > B) public static function gt12(lhs : system.Int64, rhs : system.UInt32) : system.Boolean;
    @:op(A > B) public static function gt13(lhs : system.Int64, rhs : system.UInt64) : system.Boolean;	
    @:op(A > B) public static function gt14(lhs : system.Int64, rhs : system.Single) : system.Boolean;	
    @:op(A > B) public static function gt15(lhs : system.Int64, rhs : system.Double) : system.Boolean;	


    @:op(A < B) public static function lt0(lhs :system.Int64, rhs :system.Int64) : system.Boolean;
    @:op(A < B) public static function lt1(lhs :system.Int64, rhs : Int) : system.Boolean;
	@:op(A < B) public static function lt2(lhs : Int, rhs :system.Int64) : system.Boolean;
    @:op(A < B) public static function lt3(lhs :system.Int64, rhs : Float) : system.Boolean;
    @:op(A < B) public static function lt4(lhs : Float, rhs :system.Int64) : system.Boolean;
		
	@:op(A < B) public static function lt5(lhs : system.Int64, rhs : system.Char) : system.Boolean;
	@:op(A < B) public static function lt6(lhs : system.Int64, rhs : system.Byte) : system.Boolean;
    @:op(A < B) public static function lt7(lhs : system.Int64, rhs : system.Int16) : system.Boolean;
    @:op(A < B) public static function lt8(lhs : system.Int64, rhs : system.Int32) : system.Boolean;
    @:op(A < B) public static function lt9(lhs : system.Int64, rhs : system.Int64) : system.Boolean;
    @:op(A < B) public static function lt10(lhs : system.Int64, rhs : system.SByte) : system.Boolean;
    @:op(A < B) public static function lt11(lhs : system.Int64, rhs : system.UInt16) : system.Boolean;
    @:op(A < B) public static function lt12(lhs : system.Int64, rhs : system.UInt32) : system.Boolean;
    @:op(A < B) public static function lt13(lhs : system.Int64, rhs : system.UInt64) : system.Boolean;	
    @:op(A < B) public static function lt14(lhs : system.Int64, rhs : system.Single) : system.Boolean;	
    @:op(A < B) public static function lt15(lhs : system.Int64, rhs : system.Double) : system.Boolean;	


    @:op(A >= B) public static function gte0(lhs :system.Int64, rhs :system.Int64) : system.Boolean;
    @:op(A >= B) public static function gte1(lhs :system.Int64, rhs : Int) : system.Boolean;
    @:op(A >= B) public static function gte2(lhs : Int, rhs :system.Int64) : system.Boolean;
    @:op(A >= B) public static function gte3(lhs :system.Int64, rhs : Float) : system.Boolean;
    @:op(A >= B) public static function gte4(lhs : Float, rhs :system.Int64) : system.Boolean;
	
	@:op(A >= B) public static function gte5(lhs : system.Int64, rhs : system.Char) : system.Boolean;
	@:op(A >= B) public static function gte6(lhs : system.Int64, rhs : system.Byte) : system.Boolean;
    @:op(A >= B) public static function gte7(lhs : system.Int64, rhs : system.Int16) : system.Boolean;
    @:op(A >= B) public static function gte8(lhs : system.Int64, rhs : system.Int32) : system.Boolean;
    @:op(A >= B) public static function gte9(lhs : system.Int64, rhs : system.Int64) : system.Boolean;
    @:op(A >= B) public static function gte10(lhs : system.Int64, rhs : system.SByte) : system.Boolean;
    @:op(A >= B) public static function gte11(lhs : system.Int64, rhs : system.UInt16) : system.Boolean;
    @:op(A >= B) public static function gte12(lhs : system.Int64, rhs : system.UInt32) : system.Boolean;
    @:op(A >= B) public static function gte13(lhs : system.Int64, rhs : system.UInt64) : system.Boolean;	
    @:op(A >= B) public static function gte14(lhs : system.Int64, rhs : system.Single) : system.Boolean;	
    @:op(A >= B) public static function gte15(lhs : system.Int64, rhs : system.Double) : system.Boolean;	

	
    @:op(A <= B) public static function lte0(lhs :system.Int64, rhs :system.Int64) : system.Boolean;
    @:op(A <= B) public static function lte1(lhs :system.Int64, rhs : Int) : system.Boolean;
    @:op(A <= B) public static function lte2(lhs : Int, rhs :system.Int64) : system.Boolean;
    @:op(A <= B) public static function lte3(lhs :system.Int64, rhs : Float) : system.Boolean;
    @:op(A <= B) public static function lte4(lhs : Float, rhs :system.Int64) : system.Boolean;
	
	@:op(A <= B) public static function lte5(lhs : system.Int64, rhs : system.Char) : system.Boolean;
	@:op(A <= B) public static function lte6(lhs : system.Int64, rhs : system.Byte) : system.Boolean;
    @:op(A <= B) public static function lte7(lhs : system.Int64, rhs : system.Int16) : system.Boolean;
    @:op(A <= B) public static function lte8(lhs : system.Int64, rhs : system.Int32) : system.Boolean;
    @:op(A <= B) public static function lte9(lhs : system.Int64, rhs : system.Int64) : system.Boolean;
    @:op(A <= B) public static function lte10(lhs : system.Int64, rhs : system.SByte) : system.Boolean;
    @:op(A <= B) public static function lte11(lhs : system.Int64, rhs : system.UInt16) : system.Boolean;
    @:op(A <= B) public static function lte12(lhs : system.Int64, rhs : system.UInt32) : system.Boolean;
    @:op(A <= B) public static function lte13(lhs : system.Int64, rhs : system.UInt64) : system.Boolean;	
	@:op(A <= B) public static function lte14(lhs : system.Int64, rhs : system.Single) : system.Boolean;	
    @:op(A <= B) public static function lte15(lhs : system.Int64, rhs : system.Double) : system.Boolean;	

	
    @:op(A == B) public static function eq0(lhs :system.Int64, rhs :system.Int64) : system.Boolean;
    @:op(A == B) public static function eq1(lhs :system.Int64, rhs : Int) : system.Boolean;
    @:op(A == B) public static function eq2(lhs : Int, rhs :system.Int64) : system.Boolean;
    @:op(A == B) public static function eq3(lhs :system.Int64, rhs : Float) : system.Boolean;
    @:op(A == B) public static function eq4(lhs : Float, rhs :system.Int64) : system.Boolean;
	
	@:op(A == B) public static function eq5(lhs : system.Int64, rhs : system.Char) : system.Boolean;
	@:op(A == B) public static function eq6(lhs : system.Int64, rhs : system.Byte) : system.Boolean;
    @:op(A == B) public static function eq7(lhs : system.Int64, rhs : system.Int16) : system.Boolean;
    @:op(A == B) public static function eq8(lhs : system.Int64, rhs : system.Int32) : system.Boolean;
    @:op(A == B) public static function eq9(lhs : system.Int64, rhs : system.Int64) : system.Boolean;
    @:op(A == B) public static function eq10(lhs : system.Int64, rhs : system.SByte) : system.Boolean;
    @:op(A == B) public static function eq11(lhs : system.Int64, rhs : system.UInt16) : system.Boolean;
    @:op(A == B) public static function eq12(lhs : system.Int64, rhs : system.UInt32) : system.Boolean;
    @:op(A == B) public static function eq13(lhs : system.Int64, rhs : system.UInt64) : system.Boolean;	
    @:op(A == B) public static function eq14(lhs : system.Int64, rhs : system.Single) : system.Boolean;	
    @:op(A == B) public static function eq15(lhs : system.Int64, rhs : system.Double) : system.Boolean;	

	
    @:op(A != B) public static function neq0(lhs :system.Int64, rhs :system.Int64) : system.Boolean;
    @:op(A != B) public static function neq1(lhs :system.Int64, rhs : Int) : system.Boolean;
    @:op(A != B) public static function neq2(lhs : Int, rhs :system.Int64) : system.Boolean;
    @:op(A != B) public static function neq3(lhs :system.Int64, rhs : Float) : system.Boolean;
    @:op(A != B) public static function neq4(lhs : Float, rhs :system.Int64) : system.Boolean;
	
	@:op(A != B) public static function neq5(lhs : system.Int64, rhs : system.Char) : system.Boolean;
	@:op(A != B) public static function neq6(lhs : system.Int64, rhs : system.Byte) : system.Boolean;
    @:op(A != B) public static function neq7(lhs : system.Int64, rhs : system.Int16) : system.Boolean;
    @:op(A != B) public static function neq8(lhs : system.Int64, rhs : system.Int32) : system.Boolean;
    @:op(A != B) public static function neq9(lhs : system.Int64, rhs : system.Int64) : system.Boolean;
    @:op(A != B) public static function neq10(lhs : system.Int64, rhs : system.SByte) : system.Boolean;
    @:op(A != B) public static function neq11(lhs : system.Int64, rhs : system.UInt16) : system.Boolean;
    @:op(A != B) public static function neq12(lhs : system.Int64, rhs : system.UInt32) : system.Boolean;
    @:op(A != B) public static function neq13(lhs : system.Int64, rhs : system.UInt64) : system.Boolean;	
    @:op(A != B) public static function neq14(lhs : system.Int64, rhs : system.Single) : system.Boolean;	
    @:op(A != B) public static function neq15(lhs : system.Int64, rhs : system.Double) : system.Boolean;	

	
    @:op(A & B) public static function and0(lhs :system.Int64, rhs :system.Int64) :system.Int64;
    @:op(A & B) public static function and1(lhs :system.Int64, rhs : Int) :system.Int64;
    @:op(A & B) public static function and2(lhs : Int, rhs :system.Int64) :system.Int64;
                                                                   		
	@:op(A & B) public static function and5(lhs : system.Int64, rhs : system.Char) : system.Int64;
	@:op(A & B) public static function and6(lhs : system.Int64, rhs : system.Byte) : system.Int64;
    @:op(A & B) public static function and7(lhs : system.Int64, rhs : system.Int16) : system.Int64;
    @:op(A & B) public static function and8(lhs : system.Int64, rhs : system.Int32) : system.Int64;
    @:op(A & B) public static function and9(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A & B) public static function and10(lhs : system.Int64, rhs : system.SByte) : system.Int64;
    @:op(A & B) public static function and11(lhs : system.Int64, rhs : system.UInt16) : system.Int64;
    @:op(A & B) public static function and12(lhs : system.Int64, rhs : system.UInt32) : system.Int64;
    //@:op(A & B) public static function and13(lhs : system.Int64, rhs : system.UInt64) : system.Int64;	

	
    @:op(A | B) public static function or0(lhs :system.Int64, rhs :system.Int64) :system.Int64;
    @:op(A | B) public static function or1(lhs :system.Int64, rhs : Int) :system.Int64;
    @:op(A | B) public static function or2(lhs : Int, rhs :system.Int64) :system.Int64;
                                                                       		
	@:op(A | B) public static function or5(lhs : system.Int64, rhs : system.Char) : system.Int64;
	@:op(A | B) public static function or6(lhs : system.Int64, rhs : system.Byte) : system.Int64;
    @:op(A | B) public static function or7(lhs : system.Int64, rhs : system.Int16) : system.Int64;
    @:op(A | B) public static function or8(lhs : system.Int64, rhs : system.Int32) : system.Int64;
    @:op(A | B) public static function or9(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A | B) public static function or10(lhs : system.Int64, rhs : system.SByte) : system.Int64;
    @:op(A | B) public static function or11(lhs : system.Int64, rhs : system.UInt16) : system.Int64;
    @:op(A | B) public static function or12(lhs : system.Int64, rhs : system.UInt32) : system.Int64;
    //@:op(A | B) public static function or13(lhs : system.Int64, rhs : system.UInt64) : system.UInt64;	
                   
    @:op(A ^ B) public static function xor0(lhs :system.Int64, rhs : system.Int64) :system.Int64;
    @:op(A ^ B) public static function xor1(lhs :system.Int64, rhs : Int) :system.Int64;
    @:op(A ^ B) public static function xor2(lhs : Int, rhs :system.Int64) :system.Int64;
		                              		
	@:op(A ^ B) public static function xor5(lhs : system.Int64, rhs : system.Char) : system.Int64;
	@:op(A ^ B) public static function xor6(lhs : system.Int64, rhs : system.Byte) : system.Int64;
    @:op(A ^ B) public static function xor7(lhs : system.Int64, rhs : system.Int16) : system.Int64;
    @:op(A ^ B) public static function xor8(lhs : system.Int64, rhs : system.Int32) : system.Int64;
    @:op(A ^ B) public static function xor9(lhs : system.Int64, rhs : system.Int64) : system.Int64;
    @:op(A ^ B) public static function xor10(lhs : system.Int64, rhs : system.SByte) : system.Int64;
    @:op(A ^ B) public static function xor11(lhs : system.Int64, rhs : system.UInt16) : system.Int64;
    @:op(A ^ B) public static function xor12(lhs : system.Int64, rhs : system.UInt32) : system.Int64;
    //@:op(A ^ B) public static function xor13(lhs : system.Int64, rhs : system.UInt64) : system.UInt64;	
}