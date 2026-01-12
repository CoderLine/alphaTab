import path from "path";
import fs from "fs";
import ts from "typescript";
import {
  GenerateContext,
  getTypeWithNullableInfo,
  TypeWithNullableInfo,
  valueOrFirstDeclarationInDts,
} from "./typeschema.mjs";
import { styleText } from "util";
import { FileStream, openFileStream, toPascalCase } from "./util.mjs";

function toExampleKey(title: string) {
  return title
    .toLowerCase()
    .replaceAll("#", "sharp")
    .replaceAll(/[^a-z0-9]/g, "-");
}

export { repositoryRoot } from "./typeschema.mjs";

export function collectExamples(
  context: GenerateContext,
  node: ts.Node
): { key: string; title: string; markdown: string }[] {
  const examples: { key: string; title: string; markdown: string }[] = [];

  for (const tag of getJSDocTags(context, node)) {
    if (tag.tagName.text === "example") {
      const [title, ...markdown] = jsDocCommentToMarkdown(
        context,
        tag.comment
      ).split("\n");
      examples.push({
        key: toExampleKey(title.trim()),
        title: title.trim(),
        markdown: markdown.join("\n").trim(),
      });
    }
  }

  return examples;
}

export function isJsonOnParent(
  context: GenerateContext,
  node: ts.Node
): boolean {
  return !!getJSDocTags(context, node).find(
    (t) => t.tagName.text === "json_on_parent"
  );
}

export function isEvent(context: GenerateContext, node: ts.Node): boolean {
  return !!getJSDocTags(context, node).find(
    (t) => t.tagName.text === "eventProperty"
  );
}

export function isTargetWeb(context: GenerateContext, node: ts.Node): boolean {
  let isWebOnly = !!getJSDocTags(context, node).find(
    (t) => t.tagName.text === "target" && t.comment === "web"
  );

  if (!isWebOnly) {
    switch (node.kind) {
      case ts.SyntaxKind.MethodSignature:
      case ts.SyntaxKind.MethodDeclaration:
      case ts.SyntaxKind.PropertySignature:
      case ts.SyntaxKind.PropertyDeclaration:
      case ts.SyntaxKind.EnumMember:
        isWebOnly = isTargetWeb(context, node.parent);
        break;
    }
  }

  return isWebOnly;
}

export type ReferencePage = {
  title: string,
  description: string,
  javaScriptOnly: boolean,
  url: string
};

export class ReferenceTableData {
  public readonly categories = new Map<string, ReferencePage[]>();

  public addPage(category: string, page: ReferencePage) {
    let items = this.categories.get(category);
    if (!items) {
      items = [];
      this.categories.set(category, items);
    }
    items.push(page);

  }
}

export async function writeReferenceTable(
  path: string,
  type: string,
  categories: ReferenceTableData) {

  await using table = await openFileStream(path);


  await table.writeLine(`import { CodeBadge } from "@site/src/components/CodeBadge";`);
  await table.writeLine(`import { Signature } from "@site/src/components/Signature";`);
  await table.writeLine();
  await table.writeLine(`<table className="table table-striped table-condensed reference-table">`);
  await table.writeLine(`  <thead>`);
  await table.writeLine(`    <tr>`);
  await table.writeLine(`      <th>${type}</th>`);
  await table.writeLine(`      <th>Summary</th>`);
  await table.writeLine(`    </tr>`);
  await table.writeLine(`  </thead>`);
  await table.writeLine(`  <tbody>`);

  const categoriesSorted = Array.from(categories.categories.entries())
    .sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });


  for (const [category, pages] of categoriesSorted) {
    await table.writeLine(`    <tr><th colSpan="4">${category}</th></tr>`);

    const sorted = pages
      .sort((a, b) => {
        const at = a.title;
        const bt = b.title;

        if (at < bt) return -1;
        if (at > bt) return 1;

        return 0;
      });

    for (const v of sorted) {
      await table.writeLine(`<tr>`);
      await table.writeLine(`  <td>`);
      await table.writeLine(`    <a href=${JSON.stringify(v.url)}>`);
      await table.writeLine(`      <CodeBadge name=${JSON.stringify(v.title)} type="${v.javaScriptOnly ? 'js' : 'all'}" />`);
      await table.writeLine(`    </a>`);
      await table.writeLine(`  </td>`);
      await table.writeLine(`  <td>`);
      await table.writeLine(`     ${v.description}`);
      await table.writeLine(`  </td>`);
      await table.writeLine(`</tr>`);
    }
  }

  await table.writeLine(`  </tbody>\n`);
  await table.writeLine(`</table>\n`);

}

export function getCategory(
  context: GenerateContext,
  node: ts.Node,
  fallbackCategory: string
): string {
  const category = getJsDocTagText(context, node, "category");
  if (category) {
    return category;
  }

  if (isEvent(context, node)) {
    return "Events" + fallbackCategory;
  }
  switch (node.kind) {
    case ts.SyntaxKind.PropertyDeclaration:
    case ts.SyntaxKind.PropertySignature:
    case ts.SyntaxKind.GetAccessor:
      return "Properties" + fallbackCategory;
    case ts.SyntaxKind.MethodSignature:
    case ts.SyntaxKind.MethodDeclaration:
      return "Methods" + fallbackCategory;
  }

  cconsole.warn("Unknown category for kind", ts.SyntaxKind[node.kind]);
  return "General";
}

function hasJSDocInheritDocTag(node: ts.Node) {
  return ts
    .getJSDocTags(node)
    .some(
      (tag) =>
        tag.tagName.text === "inheritDoc" || tag.tagName.text === "inheritdoc"
    );
}

function getBaseTypeList(
  context: GenerateContext,
  node: ts.ClassDeclaration | ts.InterfaceDeclaration
): (ts.ClassDeclaration | ts.InterfaceDeclaration)[] {
  let baseTypes: (ts.ClassDeclaration | ts.InterfaceDeclaration)[] = [];
  switch (node.kind) {
    case ts.SyntaxKind.ClassDeclaration:
    case ts.SyntaxKind.InterfaceDeclaration:
      const clauses = node.heritageClauses;
      if (clauses) {
        for (const h of clauses) {
          for (const t of h.types) {
            const type = context.checker.getTypeAtLocation(t);
            if (type.symbol) {
              const decl = valueOrFirstDeclarationInDts(context, type.symbol);
              if (
                decl &&
                (ts.isClassDeclaration(decl) || ts.isInterfaceDeclaration(decl))
              ) {
                baseTypes.push(decl);
              }
            }
          }
        }
      }
      break;
  }
  return baseTypes;
}

function findBaseOfDeclaration<T>(
  context: GenerateContext,
  node: ts.Node,
  selector: (baseNode: ts.Node) => T | undefined
): T | undefined {
  let baseTypes: (ts.ClassDeclaration | ts.InterfaceDeclaration)[];

  switch (node.kind) {
    case ts.SyntaxKind.ClassDeclaration:
    case ts.SyntaxKind.InterfaceDeclaration:
      baseTypes = getBaseTypeList(
        context,
        node as ts.ClassDeclaration | ts.InterfaceDeclaration
      );

      for (const t of baseTypes) {
        const v = selector(t);
        if (v !== undefined) {
          return v;
        }
      }
      return undefined;

    case ts.SyntaxKind.MethodSignature:
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.PropertyDeclaration:
    case ts.SyntaxKind.PropertySignature:
    case ts.SyntaxKind.GetAccessor:
    case ts.SyntaxKind.SetAccessor:
      baseTypes = getBaseTypeList(
        context,
        node.parent as ts.ClassDeclaration | ts.InterfaceDeclaration
      );

      for (const t of baseTypes) {
        const member = t.members.find(
          (m) =>
            m.name?.getText() ===
            (node as ts.ClassElement | ts.TypeElement).name?.getText()
        );
        if (member) {
          const v = selector(member);
          if (v !== undefined) {
            return v;
          }
        }
      }

      break;
  }

  return undefined;
}

export function getJSDocCommentsAndTags(
  context: GenerateContext,
  node: ts.Node
) {
  if (hasJSDocInheritDocTag(node)) {
    const base = findBaseOfDeclaration(context, node, (baseNode) => {
      if (hasJSDocInheritDocTag(baseNode)) {
        return undefined;
      }
      const docs = ts.getJSDocCommentsAndTags(baseNode);
      if (docs.length === 0) {
        return undefined;
      }
      return docs;
    });
    if (base) {
      return base;
    }
  }
  return ts.getJSDocCommentsAndTags(node);
}

export function getJSDocTags(context: GenerateContext, node: ts.Node) {
  if (hasJSDocInheritDocTag(node)) {
    const base = findBaseOfDeclaration(context, node, (baseNode) => {
      if (hasJSDocInheritDocTag(baseNode)) {
        return undefined;
      }
      const tags = ts.getJSDocTags(baseNode);
      if (tags.length > 0) {
        return tags;
      }
      return undefined;
    });
    if (base) {
      return base;
    }
  }
  return ts.getJSDocTags(node);
}

export function getJsDocTagText(
  context: GenerateContext,
  node: ts.Node,
  tagName: string
): string {
  return jsDocCommentToMarkdown(
    context,
    getJSDocTags(context, node).find((t) => t.tagName.text === tagName)?.comment
  );
}

export function getSummary(
  context: GenerateContext,
  node: ts.Node,
  resolveLinks: boolean,
  shorten: boolean = true
): string {
  const jsDoc = getJSDocCommentsAndTags(context, node);
  if ((jsDoc.length > 1 && ts.isJSDoc(jsDoc[0])) || jsDoc.length === 1) {
    const text = jsDocCommentToMarkdown(
      context,
      jsDoc[0].comment,
      resolveLinks
    );
    if (shorten) {
      return (
        text
          .split("\n")
          .find((l) => l.trim().length > 0)
          ?.trim() ?? ""
      );
    } else {
      return text;
    }
  }

  return "";
}

let warnOnMissingDescription = false;
export function enableWarningsOnMissingDocs() {
  warnOnMissingDescription = true;
}

export function disableWarningsOnMissingDocs() {
  warnOnMissingDescription = false;
}

export function getFullDescription(context: GenerateContext, node: ts.Node) {
  const description = `${getSummary(
    context,
    node,
    true,
    false
  )} ${getJsDocTagText(context, node, "remarks")}`.trim();

  if (!description) {
    const isOwn =
      path.basename(node.getSourceFile().fileName) ===
      path.basename(context.dts);
    if (isOwn && warnOnMissingDescription) {
      let name =
        "name" in node ? (node.name as ts.Node).getText() : node.getText();

      if (ts.isParameter(node)) {
        name =
          (node.parent.parent as ts.NamedDeclaration).name!.getText() +
          "." +
          node.parent.name!.getText() +
          "(" +
          name +
          ")";
      } else if (
        ts.isClassDeclaration(node.parent) ||
        ts.isInterfaceDeclaration(node.parent)
      ) {
        name = node.parent.name!.getText() + "." + name;
      }

      cconsole.warn(
        "Missing description for",
        name,
        "at",
        node.getSourceFile().fileName,
        node.getSourceFile().getLineAndCharacterOfPosition(node.pos)
      );
    }

    return "(no description)";
  }

  return description;
}

function rewriteJsDocText(s: string): string {
  return s
    .replaceAll("https://alphatab.net/", "/")
    .replaceAll("https://www.alphatab.net/", "/")
    .replaceAll(/\{@since ([^}]+)\}/g, (_, since) => {
      return `<SinceBadge inline={true} since={${JSON.stringify(since)}} />`;
    })
    .replaceAll(/\{@([^}]+)\}/g, (match) => {
      return `\`${match}\``;
    });
}

export function jsDocCommentToMarkdown(
  context: GenerateContext,
  comment: ts.JSDoc["comment"] | ts.JSDocComment,
  resolveLinks: boolean = true
) {
  if (comment !== undefined) {
    let text = "";

    if (typeof comment === "string") {
      text += rewriteJsDocText(comment);
    } else if ("kind" in comment) {
      switch (comment.kind) {
        case ts.SyntaxKind.JSDocText:
          text += rewriteJsDocText(comment.text);
          break;
        case ts.SyntaxKind.JSDocLink:
        case ts.SyntaxKind.JSDocLinkCode:
        case ts.SyntaxKind.JSDocLinkPlain:
          const builder = new TypeReferencedCodeBuilder(context);

          let linkText = comment.text;
          if (comment.name) {
            if (!linkText) {
              linkText = comment.name.getText();
            }
            if (resolveLinks) {
              // workaround for https://github.com/microsoft/TypeScript/issues/61433
              let symbol: ts.Symbol | undefined;
              if (comment.name.getText().endsWith(".name")) {
                // resolve parent
                if (ts.isQualifiedName(comment.name)) {
                  symbol = context.checker.getSymbolAtLocation(
                    comment.name.left
                  );
                } else if (ts.isJSDocMemberName(comment.name)) {
                  symbol = context.checker.getSymbolAtLocation(
                    comment.name.left
                  );
                }

                symbol = symbol?.members?.get(
                  ts.escapeLeadingUnderscores("name")
                );
              } else {
                symbol = context.checker.getSymbolAtLocation(comment.name);
              }

              if (symbol) {
                builder.settingOrDeclaration(symbol, linkText);
              } else {
                builder.identifier(linkText);
                cconsole.error(
                  `Could not resolve tsdoc link ${comment.name.getText()} at `,
                  comment
                    .getSourceFile()
                    .getLineAndCharacterOfPosition(comment.pos)
                );
              }
            } else {
              builder.identifier(linkText);
            }
          }

          text += builder.toMdx("js", "inline");

          break;
      }
    } else {
      for (const n of comment) {
        text += jsDocCommentToMarkdown(context, n, resolveLinks);
      }
    }

    return text;
  }
  return "";
}

function tryGetSettingsUrl(
  context: GenerateContext,
  symbol: ts.Symbol
): string | undefined {
  if (!symbol) {
    return undefined;
  }

  if ("parent" in symbol && symbol.parent) {
    const parentSymbol = symbol.parent as ts.Symbol;
    if (parentSymbol.name.endsWith("Settings")) {
      const settingsProp = context.settings.members.find(
        (m) =>
          ts.isPropertyDeclaration(m) &&
          m.type &&
          context.checker.getTypeAtLocation(m.type).symbol == symbol.parent
      );
      if (settingsProp) {
        return `/docs/reference/settings/${settingsProp
          .name!.getText()
          .toLowerCase()}/${symbol.name.toLowerCase()}`;
      } else {
        // cconsole.warn(
        //   "Could not find a property of type ",
        //   parentSymbol.name,
        //   " in Settings"
        // );
        return undefined;
      }
    }

    return undefined;
  } else {
    // console.warn("Symbol", symbol.name, " has no parent symbol",
    //   node.getSourceFile().fileName,
    //   node.getSourceFile().getLineAndCharacterOfPosition(node.pos),

    // );
    return undefined;
  }
}

function getDeclarationReferenceUrl(
  context: GenerateContext,
  element: ts.Node,
  warnOnMissingReference: boolean = true,
): string {
  const fileName = element.getSourceFile().fileName;

  if (path.basename(fileName) !== path.basename(context.dts)) {
    return "";
  }

  switch (element.kind) {
    case ts.SyntaxKind.ClassDeclaration:
    case ts.SyntaxKind.EnumDeclaration:
    case ts.SyntaxKind.InterfaceDeclaration:
    case ts.SyntaxKind.TypeAliasDeclaration:
      let name = (element as ts.DeclarationStatement).name!.getText();
      if (context.nameToExportName.has(name)) {
        name = context.nameToExportName.get(name)!;
        if (name.startsWith("alphaTab.")) {
          name = name.substring(9);
        }
      } else {
        cconsole.warn(
          `Type ${name} is not exported, no documentation generated and cross reference not linked`
        );
        return "";
      }

      return `/docs/reference/types/${name
        .replaceAll(".", "/")
        .toLowerCase()}`;

    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.MethodSignature:
    case ts.SyntaxKind.Constructor:
    case ts.SyntaxKind.GetAccessor:
    case ts.SyntaxKind.SetAccessor:
    case ts.SyntaxKind.PropertyDeclaration:
    case ts.SyntaxKind.PropertySignature:
      let page = (element as ts.ClassElement).name!.getText().toLowerCase();
      return (
        getDeclarationReferenceUrl(
          context,
          element.parent as ts.ClassDeclaration | ts.InterfaceDeclaration,
        ) + '/#' + page
      );
    case ts.SyntaxKind.EnumMember:
      return (
        getDeclarationReferenceUrl(
          context,
          element.parent as ts.EnumDeclaration
        ) +
        "/#" +
        (element as ts.EnumMember).name!.getText().toLowerCase()
      );
    case ts.SyntaxKind.TypeParameter:
      return "";
    default:
      cconsole.error(
        "Unhandled node kind",
        ts.SyntaxKind[element.kind],
        "at",
        element.getSourceFile().fileName,
        element.getSourceFile().getLineAndCharacterOfPosition(element.pos),
        element.getText()
      );
  }

  if (warnOnMissingReference) {
    cconsole.error(
      "Failed to resolve reference link for declaration ",
      element
    );
  }
  return "";
}

function getTypeReferenceUrl(
  context: GenerateContext,
  element: TypeWithNullableInfo,
  warnOnMissingReference: boolean = true
): string {
  // TODO: better generation of type references, we can have multiple links e.g. Map<NoteElement, Beat> where
  // all identifiers get their own links.

  if (
    element.fullString === "any" ||
    element.fullString === "unknown" ||
    element.fullString === "void"
  ) {
    return "";
  } else if (element.isPrimitiveType || element.isTypedArray) {
    return "";
  } else if (element.isArray) {
    return getTypeReferenceUrl(context, element.arrayItemType!);
  } else if (element.isFunctionType) {
    return "";
  } else if (element.isTypeLiteral) {
    return "";
  } else if (element.isOwnType) {
    let declaration = valueOrFirstDeclarationInDts(context, element.symbol!);
    if (declaration) {
      return getTypeReferenceUrl(context, declaration as any);
    }
  } else if (element.typeArguments) {
    // currently we mostly have one own type in generics (e.g. maps, sets etc.)
    for (const a of element.typeArguments) {
      if (a.isOwnType || a.isUnionType) {
        const reference = getTypeReferenceUrl(context, a, false);
        if (reference) {
          return reference;
        }
      }
    }

    // there are maps with only primitives
    return "";
  } else if (element.isUnionType) {
    for (const a of element.unionTypes!) {
      const reference = getTypeReferenceUrl(context, a, false);
      if (reference) {
        return reference;
      }
    }
  } else {
    let declaration = valueOrFirstDeclarationInDts(context, element.symbol!);
    if (declaration) {
      return getDeclarationReferenceUrl(context, declaration as any);
    }
  }

  if (warnOnMissingReference) {
    cconsole.error("Failed to resolve reference link for type ", element);
  }
  return "";
}

export async function writeExamples(
  fileStream: FileStream,
  context: GenerateContext,
  element: ts.Node
) {
  const examples = collectExamples(context, element);
  if (examples.length === 1) {
    await fileStream.write(`\n## Example - ${examples[0].title}\n\n`);
    await fileStream.write(`${examples[0].markdown}\n`);
  } else if (examples.length > 1) {
    await fileStream.write(`\n## Examples\n\n`);
    await fileStream.write("<Tabs\n");
    await fileStream.write(
      `    defaultValue=${JSON.stringify(examples[0].key)}\n`
    );
    await fileStream.write(`    values={[\n`);

    for (let i = 0; i < examples.length; i++) {
      await fileStream.write(
        `      { label: ${JSON.stringify(
          examples[i].title
        )}, value: ${JSON.stringify(examples[i].key)}}`
      );
      if (i < examples.length - 1) {
        await fileStream.write(`,\n`);
      } else {
        await fileStream.write(`\n`);
      }
    }

    await fileStream.write(`    ]}\n`);
    await fileStream.write(`>\n`);

    for (const example of examples) {
      await fileStream.write(
        `<TabItem value=${JSON.stringify(example.key)}>\n`
      );

      await fileStream.write(`${example.markdown}\n`);

      await fileStream.write(`</TabItem>\n`);
    }

    await fileStream.write(`</Tabs>\n`);
  }
}

function isInternal(context: GenerateContext, node: ts.Node) {
  const tags = getJSDocTags(context, node);

  if (tags.find((t) => t.tagName.text === "internal")) {
    return true;
  }

  return false;
}

export async function writeEventDetails(
  context: GenerateContext,
  fileStream: FileStream,
  parent: ts.ClassDeclaration | ts.InterfaceDeclaration,
  member:
    | ts.PropertySignature
    | ts.PropertyDeclaration
    | ts.GetAccessorDeclaration,
  referenceDoc: boolean = false
) {
  await writeCommonDescription(context, fileStream, parent, member, referenceDoc);

  await writeEventSignatures(context, fileStream, member);

  if (!referenceDoc) {
    await writeManualDocs(fileStream, member);

    await writeExamples(fileStream, context, member);
  }
}

export async function writeEventSignatures(
  context: GenerateContext,
  fileStream: FileStream,
  member:
    | ts.PropertySignature
    | ts.PropertyDeclaration
    | ts.GetAccessorDeclaration
) {
  await writePropertySignatures(context, fileStream, member);
}

export async function writeMethodDetails(
  context: GenerateContext,
  fileStream: FileStream,
  parent: ts.ClassDeclaration | ts.InterfaceDeclaration,
  member: ts.MethodDeclaration | ts.MethodSignature,
  referenceDoc: boolean = false
) {
  await writeCommonDescription(context, fileStream, parent, member, referenceDoc);

  await writeMethodSignatures(context, fileStream, member);
  await writeMethodParameters(context, fileStream, member);
  await writeMethodReturn(context, fileStream, member, referenceDoc ? 4 : 3);

  if (!referenceDoc) {
    await writeManualDocs(fileStream, member);

    await writeExamples(fileStream, context, member);
  }
}

async function writeMethodReturn(
  context: GenerateContext,
  fileStream: FileStream,
  m: ts.MethodDeclaration | ts.MethodSignature,
  level: number
) {
  const returnsDoc = getJsDocTagText(context, m, "returns");
  if (returnsDoc) {
    await fileStream.write(`${'#'.repeat(level)} Returns \n`);
    await fileStream.write(`${returnsDoc} \n\n`);
  }
}

export async function beginParameterTable(
  fileStream: FileStream
) {
  await fileStream.write(`<table className="table table-striped table-condensed type-table">\n`);
  await fileStream.write(`  <thead>\n`);
  await fileStream.write(`    <tr>\n`);
  await fileStream.write(`      <th>Parameter</th>\n`);
  await fileStream.write(`      <th>Summary</th>\n`);
  await fileStream.write(`    </tr>\n`);
  await fileStream.write(`  </thead>\n`);
  await fileStream.write(`  <tbody>\n`);
}

export async function writeParameterRow(
  fileStream: FileStream,
  name: string,
  description: string,
) {
  await fileStream.write(`<tr>\n`);
  await fileStream.write(`  <td>\n`);
  await fileStream.write(`    <CodeBadge type="all" name=${JSON.stringify(name)} />\n`);
  await fileStream.write(`  </td>\n`);
  await fileStream.write(`  <td>\n`);
  for (const l of description.split('\n')) {
    await fileStream.write(`    ${l}\n`);
  }
  await fileStream.write(`  </td>\n`);
  await fileStream.write(`</tr>\n`);
}

export async function endParameterTable(
  fileStream: FileStream
) {
  await fileStream.write(`  </tbody>\n`);
  await fileStream.write(`</table>\n`);
}

export async function writeMethodParameters(
  context: GenerateContext,
  fileStream: FileStream,
  m: ts.MethodDeclaration | ts.MethodSignature
) {
  if (m.parameters.length > 0) {
    await beginParameterTable(fileStream);

    for (let i = 0; i < m.parameters.length; i++) {
      await writeParameterRow(fileStream,
        m.parameters[
          i
        ].name.getText(),
        getFullDescription(context, m.parameters[i])
      );
    }

    await endParameterTable(fileStream);
  }
}

export async function writeMethodSignatures(
  context: GenerateContext,
  fileStream: FileStream,
  m: ts.MethodDeclaration | ts.MethodSignature
) {
  const isWebOnly = isTargetWeb(context, m);
  const builder = new TypeReferencedCodeBuilder(context);

  await fileStream.writeLine(
    `<Signature style="block"`
  );


  if (m.modifiers) {
    for (const mod of m.modifiers) {
      builder.keyword(mod.getText());
      builder.whitespace(" ");
    }
  }

  builder.identifier(m.name.getText());
  builder.token("(");

  for (let i = 0; i < m.parameters.length; i++) {
    if (i > 0) {
      builder.token(",");
      builder.whitespace(" ");
    }

    builder.identifier(m.parameters[i].name.getText());
    if (m.parameters[i].questionToken) {
      builder.token("?");
    }

    builder.token(":");
    builder.whitespace(" ");
    builder.type(
      getTypeWithNullableInfo(context, m.parameters[i].type, true, false)
    );

    if (m.parameters[i].initializer) {
      builder.whitespace(" ");
      builder.token("=");
      builder.whitespace(" ");
      builder.identifier(m.parameters[i].initializer!.getText());
    }
  }

  builder.token(")");
  builder.token(":");
  builder.whitespace(" ");
  builder.type(getTypeWithNullableInfo(context, m.type, true, false));

  await fileStream.writeLine(
    `           js={${builder.toJSON("js")}}`
  );

  if (!isWebOnly) {
    builder.reset();
    if (m.modifiers) {
      for (const mod of m.modifiers) {
        switch (mod.kind) {
          case ts.SyntaxKind.StaticKeyword:
          case ts.SyntaxKind.AbstractKeyword:
          case ts.SyntaxKind.OverrideKeyword:
            builder.keyword(mod.getText());
            builder.whitespace(" ");
            break;
        }
      }
    }

    builder.type(getTypeWithNullableInfo(context, m.type, false, false));
    builder.whitespace(" ");
    builder.identifier(toPascalCase(m.name!.getText()));
    builder.token("(");
    for (let i = 0; i < m.parameters.length; i++) {
      if (i > 0) {
        builder.token(",");
        builder.whitespace(" ");
      }

      builder.type(
        getTypeWithNullableInfo(
          context,
          m.parameters[i].type,
          false,
          !!m.parameters[i].questionToken
        )
      );

      builder.whitespace(" ");
      builder.identifier(m.parameters[i].name.getText());

      if (m.parameters[i].initializer) {
        builder.whitespace(" ");
        builder.token("=");
        builder.whitespace(" ");
        builder.identifier(m.parameters[i].initializer!.getText());
      }
    }
    builder.token(")");

    await fileStream.writeLine(
      `           csharp={${builder.toJSON("c#")}}`
    );

    builder.reset();

    if (m.type!.getText().startsWith("Promise<")) {
      builder.identifier("suspend");
      builder.whitespace(" ");
    }

    builder.identifier("fun");
    builder.whitespace(" ");
    builder.identifier(m.name!.getText());
    builder.token("(");

    for (let i = 0; i < m.parameters.length; i++) {
      if (i > 0) {
        builder.token(",");
        builder.whitespace(" ");
      }

      builder.identifier(m.parameters[i].name.getText());
      builder.token(":");
      builder.whitespace(" ");
      builder.type(
        getTypeWithNullableInfo(
          context,
          m.parameters[i].type,
          false,
          !!m.parameters[i].questionToken
        )
      );
    }

    builder.token(")");
    builder.token(":");
    builder.whitespace(" ");
    builder.type(getTypeWithNullableInfo(context, m.type, false, false));

    await fileStream.writeLine(
      `           kotlin={${builder.toJSON("kotlin")}}`
    );
  }

  await fileStream.writeLine(
    `/>`
  );

  await fileStream.writeLine();
}

export async function writeCommonImports(fileStream: FileStream, additionals: string[] = []) {
  await fileStream.writeLine();
  const imports = [
    'Tabs',
    'TabItem',
    'CodeBadge',
    'SinceBadge',
    'DynHeading',
    'Link',
    'Signature',
    ...additionals
  ];

  await fileStream.writeLine(`import { ${imports.join(', ')} } from '@site/src/reference-commons'`);


  await fileStream.writeLine();
}

function getInheritenceInfo(
  context: GenerateContext,
  parent: ts.ClassDeclaration | ts.InterfaceDeclaration,
  member: ts.ClassElement | ts.TypeElement
) {
  let info = "";
  // inheritence info
  if (member.parent !== parent) {
    info += " (Inherited from ";
    const builder = new TypeReferencedCodeBuilder(context);
    builder.declaration(
      member.parent as ts.ClassDeclaration | ts.InterfaceDeclaration
    );

    let name = (member.parent as ts.NamedDeclaration).name!.getText();
    if (context.nameToExportName.has(name)) {
      name = context.nameToExportName.get(name)!;
    }

    info += builder.toMdx("js", "inline");

    info += ")";
  }
  return info;
}


async function writeCommonDescription(
  context: GenerateContext,
  fileStream: FileStream,
  parent: ts.ClassDeclaration | ts.InterfaceDeclaration,
  member: ts.TypeElement | ts.ClassElement,
  referenceDoc: boolean
) {
  await fileStream.write(`${getFullDescription(context, member)}`);
  if (referenceDoc) {
    await fileStream.write(`${getInheritenceInfo(context, parent, member)}`);
  }

  await fileStream.write(`\n\n`);
}

export async function writeManualDocs(
  fileStream: FileStream,
  member: ts.TypeElement | ts.ClassElement
) {
  try {
    const importFile = path.join(
      path.dirname(fileStream.path),
      "_" + member.name!.getText().toLowerCase() + ".mdx"
    );
    await fs.promises.access(importFile, fs.constants.R_OK);

    await fileStream.write(
      `\nimport ManualDocs from './_${member
        .name!.getText()
        .toLowerCase()}.mdx';\n`
    );
    await fileStream.write("\n");
    await fileStream.write(`<ManualDocs />\n`);
  } catch (e) {
    // ignore
  }
}

export async function writePropertyDetails(
  context: GenerateContext,
  fileStream: FileStream,
  parent: ts.ClassDeclaration | ts.InterfaceDeclaration,
  member:
    | ts.PropertySignature
    | ts.PropertyDeclaration
    | ts.GetAccessorDeclaration,
  referenceDoc: boolean = false
) {
  await writeCommonDescription(context, fileStream, parent, member, referenceDoc);

  await writePropertySignatures(context, fileStream, member);

  if (!referenceDoc) {
    await writeManualDocs(fileStream, member);
    await writeExamples(fileStream, context, member);
  }
}

export const cconsole = {
  log: (...args) => {
    console.log(...args);
  },
  debug: (...args) => {
    console.log(
      ...args.map((a) => (typeof a === "string" ? styleText(["dim"], a) : a))
    );
  },

  info: (...args) => {
    console.log(
      ...args.map((a) => (typeof a === "string" ? styleText(["blue"], a) : a))
    );
  },

  warn: (...args) => {
    console.log(
      ...args.map((a) => (typeof a === "string" ? styleText(["yellow"], a) : a))
    );
  },

  error: (...args) => {
    console.log(
      ...args.map((a) => (typeof a === "string" ? styleText(["red"], a) : a))
    );
  },
};

function shouldGenerateMember(
  context: GenerateContext,
  m: ts.TypeElement | ts.ClassElement
) {
  if (!m.name) {
    // e.g. constructors
    return false;
  }
  if (ts.isComputedPropertyName(m.name)) {
    // e.g. [Symbol.iterator]
    return false;
  }

  // private
  if (
    ts.canHaveModifiers(m) &&
    m.modifiers?.some(
      (mod) =>
        mod.kind == ts.SyntaxKind.PrivateKeyword ||
        mod.kind === ts.SyntaxKind.ProtectedKeyword
    )
  ) {
    return false;
  }

  if (isInternal(context, m) || ts.isSetAccessor(m)) {
    return false;
  }

  return true;
}

export function collectMembers(
  context: GenerateContext,
  members: Map<string, ts.ClassElement | ts.TypeElement>,
  exportedType: ts.ClassDeclaration | ts.InterfaceDeclaration,
  collectBase: boolean = true
) {
  for (const m of exportedType.members) {
    if (shouldGenerateMember(context, m) && !members.has(m.name!.getText())) {
      members.set(m.name!.getText(), m);
    }
  }

  const extendsClause = exportedType.heritageClauses?.find(
    (c) => c.token === ts.SyntaxKind.ExtendsKeyword
  );
  if (extendsClause && collectBase) {
    const symbol = context.checker.getTypeAtLocation(
      extendsClause.types[0]
    ).symbol;
    const baseType = valueOrFirstDeclarationInDts(context, symbol);
    if (
      baseType &&
      (ts.isClassDeclaration(baseType) || ts.isInterfaceDeclaration(baseType))
    ) {
      collectMembers(context, members, baseType);
    } else if (symbol.members) {
      for (const [_, member] of symbol.members) {
        const decl = valueOrFirstDeclarationInDts(context, member);
        if (decl) {
          if (ts.isClassElement(decl) || ts.isTypeElement(decl)) {
            if (
              shouldGenerateMember(context, decl) &&
              !members.has(decl.name!.getText())
            ) {
              members.set(decl.name!.getText(), decl);
            }
          }
        }
      }
    }
  }
}

async function writePropertySignatures(
  context: GenerateContext,
  fileStream: FileStream,
  m: ts.PropertySignature | ts.PropertyDeclaration | ts.GetAccessorDeclaration
) {
  const isWebOnly = isTargetWeb(context, m);
  const builder = new TypeReferencedCodeBuilder(context);

  await fileStream.writeLine(
    `<Signature style="block"`
  );

  if (m.modifiers) {
    for (const mod of m.modifiers) {
      switch (mod.kind) {
        case ts.SyntaxKind.AccessorKeyword:
          break;
        default:
          builder.keyword(mod.getText());
          builder.whitespace(" ");
          break;
      }
    }
  }

  const isReadonlyAccessor =
    ts.isGetAccessor(m) &&
    !(m.parent as ts.ClassDeclaration | ts.InterfaceDeclaration).members.some(
      (p) => ts.isSetAccessor(p) && p.name.getText() === m.name.getText()
    );

  if (isReadonlyAccessor) {
    builder.keyword("readonly");
    builder.whitespace(" ");
  }

  builder.identifier(m.name.getText());
  if (m.questionToken) {
    builder.token("?");
  }
  builder.token(":");
  builder.whitespace(" ");
  builder.type(getTypeWithNullableInfo(context, m.type, true, false));

  let defaultValue = getJsDocTagText(context, m, "defaultValue");
  let defaultValueIsCode =
    defaultValue.startsWith("`") && defaultValue.endsWith("`");
  if (defaultValueIsCode) {
    defaultValue = defaultValue.substring(1, defaultValue.length - 1);
  }
  if ((m.parent as ts.NamedDeclaration).name!?.getText().endsWith("Json")) {
    defaultValue = "";
  }

  if (defaultValue) {
    builder.whitespace(" ");
    builder.token("=");
    builder.whitespace(" ");
    builder.identifier(defaultValue);
  }

  builder.token(";");

  await fileStream.writeLine(
    `           js={${builder.toJSON("js")}}`
  );

  if (!isWebOnly) {
    const isReadonly =
      m.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ReadonlyKeyword) ||
      (ts.isGetAccessor(m) &&
        !(
          m.parent as ts.ClassDeclaration | ts.InterfaceDeclaration
        ).members.some(
          (p) => ts.isSetAccessor(p) && p.name.getText() === m.name.getText()
        ));
    const isStatic = m.modifiers?.some(
      (mod) => mod.kind === ts.SyntaxKind.StaticKeyword
    );
    const isAbstract = m.modifiers?.some(
      (mod) => mod.kind === ts.SyntaxKind.AbstractKeyword
    );

    builder.reset();
    if (isStatic) {
      builder.keyword("static");
      builder.whitespace(" ");
    }

    if (isAbstract) {
      builder.keyword("abstract");
      builder.whitespace(" ");
    }

    builder.type(getTypeWithNullableInfo(context, m.type, false, false));
    builder.whitespace(" ");
    builder.identifier(toPascalCase(m.name!.getText()));
    builder.whitespace(" ");
    builder.token("{");
    builder.whitespace(" ");
    builder.keyword("get");
    builder.token(";");
    builder.whitespace(" ");

    if (!isReadonly) {
      builder.keyword("set");
      builder.token(";");
      builder.whitespace(" ");
    }

    builder.token("}");

    if (defaultValue) {
      builder.whitespace(" ");
      builder.token("=");
      builder.whitespace(" ");
      builder.identifier(defaultValue);
    }

    await fileStream.writeLine(
      `           csharp={${builder.toJSON("c#")}}`
    );


    builder.reset();
    if (isStatic) {
      builder.keyword("companion");
      builder.whitespace(" ");
      builder.keyword("object");
      builder.whitespace(" ");
      builder.token("{");
      builder.whitespace(" ");
    }

    if (isAbstract) {
      builder.keyword("abstract");
      builder.whitespace(" ");
    }

    builder.keyword(isReadonly ? "val" : "var");
    builder.whitespace(" ");
    builder.identifier(m.name!.getText());
    builder.token(":");
    builder.whitespace(" ");
    builder.type(getTypeWithNullableInfo(context, m.type, false, false));

    if (defaultValue) {
      builder.whitespace(" ");
      builder.token("=");
      builder.whitespace(" ");
      builder.identifier(defaultValue);
    }

    if (isStatic) {
      builder.whitespace(" ");
      builder.token("}");
    }

    await fileStream.writeLine(
      `           kotlin={${builder.toJSON("kotlin")}}`
    );
  }

  await fileStream.writeLine(
    `/>`
  );
  await fileStream.writeLine();
}

type TypeReferencedCodeLink = { link: string; linkText: string };
export type TypeReferencedCodeToken = {
  kind: "identifier" | "token" | "keyword" | "whitespace" | "type" | "link";
  content: string | TypeWithNullableInfo | TypeReferencedCodeLink;
};

type TypeReferencedCodeLanguage = "js" | "c#" | "kotlin";

export class TypeReferencedCodeBuilder {
  private chunks: TypeReferencedCodeToken[] = [];
  public links = true;

  public constructor(private context: GenerateContext) { }

  public identifier(s: string) {
    this.chunks.push({ kind: "identifier", content: s });
  }

  public whitespace(s: string) {
    this.chunks.push({ kind: "whitespace", content: s });
  }

  public token(s: string) {
    this.chunks.push({ kind: "token", content: s });
  }

  public keyword(s: string) {
    this.chunks.push({ kind: "keyword", content: s });
  }

  public type(t: TypeWithNullableInfo) {
    this.chunks.push({ kind: "type", content: t });
  }

  public declaration(t: ts.NamedDeclaration, linkText?: string) {
    linkText ??= t.name?.getText() ?? "UnknownReference";

    if (!this.links) {
      return this.identifier(linkText);
    }

    const referenceUrl = getDeclarationReferenceUrl(this.context, t as any);
    if (referenceUrl) {
      this.chunks.push({
        kind: "link",
        content: { link: referenceUrl, linkText },
      });
    } else {
      // cconsole.error(
      //   `Could not resolve setting or declaration link ${linkText} for declaration `,
      //   t
      // );
      this.chunks.push({
        kind: "identifier",
        content: linkText,
      });
    }
  }

  public settingOrDeclaration(s: ts.Symbol, text: string) {
    const settingsLink = tryGetSettingsUrl(this.context, s);
    if (settingsLink) {
      this.chunks.push({
        kind: "link",
        content: { link: settingsLink, linkText: text },
      });
    } else {
      let declaration = valueOrFirstDeclarationInDts(this.context, s);
      if (declaration) {
        if (!("name" in declaration)) {
          cconsole.error("Unsupported declaration type", declaration);
          return;
        }

        this.declaration(declaration! as ts.NamedDeclaration);
      } else {
        cconsole.error(
          `Could not resolve setting or declaration link ${text} for symbol `,
          s
        );
        cconsole.warn();
        this.chunks.push({
          kind: "identifier",
          content: text,
        });
      }
    }
  }

  public reset() {
    this.chunks = [];
  }

  public toPlain(language: TypeReferencedCodeLanguage) {
    let plain = '';

    const translated = this.translateChunks(this.chunks, language);
    for (const chunk of translated) {
      switch (chunk.kind) {
        case "identifier":
        case "token":
        case "keyword":
        case "whitespace":
          plain += escapeHtmlEntities(chunk.content.toString());
          break;

        // case "type": // rewritten during translateChunks
        //   break;
        case "link":
          const link = chunk.content as TypeReferencedCodeLink;
          plain += escapeHtmlEntities(link.linkText);
          break;
      }
    }


    return plain;
  }

  public toJSON(language: TypeReferencedCodeLanguage) {
    const translated = this.translateChunks(this.chunks, language);

    const json: any[] = [];
    for (const chunk of translated) {
      switch (chunk.kind) {
        case "identifier":
        case "token":
        case "keyword":
        case "whitespace":
          json.push([chunk.kind, chunk.content.toString()]);
          break;

        // case "type": // rewritten during translateChunks
        //   break;
        case "link":
          const link = chunk.content as TypeReferencedCodeLink;
          json.push(['identifier', link.linkText, link.link]);
          break;
      }
    }

    return JSON.stringify(json);
  }


  public toMdx(
    language: TypeReferencedCodeLanguage,
    style: "block" | "inline",
    basicName: string = ''
  ) {
    let code = `<Signature style=${JSON.stringify(style)} `;
    switch (language) {
      case "js":
        code += 'js';
        break;
      case "c#":
        code += 'csharp';
        break;
      case "kotlin":
        code += 'kotlin';
        break;
    }
    code += '={' + this.toJSON(language) + '}>' + this.toPlain(language) + '</Signature> ';
    return code;
  }

  translateChunks(
    chunks: TypeReferencedCodeToken[],
    language: TypeReferencedCodeLanguage
  ): TypeReferencedCodeToken[] {
    const translated: TypeReferencedCodeToken[] = [];

    for (const chunk of chunks) {
      switch (chunk.kind) {
        case "identifier":
        case "token":
        case "keyword":
        case "whitespace":
        case "link":
          translated.push(chunk);
          break;
        case "type":
          this.translateType(
            translated,
            language,
            chunk.content as TypeWithNullableInfo
          );
          break;
      }
    }

    return translated;
  }

  translateType(
    tokens: TypeReferencedCodeToken[],
    language: TypeReferencedCodeLanguage,
    type: TypeWithNullableInfo
  ) {
    if (type.isPrimitiveType) {
      this.translatePrimitiveType(tokens, language, type);
      return;
    }

    if (type.isArray) {
      this.translateArrayType(tokens, language, type);
      return;
    }

    if (type.isUnionType) {
      this.translateUnionType(tokens, language, type);
      return;
    }

    this.translateTypeReference(tokens, language, type);
  }
  translateUnionType(
    tokens: TypeReferencedCodeToken[],
    language: TypeReferencedCodeLanguage,
    type: TypeWithNullableInfo
  ) {
    switch (language) {
      case "js":
        for (let i = 0; i < type.unionTypes!.length; i++) {
          if (i > 0) {
            tokens.push({
              kind: "whitespace",
              content: " ",
            });
            tokens.push({
              kind: "token",
              content: "|",
            });
            tokens.push({
              kind: "whitespace",
              content: " ",
            });
          }

          this.translateType(tokens, language, type.unionTypes![i]);
        }
        break;
      case "c#":
      case "kotlin":
        cconsole.error(
          "Requested generation of union type for unsupported language",
          language,
          type.fullString
        );
        break;
    }
  }

  translateTypeReference(
    tokens: TypeReferencedCodeToken[],
    language: TypeReferencedCodeLanguage,
    type: TypeWithNullableInfo
  ) {
    const referenceLink = getTypeReferenceUrl(
      this.context,
      type,
      false
    );

    switch (language) {
      case "js":
        if (referenceLink) {
          tokens.push({
            kind: "link",
            content: {
              link: referenceLink,
              linkText: type.ownTypeAsString,
            },
          });
        } else {
          tokens.push({
            kind: "identifier",
            content: type.ownTypeAsString,
          });
        }
        break;
      case "c#":
        switch (type.ownTypeAsString) {
          case "void":
            tokens.push({
              kind: "keyword",
              content: "void",
            });
            return;
          case "Error":
            tokens.push({
              kind: "link",
              content: {
                link: "https://learn.microsoft.com/en-us/dotnet/api/system.exception",
                linkText: "System.Exception",
              },
            });
            break;
          case "Promise":
            tokens.push({
              kind: "link",
              content: {
                link: type.typeArguments
                  ? "https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task-1"
                  : "https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task",
                linkText: "System.Threading.Task",
              },
            });
            break;
          default:
            if (referenceLink) {
              tokens.push({
                kind: "link",
                content: {
                  link: referenceLink,
                  linkText: toPascalCase(type.ownTypeAsString),
                },
              });
            } else {
              tokens.push({
                kind: "identifier",
                content: toPascalCase(type.ownTypeAsString),
              });
            }
            break;
        }

        break;
      case "kotlin":
        switch (type.ownTypeAsString) {
          case "void":
            tokens.push({
              kind: "identifier",
              content: "Unit",
            });
            return;
          case "Error":
            tokens.push({
              kind: "link",
              content: {
                link: "https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-throwable/",
                linkText: "kotlin.Throwable",
              },
            });
            break;
          case "Promise":
            if (!type.typeArguments) {
              tokens.push({
                kind: "identifier",
                content: "Unit",
              });
            } else {
              this.translateType(tokens, language, type.typeArguments[0]);
            }
            return;
          case "Map":
            if (
              type.typeArguments![0].isPrimitiveType ||
              type.typeArguments![1].isPrimitiveType
            ) {
              const keyPart = type.typeArguments![0].isPrimitiveType
                ? this.kotlinPrimitiveType(type.typeArguments![0])
                : "Object";

              const valuePart = type.typeArguments![1].isPrimitiveType
                ? this.kotlinPrimitiveType(type.typeArguments![1])
                : "Object";

              tokens.push({
                kind: "identifier",
                content: "alphaTab.collections." + keyPart + valuePart + "Map",
              });
            } else {
              tokens.push({
                kind: "identifier",
                content: "alphaTab.collections.Map",
              });
            }
            break;
          default:
            if (referenceLink) {
              tokens.push({
                kind: "link",
                content: {
                  link: referenceLink,
                  linkText: type.ownTypeAsString,
                },
              });
            } else {
              tokens.push({
                kind: "identifier",
                content: type.ownTypeAsString,
              });
            }
            break;
        }

        break;
    }

    this.translateTypeArguments(tokens, language, type);

    this.translateNullableInfo(tokens, language, type);
  }

  translateTypeArguments(
    tokens: TypeReferencedCodeToken[],
    language: TypeReferencedCodeLanguage,
    type: TypeWithNullableInfo
  ) {
    if (!type.typeArguments) {
      return;
    }

    tokens.push({
      kind: "token",
      content: "<",
    });

    for (let i = 0; i < type.typeArguments.length; i++) {
      if (i > 0) {
        tokens.push({
          kind: "token",
          content: ",",
        });
        tokens.push({
          kind: "whitespace",
          content: " ",
        });
      }

      this.translateType(tokens, language, type.typeArguments[i]);
    }

    tokens.push({
      kind: "token",
      content: ">",
    });
  }

  translateArrayType(
    tokens: TypeReferencedCodeToken[],
    language: TypeReferencedCodeLanguage,
    type: TypeWithNullableInfo
  ) {
    switch (language) {
      case "js":
        this.translateType(tokens, language, type.arrayItemType!);
        tokens.push({
          kind: "token",
          content: "[]",
        });
        break;
      case "c#":
        tokens.push({
          kind: "link",
          content: {
            linkText: "IList",
            link:
              "https://learn.microsoft.com/en-us/dotnet/api/system.collections.ilist",
          },
        });
        tokens.push({
          kind: "token",
          content: "<",
        });
        this.translateType(tokens, language, type.arrayItemType!);
        tokens.push({
          kind: "token",
          content: ">",
        });

        break;
      case "kotlin":
        if (type.arrayItemType!.isPrimitiveType) {
          switch (type.arrayItemType!.ownTypeAsString) {
            case "boolean":
              tokens.push({
                kind: "identifier",
                content: "alphaTab.collections.BooleanList",
              });
              break;
            case "number":
              tokens.push({
                kind: "identifier",
                content: "alphaTab.collections.DoubleList",
              });
              break;
          }
        } else {
          tokens.push({
            kind: "identifier",
            content: "alphaTab.collections.List",
          });
          tokens.push({
            kind: "token",
            content: "<",
          });
          this.translateType(tokens, language, type.arrayItemType!);
          tokens.push({
            kind: "token",
            content: ">",
          });
        }
        break;
    }

    this.translateNullableInfo(tokens, language, type);
  }

  kotlinPrimitiveType(type: TypeWithNullableInfo) {
    switch (type.ownTypeAsString) {
      case "number":
        return "Double";
      case "string":
        return "String";
      case "boolean":
        return "Boolean";
      case "BigInt":
        return "Long";
      case "unknown":
        return "Any";
    }
    return type.ownTypeAsString;
  }

  translatePrimitiveType(
    tokens: TypeReferencedCodeToken[],
    language: "js" | "c#" | "kotlin",
    type: TypeWithNullableInfo
  ) {
    const referenceLink = getTypeReferenceUrl(this.context, type, false);
    let name: string = "";
    switch (language) {
      case "js":
        name = type.ownTypeAsString;
        break;
      case "c#":
        switch (type.ownTypeAsString) {
          case "number":
            name = "double";
            break;
          case "string":
            name = "string";
            break;
          case "boolean":
            name = "bool";
            break;
          case "BigInt":
            name = "long";
            break;
          case "unknown":
            name = "object";
            break;
        }
        break;
      case "kotlin":
        name = this.kotlinPrimitiveType(type);
        break;
    }

    if (referenceLink) {
      tokens.push({
        kind: "link",
        content: {
          link: referenceLink,
          linkText: name,
        },
      });
    } else {
      tokens.push({
        kind: "identifier",
        content: name,
      });
    }

    this.translateNullableInfo(tokens, language, type);
  }

  translateNullableInfo(
    tokens: TypeReferencedCodeToken[],
    language: TypeReferencedCodeLanguage,
    type: TypeWithNullableInfo
  ) {
    switch (language) {
      case "js":
        if (type.isOptional) {
          tokens.push({
            kind: "whitespace",
            content: " ",
          });
          tokens.push({
            kind: "token",
            content: "|",
          });
          tokens.push({
            kind: "whitespace",
            content: " ",
          });
          tokens.push({
            kind: "keyword",
            content: "undefined",
          });
        }
        if (type.isNullable) {
          tokens.push({
            kind: "whitespace",
            content: " ",
          });
          tokens.push({
            kind: "token",
            content: "|",
          });
          tokens.push({
            kind: "whitespace",
            content: " ",
          });
          tokens.push({
            kind: "keyword",
            content: "null",
          });
        }
        break;
      case "c#":
        if (type.isOptional || type.isNullable) {
          tokens.push({
            kind: "token",
            content: "?",
          });
        }
        break;
      case "kotlin":
        if (type.isOptional || type.isNullable) {
          tokens.push({
            kind: "token",
            content: "?",
          });
        }
        break;
    }
  }
}


export function escapeHtmlEntities(input: string): string {
  if (input === null || input === undefined) return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#96;",
    "{": "\\{",
    "}": "\\}",
  };

  return input.replace(/[\u00A0-\u9999<>&"'\/`\{\}]/g, (ch) => {
    return map[ch] ?? `&#${ch.charCodeAt(0)};`;
  });
}