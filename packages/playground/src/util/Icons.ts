import type { IconNode } from 'lucide';
import createElement from 'lucide/dist/esm/createElement.mjs';
import Menu from 'lucide/dist/esm/icons/menu.mjs';

export function icon(node: IconNode): SVGElement {
    return createElement(node);
}

export const Icons = {
    Menu: Menu as IconNode
} satisfies Record<string, IconNode>;

export type { IconNode };
