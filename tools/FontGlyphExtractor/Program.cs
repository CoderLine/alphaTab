using System.Dynamic;
using System.IO;
using System.Linq;
using System.Xml.Linq;
using System.Xml.XPath;

namespace FontGlyphExtractor
{
    class Program
    {
        static void Main(string[] args)
        {
            string inputSvg = args[0];
            string outputTemplate = args[1];
            RunExport(inputSvg, outputTemplate);
        }

        private static string SvgNs;
        private static string InkscapeNs;

        private static void RunExport(string inputSvg, string outputTemplate)
        {
            FileInfo info = new FileInfo(string.Format(outputTemplate, "Test"));
            if (!info.Directory.Exists)
            {
                Directory.CreateDirectory(info.DirectoryName);
            }

            XDocument document = XDocument.Load(inputSvg);
            XElement root = document.Root;

            SvgNs = root.GetNamespaceOfPrefix("svg").NamespaceName;
            InkscapeNs = root.GetNamespaceOfPrefix("inkscape").NamespaceName;

            var glyphs = root.Elements(XName.Get("g", SvgNs))
                .Where(g => g.Attribute(XName.Get("groupmode", InkscapeNs)).Value == "layer");
            foreach (var glyph in glyphs)
            {
                string target = string.Format(outputTemplate, glyph.Attribute(XName.Get("id")).Value);
                ExportGlyph(document.Root, glyph, target);
            }
        }

        private static void ExportGlyph(XElement root, XElement glyph, string target)
        {
            XDocument document = new XDocument();

            XElement r = new XElement("svg",
                new XAttribute("version", "1.1"),
                new XAttribute("x", root.Attribute(XName.Get("x")).Value),
                new XAttribute("y", root.Attribute(XName.Get("y")).Value),
                new XAttribute("width", root.Attribute(XName.Get("width")).Value),
                new XAttribute("height", root.Attribute(XName.Get("height")).Value),
                new XAttribute("viewBox", root.Attribute(XName.Get("viewBox")).Value));
            document.Add(r);

            XElement path = glyph.Descendants(XName.Get("path", SvgNs)).First();

            XElement g = new XElement("g",
                new XAttribute("id", glyph.Attribute(XName.Get("id")).Value),
                new XElement("path",
                    new XAttribute("d", path.Attribute(XName.Get("d")).Value),
                    new XAttribute("style", "fill:#000000")
                )
            );
            r.Add(g);

            document.Save(target);
        }
    }
}
