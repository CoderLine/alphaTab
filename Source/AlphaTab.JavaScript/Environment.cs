/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Platform;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering.Glyphs;
using SharpKit.Html;
using SharpKit.JavaScript;
using StringBuilder = AlphaTab.Collections.StringBuilder;

namespace AlphaTab
{
    /// <summary>
    /// This public class represents the global alphaTab environment where
    /// alphaTab looks for information like available layout engines
    /// staves etc.
    /// </summary>
    public partial class Environment
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

            JsContext.JsCode("Math.log2 = Math.log2 || function(x) { return Math.log(x) * Math.LOG2E; };");

            // try to build the find the alphaTab script url in case we are not in the webworker already
            if (HtmlContext.self.document.As<bool>())
            {
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
                HtmlContext.document.write(vbAjaxLoader.ToString());

                var scriptElement = HtmlContext.document.Member("currentScript").As<HtmlScriptElement>();
                if (!scriptElement.As<bool>())
                {
                    // try to get javascript from exception stack
                    try
                    {
                        var error = new JsError();
                        var stack = error.Member("stack");
                        if (!stack.As<bool>())
                        {
                            throw error;
                        }

                        ScriptFile = ScriptFileFromStack(stack.As<JsString>());
                    }
                    catch (JsError e)
                    {
                        var stack = e.Member("stack");
                        if (!stack.As<bool>())
                        {
                            scriptElement =
                                HtmlContext.document.querySelector("script[data-alphatab]").As<HtmlScriptElement>();
                        }
                        else
                        {
                            ScriptFile = ScriptFileFromStack(stack.As<JsString>());
                        }
                    }
                }

                // failed to automatically resolve
                if (string.IsNullOrEmpty(ScriptFile))
                {
                    if (!scriptElement.As<bool>())
                    {
                        HtmlContext.console.warn(
                            "Could not automatically find alphaTab script file for worker, please add the data-alphatab attribute to the script tag that includes alphaTab or provide it when initializing alphaTab");
                    }
                    else
                    {
                        ScriptFile = scriptElement.src;
                    }
                }
            }
        }

        // based on https://github.com/JamesMGreene/currentExecutingScript
        private static string ScriptFileFromStack(JsString stack)
        {
            var matches = stack.match(@"(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?");
            if (!matches.As<bool>())
            {
                matches = stack.match(@"^(?:|[^:@]*@|.+\)@(?=data:text\/javascript|blob|http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?");
                if (!matches.As<bool>())
                {
                    matches = stack.match(@"\)@(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?");
                    if (!matches.As<bool>())
                    {
                        return null;
                    }
                }
            }
            return matches[1];
        }

        private static void CheckFontLoad()
        {
            var isWorker = JsContext.JsCode("typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope").As<bool>();
            if (isWorker)
            {
                // no web fonts in web worker
                IsFontLoaded = false;
                return;
            }


            var cssFontLoadingModuleSupported = JsContext.JsCode("!!document.fonts && !!document.fonts.load").As<bool>();
            if (cssFontLoadingModuleSupported)
            {
                // ReSharper disable once UnusedVariable
                JsFunc<bool> onLoaded = () =>
                {
                    IsFontLoaded = true;
                    return true;
                };
                JsContext.JsCode("document.fonts.load('1em alphaTab').then(onLoaded)");
            }
            else
            {
                Action checkFont = null;
                checkFont = () =>
                {
                    var testItem = HtmlContext.document.getElementById("alphaTabFontChecker").As<HtmlDivElement>();

                    if (testItem == null)
                    {
                        // create a hidden element with the font style set
                        testItem = HtmlContext.document.createElement("div").As<HtmlDivElement>();
                        testItem.setAttribute("id", "alphaTabFontChecker");
                        testItem.style.opacity = "0";
                        testItem.style.position = "absolute";
                        testItem.style.left = "0";
                        testItem.style.top = "0";
                        testItem.style.fontSize = "100px";
                        testItem.classList.add("at");
                        testItem.innerHTML = "&#" + (int)MusicFontSymbol.ClefG + ";";

                        HtmlContext.document.body.appendChild(testItem);
                    }

                    // get width
                    var width = testItem.offsetWidth;
                    if (width > 30 && width < 100)
                    {
                        IsFontLoaded = true;
                        HtmlContext.document.body.removeChild(testItem);
                    }
                    else
                    {
                        HtmlContext.window.setTimeout(() =>
                        {
                            checkFont();
                        }, 1000);
                    }
                };
                HtmlContext.window.addEventListener("DOMContentLoaded", e =>
                {
                    checkFont();
                });
            }
        }
    }
}
