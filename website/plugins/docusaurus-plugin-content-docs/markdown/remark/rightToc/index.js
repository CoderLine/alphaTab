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
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const stringify_object_1 = __importDefault(require("stringify-object"));
const search_1 = __importDefault(require("./search"));
const parseOptions = {
    plugins: ['jsx'],
    sourcetype: 'module',
};
const isImport = (child) => child.type === 'import';
const hasImports = (index) => index > -1;
const isExport = (child) => child.type === 'export';
const isTarget = (child, name) => {
    let found = false;
    const ast = parser_1.parse(child.value, parseOptions);
    traverse_1.default(ast, {
        VariableDeclarator: (path) => {
            if (path.node.id.name === name) {
                found = true;
            }
        },
    });
    return found;
};
const getOrCreateExistingTargetIndex = (children, name) => {
    let importsIndex = -1;
    let targetIndex = -1;
    children.forEach((child, index) => {
        if (isImport(child)) {
            importsIndex = index;
        }
        else if (isExport(child) && isTarget(child, name)) {
            targetIndex = index;
        }
    });
    if (targetIndex === -1) {
        const target = {
            default: false,
            type: 'export',
            value: `export const ${name} = [];`,
        };
        targetIndex = hasImports(importsIndex) ? importsIndex + 1 : 0;
        children.splice(targetIndex, 0, target);
    }
    return targetIndex;
};
const plugin = (options = {}) => {
    const name = options.name || 'rightToc';
    const transformer = (node) => {
        const headings = search_1.default(node);
        const { children } = node;
        const targetIndex = getOrCreateExistingTargetIndex(children, name);
        if (headings && headings.length) {
            children[targetIndex].value = `export const ${name} = ${stringify_object_1.default(headings)};`;
        }
    };
    return transformer;
};
exports.default = plugin;
