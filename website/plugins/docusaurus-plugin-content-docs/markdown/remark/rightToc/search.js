"use strict";
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mdast_util_to_string_1 = __importDefault(require("mdast-util-to-string"));
const unist_util_visit_1 = __importDefault(require("unist-util-visit"));
const escape_html_1 = __importDefault(require("escape-html"));
const github_slugger_1 = __importDefault(require("github-slugger"));
const slugs = github_slugger_1.default();
// https://github.com/syntax-tree/mdast#heading
function toValue(node) {
    if (node && node.type) {
        switch (node.type) {
            case 'text':
                return escape_html_1.default(node.value);
            case 'heading':
                return node.children.map(toValue).join('');
            case 'inlineCode':
                return `<code>${escape_html_1.default(node.value)}</code>`;
            case 'emphasis':
                return `<em>${node.children.map(toValue).join('')}</em>`;
            case 'strong':
                return `<strong>${node.children.map(toValue).join('')}</strong>`;
            case 'delete':
                return `<del>${node.children.map(toValue).join('')}</del>`;
            default:
        }
    }
    return mdast_util_to_string_1.default(node);
}
// Visit all headings. We `slug` all headings (to account for
// duplicates), but only take h2 and h3 headings.
const search = (node) => {
    const headings = [];
    let current = -1;
    let currentDepth = 0;
    slugs.reset();
    const onHeading = (child, _, parent) => {
        const value = mdast_util_to_string_1.default(child);
        const id = child.data && child.data.hProperties && child.data.hProperties.id;
        const slug = slugs.slug(id || value);
        if (parent !== node || !value || child.depth > 3 || child.depth < 2) {
            return;
        }
        const entry = { value: toValue(child), id: slug, children: [] };
        if (!headings.length || currentDepth >= child.depth) {
            headings.push(entry);
            current += 1;
            currentDepth = child.depth;
        }
        else {
            headings[current].children.push(entry);
        }
    };
    unist_util_visit_1.default(node, 'heading', onHeading);
    return headings;
};
exports.default = search;
