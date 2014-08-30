using System;
using System.Text;
using System.Text.RegularExpressions;
using System.Html;
using System.Net;
using AlphaTab.IO;

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
            var appName = System.Html.Navigator.AppName;
            string agent = System.Html.Navigator.UserAgent;
            if (appName == "Microsoft Internet Explorer")
            {
                var r = new Regex("MSIE ([0-9]{1,}[\\.0-9]{0,})");
                var m = r.Exec(agent);
                if (m != null)
                {
                    rv = Std.ParseFloat(m[1]);
                }
            }
            return rv;
        }

        [System.Runtime.CompilerServices.InlineCodeAttribute("VbAjaxLoader({method}, {path})")]
        private dynamic VbAjaxLoader(string method, string path)
        {
            return null;
        }

        [System.Runtime.CompilerServices.InlineCodeAttribute("new Uint8Array({arrayBuffer})")]
        private byte[] NewUint8Array(object arrayBuffer)
        {
            return null;
        }

        public ByteArray LoadBinary(string path)
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
                    data.Append((char)(fileContents[i]));
                    i++;
                }

                var reader = GetBytesFromString(data.ToString());
                return reader;
            }

            XmlHttpRequest xhr = new XmlHttpRequest();
            xhr.Open("GET", path, false);
            xhr.ResponseType = XmlHttpRequestResponseType.Arraybuffer;
            xhr.Send();

            if (xhr.Status == 200)
            {
                var reader = new ByteArray(NewUint8Array(xhr.Response));
                return reader;
            }
            // Error handling
            if (xhr.Status == 0)
            {
                throw new FileLoadException("You are offline!!\n Please Check Your Network.");
            }
            if (xhr.Status == 404)
            {
                throw new FileLoadException("Requested URL not found.");
            }
            if (xhr.Status == 500)
            {
                throw new FileLoadException("Internel Server Error.");
            }
            if (xhr.StatusText == "parsererror")
            {
                throw new FileLoadException("Error.\nParsing JSON Request failed.");
            }
            if (xhr.StatusText == "timeout")
            {
                throw new FileLoadException("Request Time out.");
            }
            throw new FileLoadException("Unknow Error: " + xhr.ResponseText);
        }

        public void LoadBinaryAsync(string path, Action<ByteArray> success, Action<Exception> error)
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
                XmlHttpRequest xhr = new XmlHttpRequest();
                xhr.OnReadyStateChange = e =>
                {
                    if (xhr.ReadyState == ReadyState.Done)
                    {
                        if (xhr.Status == 200)
                        {
                            var reader = new ByteArray(NewUint8Array(xhr.Response));
                            success(reader);
                        }
                        // Error handling
                        else if (xhr.Status == 0)
                        {
                            error(new FileLoadException("You are offline!!\n Please Check Your Network."));
                        }
                        else if (xhr.Status == 404)
                        {
                            error(new FileLoadException("Requested URL not found."));
                        }
                        else if (xhr.Status == 500)
                        {
                            error(new FileLoadException("Internel Server Error."));
                        }
                        else if (xhr.StatusText == "parsererror")
                        {
                            error(new FileLoadException("Error.\nParsing JSON Request failed."));
                        }
                        else if (xhr.StatusText == "timeout")
                        {
                            error(new FileLoadException("Request Time out."));
                        }
                        else
                        {
                            error(new FileLoadException("Unknow Error: " + xhr.ResponseText));
                        }
                    }
                };
                xhr.Open("GET", path, true);
                xhr.ResponseType = XmlHttpRequestResponseType.Arraybuffer;
                xhr.Send();
            }
        }

        private static ByteArray GetBytesFromString(string s)
        {
            ByteArray b = new ByteArray(s.Length);
            for (int i = 0; i < s.Length; i++)
            {
                b[i] = (byte)s[i];
            }
            return b;
        }
    }
}