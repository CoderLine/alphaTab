import type * as alphaTab from '@coderline/alphatab';

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
