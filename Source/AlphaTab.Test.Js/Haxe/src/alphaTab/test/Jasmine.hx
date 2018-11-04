package alphaTab.test;

#if macro

import haxe.macro.*;
import haxe.macro.Type;
import haxe.macro.Expr;

class Jasmine 
{
	macro static function generateJasmineSuites() 
	{
		var allTypes = new Array<haxe.macro.ClassType>();
		Context.onGenerate(function(types:Array<Type>) {
			for(type in types) 
			{
				switch(type)
				{
					case TInst(t,params):
						var classType = t.get();
						if(classType.meta.has(":testClass"))
						{
							allTypes.push(classType);
						}
					default:
				}
			}			
		});
	
		Context.onAfterGenerate(function() {
			trace('Collecting Test Suites');
			
			var dir = haxe.io.Path.directory(Compiler.getOutput());
			var sourceFile = haxe.io.Path.withoutDirectory(Compiler.getOutput());
			var specFile = haxe.io.Path.join([dir, "alphaTab.tests.specs.js"]);
			if(sys.FileSystem.exists(specFile))
			{
				sys.FileSystem.deleteFile(specFile);
			}
			var output = sys.io.File.write(specFile, false);

			output.writeString("/// <reference path=\"" + sourceFile + "\" />\r\n");

			for(t in allTypes)
			{
				var typeName = t.pack.join(".") + "." + t.name;
				
				var func = (t.meta.has(":testIgnore")) ? "xdescribe" : "describe";
				
				output.writeString(func + "(\"" + typeName + "\", function() {\r\n");
				output.writeString("    var __instance = new " + typeName + "();\r\n");

				var fields = t.fields.get();
				for(field in fields)
				{
					switch(field.kind)
					{
						case FMethod(k):
							if(k == MethNormal && field.meta.has(":testMethod"))
							{
								output.writeString("    it(\""+field.name+"\", function(done) {\r\n");
								output.writeString("        alphaTab.test.TestPlatform.Done = done;\r\n");
								
								var ignoreInfo = field.meta.extract(":testIgnore");
								if(ignoreInfo.length > 0)
								{
									var reason:String = "Test ignored";
									
									if (ignoreInfo[0].params != null && ignoreInfo[0].params.length > 0) 
									{
										reason = haxe.macro.ExprTools.getValue(ignoreInfo[0].params[0]);
									}
									output.writeString("         pending(\"" + reason + "\");\r\n");
								}
								output.writeString("        __instance."+field.name+"();\r\n");
                                
                                if(!field.meta.has(":testMethodAsync"))
                                {
                                    output.writeString("        done();\r\n");
                                }
								
								output.writeString("    });\r\n");
							}
						default:
					}
				}

				output.writeString("});\r\n");
			}			
			
			output.writeString("// End of test registration\r\n");
			
			output.flush();
			output.close();
			
			trace('Collecting Test Suites done');

		});
		return null;
	}
#end
}