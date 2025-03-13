import path from "path";
import url from "url";
import fs from "fs";
import ts from "typescript";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const alphaTabEntryFile = url.fileURLToPath(
  import.meta.resolve("@coderline/alphatab")
);
const alphaTabDir = path.resolve(alphaTabEntryFile, "..", "..");

const dts = path.resolve(alphaTabDir, "dist", "alphaTab.d.ts");
const ast = ts.createSourceFile(
  dts,
  await fs.promises.readFile(dts, "utf-8"),
  {
    jsDocParsingMode: ts.JSDocParsingMode.ParseAll,
    languageVersion: ts.ScriptTarget.Latest,
  },
  true,
  ts.ScriptKind.TS
);

const lookup = new Map<string, ts.DeclarationStatement>();

const outDir = path.resolve(__dirname, "..", "src", "alphatabdoc");

async function writeType(exportedName: string, schema: any) {
  const parts = exportedName.replace("alphaTab.", "").split(".");
  parts[parts.length - 1] = parts[parts.length - 1] + ".ts";

  const full = path.resolve(outDir, ...parts);
  await fs.promises.mkdir(path.dirname(full), { recursive: true });

  console.log("writing", full);
  try {
    await fs.promises.writeFile(
      full,
      `export default ${JSON.stringify(schema, null, 2)};`
    );
  } catch (e) {
    console.error("error writing", full, e, schema);
  }
}

function jsDocCommentSchema(
  d?: ts.NodeArray<ts.JSDocComment> | ts.JSDocComment | string
) {
  if (!d) {
    return undefined;
  }

  if (typeof d === "string") {
    return [{
      kind: "text",
      text: d,
    }];
  }

  if ("kind" in d) {
    switch (d.kind) {
      case ts.SyntaxKind.JSDocText:
        return [{
          kind: "text",
          text: (d as ts.JSDocText).text,
        }];
      case ts.SyntaxKind.JSDocLink:
        return [{
          kind: "link",
          name: (d as ts.JSDocLink).name?.getText(),
          text: (d as ts.JSDocLink).text,
        }];
      case ts.SyntaxKind.JSDocLinkPlain:
        return [{
          kind: "link",
          name: (d as ts.JSDocLinkPlain).name?.getText(),
          text: (d as ts.JSDocLinkPlain).text,
        }];
      case ts.SyntaxKind.JSDocLinkCode:
        return [{
          kind: "link",
          name: (d as ts.JSDocLinkCode).name?.getText(),
          text: (d as ts.JSDocLinkCode).text,
        }];
    }

    return [{
      kind: "unknown",
    }];
  }

  return d.reduce((d, x) => [d, ...jsDocCommentSchema(x)], []);
}

function jsDocSchema(d: ts.Node) {
  const comments = ts.getJSDocCommentsAndTags(d);
  return comments.map((m) => {
    if (ts.isJSDoc(m)) {
      return {
        kind: "jsdoc",
        comment: jsDocCommentSchema(m.comment),
        tags: m.tags?.map((t) => {
          return {
            kind: "jsdoctag",
            tagName: t.tagName.text,
            comment: jsDocCommentSchema(t.comment),
          };
        }),
      };
    } else {
      return {
        kind: "jsdoctag",
        tagName: m.tagName.text,
        comment: jsDocCommentSchema(m.comment),
      };
    }
  });
}

async function writeEnumDeclaration(
  d: ts.EnumDeclaration,
  exportedName: string
) {
  await writeType(exportedName, {
    name: exportedName,
    tsdoc: jsDocSchema(d),
    members: d.members.map((m) => {
      return {
        name: m.name.getText(),
        tsdoc: jsDocSchema(m),
      };
    }),
  });
}
async function writeClassDeclaration(
  d: ts.ClassDeclaration,
  exportedName: string
) {
  await writeType(exportedName, {
    name: exportedName,
    tsdoc: jsDocSchema(d),
  });
}

async function writeInterfaceDeclaration(
  d: ts.InterfaceDeclaration,
  exportedName: string
) {
  await writeType(exportedName, {
    name: exportedName,
    tsdoc: jsDocSchema(d),
  });
}

async function writeModuleDeclaration(
  d: ts.ModuleDeclaration,
  exportedName: string
) {
  if (!d.body || !ts.isModuleBlock(d.body)) {
    console.warn("Unsupported module declaration", exportedName);
    return;
  }

  for (const s of d.body.statements) {
    if (
      ts.isExportDeclaration(s) &&
      s.exportClause &&
      ts.isNamedExports(s.exportClause)
    ) {
      for (const nested of s.exportClause.elements) {
        let exportName = "";
        let typeName = "";
        if (nested.propertyName) {
          typeName = (nested.propertyName as ts.Identifier).text;
          exportName = (nested.name as ts.Identifier).text;
        } else {
          typeName = (nested.name as ts.Identifier).text;
          exportName = typeName;
        }

        if (lookup.has(typeName)) {
          walkExports(lookup.get(typeName)!, exportedName + "." + exportName);
        } else {
          console.warn("Unresolved export", typeName, "in", exportedName);
        }
      }
    } else {
      console.warn(
        "Unsupported statement",
        ts.SyntaxKind[s.kind],
        "in",
        exportedName
      );
    }
  }
}

async function walkExports(d: ts.DeclarationStatement, identifier: string) {
  if (!d.name || !ts.isIdentifier(d.name)) {
    return;
  }

  if (ts.isEnumDeclaration(d)) {
    await writeEnumDeclaration(d, identifier);
  } else if (ts.isClassDeclaration(d)) {
    await writeClassDeclaration(d, identifier);
  } else if (ts.isInterfaceDeclaration(d)) {
    await writeInterfaceDeclaration(d, identifier);
  } else if (ts.isModuleDeclaration(d)) {
    await writeModuleDeclaration(d, identifier);
  }
}

const exports: { d: ts.DeclarationStatement; identifier: string }[] = [];
for (const d of ast!.statements) {
  if (!ts.isDeclarationStatement(d) || !ts.canHaveModifiers(d)) {
    continue;
  }
  const isExported = !!d.modifiers?.some(
    (m) => m.kind === ts.SyntaxKind.ExportKeyword
  );

  let identifier = "";
  if (d.name) {
    if (ts.isIdentifier(d.name)) {
      identifier = d.name.text;
    }
  }

  if (identifier) {
    lookup.set(identifier, d);
  }

  if (isExported) {
    exports.push({ d, identifier });
  }
}

for (const { d, identifier } of exports) {
  walkExports(d, "alphaTab." + identifier);
}
