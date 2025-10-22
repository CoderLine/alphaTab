import {
    type AlphaTexBackSlashTokenNode,
    type AlphaTexBraceCloseTokenNode,
    type AlphaTexBraceOpenTokenNode,
    type AlphaTexIdentifier,
    type AlphaTexMetaDataNode,
    type AlphaTexMetaDataTagNode,
    AlphaTexNodeType,
    type AlphaTexNumberLiteral,
    type AlphaTexParenthesisCloseTokenNode,
    type AlphaTexParenthesisOpenTokenNode,
    type AlphaTexPropertiesNode,
    type AlphaTexPropertyNode,
    type AlphaTexStringLiteral,
    type AlphaTexValueList,
    type IAlphaTexValueListItem
} from '@src/importer/alphaTex/AlphaTexAst';

/**
 * AlphaTexNodeFactory (short name for less code)
 * @internal
 */
export class Atnf {
    static ident(text: string): AlphaTexIdentifier {
        return {
            nodeType: AlphaTexNodeType.Ident,
            text
        } as AlphaTexIdentifier;
    }
    static string(text: string): AlphaTexStringLiteral {
        return { nodeType: AlphaTexNodeType.String, text } as AlphaTexStringLiteral;
    }
    static number(value: number): AlphaTexNumberLiteral {
        return {
            nodeType: AlphaTexNodeType.Number,
            value
        } as AlphaTexNumberLiteral;
    }

    public static meta(
        tag: string,
        values?: AlphaTexValueList,
        properties?: AlphaTexPropertiesNode
    ): AlphaTexMetaDataNode {
        return {
            nodeType: AlphaTexNodeType.Meta,
            tag: {
                nodeType: AlphaTexNodeType.Tag,
                prefix: {
                    nodeType: AlphaTexNodeType.Backslash
                } as AlphaTexBackSlashTokenNode,
                tag: {
                    nodeType: AlphaTexNodeType.Ident,
                    text: tag
                } as AlphaTexIdentifier
            } as AlphaTexMetaDataTagNode,
            values,
            properties,
            propertiesBeforeValues: false
        } as AlphaTexMetaDataNode;
    }

    public static identMeta(tag: string, value: string): AlphaTexMetaDataNode {
        return Atnf.meta(tag, Atnf.identValue(value));
    }

    public static numberMeta(tag: string, value: number): AlphaTexMetaDataNode {
        return Atnf.meta(tag, Atnf.numberValue(value));
    }

    public static values(
        values: (IAlphaTexValueListItem | undefined)[],
        parentheses: boolean | undefined = undefined
    ): AlphaTexValueList | undefined {
        const valueList = {
            nodeType: AlphaTexNodeType.Values,
            values: values.filter(v => v !== undefined)
        } as AlphaTexValueList;

        const addParenthesis: boolean = parentheses === undefined ? valueList.values.length > 1 : parentheses;

        if (addParenthesis) {
            valueList.openParenthesis = {
                nodeType: AlphaTexNodeType.LParen
            } as AlphaTexParenthesisOpenTokenNode;
            valueList.closeParenthesis = {
                nodeType: AlphaTexNodeType.RParen
            } as AlphaTexParenthesisCloseTokenNode;
        }

        if (valueList.values.length === 0) {
            return undefined;
        }

        return valueList;
    }

    public static stringValue(text: string): AlphaTexValueList {
        return Atnf.values([Atnf.string(text)])!;
    }

    public static identValue(text: string): AlphaTexValueList {
        return Atnf.values([Atnf.ident(text)])!;
    }

    public static numberValue(value: number): AlphaTexValueList {
        return Atnf.values([Atnf.number(value)])!;
    }

    public static props(
        properties: ([string, AlphaTexValueList | undefined] | undefined)[]
    ): AlphaTexPropertiesNode {
        const node = {
            nodeType: AlphaTexNodeType.Props,
            properties: [],
            openBrace: {
                nodeType: AlphaTexNodeType.LBrace
            } as AlphaTexBraceOpenTokenNode,
            closeBrace: {
                nodeType: AlphaTexNodeType.RBrace
            } as AlphaTexBraceCloseTokenNode
        } as AlphaTexPropertiesNode;

        for (const p of properties) {
            if (p) {
                node.properties.push({
                    nodeType: AlphaTexNodeType.Prop,
                    property: Atnf.ident(p[0]),
                    values: p[1]
                } as AlphaTexPropertyNode);
            }
        }

        return node;
    }

    public static prop(properties: AlphaTexPropertyNode[], identifier: string, values?: AlphaTexValueList) {
        properties.push({
            nodeType: AlphaTexNodeType.Prop,
            property: Atnf.ident(identifier),
            values
        });
    }
}
