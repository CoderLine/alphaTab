import path from "path";
import url from "url";
import ts, { JSDocParsingMode } from "typescript";
import { generateSettings } from "./generate-settings.mjs";
import { GenerateContext, repositoryRoot } from "./typeschema.mjs";
import { generateTypeDocs } from "./generate-typedocs.mjs";
import { cconsole, TypeReferencedCodeToken } from "./generate-common.mjs";
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
  emptyFiles: false
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

context.emptyFiles = process.argv.includes("--empty");

await generateSettings(context);
await generateTypeDocs(context);
await generateApiDocs(context);

// styles for syntax highlighting
import { PrismTheme, PrismThemeEntry, themes as prismThemes } from "prism-react-renderer";
import { openFileStream } from "./util.mjs";

await using styles = await openFileStream(path.join(
  repositoryRoot,
  'src',
  'css',
  'highlight.scss'
));

function toKebabCase(s: string): string {
  return s.replaceAll(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}
function prismToCss(entry: PrismThemeEntry): [string, string][] {
  return Object.entries(entry).map(e => ([toKebabCase(e[0]), e[1]]) as [string, string]);
}

async function writeStyles(theme: string, prismTheme: PrismTheme) {
  await styles.writeLine(`[data-theme=${JSON.stringify(theme)}] {`)

  const themeLookup = new Map<TypeReferencedCodeToken["kind"], PrismThemeEntry>();

  themeLookup.set("identifier", prismTheme.plain);
  themeLookup.set("token", prismTheme.plain);
  themeLookup.set("keyword", prismTheme.plain);
  themeLookup.set("whitespace", prismTheme.plain);

  for (const styles of prismTheme.styles) {
    if (styles.types.includes("variable")) {
      themeLookup.set("identifier", styles.style);
    }
    if (styles.types.includes("punctuation")) {
      themeLookup.set("token", styles.style);
    }
    if (styles.types.includes("keyword")) {
      themeLookup.set("keyword", styles.style);
    }
  }

  await styles.writeLine(`  code.codeBlockLines.generated, code.codeBlockLinesInline {`)
  // plain style on container
  for (const [k, v] of prismToCss(prismTheme.plain)) {
    await styles.writeLine(`    ${k}: ${v};`)
  }
  await styles.writeLine()

  // specific token kinds
  for (const [kind, style] of themeLookup) {
    await styles.writeLine(`    .${kind} {`)
    for (const [k, v] of prismToCss(style)) {
      await styles.writeLine(`      ${k}: ${v};`)
    }
    await styles.writeLine(`    }`)
  }

  await styles.writeLine(`  }`)
  await styles.writeLine(`}`)
}

// aligned with "docusaurus.config.ts"
await writeStyles('light', prismThemes.github);
await writeStyles('dark', prismThemes.dracula);


