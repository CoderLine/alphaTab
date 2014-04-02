using System;
using System.IO;
using System.Text.RegularExpressions;

namespace AlphaTab.Platform.JavaScript
{
    /// <summary>
    /// This is a fileloader implementation for JavaScript.
    /// It uses a ajax request in case of modern browsers like Firefox or Chrome. 
    /// For IE a VBScript is used to load a binary stream. 
    /// </summary>
    public class JsFileLoader : IFileLoader
    {
        // http://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx
        public static float GetIEVersion()
        {
            float rv = -1;
            var appName = /*Navigator.appName*/ "";
            string agent = /*Navigator.userAgent*/ "";
            if (appName == "Microsoft Internet Explorer")
            {
                var m = Regex.Match(agent, "MSIE ([0-9]{1,}[\\.0-9]{0,})", RegexOptions.Compiled);
                if (m.Success)
                {
                    rv = float.Parse(m.Groups[1].Value);
                }
            }
            return rv;
        }

        public byte[] LoadBinary(string path)
        {
            var ie = GetIEVersion();
            if (ie >= 0 && ie <= 9)
            {
                // use VB Loader to load binary array
                dynamic vbArr = /*Window.eval("VbAjaxLoader('GET', path)")*/ "";
                var fileContents = vbArr.toArray();

                // decode byte array to string
                var data = "";
                var i = 0;
                while (i < (fileContents.length - 1))
                {
                    data += (char)(fileContents[i]);
                    i++;
                }

                var reader = GetBytesFromString(data);
                return reader;
            }
            dynamic /*XMLHttpRequest*/ xhr = new object/*XMLHttpRequest*/();
            xhr.open("GET", path, false);
            xhr.responseType = "arraybuffer";
            xhr.send();

            if (xhr.status == 200)
            {
                var reader = (byte[])(xhr.response);
                return (reader);
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
                dynamic vbArr = /*Window.eval("VbAjaxLoader('GET', path)")*/ "";
                var fileContents = vbArr.toArray();

                // decode byte array to string
                var data = "";
                var i = 0;
                while (i < (fileContents.length - 1))
                {
                    data += (char)(fileContents[i]);
                    i++;
                }

                var reader = GetBytesFromString(data);
                success(reader);
            }
            else
            {
                dynamic xhr = new object/*XMLHttpRequest*/();
                xhr.onreadystatechange = new Action(() =>
                {
                    if (xhr.readyState == 4)
                    {
                        if (xhr.status == 200)
                        {
                            var reader = (byte[])(xhr.response);
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
                });
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
