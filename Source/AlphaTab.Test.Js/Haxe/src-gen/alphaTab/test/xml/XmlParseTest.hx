package alphaTab.test.xml;

using system.HaxeExtensions;
@:testClass
class XmlParseTest
{
    @:testMethod
    public function ParseSimple() : Void 
    {
        var s : system.CsString = "<root></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
        alphaTab.test.Assert.AreEqual_T1_T22("root", xml.DocumentElement.LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22(0, xml.DocumentElement.ChildNodes.Count);
    }

    @:testMethod
    public function ParseShorthand() : Void 
    {
        var s : system.CsString = "<root />";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
        alphaTab.test.Assert.AreEqual_T1_T22("root", xml.DocumentElement.LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22(0, xml.DocumentElement.ChildNodes.Count);
    }

    @:testMethod
    public function ParseSingleAttribute() : Void 
    {
        var s : system.CsString = "<root att=\"v\"></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
        alphaTab.test.Assert.AreEqual_T1_T22("root", xml.DocumentElement.LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22("v", xml.DocumentElement.GetAttribute("att"));
        alphaTab.test.Assert.AreEqual_T1_T22(0, xml.DocumentElement.ChildNodes.Count);
    }

    @:testMethod
    public function ParseMultipleAttributes() : Void 
    {
        var s : system.CsString = "<root att=\"v\" att2=\"v2\"></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
        alphaTab.test.Assert.AreEqual_T1_T22("root", xml.DocumentElement.LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22("v", xml.DocumentElement.GetAttribute("att"));
        alphaTab.test.Assert.AreEqual_T1_T22("v2", xml.DocumentElement.GetAttribute("att2"));
        alphaTab.test.Assert.AreEqual_T1_T22(0, xml.DocumentElement.ChildNodes.Count);
    }

    @:testMethod
    public function ParseSimpleText() : Void 
    {
        var s : system.CsString = "<root>Text</root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
        alphaTab.test.Assert.AreEqual_T1_T22("root", xml.DocumentElement.LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22(1, xml.DocumentElement.ChildNodes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.xml.XmlNodeType.Text, xml.DocumentElement.ChildNodes.get_Item(0).NodeType);
        alphaTab.test.Assert.AreEqual_T1_T22("Text", xml.DocumentElement.ChildNodes.get_Item(0).Value);
    }

    @:testMethod
    public function ParseChild() : Void 
    {
        var s : system.CsString = "<root><cc></cc></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
        alphaTab.test.Assert.AreEqual_T1_T22("root", xml.DocumentElement.LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22(1, xml.DocumentElement.ChildNodes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(0).NodeType);
        alphaTab.test.Assert.AreEqual_T1_T22("cc", xml.DocumentElement.ChildNodes.get_Item(0).LocalName);
    }

    @:testMethod
    public function ParseMultiChild() : Void 
    {
        var s : system.CsString = "<root><cc></cc><cc></cc></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
        alphaTab.test.Assert.AreEqual_T1_T22("root", xml.DocumentElement.LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22(2, xml.DocumentElement.ChildNodes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(0).NodeType);
        alphaTab.test.Assert.AreEqual_T1_T22("cc", xml.DocumentElement.ChildNodes.get_Item(0).LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(1).NodeType);
        alphaTab.test.Assert.AreEqual_T1_T22("cc", xml.DocumentElement.ChildNodes.get_Item(1).LocalName);
    }

    @:testMethod
    public function ParseComments() : Void 
    {
        var s : system.CsString = "<!-- some comment --><test><cc c=\"d\"><!-- some comment --></cc><!-- some comment --><cc>value<!-- some comment --></cc></test><!-- ending -->";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
        alphaTab.test.Assert.AreEqual_T1_T22("test", xml.DocumentElement.LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22(2, xml.DocumentElement.ChildNodes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(0).NodeType);
        alphaTab.test.Assert.AreEqual_T1_T22("cc", xml.DocumentElement.ChildNodes.get_Item(0).LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22("d", xml.DocumentElement.ChildNodes.get_Item(0).GetAttribute("c"));
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(1).NodeType);
        alphaTab.test.Assert.AreEqual_T1_T22("cc", xml.DocumentElement.ChildNodes.get_Item(1).LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22(1, xml.DocumentElement.ChildNodes.get_Item(1).ChildNodes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.xml.XmlNodeType.Text, xml.DocumentElement.ChildNodes.get_Item(1).ChildNodes.get_Item(0).NodeType);
        alphaTab.test.Assert.AreEqual_T1_T22("value", xml.DocumentElement.ChildNodes.get_Item(1).ChildNodes.get_Item(0).Value);
    }

    @:testMethod
    public function ParseDoctype() : Void 
    {
        var s : system.CsString = "<!DOCTYPE html><test><cc></cc><cc></cc></test>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
        alphaTab.test.Assert.AreEqual_T1_T22("test", xml.DocumentElement.LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22(2, xml.DocumentElement.ChildNodes.Count);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(0).NodeType);
        alphaTab.test.Assert.AreEqual_T1_T22("cc", xml.DocumentElement.ChildNodes.get_Item(0).LocalName);
        alphaTab.test.Assert.AreEqual_T1_T22(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(1).NodeType);
        alphaTab.test.Assert.AreEqual_T1_T22("cc", xml.DocumentElement.ChildNodes.get_Item(1).LocalName);
    }

    @:testMethod
    public function ParseXmlHeadTest() : Void 
    {
        var s : system.CsString = "<?xml version=\"1.0\" encoding=\"utf-8\"`?><root></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
        alphaTab.test.Assert.AreEqual_T1_T22("root", xml.DocumentElement.LocalName);
    }

    @:testMethod
    public function ParseFull() : Void 
    {
        var s : system.CsString = alphaTab.test.TestPlatform.LoadFileAsString("TestFiles\\Xml\\GPIF.xml");
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        alphaTab.test.Assert.IsNotNull(xml.DocumentElement);
    }

    public function new() 
    {
    }

}
