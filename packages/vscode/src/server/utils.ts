import type * as alphaTab from '@src/alphaTab.main';

type AlphaTexAstNode = alphaTab.importer.alphaTex.AlphaTexAstNode;

function binaryNodeSearchInner<T extends AlphaTexAstNode>(
    items: T[],
    offset: number,
    left: number = 0,
    right: number = items.length
) {
    if (left > right) {
        return undefined;
    }

    const center = Math.trunc((left + right) / 2);
    const centerItem = items[center];

    // match
    if (centerItem.start!.offset <= offset && offset <= centerItem.end!.offset) {
        return centerItem;
    }

    // left half
    if (offset < centerItem.start!.offset) {
        return binaryNodeSearchInner(items, offset, left, center);
    }

    // right half
    return binaryNodeSearchInner(items, offset, center, right);
}

export function binaryNodeSearch<T extends AlphaTexAstNode>(
    items: T[],
    offset: number,
    lastIfBeyondEnd: boolean = false
) {
    // no items
    if (items.length === 0) {
        return undefined;
    }

    // TODO: respect white-space between tokens on search (trailing white space counts to previous node)

    // not in range
    const rangeStart = items[0].start!.offset;
    const rangeEnd = items[items.length - 1].end!.offset;
    if (offset < rangeStart || offset > rangeEnd) {
        if (lastIfBeyondEnd && items.length > 0 && offset > rangeEnd) {
            return items[items.length - 1];
        }

        return undefined;
    }

    return binaryNodeSearchInner(items, offset, 0, items.length);
}
