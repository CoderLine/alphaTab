using System;
using System.Reflection;
using AlphaTab.Audio.Generator;
using AlphaTab.IO;
using AlphaTab.Platform;
using AlphaTab.Platform.JavaScript;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using SharpKit.Html;
using SharpKit.JavaScript;

// General Information about an assembly is controlled through the following 
// set of attributes. Change these attribute values to modify the information
// associated with an assembly.

[assembly: AssemblyTitle("AlphaTab")]
[assembly: AssemblyDescription("alphaTab is a cross platform music notation and guitar tablature rendering library.")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("")]
[assembly: AssemblyProduct("AlphaTab")]
[assembly: AssemblyCopyright("Copyright ©  2014")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]

// Version information for an assembly consists of the following four values:
//
//      Major Version
//      Minor Version 
//      Build Number
//      Revision
//
// You can specify all the values or you can default the Build and Revision Numbers 
// by using the '*' as shown below:
// [assembly: AssemblyVersion("1.0.*")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

[assembly: JsExport(ExportComments = true, OmitSharpKitHeaderComment = true, ForceOmitCasts = true, ForceIntegers = true)]
// Export all Types
[assembly: JsType(Mode = JsMode.Prototype,
                    AutomaticPropertiesAsFields = true,
                    Export = true,
                    IgnoreGenericTypeArguments = true,
                    IgnoreGenericMethodArguments = true,
                    OmitCasts = true
                    )]

// Exclude Interfaces from exporting
[assembly: JsType(Export = false, TargetType = typeof(IMidiFileHandler))]
[assembly: JsType(Export = false, TargetType = typeof(IReadable))]
[assembly: JsType(Export = false, TargetType = typeof(IWriteable))]
[assembly: JsType(Export = false, TargetType = typeof(ICanvas))]
[assembly: JsType(Export = false, TargetType = typeof(IPathCanvas))]
[assembly: JsType(Export = false, TargetType = typeof(IFileLoader))]
[assembly: JsType(Export = false, TargetType = typeof(ISupportsFinalize))]
[assembly: JsType(Export = false, TargetType = typeof(IEffectBarRendererInfo))]
[assembly: JsType(Export = false, TargetType = typeof(IScoreRenderer))]

[assembly: JsType(JsMode.Prototype, TargetType = typeof(Math), Name = "Math", NativeArrayEnumerator = true, NativeEnumerator = false, Export = false)]

[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Min", Name = "min")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Max", Name = "max")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Abs", Name = "abs")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Pow", Name = "pow")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Sqrt", Name = "sqrt")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Ceiling", Name = "ceil")]

[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "IsNullOrEmpty", InlineCodeExpression = "((value == null) || (value.length == 0))")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "StartsWith", InlineCodeExpression = "this.indexOf(value) == 0")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "EndsWith", InlineCodeExpression = "(this.lastIndexOf(value) == (this.length - value.length))")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "Contains", InlineCodeExpression = "this.indexOf(value) != -1")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "Replace", InlineCodeExpression = "this.replace(oldValue, newValue)")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "Split", InlineCodeExpression = "this.split(separator)")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "get_Chars", Name = "charCodeAt", NativeOverloads = true)]

[assembly: JsMethod(TargetType = typeof(IComparable), TargetMethod = "CompareTo", InlineCodeExpression = "(this - obj)")]
[assembly: JsMethod(TargetType = typeof(int), TargetMethod = "CompareTo", InlineCodeExpression = "(this - value)")]
[assembly: JsMethod(TargetType = typeof(float), TargetMethod = "CompareTo", InlineCodeExpression = "(this - value)")]

[assembly: JsMethod(TargetType = typeof(Nullable<>), TargetMethod = "get_Value", InlineCodeExpression = "this")]

[assembly: JsType(Mode = JsMode.Prototype, TargetType = typeof(Html5Canvas),
                    AutomaticPropertiesAsFields = false,
                    Export = true,
                    IgnoreGenericTypeArguments = true,
                    IgnoreGenericMethodArguments = true,
                    OmitCasts = true
                    )]

[assembly: JsType(Mode = JsMode.Prototype, TargetType = typeof(SvgCanvas),
                    AutomaticPropertiesAsFields = false,
                    Export = true,
                    IgnoreGenericTypeArguments = true,
                    IgnoreGenericMethodArguments = true,
                    OmitCasts = true
                    )]

