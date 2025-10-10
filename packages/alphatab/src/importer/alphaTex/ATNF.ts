import { AlphaTexBackSlashTokenNode, AlphaTexBraceCloseTokenNode, AlphaTexBraceOpenTokenNode, AlphaTexIdentifier, AlphaTexMetaDataNode, AlphaTexMetaDataTagNode, AlphaTexNodeType, AlphaTexNumberLiteral, AlphaTexParenthesisCloseTokenNode, AlphaTexParenthesisOpenTokenNode, AlphaTexPropertiesNode, AlphaTexPropertyNode, AlphaTexStringLiteral, AlphaTexValueList, IAlphaTexValueListItem } from "@src/importer/alphaTex/AlphaTexAst";

/**
 * AlphaTexNodeFactory (short name for less code)
 */
export class ATNF {
    static identifier(text: string): AlphaTexIdentifier {
        return {
            nodeType: AlphaTexNodeType.Identifier,
            text
        } as AlphaTexIdentifier;
    }
    static stringLiteral(text: string): AlphaTexStringLiteral {
        return { nodeType: AlphaTexNodeType.StringLiteral, text } as AlphaTexStringLiteral;
    }
    static numberLiteral(value: number): AlphaTexNumberLiteral {
        return {
            nodeType: AlphaTexNodeType.NumberLiteral,
            value
        } as AlphaTexNumberLiteral;
    }

    public static metaData(
        tag: string,
        values?: AlphaTexValueList,
        properties?: AlphaTexPropertiesNode
    ): AlphaTexMetaDataNode {
        return {
            nodeType: AlphaTexNodeType.MetaData,
            tag: {
                nodeType: AlphaTexNodeType.MetaDataTag,
                prefix: {
                    nodeType: AlphaTexNodeType.BackSlashToken
                } as AlphaTexBackSlashTokenNode,
                tag: {
                    nodeType: AlphaTexNodeType.Identifier,
                    text: tag
                } as AlphaTexIdentifier
            } as AlphaTexMetaDataTagNode,
            values,
            properties,
            propertiesBeforeValues: false
        } as AlphaTexMetaDataNode;
    }

    public static identifierMetaData(tag: string, value: string): AlphaTexMetaDataNode {
        return ATNF.metaData(tag, ATNF.identifierValueList(value));
    }

    public static numberMetaData(tag: string, value: number): AlphaTexMetaDataNode {
        return ATNF.metaData(tag, ATNF.numberValueList(value));
    }

    public static valueList(parenthesis: boolean, values: (IAlphaTexValueListItem | undefined)[]): AlphaTexValueList {
        const valueList = {
            nodeType: AlphaTexNodeType.ValueList,
            values: values.filter(v => v !== undefined)
        } as AlphaTexValueList;

        if (parenthesis) {
            valueList.openParenthesis = {
                nodeType: AlphaTexNodeType.ParenthesisOpenToken
            } as AlphaTexParenthesisOpenTokenNode;
            valueList.closeParenthesis = {
                nodeType: AlphaTexNodeType.ParenthesisCloseToken
            } as AlphaTexParenthesisCloseTokenNode;
        }

        return valueList;
    }

    public static stringValueList(text: string): AlphaTexValueList {
        return ATNF.valueList(false, [ATNF.stringLiteral(text)]);
    }

    public static identifierValueList(text: string): AlphaTexValueList {
        return ATNF.valueList(false, [ATNF.identifier(text)]);
    }

    public static numberValueList(value: number): AlphaTexValueList {
        return ATNF.valueList(false, [ATNF.numberLiteral(value)]);
    }

    public static properties(
        properties: ([string, AlphaTexValueList | undefined] | undefined)[]
    ): AlphaTexPropertiesNode {
        const node = {
            nodeType: AlphaTexNodeType.Properties,
            properties: [],
            openBrace: {
                nodeType: AlphaTexNodeType.BraceOpenToken
            } as AlphaTexBraceOpenTokenNode,
            closeBrace: {
                nodeType: AlphaTexNodeType.BraceCloseToken
            } as AlphaTexBraceCloseTokenNode
        } as AlphaTexPropertiesNode;

        for (const p of properties) {
            if (p) {
                node.properties.push({
                    nodeType: AlphaTexNodeType.Property,
                    property: ATNF.identifier(p[0]),
                    values: p[1]
                } as AlphaTexPropertyNode);
            }
        }

        return node;
    }

    public static property(properties: AlphaTexPropertyNode[], identifier: string, values?: AlphaTexValueList) {
        properties.push({
            nodeType: AlphaTexNodeType.Property,
            property: ATNF.identifier(identifier),
            values
        });
    }
}
