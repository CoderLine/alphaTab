package alphaTab.test.xml;

using system.HaxeExtensions;
class XmlParseTest
{
    @Test
    public function ParseSimple() : Void 
    {
        var s : system.CsString = "<root></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
        massive.munit.Assert.areEqual("root", xml.DocumentElement.LocalName);
        massive.munit.Assert.areEqual(0, xml.DocumentElement.ChildNodes.Count);
    }

    @Test
    public function ParseShorthand() : Void 
    {
        var s : system.CsString = "<root />";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
        massive.munit.Assert.areEqual("root", xml.DocumentElement.LocalName);
        massive.munit.Assert.areEqual(0, xml.DocumentElement.ChildNodes.Count);
    }

    @Test
    public function ParseSingleAttribute() : Void 
    {
        var s : system.CsString = "<root att=\"v\"></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
        massive.munit.Assert.areEqual("root", xml.DocumentElement.LocalName);
        massive.munit.Assert.areEqual("v", xml.DocumentElement.GetAttribute("att"));
        massive.munit.Assert.areEqual(0, xml.DocumentElement.ChildNodes.Count);
    }

    @Test
    public function ParseMultipleAttributes() : Void 
    {
        var s : system.CsString = "<root att=\"v\" att2=\"v2\"></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
        massive.munit.Assert.areEqual("root", xml.DocumentElement.LocalName);
        massive.munit.Assert.areEqual("v", xml.DocumentElement.GetAttribute("att"));
        massive.munit.Assert.areEqual("v2", xml.DocumentElement.GetAttribute("att2"));
        massive.munit.Assert.areEqual(0, xml.DocumentElement.ChildNodes.Count);
    }

    @Test
    public function ParseSimpleText() : Void 
    {
        var s : system.CsString = "<root>Text</root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
        massive.munit.Assert.areEqual("root", xml.DocumentElement.LocalName);
        massive.munit.Assert.areEqual(1, xml.DocumentElement.ChildNodes.Count);
        massive.munit.Assert.areEqual(alphaTab.xml.XmlNodeType.Text, xml.DocumentElement.ChildNodes.get_Item(0).NodeType);
        massive.munit.Assert.areEqual("Text", xml.DocumentElement.ChildNodes.get_Item(0).Value);
    }

    @Test
    public function ParseChild() : Void 
    {
        var s : system.CsString = "<root><cc></cc></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
        massive.munit.Assert.areEqual("root", xml.DocumentElement.LocalName);
        massive.munit.Assert.areEqual(1, xml.DocumentElement.ChildNodes.Count);
        massive.munit.Assert.areEqual(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(0).NodeType);
        massive.munit.Assert.areEqual("cc", xml.DocumentElement.ChildNodes.get_Item(0).LocalName);
    }

    @Test
    public function ParseMultiChild() : Void 
    {
        var s : system.CsString = "<root><cc></cc><cc></cc></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
        massive.munit.Assert.areEqual("root", xml.DocumentElement.LocalName);
        massive.munit.Assert.areEqual(2, xml.DocumentElement.ChildNodes.Count);
        massive.munit.Assert.areEqual(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(0).NodeType);
        massive.munit.Assert.areEqual("cc", xml.DocumentElement.ChildNodes.get_Item(0).LocalName);
        massive.munit.Assert.areEqual(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(1).NodeType);
        massive.munit.Assert.areEqual("cc", xml.DocumentElement.ChildNodes.get_Item(1).LocalName);
    }

    @Test
    public function ParseComments() : Void 
    {
        var s : system.CsString = "<!-- some comment --><test><cc c=\"d\"><!-- some comment --></cc><!-- some comment --><cc>value<!-- some comment --></cc></test><!-- ending -->";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
        massive.munit.Assert.areEqual("test", xml.DocumentElement.LocalName);
        massive.munit.Assert.areEqual(2, xml.DocumentElement.ChildNodes.Count);
        massive.munit.Assert.areEqual(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(0).NodeType);
        massive.munit.Assert.areEqual("cc", xml.DocumentElement.ChildNodes.get_Item(0).LocalName);
        massive.munit.Assert.areEqual("d", xml.DocumentElement.ChildNodes.get_Item(0).GetAttribute("c"));
        massive.munit.Assert.areEqual(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(1).NodeType);
        massive.munit.Assert.areEqual("cc", xml.DocumentElement.ChildNodes.get_Item(1).LocalName);
        massive.munit.Assert.areEqual(1, xml.DocumentElement.ChildNodes.get_Item(1).ChildNodes.Count);
        massive.munit.Assert.areEqual(alphaTab.xml.XmlNodeType.Text, xml.DocumentElement.ChildNodes.get_Item(1).ChildNodes.get_Item(0).NodeType);
        massive.munit.Assert.areEqual("value", xml.DocumentElement.ChildNodes.get_Item(1).ChildNodes.get_Item(0).Value);
    }

    @Test
    public function ParseDoctype() : Void 
    {
        var s : system.CsString = "<!DOCTYPE html><test><cc></cc><cc></cc></test>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
        massive.munit.Assert.areEqual("test", xml.DocumentElement.LocalName);
        massive.munit.Assert.areEqual(2, xml.DocumentElement.ChildNodes.Count);
        massive.munit.Assert.areEqual(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(0).NodeType);
        massive.munit.Assert.areEqual("cc", xml.DocumentElement.ChildNodes.get_Item(0).LocalName);
        massive.munit.Assert.areEqual(alphaTab.xml.XmlNodeType.Element, xml.DocumentElement.ChildNodes.get_Item(1).NodeType);
        massive.munit.Assert.areEqual("cc", xml.DocumentElement.ChildNodes.get_Item(1).LocalName);
    }

    @Test
    public function ParseXmlHeadTest() : Void 
    {
        var s : system.CsString = "<?xml version=\"1.0\" encoding=\"utf-8\"`?><root></root>";
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
        massive.munit.Assert.areEqual("root", xml.DocumentElement.LocalName);
    }

    @Test
    public function ParseFull() : Void 
    {
        var s : system.CsString = alphaTab.test.TestPlatform.LoadFileAsString("TestFiles\\Xml\\GPIF.xml");
        var xml : alphaTab.xml.XmlDocument = new alphaTab.xml.XmlDocument(s);
        massive.munit.Assert.isNotNull(xml.DocumentElement);
    }

    public function new() 
    {
    }

}
