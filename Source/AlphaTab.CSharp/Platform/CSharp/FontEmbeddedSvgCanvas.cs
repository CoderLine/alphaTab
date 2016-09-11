using System;
using System.IO;
using System.Net;
using System.Security;
using System.Text;
using System.Xml;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using StringBuilder = AlphaTab.Collections.StringBuilder;

namespace AlphaTab.Platform.CSharp
{
    /// <summary>
    /// This SVG canvas embedds the SVG font directly into the produced SVG.
    /// Due to the SVG opening tag that is generated, before the first actual rendering, 
    /// the output of this canvas is no valid XML until the music sheet is completely rendered. 
    /// </summary>
    public class FontEmbeddedSvgCanvas : FontSvgCanvas
    {
        private static readonly Util.Lazy<string> SvgFontString;
        private static string SvgFontName;

        static FontEmbeddedSvgCanvas()
        {
            SvgFontString = new Util.Lazy<string>(LoadSvgFontString);
        }

        private static string LoadSvgFontString()
        {
            using (var svg = typeof(FontEmbeddedSvgCanvas).Assembly.GetManifestResourceStream(typeof(FontEmbeddedSvgCanvas), "Bravura.svg"))
            {
                var xmlReader = new XmlTextReader(new StreamReader(svg));
                xmlReader.DtdProcessing = DtdProcessing.Ignore;

                var dom = new XmlDocument();
                dom.Load(xmlReader);
                var defs = (XmlElement)dom.DocumentElement.GetElementsByTagName("defs")[0];
                var svgFontName = defs.GetElementsByTagName("font")[0].Attributes["id"].Value;

                var styleTag = dom.CreateElement("style", defs.NamespaceURI);
                styleTag.SetAttribute("type", "text/css");
                styleTag.InnerText = "@font-face { font-family: \"at\"; src: url(#" + svgFontName + ") format('svg'); } .at { overflow: visible; font-family: 'at'; font-size: 34px; } ";
                defs.AppendChild(styleTag);

                return defs.OuterXml;
            }
        }

        public override object OnPreRender()
        {
            // build SVG start tag including SVG font
            var buffer = new StringBuilder();
            buffer.Append("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" class=\"alphaTabWrapperSvg\">");
            buffer.Append(SvgFontString.Value);
            return buffer.ToString();
        }

        public override object OnRenderFinished()
        {
            return "</svg>";
        }
    }
}
