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
    type AlphaTexArgumentList,
    type IAlphaTexArgumentValue
} from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

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
        values?: AlphaTexArgumentList,
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
            arguments: values,
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

    public static args(
        values: (IAlphaTexArgumentValue | undefined)[],
        parentheses: boolean | undefined = undefined
    ): AlphaTexArgumentList | undefined {
        const valueList = {
            nodeType: AlphaTexNodeType.Arguments,
            arguments: values.filter(v => v !== undefined)
        } as AlphaTexArgumentList;

        const addParenthesis: boolean = parentheses === undefined ? valueList.arguments.length > 1 : parentheses;

        if (addParenthesis) {
            valueList.openParenthesis = {
                nodeType: AlphaTexNodeType.LParen
            } as AlphaTexParenthesisOpenTokenNode;
            valueList.closeParenthesis = {
                nodeType: AlphaTexNodeType.RParen
            } as AlphaTexParenthesisCloseTokenNode;
        }

        if (valueList.arguments.length === 0) {
            return undefined;
        }

        return valueList;
    }

    public static stringValue(text: string): AlphaTexArgumentList {
        return Atnf.args([Atnf.string(text)])!;
    }

    public static identValue(text: string): AlphaTexArgumentList {
        return Atnf.args([Atnf.ident(text)])!;
    }

    public static numberValue(value: number): AlphaTexArgumentList {
        return Atnf.args([Atnf.number(value)])!;
    }

    public static props(
        properties: ([string, AlphaTexArgumentList | undefined] | undefined)[]
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
                    arguments: p[1]
                } as AlphaTexPropertyNode);
            }
        }

        return node;
    }

    public static prop(properties: AlphaTexPropertyNode[], identifier: string, values?: AlphaTexArgumentList) {
        properties.push({
            nodeType: AlphaTexNodeType.Prop,
            property: Atnf.ident(identifier),
            arguments: values
        });
    }
}
