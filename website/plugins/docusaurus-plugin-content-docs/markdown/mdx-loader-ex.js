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
const loader_utils_1 = require("loader-utils");
const fs_extra_1 = require("fs-extra");
const mdx_1 = __importDefault(require("@mdx-js/mdx"));
const remark_emoji_1 = __importDefault(require("remark-emoji"));
const remark_slug_1 = __importDefault(require("remark-slug"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const stringify_object_1 = __importDefault(require("stringify-object"));
const rightToc_1 = __importDefault(require("./remark/rightToc"));
const DEFAULT_OPTIONS = {
    rehypePlugins: [],
    remarkPlugins: [remark_emoji_1.default, remark_slug_1.default, rightToc_1.default],
};
module.exports = async function (fileString) {
    const callback = this.async();
    const { data, content } = gray_matter_1.default(fileString);
    const reqOptions = loader_utils_1.getOptions(this) || {};
    const options = Object.assign(Object.assign({}, reqOptions), { remarkPlugins: [
            ...DEFAULT_OPTIONS.remarkPlugins,
            ...(reqOptions.remarkPlugins || []),
        ], rehypePlugins: [
            ...DEFAULT_OPTIONS.rehypePlugins,
            ...(reqOptions.rehypePlugins || []),
        ], filepath: this.resourcePath });
    let result;
    try {
        result = await mdx_1.default(content, options);
    }
    catch (err) {
        return callback(err);
    }
    let exportStr = `export const frontMatter = ${stringify_object_1.default(data)};`;
    // Read metadata for this MDX and export it
    if (options.metadataPath && typeof options.metadataPath === 'function') {
        const metadataPath = options.metadataPath(this.resourcePath);
        if (metadataPath) {
            // Add as dependency of this loader result so that we can recompile if metadata is changed
            this.addDependency(metadataPath);
            const metadata = await fs_extra_1.readFile(metadataPath, 'utf8');
            exportStr += `\nexport const metadata = ${metadata};`;
        }
    }
    if (options.fullMetadataPath &&
        typeof options.fullMetadataPath === 'string') {
        const fullMetadataPath = options.fullMetadataPath;
        if (fullMetadataPath) {
            this.addDependency(fullMetadataPath);
            const fullMetadata = await fs_extra_1.readFile(fullMetadataPath, 'utf8');
            exportStr += `\nconst fullMetadata = ${fullMetadata};`;
        }
    }
    const code = `
  import React from 'react';
  import { mdx } from '@mdx-js/react';

  ${exportStr}
  ${result}
  `;
    return callback(null, code);
};
