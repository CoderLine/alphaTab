package alphatab.compiler;

class HaXeDocParser 
{
	public static function parse(comment:String) : HaXeDoc
	{
		var haXeDoc = new HaXeDoc();
		
		var r:EReg = ~/\n[ \n\t\/]*\*[ \t]*@/;
		var explodedComment = exploder.split("\n" + comment);
		
		r = ~/^[ \t]*[\/*]*\**( ?.*)[ \t\/*]*$/m;
		
		r.
	}
}