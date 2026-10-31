/**
 * The types of nodes in a {@link XmlNode} tree.
 * @internal
 */
export enum XmlNodeType {
    Element = 0,
    Document = 1,
    Comment = 2,
    DocumentType = 3
}

/**
 * A node of a lightweight XML tree tailored to the data oriented XML formats alphaTab reads and writes
 * (MusicXML, Guitar Pro GPIF, Capella).
 *
 * These formats do not use mixed content, hence character data is not represented as own nodes but
 * as text of the element containing it:
 * - Each run of character data between markup is trimmed, runs with only whitespace (formatting) are dropped.
 * - CDATA sections are kept as written.
 * - The text of an element is the concatenation of its runs and CDATA sections.
 *
 * Comments and processing instructions are skipped while parsing, comments can be added for writing.
 * @internal
 */
export class XmlNode {
    private static readonly _noNodes: XmlNode[] = [];

    private _text: string | null = null;
    private _isCData: boolean = false;
    private _attributes: Map<string, string> | null = null;
    private _childNodes: XmlNode[] | null = null;
    // only separated from the child nodes when non-element children (comments, doctype) are added
    private _childElements: XmlNode[] | null = null;

    /**
     * The type of this node.
     */
    public nodeType: XmlNodeType;

    /**
     * The name of an element node, empty for other node types.
     */
    public localName: string;

    public constructor(nodeType: XmlNodeType = XmlNodeType.Element, localName: string = '') {
        this.nodeType = nodeType;
        this.localName = localName;
    }

    /**
     * All child nodes in document order. The returned list must not be modified, use {@link addChild}.
     */
    public get childNodes(): XmlNode[] {
        return this._childNodes ?? XmlNode._noNodes;
    }

    /**
     * The child element nodes in document order. The returned list must not be modified, use {@link addChild}.
     */
    public childElements(): XmlNode[] {
        return this._childElements ?? this._childNodes ?? XmlNode._noNodes;
    }

    /**
     * The first child element or null if there is none.
     */
    public get firstElement(): XmlNode | null {
        const elements = this.childElements();
        return elements.length > 0 ? elements[0] : null;
    }

    /**
     * Whether any attributes are set on this node.
     */
    public get hasAttributes(): boolean {
        return this._attributes !== null && this._attributes.size > 0;
    }

    /**
     * The attributes of this node.
     */
    public get attributes(): Map<string, string> {
        let attributes = this._attributes;
        if (attributes === null) {
            attributes = new Map<string, string>();
            this._attributes = attributes;
        }
        return attributes;
    }

    /**
     * Gets the value of the attribute with the given name or the default value if the attribute is not set.
     */
    public getAttribute(name: string, defaultValue: string = ''): string {
        const attributes = this._attributes;
        if (attributes !== null && attributes.has(name)) {
            return attributes.get(name)!;
        }
        return defaultValue;
    }

    /**
     * Whether the text of this node was written as CDATA section.
     */
    public get isCData(): boolean {
        return this._isCData;
    }

    /**
     * Whether a text was set for this node (also if it is empty).
     */
    public get hasText(): boolean {
        return this._text !== null;
    }

    /**
     * The text of this node. For elements with child elements, the texts of the children are appended.
     * Setting the text removes all child nodes.
     */
    public get innerText(): string {
        const text = this._text ?? '';
        const elements = this.childElements();
        if (elements.length === 0) {
            return text;
        }

        let result = text;
        for (const e of elements) {
            result += e.innerText;
        }
        return result;
    }

    public set innerText(value: string) {
        this._text = value;
        this._isCData = false;
        this._childNodes = null;
        this._childElements = null;
    }

    /**
     * Sets the text of this node to be written as CDATA section. Removes all child nodes.
     */
    public setCData(value: string) {
        this.innerText = value;
        this._isCData = true;
    }

    /**
     * Appends the given character data to the text of this node.
     * @param text The text to append.
     * @param isCData Whether the text originates from a CDATA section.
     */
    public appendText(text: string, isCData: boolean) {
        const current = this._text;
        this._text = current === null ? text : current + text;
        if (isCData) {
            this._isCData = true;
        }
    }

    public addChild(node: XmlNode): void {
        let childNodes = this._childNodes;
        if (childNodes === null) {
            childNodes = [];
            this._childNodes = childNodes;
        }

        const childElements = this._childElements;
        if (node.nodeType === XmlNodeType.Element) {
            // separate list only exists after a non element child was added
            if (childElements !== null) {
                childElements.push(node);
            }
        } else if (childElements === null) {
            this._childElements = childNodes.slice();
        }

        childNodes.push(node);
    }

    /**
     * Creates a new element with the given name and adds it as child.
     */
    public addElement(name: string): XmlNode {
        const element = new XmlNode(XmlNodeType.Element, name);
        this.addChild(element);
        return element;
    }

    /**
     * Finds the first child element with the given name.
     */
    public findChildElement(name: string): XmlNode | null {
        for (const e of this.childElements()) {
            if (e.localName === name) {
                return e;
            }
        }
        return null;
    }

    /**
     * Collects all child elements with the given name.
     * @param name The name of the elements.
     * @param recursive Whether to also search the descendants of the child elements.
     */
    public getElementsByTagName(name: string, recursive: boolean = false): XmlNode[] {
        const result: XmlNode[] = [];
        this._collectElementsByTagName(result, name, recursive);
        return result;
    }

    private _collectElementsByTagName(result: XmlNode[], name: string, recursive: boolean) {
        for (const e of this.childElements()) {
            if (e.localName === name) {
                result.push(e);
            }
            if (recursive) {
                e._collectElementsByTagName(result, name, true);
            }
        }
    }
}
