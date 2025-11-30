import * as alphaTab from '@coderline/alphatab';
import type { ParameterDefinition, SignatureDefinition } from '@coderline/alphatab-alphatex/types';

function binaryNodeSearchInner<T extends alphaTab.importer.alphaTex.AlphaTexAstNode>(
    items: T[],
    offset: number,
    left: number = 0,
    right: number = items.length,
    trailingEnd: number
) {
    if (left > right) {
        return undefined;
    }

    const center = Math.trunc((left + right) / 2);
    const centerItem = items[center];

    // match
    const end = center === items.length - 1 ? trailingEnd : items[center + 1].start!.offset;
    if (centerItem.start!.offset <= offset && offset <= end) {
        return centerItem;
    }

    // left half
    if (offset < centerItem.start!.offset) {
        return binaryNodeSearchInner(items, offset, left, center, trailingEnd);
    }

    // right half
    return binaryNodeSearchInner(items, offset, center, right, trailingEnd);
}

export function binaryNodeSearch<T extends alphaTab.importer.alphaTex.AlphaTexAstNode>(
    items: T[],
    offset: number,
    trailingEnd: number = items.length > 0 ? items[items.length - 1].end!.offset : 0
) {
    // no items
    if (items.length === 0) {
        return undefined;
    }

    // not in range
    const rangeStart = items[0].start!.offset;
    const rangeEnd = trailingEnd;
    if (offset < rangeStart || offset > rangeEnd) {
        return undefined;
    }

    return binaryNodeSearchInner(items, offset, 0, items.length, trailingEnd);
}

export function resolveSignature(
    signatures: SignatureDefinition[],
    args: alphaTab.importer.alphaTex.AlphaTexArgumentList
): Map<number, SignatureDefinition> {
    const resolved = new Map<number, SignatureDefinition>();

    if (args.signatureCandidateIndices !== undefined) {
        for (const i of args.signatureCandidateIndices) {
            resolved.set(i, signatures[i]);
        }
    }

    return resolved;
}

export function parameterToSyntax(parameter: ParameterDefinition, onlyParameterNames: boolean) {
    let p: string = parameter.name;
    if (!onlyParameterNames) {
        switch (parameter.parseMode) {
            case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional:
            case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.OptionalAsFloat:
                p += '?';
                break;
        }
        p += `: ${nodeTypesToTypeDocs(parameter)}`;

        if (parameter.defaultValue) {
            p += ` = ${parameter.defaultValue}`;
        }
    }

    return p;
}

export function nodeTypesToTypeDocs(parameter: ParameterDefinition) {
    const typeArray = Array.isArray(parameter.type) ? parameter.type : [parameter.type];
    let p: string = '';
    if (parameter.values && !parameter.valuesOnlyForCompletion && parameter.values.length < 5) {
        const valueArray = parameter.values.map(v => v.name);
        switch (typeArray[0]) {
            case alphaTab.importer.alphaTex.AlphaTexNodeType.String:
                p = valueArray.map(v => `"${v}"`).join('|');
                break;
            default:
                p = valueArray.join('|');
                break;
        }
    } else {
        p = typeArray.map(t => alphaTab.importer.alphaTex.AlphaTexNodeType[t]).join('|');
    }

    switch (parameter.parseMode) {
        case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.RequiredAsValueList:
        case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.ValueListWithoutParenthesis:
            p += '[]';
    }

    return p;
}
