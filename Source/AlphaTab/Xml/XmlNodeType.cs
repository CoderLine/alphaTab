namespace AlphaTab.Xml
{
    public enum XmlNodeType
    {
        None,
        Element,
        Attribute,
        Text,
        CDATA,
        EntityReference,
        Entity,
        ProcessingInstruction,
        Comment,
        Document,
        DocumentType,
        DocumentFragment,
        Notation,
        Whitespace,
        SignificantWhitespace,
        EndElement,
        EndEntity,
        XmlDeclaration
    }
}