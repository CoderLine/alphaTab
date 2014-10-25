/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Text.RegularExpressions;
using AlphaTab.Collections;
using AlphaTab.IO;
using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Platform.JavaScript
{
    /// <summary>
    /// This is a fileloader implementation for JavaScript.
    /// It uses a ajax request in case of modern browsers like Firefox or Chrome. 
    /// For IE a VBScript is used to load a binary stream. 
    /// </summary>
    public class JsFileLoader : HtmlContext, IFileLoader
    {
        // http://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx
        public static float GetIEVersion()
        {
            float rv = -1;
            var appName = navigator.appName;
            string agent = navigator.userAgent;
            if (appName == "Microsoft Internet Explorer")
            {
                var r = new JsRegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
                var m = r.exec(agent);
                if (m != null)
                {
                    rv = Std.ParseFloat(m[1]);
                }
            }
            return rv;
        }

        [JsMethod(InlineCodeExpression = "VbAjaxLoader(method, path)", Export = false)]
        private dynamic VbAjaxLoader(string method, string path)
        {
            return null;
        }

        [JsMethod(InlineCodeExpression = "new Uint8Array(arrayBuffer)", Export = false)]
        private byte[] NewUint8Array(object arrayBuffer)
        {
            return null;
        }

        public byte[] LoadBinary(string path)
        {
            var ie = GetIEVersion();
            if (ie >= 0 && ie <= 9)
            {
                // use VB Loader to load binary array
                dynamic vbArr = VbAjaxLoader("GET", path);
                var fileContents = vbArr.toArray();

                // decode byte array to string
                var data = new StringBuilder();
                var i = 0;
                while (i < (fileContents.length - 1))
                {
                    data.AppendChar((char)(fileContents[i]));
                    i++;
                }

                var reader = GetBytesFromString(data.ToString());
                return reader;
            }

            XMLHttpRequest xhr = new XMLHttpRequest();
            xhr.open("GET", path, false);
            xhr.responseType = "arraybuffer";
            xhr.send();

            if (xhr.status == 200)
            {
                var reader = NewUint8Array(xhr.response);
                return reader;
            }
            // Error handling
            if (xhr.status == 0)
            {
                throw new FileLoadException("You are offline!!\n Please Check Your Network.");
            }
            if (xhr.status == 404)
            {
                throw new FileLoadException("Requested URL not found.");
            }
            if (xhr.status == 500)
            {
                throw new FileLoadException("Internel Server Error.");
            }
            if (xhr.statusText == "parsererror")
            {
                throw new FileLoadException("Error.\nParsing JSON Request failed.");
            }
            if (xhr.statusText == "timeout")
            {
                throw new FileLoadException("Request Time out.");
            }
            throw new FileLoadException("Unknow Error: " + xhr.responseText);
        }

        public void LoadBinaryAsync(string path, Action<byte[]> success, Action<Exception> error)
        {
            var ie = GetIEVersion();
            if (ie >= 0 && ie <= 9)
            {
                // use VB Loader to load binary array
                dynamic vbArr = VbAjaxLoader("GET", path);
                var fileContents = vbArr.toArray();

                // decode byte array to string
                var data = new StringBuilder();
                var i = 0;
                while (i < (fileContents.length - 1))
                {
                    data.Append(((char)(fileContents[i])));
                    i++;
                }

                var reader = GetBytesFromString(data.ToString());
                success(reader);
            }
            else
            {
                XMLHttpRequest xhr = new XMLHttpRequest();
                xhr.onreadystatechange = e =>
                {
                    if (xhr.readyState == 4)
                    {
                        if (xhr.status == 200)
                        {
                            var reader = NewUint8Array(xhr.response);
                            success(reader);
                        }
                        // Error handling
                        else if (xhr.status == 0)
                        {
                            error(new FileLoadException("You are offline!!\n Please Check Your Network."));
                        }
                        else if (xhr.status == 404)
                        {
                            error(new FileLoadException("Requested URL not found."));
                        }
                        else if (xhr.status == 500)
                        {
                            error(new FileLoadException("Internel Server Error."));
                        }
                        else if (xhr.statusText == "parsererror")
                        {
                            error(new FileLoadException("Error.\nParsing JSON Request failed."));
                        }
                        else if (xhr.statusText == "timeout")
                        {
                            error(new FileLoadException("Request Time out."));
                        }
                        else
                        {
                            error(new FileLoadException("Unknow Error: " + xhr.responseText));
                        }
                    }
                };
                xhr.open("GET", path, true);
                xhr.responseType = "arraybuffer";
                xhr.send();
            }
        }

        private static byte[] GetBytesFromString(string s)
        {
            byte[] b = new byte[s.Length];
            for (int i = 0; i < s.Length; i++)
            {
                b[i] = (byte)s[i];
            }
            return b;
        }
    }
}