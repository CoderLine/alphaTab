#if macro
package alphaTab;

import haxe.macro.Expr;
import haxe.macro.Type;
import haxe.macro.Context;
import haxe.macro.ExprTools;
import haxe.macro.TypeTools;
import haxe.macro.ComplexTypeTools;

class JsonSerializationBuilder {
	public static macro function build():Array<Field> {
		var fields = Context.getBuildFields();

		var currentType = Context.getLocalType();

        var typeToBuild:Type = null;

        switch (currentType) {
			case TInst(t, params):
				typeToBuild = currentType;
				switch (t.get().kind) {
					case KAbstractImpl(a):
                        typeToBuild = TAbstract(a, params);
					default:
				}

			case TAbstract(t, params):
                typeToBuild = currentType;

			default:
                trace("Unsupported JSON serialization type: " + currentType);
                return fields;
		}

		var toJsonMethod:Field = null;
		var fromJsonMethod:Field = null;

		var properties = new Array<Field>();

		for (f in fields) {
			switch (f.kind) {
				case FVar(t, e):
					properties.push(f);
				case FFun(fun):
					switch (f.name) {
						case 'toJson':
							toJsonMethod = f;
						case 'fromJson':
							fromJsonMethod = f;
					}
				case FProp(get, set, t, e):
					properties.push(f);
			}
		}

		if (toJsonMethod == null) {
			toJsonMethod = {
				name: 'toJson',
				meta: [],
				access: [AStatic, APublic],
				pos: Context.currentPos(),
				kind: FFun({
					args: [{name: 'obj', type: Context.toComplexType(typeToBuild)}],
					expr: null,
					ret: macro:Dynamic
				})
			}
			fields.push(toJsonMethod);
		}

		if (fromJsonMethod == null) {
			fromJsonMethod = {
				name: 'fromJson',
				meta: [],
				access: [AStatic, APublic],
				pos: Context.currentPos(),
				kind: FFun({
					args: [{name: 'json', type: macro:Dynamic}],
					expr: null,
					ret: Context.toComplexType(typeToBuild)
				})
			}
			fields.push(fromJsonMethod);
		}

        switch(typeToBuild) {
            case TInst(t, p):
                switch (toJsonMethod.kind) {
                    case FFun(fun):
						fun.args[0].name = "obj";
                        fun.expr = generateToJsonBodyForClass(properties, typeToBuild);
                    default:
                        trace('Invalid method kind');
                }

                switch (fromJsonMethod.kind) {
                    case FFun(fun):
						fun.args[0].name = "json";
                        fun.expr = generateFromJsonBodyForClass(properties, t.get());
                    default:
                     trace('Invalid method kind');
                }
            case TAbstract(t,p):
                switch (toJsonMethod.kind) {
                    case FFun(fun):
						fun.args[0].name = "obj";
                        fun.expr = generateToJsonBodyForAbstract(properties, t.get());
                    default:
                     trace('Invalid method kind');
                }

                switch (fromJsonMethod.kind) {
                    case FFun(fun):
						fun.args[0].name = "json";
                        fun.expr = generateFromJsonBodyForAbstract(properties, t.get());
                    default:
                     trace('Invalid method kind');
                }
            default:
                trace('Unsupported kind: ' + typeToBuild);
        }

        return fields;
	}

	private static function generateToJsonBodyForAbstract(fields:Array<Field>, sourceType:AbstractType):Expr {
		var statements = new Array<Expr>();

		statements.push(macro return obj.toInt32_IFormatProvider(null));

		return macro $b{statements};
	}

	private static function generateFromJsonBodyForAbstract(fields:Array<Field>, sourceType:AbstractType):Expr {
		var statements = new Array<Expr>();

		statements.push(macro if(untyped __js__("typeof json === 'number'")) {
			return json;
		});

		statements.push(macro if(untyped __js__("typeof json === 'string'")) {
			return fromString(json);
		});
		
		statements.push(macro throw new alphaTab.utils.SerializationException().SerializationException('Unsupported value type')	);

		return macro $b{statements};
	}

	private static function generateToJsonBodyForClass(fields:Array<Field>, sourceType:Type):Expr {
		var statements = new Array<Expr>();

		var sourceTypeComplex:ComplexType = Context.toComplexType(sourceType);

		statements.push(macro var json:Dynamic = {});

		for(f in fields) {
			var fieldName:String = f.name;
			var jsonName:String = null;
			if (f.meta != null) {
				for (metaEntry in f.meta) {
					if (metaEntry.name == "json" && metaEntry.params != null) {
						for (v in metaEntry.params) {
							var name = ExprTools.getValue(v).toString();
							if (name != "") {
								jsonName = name;
							}
						}
					}
				}
			}

			if(jsonName != null) {
				var fieldType:ComplexType = null;
				switch (f.kind) {
					case FVar(t, e):
						fieldType = t;
					case FProp(get, set, t, e):
						fieldType = t;
					default:
				}

				if (fieldType != null) {
					var fieldTypeType = ComplexTypeTools.toType(fieldType);
					switch (fieldTypeType) {
						case TInst(tfield, params):
							var fieldType = tfield.get();

							var fieldTypeName = fieldType.pack.join('.') + '.' + fieldType.name;

							statements.push(macro {
								json.$jsonName = $p{fieldTypeName.split('.')}.toJson(obj.$fieldName);
							});

						case TAbstract(tabs, params):
							var abstractType = tabs.get();
							var fullName = abstractType.pack.join('.') + '.' + abstractType.name;

							switch (fullName) {
								case 'system.CsString',
									'system.Boolean',
									'system.Byte',
									'system.SByte',
									'system.Int16',
									'system.UInt16',
									'system.Int32',
									'system.UInt32',
									'system.Int64',
									'system.UInt64',
									'system.Single',
									'system.Double',
									'system.Char',
									'system.BooleanArray',
									'system.ByteArray',
									'system.SByteArray',
									'system.Int16Array',
									'system.UInt16Array',
									'system.Int32Array',
									'system.UInt32Array',
									'system.Int64Array',
									'system.UInt64Array',
									'system.SingleArray',
									'system.DoubleArray',
									'system.CharArray':
									statements.push(macro {
										json.$jsonName = obj.$fieldName;
									});

								default:
									statements.push(macro {
										json.$jsonName = $p{fullName.split('.')}.toJson(obj.$fieldName);
									});
							}

						default:
							statements.push(macro {
								json.$jsonName = obj.$fieldName;
							});
					}
				}
			}
		}

		statements.push(macro return json);

		return macro $b{statements};
	}

	private static function generateFromJsonBodyForClass(fields:Array<Field>, targetType:ClassType):Expr {
		var statements = new Array<Expr>();

		var targetTypePath:TypePath = {
			pack: targetType.pack,
			name: targetType.name
		};

		statements.push(macro var obj = new $targetTypePath());

		var forSwitch:Expr = macro system.ObjectExtensions.forIn(json, function(key) {
			switch(key.toLower()) {

			}
		});
		statements.push(forSwitch);

		// unwrap switch for case generation
		var switchCases:Array<Case> = null;
		switch(forSwitch.expr) {
			case ECall(c, callParams):
				switch(callParams[1].expr) 
				{
					case EFunction(name, fun):
						switch(fun.expr.expr) {
							case EBlock(exprs): 
								switch(exprs[0].expr) {
									case ESwitch(e, cases, edef):
										switchCases = cases;	
									default:
								}
							default:
						}
					default:
				}
			default:
		}

		for (f in fields) {
			var fieldCase:Case = {
				values: [],	
				expr: null
			}

			var fieldName:String = f.name;
			var jsonNames = new Array<String>();
			if (f.meta != null) {
				for (metaEntry in f.meta) {
					if (metaEntry.name == "json" && metaEntry.params != null) {
						for (v in metaEntry.params) {
							var name = ExprTools.getValue(v).toString();
							if (name != "") {
								jsonNames.push(name);

								fieldCase.values.push({
									pos: Context.currentPos(),
									expr: EConst(CString(name.toLowerCase()))
								});
							}
						}
					}
				}
			}

			if (jsonNames.length > 0) {
				switchCases.push(fieldCase);

				var fieldType:ComplexType = null;
				switch (f.kind) {
					case FVar(t, e):
						fieldType = t;
					case FProp(get, set, t, e):
						fieldType = t;
					default:
				}

				if (fieldType != null) {
					var fieldTypeType = ComplexTypeTools.toType(fieldType);
					switch (fieldTypeType) {
						case TInst(tfield, params):
							var fieldType = tfield.get();

							var fieldTypeName = fieldType.pack.join('.') + '.' + fieldType.name;

							fieldCase.expr = macro {
								obj.$fieldName = $p{fieldTypeName.split('.')}.fromJson(untyped json[key]);
							};

						case TAbstract(tabs, params):
							var abstractType = tabs.get();
							var fullName = abstractType.pack.join('.') + '.' + abstractType.name;

							switch (fullName) {
								case 'system.CsString',
									'system.Boolean',
									'system.Byte',
									'system.SByte',
									'system.Int16',
									'system.UInt16',
									'system.Int32',
									'system.UInt32',
									'system.Int64',
									'system.UInt64',
									'system.Single',
									'system.Double',
									'system.Char',
									'system.BooleanArray',
									'system.ByteArray',
									'system.SByteArray',
									'system.Int16Array',
									'system.UInt16Array',
									'system.Int32Array',
									'system.UInt32Array',
									'system.Int64Array',
									'system.UInt64Array',
									'system.SingleArray',
									'system.DoubleArray',
									'system.CharArray':
									// TODO: better validation of input value vs output value
									fieldCase.expr = macro {
										obj.$fieldName = untyped json[key];
									};

								default:
									fieldCase.expr = macro {
										obj.$fieldName = $p{fullName.split('.')}.fromJson(untyped json[key]);
									};
							}

						default:
							var jsonString = haxe.Json.stringify(fieldTypeType);
							fieldCase.expr = macro {
								trace('TODO: Unsupported Serialization value: ${jsonString}');
							};
							Context.warning('Unsupported Serialization value: ' + jsonString, Context.currentPos());
					}
				}
			}
		}

		statements.push(macro return obj);

		return macro $b{statements};
	}
}
#end
