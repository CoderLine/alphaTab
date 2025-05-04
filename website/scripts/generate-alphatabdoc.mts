import path from "path";
import url from "url";
import ts, { JSDocParsingMode } from "typescript";
import { generateSettings } from "./generate-settings.mjs";
import { GenerateContext } from "./typeschema.mjs";
import { generateTypeDocs } from "./generate-typedocs.mjs";
import { cconsole } from "./generate-common.mjs";
import { generateApiDocs } from "./generate-api.mjs";

const alphaTabEntryFile = url.fileURLToPath(
  import.meta.resolve("@coderline/alphatab")
);
const alphaTabDir = path.resolve(alphaTabEntryFile, "..", "..");

const dts = path.resolve(alphaTabDir, "dist", "alphaTab.d.ts");
const host = ts.createCompilerHost({}, true);
host.jsDocParsingMode = JSDocParsingMode.ParseAll;

const program = ts.createProgram({
  rootNames: [dts],
  options: {},
  host: host,
});

const ast = program.getSourceFile(dts);

const lookup = new Map<string, ts.DeclarationStatement>();

const context: GenerateContext = {
  checker: program.getTypeChecker(),
  dts: dts,
  flatExports: new Map(),
  nameToExportName: new Map(),
  settings: null!,
};

function walkModuleDeclaration(
  d: ts.ModuleDeclaration,
  exportedName: string,
  handler: (
    exportName: string,
    internalName: string,
    d: ts.DeclarationStatement
  ) => void
) {
  if (!d.body || !ts.isModuleBlock(d.body)) {
    cconsole.warn("Unsupported module declaration", exportedName);
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
          walkExports(
            lookup.get(typeName)!,
            exportedName + "." + exportName,
            typeName,
            handler
          );
        } else {
          cconsole.warn("Unresolved export", typeName, "in", exportedName);
        }
      }
    } else {
      cconsole.warn(
        "Unsupported statement",
        ts.SyntaxKind[s.kind],
        "in",
        exportedName
      );
    }
  }
}

async function walkExports(
  d: ts.DeclarationStatement,
  exportName: string,
  internalName: string,
  handler: (
    exportName: string,
    internalName: string,
    d: ts.DeclarationStatement
  ) => void
) {
  if (!d.name || !ts.isIdentifier(d.name)) {
    return;
  }

  if (ts.isModuleDeclaration(d)) {
    walkModuleDeclaration(d, exportName, handler);
  } else {
    handler(exportName, internalName, d);
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
  walkExports(d, "alphaTab." + identifier, identifier, async (e, i, d) => {
    if (
      ts.isEnumDeclaration(d) ||
      ts.isClassDeclaration(d) ||
      ts.isInterfaceDeclaration(d) ||
      ts.isTypeAliasDeclaration(d) 
    ) {
      context.flatExports.set(e, d);
      context.nameToExportName.set(i, e);
    }
  });
}

context.settings = context.flatExports.get(
  "alphaTab.Settings"
) as ts.ClassDeclaration;
await generateSettings(context);
await generateTypeDocs(context);
await generateApiDocs(context);

// TODO: run prettier on MDX files