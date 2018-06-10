/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

using System;
using AlphaTab.Collections;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Platform;
using AlphaTab.Platform.JavaScript;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Util;
using Haxe;
using Haxe.Js;
using Phase;
using Phase.Attributes;
using Phase.CompilerServices;
using StringBuilder = AlphaTab.Collections.StringBuilder;

namespace AlphaTab
{
    /// <summary>
    /// This public class represents the global alphaTab environment where
    /// alphaTab looks for information like available layout engines
    /// staves etc.
    /// </summary>
    partial class Environment
    {
        public static string ScriptFile { get; set; }
        public static bool IsFontLoaded { get; set; }

        static void PlatformInit()
        {
            RenderEngines["svg"] = () => new CssFontSvgCanvas();
            RenderEngines["default"] = () => new CssFontSvgCanvas();
            RenderEngines["html5"] = () => new Platform.JavaScript.Html5Canvas();

            // check whether webfont is loaded
            CheckFontLoad();

            RegisterJQueryPlugin();

            Script.Write("untyped __js__(\"Math.log2 = Math.log2 || function(x) { return Math.log(x) * Math.LOG2E; };\");");

            // try to build the find the alphaTab script url in case we are not in the webworker already
            if (Lib.Global.document)
            {
                Script.Write("untyped __js__(\"window.AudioContext = window.AudioContext || window.webkitAudioContext;\");");

                var document = Browser.Document;
                /**
                 * VB Loader For IE 
                 * This code is based on the code of 
                 *     http://nagoon97.com/reading-binary-files-using-ajax/
                 *     Copyright (c) 2008 Andy G.P. Na <nagoon97@naver.com>
                 *     The source code is freely distributable under the terms of an MIT-style license.
                 */
                var vbAjaxLoader = new StringBuilder();
                vbAjaxLoader.AppendLine("<script type=\"text/vbscript\">");
                vbAjaxLoader.AppendLine("Function VbAjaxLoader(method, fileName)");
                vbAjaxLoader.AppendLine("    Dim xhr");
                vbAjaxLoader.AppendLine("    Set xhr = CreateObject(\"Microsoft.XMLHTTP\")");
                vbAjaxLoader.AppendLine("    xhr.Open method, fileName, False");
                vbAjaxLoader.AppendLine("    xhr.setRequestHeader \"Accept-Charset\", \"x-user-defined\"");
                vbAjaxLoader.AppendLine("    xhr.send");
                vbAjaxLoader.AppendLine("    Dim byteArray()");
                vbAjaxLoader.AppendLine("    if xhr.Status = 200 Then");
                vbAjaxLoader.AppendLine("        Dim byteString");
                vbAjaxLoader.AppendLine("        Dim i");
                vbAjaxLoader.AppendLine("        byteString=xhr.responseBody");
                vbAjaxLoader.AppendLine("        ReDim byteArray(LenB(byteString))");
                vbAjaxLoader.AppendLine("        For i = 1 To LenB(byteString)");
                vbAjaxLoader.AppendLine("            byteArray(i-1) = AscB(MidB(byteString, i, 1))");
                vbAjaxLoader.AppendLine("        Next");
                vbAjaxLoader.AppendLine("    End If");
                vbAjaxLoader.AppendLine("    VbAjaxLoader=byteArray");
                vbAjaxLoader.AppendLine("End Function");
                vbAjaxLoader.AppendLine("</script>");

                var s = vbAjaxLoader.ToString();
                document.Write(s);

                ScriptElement scriptElement = (ScriptElement)document.CurrentScript;
                if (!scriptElement.IsTruthy())
                {
                    // try to get javascript from exception stack
                    try
                    {
                        var error = new Error();
                        var stack = error.Stack;
                        if (!stack.IsTruthy())
                        {
                            throw error;
                        }
                        ScriptFile = ScriptFileFromStack(stack);
                    }
                    catch (Error e)
                    {
                        var stack = e.Stack;
                        if (!stack.IsTruthy())
                        {
                            scriptElement = (ScriptElement)document.QuerySelector("script[data-alphatab]\")");
                        }
                        else
                        {
                            ScriptFile = ScriptFileFromStack(stack);
                        }
                    }
                }

                // failed to automatically resolve
                if (string.IsNullOrEmpty(ScriptFile))
                {
                    if (!scriptElement.IsTruthy())
                    {
                        Logger.Warning("Environment", "Could not automatically find alphaTab script file for worker, please add the data-alphatab attribute to the script tag that includes alphaTab or provide it when initializing alphaTab");
                    }
                    else
                    {
                        ScriptFile = scriptElement.Src;
                    }
                }
            }
            else
            {
                AlphaTabWebWorker.Init();
                AlphaSynthWebWorker.Init();
            }
        }

        private static void RegisterJQueryPlugin()
        {
            if (Platform.Platform.JsonExists(Lib.Global, "jQuery"))
            {
                dynamic jquery = Browser.Window.Member<dynamic>("jQuery");


                var api = new JQueryAlphaTab();
                jquery.fn.alphaTab = (Func<string, object>)(method =>
                {
                    var _this = Script.Write<HaxeArray<Element>>("untyped __js__(\"this\")");
                    // if only a single element is affected, we use this
                    if (_this.Length == 1)
                    {
                        return api.Exec(_this[0], method, Script.Write<string[]>("untyped __js__(\"Array.prototype.slice.call(arguments, 1)\")"));
                    }
                    // if multiple elements are affected we provide chaining
                    else
                    {
                        return Script.Write<dynamic>("untyped __js__(\"this\")")
                            .each((Action)(() =>
                            {
                                api.Exec(Script.Write<Element>("untyped __js__(\"this\")"), method,
                                    Script.Write<string[]>("untyped __js__(\"Array.prototype.slice.call(arguments, 1)\")"));
                            }));
                    }
                });
                jquery.alphaTab = new
                {
                    restore = JQueryAlphaTab.Restore
                };
                jquery.fn.alphaTab.fn = api;
            }


        }

        // based on https://github.com/JamesMGreene/currentExecutingScript
        private static string ScriptFileFromStack(string stack)
        {
            var matches = stack.Match(@"(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?");
            if (!matches.IsTruthy())
            {
                matches = stack.Match(@"^(?:|[^:@]*@|.+\)@(?=data:text\/javascript|blob|http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?");
                if (!matches.IsTruthy())
                {
                    matches = stack.Match(@"\)@(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?");
                    if (!matches.IsTruthy())
                    {
                        return null;
                    }
                }
            }
            return matches[1];
        }

        private static void CheckFontLoad()
        {
            var isWorker = Script.Write<bool>("untyped __js__(\"typeof(WorkerGlobalScope) !== 'undefined' && self instanceof WorkerGlobalScope\")");
            if (isWorker)
            {
                // no web fonts in web worker
                IsFontLoaded = false;
                return;
            }

            var cssFontLoadingModuleSupported = Browser.Document.Fonts.IsTruthy() && Browser.Document.Fonts.Member<object>("load").IsTruthy();
            if (cssFontLoadingModuleSupported)
            {
                Action checkFont = null;
                checkFont = () =>
                {
                    Browser.Document.Fonts.Load("1em alphaTab").Then(_ =>
                    {
                        if (Browser.Document.Fonts.Check("1em alphaTab"))
                        {
                            IsFontLoaded = true;
                        }
                        else
                        {
                            Browser.Window.SetTimeout((Action)(() =>
                            {
                                checkFont();
                            }), 250);

                        }
                        return true;
                    });
                };
                checkFont();
            }
            else
            {
                Action checkFont = null;
                checkFont = () =>
                {
                    var document = Browser.Document;
                    var testItem = document.GetElementById("alphaTabFontChecker");

                    if (testItem == null)
                    {
                        // create a hidden element with the font style set
                        testItem = document.CreateElement("div");
                        testItem.SetAttribute("id", "alphaTabFontChecker");
                        testItem.Style.Opacity = "0";
                        testItem.Style.Position = "absolute";
                        testItem.Style.Left = "0";
                        testItem.Style.Top = "0";
                        testItem.Style.FontSize = "100px";
                        testItem.ClassList.Add("at");
                        testItem.InnerHTML = "&#" + (int)MusicFontSymbol.ClefG + ";";

                        document.Body.AppendChild(testItem);
                    }

                    // get width
                    var width = testItem.OffsetWidth;
                    if (width > 30 && width < 100)
                    {
                        IsFontLoaded = true;
                        document.Body.RemoveChild(testItem);
                    }
                    else
                    {
                        Browser.Window.SetTimeout((Action)(() =>
                        {
                            checkFont();
                        }), 250);
                    }
                };
                Browser.Window.AddEventListener("DOMContentLoaded", (Action)(() =>
                {
                    checkFont();
                }));
            }
        }
    }
}
