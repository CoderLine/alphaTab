using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlphaTab.Xml;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Xml
{
    [TestClass]
    public class XmlParseTest
    {
        [TestMethod]
        public void ParseSimple()
        {
            var s = "<root></root>";
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
            Assert.AreEqual("root", xml.DocumentElement.LocalName);
            Assert.AreEqual(0, xml.DocumentElement.ChildNodes.Count);
        }

        [TestMethod]
        public void ParseShorthand()
        {
            var s = "<root />";
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
            Assert.AreEqual("root", xml.DocumentElement.LocalName);
            Assert.AreEqual(0, xml.DocumentElement.ChildNodes.Count);
        }

        [TestMethod]
        public void ParseSingleAttribute()
        {
            var s = "<root att=\"v\"></root>";
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
            Assert.AreEqual("root", xml.DocumentElement.LocalName);
            Assert.AreEqual("v", xml.DocumentElement.GetAttribute("att"));
            Assert.AreEqual(0, xml.DocumentElement.ChildNodes.Count);
        }

        [TestMethod]
        public void ParseMultipleAttributes()
        {
            var s = "<root att=\"v\" att2=\"v2\"></root>";
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
            Assert.AreEqual("root", xml.DocumentElement.LocalName);
            Assert.AreEqual("v", xml.DocumentElement.GetAttribute("att"));
            Assert.AreEqual("v2", xml.DocumentElement.GetAttribute("att2"));
            Assert.AreEqual(0, xml.DocumentElement.ChildNodes.Count);
        }

        [TestMethod]
        public void ParseSimpleText()
        {
            var s = "<root>Text</root>";
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
            Assert.AreEqual("root", xml.DocumentElement.LocalName);
            Assert.AreEqual(1, xml.DocumentElement.ChildNodes.Count);
            Assert.AreEqual(XmlNodeType.Text, xml.DocumentElement.ChildNodes[0].NodeType);
            Assert.AreEqual("Text", xml.DocumentElement.ChildNodes[0].Value);
        }

        [TestMethod]
        public void ParseChild()
        {
            var s = "<root><cc></cc></root>";
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
            Assert.AreEqual("root", xml.DocumentElement.LocalName);
            Assert.AreEqual(1, xml.DocumentElement.ChildNodes.Count);
            Assert.AreEqual(XmlNodeType.Element, xml.DocumentElement.ChildNodes[0].NodeType);
            Assert.AreEqual("cc", xml.DocumentElement.ChildNodes[0].LocalName);
        }

        [TestMethod]
        public void ParseMultiChild()
        {
            var s = "<root><cc></cc><cc></cc></root>";
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
            Assert.AreEqual("root", xml.DocumentElement.LocalName);
            Assert.AreEqual(2, xml.DocumentElement.ChildNodes.Count);
            Assert.AreEqual(XmlNodeType.Element, xml.DocumentElement.ChildNodes[0].NodeType);
            Assert.AreEqual("cc", xml.DocumentElement.ChildNodes[0].LocalName);
            Assert.AreEqual(XmlNodeType.Element, xml.DocumentElement.ChildNodes[1].NodeType);
            Assert.AreEqual("cc", xml.DocumentElement.ChildNodes[1].LocalName);
        }

        [TestMethod]
        public void ParseComments()
        {
            var s = "<!-- some comment --><test><cc c=\"d\"><!-- some comment --></cc><!-- some comment --><cc>value<!-- some comment --></cc></test><!-- ending -->";
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
            Assert.AreEqual("test", xml.DocumentElement.LocalName);
            Assert.AreEqual(2, xml.DocumentElement.ChildNodes.Count);
            Assert.AreEqual(XmlNodeType.Element, xml.DocumentElement.ChildNodes[0].NodeType);
            Assert.AreEqual("cc", xml.DocumentElement.ChildNodes[0].LocalName);
            Assert.AreEqual("d", xml.DocumentElement.ChildNodes[0].GetAttribute("c"));
            Assert.AreEqual(XmlNodeType.Element, xml.DocumentElement.ChildNodes[1].NodeType);
            Assert.AreEqual("cc", xml.DocumentElement.ChildNodes[1].LocalName);
            Assert.AreEqual(1, xml.DocumentElement.ChildNodes[1].ChildNodes.Count);
            Assert.AreEqual(XmlNodeType.Text, xml.DocumentElement.ChildNodes[1].ChildNodes[0].NodeType);
            Assert.AreEqual("value", xml.DocumentElement.ChildNodes[1].ChildNodes[0].Value);
        }

        [TestMethod]
        public void ParseDoctype()
        {
            var s = "<!DOCTYPE html><test><cc></cc><cc></cc></test>";
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
            Assert.AreEqual("test", xml.DocumentElement.LocalName);
            Assert.AreEqual(2, xml.DocumentElement.ChildNodes.Count);
            Assert.AreEqual(XmlNodeType.Element, xml.DocumentElement.ChildNodes[0].NodeType);
            Assert.AreEqual("cc", xml.DocumentElement.ChildNodes[0].LocalName);
            Assert.AreEqual(XmlNodeType.Element, xml.DocumentElement.ChildNodes[1].NodeType);
            Assert.AreEqual("cc", xml.DocumentElement.ChildNodes[1].LocalName);
        }

        [TestMethod]
        public void ParseXmlHeadTest()
        {
            var s = "<?xml version=\"1.0\" encoding=\"utf-8\"`?><root></root>";
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
            Assert.AreEqual("root", xml.DocumentElement.LocalName);
        }

        [TestMethod]
        public void ParseFull()
        {
            var s = File.ReadAllText("TestFiles\\Xml\\GPIF.xml");
            var xml = new XmlDocument(s);
            Assert.IsNotNull(xml.DocumentElement);
        }
    }
}
